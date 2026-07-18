// convex/ai/processJob.ts
//
// Background Action: Layer 1 Job & Company Requirement Analysis
// Ingests job descriptions, runs web search for company culture via Tavily,
// compares requirements to the candidate's profile, and identifies skill gaps.

"use node";

import { action } from "../_generated/server";
import type { ActionCtx } from "../_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { OpenAI } from "openai";
import { tavily } from "@tavily/core";
import pdf from "@cedrugs/pdf-parse";
import { maskPersonalInfo } from "../lib/piiMask";
import { z } from "zod";
import { jobSearchSkill } from "./Skills/registry";

// ─── Zod Schemas for LLM Output Validation ───────────────────

const ExtractedRequirementsSchema = z.object({
  hardSkills: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  resumeType: z.enum(["ats_strict", "modern_professional", "academic"]).default("ats_strict"),
  requiredQualifications: z.array(z.string()).optional().default([]),
  niceToHaveSkills: z.array(z.string()).optional().default([]),
  keywordsToInclude: z.array(z.string()).optional().default([]),
  companyInsights: z.object({
    usesATS: z.boolean().default(true),
    industry: z.string().default("Technology"),
    cultureKeywords: z.array(z.string()).default([]),
  }).default({ usesATS: true, industry: "Technology", cultureKeywords: [] }),
});

const GapQuestionSchema = z.object({
  skill: z.string(),
  question: z.string(),
});

const AnalysisResultSchema = z.object({
  requirements: ExtractedRequirementsSchema,
  gapQuestions: z.array(GapQuestionSchema).default([]),
});

type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

function generateCacheKey(company: string, jd: string): string {
  const cleanStr = `${company.toLowerCase()}_${jd.toLowerCase()}`.replace(
    /[^a-z0-9]/g,
    ""
  );
  let hash = 0;
  for (let i = 0; i < cleanStr.length; i++) {
    const char = cleanStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `jd:analysis:${Math.abs(hash)}`;
}

async function getCache(key: string): Promise<AnalysisResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["GET", key]),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: string | null };
    if (!data.result) return null;
    const parsed =
      typeof data.result === "string" ? JSON.parse(data.result) : data.result;
    return AnalysisResultSchema.parse(parsed);
  } catch (e) {
    console.error("[redis-cache] Failed to read from Upstash cache:", e);
    return null;
  }
}

async function setCache(
  key: string,
  value: AnalysisResult,
  ttlSec = 86400
): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", key, JSON.stringify(value), "EX", ttlSec.toString()]),
    });
    if (!res.ok) {
      console.error("[redis-cache] Upstash SET failed:", await res.text());
    }
  } catch (e) {
    console.error("[redis-cache] Failed to write to Upstash cache:", e);
  }
}

async function commitAnalysisResult(
  ctx: ActionCtx,
  jobId: Id<"jobs">,
  validatedResult: AnalysisResult
) {
  if (validatedResult.gapQuestions.length > 0) {
    await ctx.runMutation(internal.jobs.internalSetNeedsUserInput, {
      jobId,
      requirements: validatedResult.requirements,
      questions: validatedResult.gapQuestions,
    });
  } else {
    await ctx.runMutation(internal.jobs.internalSetExtractedRequirements, {
      jobId,
      requirements: validatedResult.requirements,
    });
  }
}

// Helper to clean Markdown tags and parse JSON with robust fallbacks
function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim();
  
  // Extract JSON block using first '{' and last '}'
  const startIdx = cleaned.indexOf("{");
  const endIdx = cleaned.lastIndexOf("}");
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  cleaned = cleaned.trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (e: any) {
    console.warn("Standard JSON.parse failed, attempting automatic comma cleanup...", e.message);
  }

  // Attempt to fix trailing commas before closing brackets/braces
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");

  try {
    return JSON.parse(cleaned);
  } catch (innerError: any) {
    console.error("Failed to parse JSON content from LLM response:", cleaned);
    throw new Error(`AI returned invalid JSON format: ${innerError.message}`);
  }
}

// ─── Convex Action ───────────────────────────────────────────

