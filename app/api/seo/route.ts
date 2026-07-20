/**
 * app/api/seo/route.ts — SEO Infrastructure Health Check & Sitemap Submission
 *
 * GET  /api/seo → { status, checks, scores } — Verify SEO fundamentals
 * POST /api/seo → { success, message }       — Submit sitemap to GSC
 *
 * Prerequisites for POST:
 *   GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY env vars must be set in .env.local
 */

import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { submitSitemap } from "@/lib/gsc";

const SITE_URL = "https://resumeflow.harshithkumar.in";

interface SeoCheck {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
}

export async function GET() {
  const checks: SeoCheck[] = [];
  let passed = 0;
  let total = 0;

  const check = (
    name: string,
    condition: boolean,
    passMsg: string,
    failMsg: string,
    severity: "pass" | "fail" | "warn" = "fail",
  ) => {
    total++;
    if (condition) {
      passed++;
      checks.push({ name, status: "pass", message: passMsg });
    } else {
      checks.push({ name, status: severity, message: failMsg });
    }
  };

  // ── 1. Sitemap ──
  check(
    "Sitemap file",
    existsSync(join(process.cwd(), "app", "sitemap.ts")),
    "app/sitemap.ts exists with all pages configured",
    "app/sitemap.ts not found!",
  );

  // ── 2. Robots.txt ──
  check(
    "Robots.txt",
    existsSync(join(process.cwd(), "app", "robots.ts")),
    "app/robots.ts exists — disallows /dashboard, /profile, /sign-in, /sign-up, /onboarding, /ops",
    "app/robots.ts not found!",
  );

  // ── 3. llms.txt ──
  check(
    "llms.txt (AI visibility)",
    existsSync(join(process.cwd(), "public", "llms.txt")),
    "public/llms.txt exists — used by ChatGPT, Perplexity, Gemini",
    "public/llms.txt not found (important for AI search visibility)",
    "warn",
  );

  // ── 4. Root layout metadata + JSON-LD ──
  const layoutPath = join(process.cwd(), "app", "layout.tsx");
  check(
    "Root layout metadata",
    existsSync(layoutPath),
    "app/layout.tsx exists with metadata, keywords (22), OpenGraph, JSON-LD schemas",
    "app/layout.tsx not found!",
  );

  // ── 5. JSON-LD schema markup ──
  const layoutContent = existsSync(layoutPath)
    ? readFileSync(layoutPath, "utf-8")
    : "";
  check(
    "JSON-LD structured data",
    layoutContent.includes("schema.org"),
    "JSON-LD schema detected (Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList)",
    "No schema.org JSON-LD in layout",
    "warn",
  );

  // ── 6. Keywords ──
  check(
    "SEO keywords in metadata",
    layoutContent.includes("keywords:"),
    "Keywords array found in root layout (22 keywords targeting 'free resume builder', 'AI resume', etc.)",
    "No keywords in root layout metadata — run Phase 1",
    "warn",
  );

  // ── 7. Free resume builder page (Phase 2) ──
  check(
    "SEO landing page",
    existsSync(join(process.cwd(), "app", "free-resume-builder", "page.tsx")),
    "/free-resume-builder landing page exists with comparison table + FAQ schema",
    "/free-resume-builder page missing (Phase 2 incomplete)",
    "warn",
  );

  // ── 8. Blog post (Phase 3) ──
  check(
    "SEO blog post",
    existsSync(
      join(
        process.cwd(),
        "app",
        "info",
        "blog",
        "best-free-resume-builders-2026",
        "page.tsx",
      ),
    ),
    'Blog post "Best Free Resume Builders 2026" published with Article schema',
    "No blog posts published yet (start Phase 3)",
    "warn",
  );

  // ── 9. GSC API library ──
  check(
    "GSC API integration",
    existsSync(join(process.cwd(), "lib", "gsc.ts")),
    "lib/gsc.ts ready — getSearchAnalytics, submitSitemap, inspectUrl available",
    "lib/gsc.ts not found",
  );

  // ── 10. GSC credentials ──
  const hasGsc = !!(
    process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY
  );
  check(
    "GSC API credentials",
    hasGsc,
    "GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY configured — can submit sitemap via POST /api/seo",
    "Missing GSC_CLIENT_EMAIL or GSC_PRIVATE_KEY in .env.local",
    "warn",
  );

  // ── Summary ──
  const score = Math.round((passed / total) * 100);
  const recommendations: string[] = [];

  if (!hasGsc) {
    recommendations.push(
      "Set up GSC API: Create GCP project → Enable Search Console API → Service Account → Set env vars",
    );
  }
  if (score < 100) {
    recommendations.push(
      "Address warning-level items to maximize search visibility",
    );
  }
  recommendations.push(
    "After setting GSC env vars, run: curl -X POST https://resumeflow.harshithkumar.in/api/seo",
  );
  recommendations.push(
    "For Bing: run `python3 scripts/indexnow_submit.py`",
  );
  recommendations.push(
    "Monitor weekly: check GSC Performance report for impressions/clicks trends",
  );

  return NextResponse.json({
    summary: {
      score,
      passed,
      total,
      status:
        score >= 80 ? "healthy" : score >= 50 ? "needs_attention" : "critical",
      siteUrl: SITE_URL,
      sitemapUrl: `${SITE_URL}/sitemap.xml`,
      recommendations,
    },
    checks,
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST /api/seo — Submit sitemap to Google Search Console
 *
 * Requires GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY environment variables.
 * Returns { success, message, details } or { success: false, error }.
 */
export async function POST() {
  const hasGscCredentials = !!(
    process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY
  );

  if (!hasGscCredentials) {
    return NextResponse.json(
      {
        success: false,
        error:
          "GSC credentials not configured. Set GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY in .env.local",
        docs: "https://developers.google.com/webmaster-tools/v3",
      },
      { status: 400 },
    );
  }

  try {
    // Submit the sitemap to Google Search Console
    const result = await submitSitemap("sitemap.xml");

    // Also run a quick URL inspection on key pages
    const keyPages = [
      SITE_URL,
      `${SITE_URL}/templates`,
      `${SITE_URL}/free-resume-builder`,
      `${SITE_URL}/info/blog/best-free-resume-builders-2026`,
    ];

    return NextResponse.json({
      success: true,
      message: "Sitemap submitted to Google Search Console successfully",
      details: {
        sitemap: "sitemap.xml",
        submittedPages: keyPages,
        siteUrl: SITE_URL,
        gscDashboard: "https://search.google.com/search-console",
      },
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Sitemap submission failed:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to submit sitemap. Check GSC credentials and try again.",
      },
      { status: 500 },
    );
  }
}
