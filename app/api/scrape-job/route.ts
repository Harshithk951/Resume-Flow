// app/api/scrape-job/route.ts
//
// Extracts job posting text, title, and company from a job URL.
// Primary: @tavily/core extract ([url])
// Fallback: Jina Reader (https://r.jina.ai/<url>)
// Fallback 2: Direct HTTP fetch with HTML-to-text cleanup

import { NextRequest, NextResponse } from "next/server";
import { tavily } from "@tavily/core";

export const runtime = "nodejs";
export const maxDuration = 30; // 30 seconds max timeout

interface ScrapeResult {
  title: string;
  company: string;
  text: string;
}

/**
 * Extracts candidate company and job title from text and URL heuristics.
 */
function extractMetadataFromText(
  rawText: string,
  urlStr: string
): { title: string; company: string; cleanText: string } {
  let title = "";
  let company = "";

  // 1. Try URL heuristics first (Greenhouse, Lever, Workday, LinkedIn, Indeed)
  try {
    const parsedUrl = new URL(urlStr);
    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname;

    if (hostname.includes("greenhouse.io")) {
      const parts = pathname.split("/").filter(Boolean);
      if (parts.length >= 1) company = parts[0];
    } else if (hostname.includes("lever.co")) {
      const parts = pathname.split("/").filter(Boolean);
      if (parts.length >= 1) company = parts[0];
    } else if (hostname.includes("workday.com")) {
      const parts = pathname.split("/").filter(Boolean);
      if (parts.length >= 1) company = parts[0];
    } else {
      // General domain name
      const domainParts = hostname.replace(/^www\./, "").split(".");
      if (domainParts.length >= 2 && domainParts[0] !== "jobs" && domainParts[0] !== "careers") {
        company = domainParts[0];
      }
    }
  } catch {
    // Ignore URL parse errors
  }

  // 2. Parse Markdown or plain text headings
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

  // Look for # Header or Title lines
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    // Check markdown heading
    const headingMatch = line.match(/^#+\s*(.+)$/);
    const candidateLine = headingMatch ? headingMatch[1].trim() : line;

    // Check "Title at Company" or "Title - Company"
    const atMatch = candidateLine.match(/^([A-Za-z0-9\s,/-]+?)\s+(?:at|@)\s+([A-Za-z0-9\s.&-]+)$/i);
    if (atMatch && !title) {
      title = atMatch[1].trim();
      if (!company) company = atMatch[2].trim();
      break;
    }

    const dashMatch = candidateLine.match(/^([A-Za-z0-9\s,/]+?)\s+[-–—|]\s+([A-Za-z0-9\s.&-]+)$/i);
    if (dashMatch && !title) {
      title = dashMatch[1].trim();
      if (!company) company = dashMatch[2].trim();
      break;
    }

    if (headingMatch && !title && candidateLine.length < 80) {
      title = candidateLine;
    }
  }

  // Clean company name capitalization
  if (company) {
    company = company.charAt(0).toUpperCase() + company.slice(1);
  }

  return {
    title: title || "Target Role",
    company: company || "Hiring Company",
    cleanText: rawText.trim(),
  };
}

/**
 * Fallback to direct HTML fetching and tag stripping.
 */
async function fallbackDirectFetch(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,text/plain",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`Direct fetch failed with HTTP ${res.status}`);
  }

  const html = await res.text();
  // Strip scripts, styles, noscript, svg
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body as { url?: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid URL string is required." },
        { status: 400 }
      );
    }

    // Validate URL syntax
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("Protocol must be http or https");
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL provided. Please provide a full URL including https://" },
        { status: 400 }
      );
    }

    let extractedText = "";

    // ─── Primary: @tavily/core Extract ───────────────────────────
    const tavilyKey = process.env.TAVILY_API_KEY;
    if (tavilyKey) {
      try {
        const tvly = tavily({ apiKey: tavilyKey });
        const extractRes = await tvly.extract([url]);
        if (extractRes && extractRes.results && extractRes.results.length > 0) {
          const firstResult = extractRes.results[0];
          extractedText = (firstResult as any).rawContent || (firstResult as any).content || "";
        }
      } catch (tavilyErr) {
        console.warn("[scrape-job] Tavily extract failed, falling back to Jina Reader:", tavilyErr);
      }
    }

    // ─── Fallback 1: Jina Reader ─────────────────────────────────
    if (!extractedText || extractedText.trim().length < 50) {
      try {
        const jinaUrl = `https://r.jina.ai/${encodeURI(url)}`;
        const jinaRes = await fetch(jinaUrl, {
          headers: {
            Accept: "text/plain",
            "User-Agent": "ResumeFlow/1.0",
          },
          signal: AbortSignal.timeout(10000),
        });

        if (jinaRes.ok) {
          const jinaText = await jinaRes.text();
          if (jinaText && jinaText.trim().length >= 50) {
            extractedText = jinaText;
          }
        }
      } catch (jinaErr) {
        console.warn("[scrape-job] Jina Reader fallback failed, trying direct fetch:", jinaErr);
      }
    }

    // ─── Fallback 2: Direct Fetch ────────────────────────────────
    if (!extractedText || extractedText.trim().length < 50) {
      try {
        extractedText = await fallbackDirectFetch(url);
      } catch (directErr) {
        console.warn("[scrape-job] Direct fetch fallback failed:", directErr);
      }
    }

    if (!extractedText || extractedText.trim().length < 30) {
      return NextResponse.json(
        {
          error:
            "Could not extract sufficient text from this job URL. Please paste the job description directly.",
        },
        { status: 422 }
      );
    }

    const parsed = extractMetadataFromText(extractedText, url);

    const result: ScrapeResult = {
      title: parsed.title,
      company: parsed.company,
      text: parsed.cleanText,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("[scrape-job] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to scrape job posting URL." },
      { status: 500 }
    );
  }
}