export const processJob = action({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    console.log("ACTION START: processJob");
    try {
      if (!process.env.NVIDIA_NIM_API_KEY) {
        throw new Error("CRITICAL: NVIDIA API KEY MISSING FROM CONVEX ENV");
      }
      if (!process.env.TAVILY_API_KEY) {
        throw new Error("CRITICAL: TAVILY API KEY MISSING FROM CONVEX ENV");
      }

      // 1. Transition state to extracting
      await ctx.runMutation(internal.jobs.internalUpdateJobState, {
        jobId: args.jobId,
        expectedState: "uploaded",
        newState: "extracting",
      });

      // 2. Fetch job details & user profile (internal query)
      const { job, profile } = await ctx.runQuery(internal.jobs.internalGetJobAndProfile, {
        jobId: args.jobId,
      });

      if (!job) {
        throw new Error("Job record not found.");
      }
      if (!profile) {
        throw new Error("Master Profile is incomplete. Please setup your profile first.");
      }

      // 3. Extract text from JD (handles text, PDF, and screenshots)
      let jdText = job.rawJdText;

      if (job.inputType === "pdf" && job.rawFileStorageId) {
        const downloadUrl = await ctx.storage.getUrl(job.rawFileStorageId);
        if (!downloadUrl) throw new Error("Could not retrieve JD PDF from storage.");
        const fileResponse = await fetch(downloadUrl);
        if (!fileResponse.ok) throw new Error("Failed to download JD PDF.");
        const buffer = await fileResponse.arrayBuffer();
        const parsed = await pdf(Buffer.from(buffer));
        jdText = parsed.text;
      } else if (job.inputType === "screenshot" && job.rawFileStorageId) {
        const downloadUrl = await ctx.storage.getUrl(job.rawFileStorageId);
        if (!downloadUrl) throw new Error("Could not retrieve JD Image from storage.");
        const fileResponse = await fetch(downloadUrl);
        if (!fileResponse.ok) throw new Error("Failed to download JD Image.");
        const buffer = await fileResponse.arrayBuffer();
        const mimeType = fileResponse.headers.get("content-type") || "image/png";
        const base64Image = Buffer.from(buffer).toString("base64");

        // Use Qwen 3.5 NIM Vision to OCR the screenshot
        const apiKey = process.env.NVIDIA_NIM_API_KEY;
        if (!apiKey) throw new Error("NVIDIA_NIM_API_KEY is not set.");
        const openai = new OpenAI({ apiKey, baseURL: "https://integrate.api.nvidia.com/v1" });

        const ocrCompletion = await openai.chat.completions.create({
          model: "meta/llama-3.2-90b-vision-instruct",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "You are an OCR engine. Extract all readable text from this job description screenshot exactly as it appears. Output only the plain text.",
                },
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType};base64,${base64Image}` },
                },
              ],
            },
          ],
          temperature: 0.0,
        });
        jdText = ocrCompletion.choices[0]?.message?.content || "";
      }

      if (!jdText || jdText.trim().length === 0) {
        throw new Error("Job description content is empty or could not be parsed.");
      }

      const cacheKey = generateCacheKey(job.companyName, jdText);
      const cachedResult = await getCache(cacheKey);
      if (cachedResult) {
        console.log("[processJob] CACHE HIT");
        await commitAnalysisResult(ctx, args.jobId, cachedResult);
        return;
      }

      console.log("[processJob] CACHE MISS: running live analysis");

      // 4. Call Tavily Search to research the company
      console.log("🔍 Step 1: Querying Tavily for live company intelligence...");
      const tavilyKey = process.env.TAVILY_API_KEY;
      if (!tavilyKey) throw new Error("TAVILY_API_KEY environment variable is not configured.");
      const tvly = tavily({ apiKey: tavilyKey });
      
      let companyResearch = "";
      try {
        const researchRes = await tvly.search(
          `What is the engineering culture, tech stack, and values of ${job.companyName}?`,
          { searchDepth: "advanced", maxResults: 3 }
        );
        companyResearch = researchRes.results
          .map((r) => `[${r.title}]: ${r.content}`)
          .join("\n\n");
      } catch (err) {
        console.error("Tavily company search failed:", err);
        companyResearch = "No live company research available. Fallback to JD context only.";
      }

      // 5. Mask PII from the Master Profile
      const maskedProfile = {
        ...profile,
        personalInfo: profile.personalInfo ? maskPersonalInfo(profile.personalInfo) : undefined,
      };

      const skillsContext = profile.skills ? `
- Languages: ${(profile.skills.languages || []).join(", ")}
- Frameworks: ${(profile.skills.frameworks || []).join(", ")}
- Tools: ${(profile.skills.tools || []).join(", ")}
- Databases: ${(profile.skills.databases || []).join(", ")}
- Soft Skills: ${(profile.skills.soft || []).join(", ")}` : "No skills details available.";

      const experienceContext = (profile.experience || [])
        .map((e: any) => `- ${e.role} at ${e.company}: ${(e.bullets || []).join("; ")}`)
        .join("\n");

      const projectsContext = (profile.projects || [])
        .map((p: any) => `- ${p.name}: ${p.description}`)
        .join("\n");

      // 6. Invoke Qwen 3.5 NIM for JD requirement analysis and skill gaps detection
      console.log("🧠 Step 2: Sending Job Description + research to Qwen 3.5 NIM for extraction...");
      const nimKey = process.env.NVIDIA_NIM_API_KEY;
      const openai = new OpenAI({ apiKey: nimKey, baseURL: "https://integrate.api.nvidia.com/v1" });

      const prompt = `You are a placement cell coordinator and hiring manager.
Analyze the provided Job Description (JD) and the Company Research context below.
Then, compare the requirements to the candidate's Master Profile, identify skill gaps, and format your output as a single JSON object.

=== COMPANY RESEARCH CONTEXT ===
${companyResearch}

=== JOB DESCRIPTION ===
Company: ${job.companyName}
Title: ${job.jobTitle}
Description:
${jdText}

=== CANDIDATE MASTER PROFILE (PII Redacted) ===
Skills:
${skillsContext}

Experience:
${experienceContext || "No experience details available."}

Projects:
${projectsContext || "No projects details available."}

Instructions:
1. Extract the requirements from the JD (hard skills, soft skills, resume type, qualifications, nice-to-have, and ATS keywords to match).
2. Classify resumeType:
   - "ats_strict" (highly corporate, standard formats)
   - "modern_professional" (startups, creative tech companies)
   - "academic" (research-heavy positions)
3. Compare the requirements with the candidate's profile. Look for CRITICAL skill gaps (major hard skills or frameworks required by the JD that are not present in the candidate's languages, frameworks, tools, experience, or projects).
4. For each critical gap (limit to a maximum of 3), generate a polite question asking if they have this skill and context.
5. Return ONLY a valid JSON block matching this structure:
{
  "requirements": {
    "hardSkills": ["React", "Python"],
    "softSkills": ["Leadership"],
    "resumeType": "ats_strict",
    "requiredQualifications": ["Bachelor's in CS"],
    "niceToHaveSkills": ["Docker"],
    "keywordsToInclude": ["API design", "microservices"],
    "companyInsights": {
      "usesATS": true,
      "industry": "Web Development",
      "cultureKeywords": ["Collaborative", "Fast-paced"]
    }
  },
  "gapQuestions": [
    {
      "skill": "Docker",
      "question": "The job description mentions Docker containerization. Have you worked with Docker, or deployed containerized apps? If yes, please provide brief context."
    }
  ]
}

Ensure to return ONLY the valid JSON structure. Do not wrap in extra commentary or text.`;

      const nimCompletion = await openai.chat.completions.create({
        model: "meta/llama-3.2-90b-vision-instruct",
        messages: [
          { role: "system", content: jobSearchSkill },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 2048,
      });

      const responseText = nimCompletion.choices[0]?.message?.content || "";
      const analysisResult = cleanAndParseJSON(responseText);

      // Validate schema
      const validatedResult = AnalysisResultSchema.parse(analysisResult);
      console.log("✅ Step 3: Job requirements successfully extracted & schema-validated.");

      await setCache(cacheKey, validatedResult, 86400);

      await commitAnalysisResult(ctx, args.jobId, validatedResult);
    } catch (err: any) {
      // 🛡️ Security: Log only sanitized error (no raw error PII leaked)
      console.error("Layer 1 pipeline failed:", err instanceof Error ? err.message : "Unknown error");
      const sanitizedError = "ResumeFlow AI is currently experiencing high traffic. Please try again in a few moments.";
      // Graceful error state transition
      await ctx.runMutation(internal.jobs.internalUpdateJobState, {
        jobId: args.jobId,
        expectedState: "extracting",
        newState: "failed",
        error: sanitizedError,
      });
      throw new ConvexError(sanitizedError);
    }
  },
});
