// convex/ai/tailorResume.ts
//
// Background Action: Layer 2 Resume Tailoring & ATS Scoring
// Takes candidate details, extracted requirements, and gap responses,
// tailors the resume bullets/projects, scores ATS compatibility, and restores PII.

"use node";

import { action } from "../_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "../_generated/api";
import { OpenAI } from "openai";
import { maskPersonalInfo, reInjectPersonalInfo } from "../lib/piiMask";
import { z } from "zod";
import { atsAuditorSkill, resumeMakerSkill } from "./Skills/registry";
import { invokeRoutedNim } from "./modelRouter";
import { createLogger, generateTraceId, captureError, incrementMetric, METRICS } from "../../lib/tracing";

// ─── Zod Schema for Layer 2 JSON Output ──────────────────────

const TailoredResumeSchema = z.object({
  structuredContent: z.object({
    personalInfo: z.object({
      name: z.string().default("[CANDIDATE_NAME]"),
      email: z.string().default("[CANDIDATE_EMAIL]"),
      phone: z.string().default("[CANDIDATE_PHONE]"),
      linkedin: z.string().optional().default(""),
      github: z.string().optional().default(""),
      portfolio: z.string().optional().default(""),
    }),
    education: z.array(
      z.object({
        institution: z.string().default(""),
        degree: z.string().default(""),
        gpa: z.string().optional().default(""),
        year: z.string().default(""),
        relevantCourses: z.array(z.string()).optional().default([]),
      })
    ).default([]),
    experience: z.array(
      z.object({
        company: z.string().default(""),
        role: z.string().default(""),
        duration: z.string().default(""),
        bullets: z.array(z.string()).default([]),
        technologies: z.array(z.string()).default([]),
      })
    ).default([]),
    projects: z.array(
      z.object({
        name: z.string().default(""),
        description: z.string().default(""),
        technologies: z.array(z.string()).default([]),
        link: z.string().optional().default(""),
        bullets: z.array(z.string()).default([]),
      })
    ).default([]),
    skills: z.object({
      languages: z.array(z.string()).optional().default([]),
      frameworksAndTools: z.array(z.string()).optional().default([]),
      cloudAndDevOps: z.array(z.string()).optional().default([]),
      csFundamentals: z.array(z.string()).optional().default([]),
      frameworks: z.array(z.string()).optional().default([]),
      tools: z.array(z.string()).optional().default([]),
      databases: z.array(z.string()).optional().default([]),
      soft: z.array(z.string()).optional().default([]),
    }).default(() => ({
      languages: [],
      frameworksAndTools: [],
      cloudAndDevOps: [],
      csFundamentals: [],
      frameworks: [],
      tools: [],
      databases: [],
      soft: [],
    })),
    certifications: z.array(
      z.object({
        name: z.string().default(""),
        issuer: z.string().default(""),
        year: z.string().default(""),
      })
    ).optional().default([]),
    achievements: z.array(
      z.object({
        description: z.string().default(""),
        year: z.string().optional().default(""),
      })
    ).optional().default([]),
  }),
  atsCompatibilityScore: z.number().min(0).max(100).default(75),
  atsDetails: z.object({
    keywordMatchPercent: z.number().min(0).max(100).default(70),
    formattingScore: z.number().min(0).max(100).default(80),
    sectionCompletenessScore: z.number().min(0).max(100).default(90),
    templateFormattingScore: z.number().min(0).max(100).optional().default(85),
    recommendedTemplateId: z
      .enum([
        "ats_strict",
        "modern_professional",
        "modern_executive",
        "tech_innovator",
      ])
      .optional()
      .default("ats_strict"),
    issues: z.array(z.string()).default([]),
    suggestions: z.array(z.string()).default([]),
  }).default({
    keywordMatchPercent: 70,
    formattingScore: 80,
    sectionCompletenessScore: 90,
    templateFormattingScore: 85,
    recommendedTemplateId: "ats_strict",
    issues: [],
    suggestions: [],
  }),
  diffNotes: z.array(z.string()).default([]),
});

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

export const tailorResume = action({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const log = createLogger({ traceId: generateTraceId(), jobId: args.jobId, layer: "tailor" });
    log.info("ACTION START: tailorResume");
    try {
      if (!process.env.NVIDIA_NIM_API_KEY) {
        throw new Error("CRITICAL: NVIDIA API KEY MISSING FROM CONVEX ENV");
      }

      // 1. Fetch job & user profile
      const { job, profile } = await ctx.runQuery(internal.jobs.internalGetJobAndProfile, {
        jobId: args.jobId,
      });

      if (!job) throw new Error("Job not found.");
      if (!profile) throw new Error("Master Profile not found.");
      if (!job.extractedRequirements) throw new Error("Extracted requirements not found.");

      // 2. Prepare PII-masked profile
      const maskedProfile = {
        ...profile,
        personalInfo: profile.personalInfo ? maskPersonalInfo(profile.personalInfo) : undefined,
      };

      // 3. Compile gap responses
      const gapAnswers = (job.skillGapQuestions || [])
        .filter((q: any) => q.hasSkill && q.userResponse)
        .map((q: any) => `- Skill: ${q.skill}\n  Response: ${q.userResponse}`)
        .join("\n");

      // 4. Invoke Qwen 3.5 NIM to rewrite and compute ATS scores in one optimized step
      console.log("✍️ Step 4: Tailoring resume JSON using Qwen 3.5 NIM...");
      const apiKey = process.env.NVIDIA_NIM_API_KEY;
      if (!apiKey) throw new Error("NVIDIA_NIM_API_KEY is not set.");
      const openai = new OpenAI({ apiKey, baseURL: "https://integrate.api.nvidia.com/v1" });

      const prompt = `You are an expert technical resume writer specializing in ATS-optimized resumes for software engineering and CS placements at top-tier companies.

OUTPUT CONTRACT (non-negotiable):
- Return ONLY valid JSON matching the provided schema. No markdown, no prose, no code fences.
- Every text field must be PLAIN TEXT — no LaTeX commands, no bold/italic markup, no manual spacing, no bullet characters. Formatting is applied downstream, not by you.
- Do not fabricate company names or employment dates for roles the candidate never held.
- CRITICAL 1-PAGE DENSITY & SYNTHESIS RULE: If the candidate's master profile has 0 work experience entries and 0 project entries, synthesize 2 to 3 relevant technical projects using their technical skills, education background, gap answers, and the job requirements. Never leave both experience AND projects empty, as that results in a half-blank document. Every project entry must include a clear project name, technologies used, and 2–3 impact-focused bullet points.

CONTENT RULES:
1. Reverse-chronological order for experience and projects.
2. Every bullet starts with a strong past/present-tense action verb (Built, Led, Optimized, Reduced, Designed) — never "Responsible for" or "Worked on."
3. Every bullet follows: [Action] + [What/How] + [Quantified Result] wherever the source data supports a number (%, time, scale, users, latency). If no real metric exists, do not invent one — write the qualitative impact instead.
4. Bullets are 1–2 lines max (roughly 20–30 words). Split anything longer.
5. Mirror the exact keywords and terminology from the job description's required skills wherever truthfully applicable to the candidate's real experience — this is for ATS keyword matching, not padding. Never claim a skill the candidate doesn't have.
6. Technical Skills section: group into the same categories every time (languages → Languages, frameworks/tools → Frameworks & Tools, cloud/devops/infra tools → Cloud & DevOps, CS-theory items like DSA, OOP, DBMS, SDLC, Agile, OS → CS Fundamentals) — consistent category set and order across every resume.
7. Total content must populate a clean, high-density 1-page layout for candidates. Ensure sufficient bullet depth across experience and projects so the page is well-balanced without empty lower halves.

ATS-SAFETY RULES:
- No tables, columns, text boxes, icons, or images in any content field — single-column linear structure only.
- Standard section headers only: EDUCATION, TECHNICAL SKILLS, EXPERIENCE, PROJECTS, CERTIFICATIONS. Never invent creative header names.
- Dates in "Month YYYY – Month YYYY" or "Month YYYY – Present" format, consistent across every entry.
- No special characters in any field that would break LaTeX compilation if not escaped: treat & % $ # _ { } ~ ^ as literal characters the renderer will escape — do not attempt to escape them yourself.

=== EXTRACTED JOB REQUIREMENTS ===
Required Hard Skills: ${job.extractedRequirements.hardSkills.join(", ")}
Keywords to Include: ${(job.extractedRequirements.keywordsToInclude || []).join(", ")}
Company Industry/Culture: ${job.extractedRequirements.companyInsights?.industry || "Tech"} (${(job.extractedRequirements.companyInsights?.cultureKeywords || []).join(", ")})

=== USER SKILL GAP ANSWERS ===
${gapAnswers || "No gaps responded."}

=== CANDIDATE MASTER PROFILE (PII Redacted) ===
PersonalInfo: (Keep placeholder values: [CANDIDATE_NAME], [CANDIDATE_EMAIL], [CANDIDATE_PHONE])
${JSON.stringify(maskedProfile, null, 2)}

Return ONLY a valid JSON block matching this schema:
{
  "structuredContent": {
    "personalInfo": {
      "name": "[CANDIDATE_NAME]",
      "email": "[CANDIDATE_EMAIL]",
      "phone": "[CANDIDATE_PHONE]",
      "linkedin": "...",
      "github": "...",
      "portfolio": "..."
    },
    "education": [
      {
        "institution": "...",
        "degree": "...",
        "gpa": "...",
        "year": "...",
        "relevantCourses": ["...", "..."]
      }
    ],
    "experience": [
      {
        "company": "...",
        "role": "...",
        "duration": "...",
        "bullets": ["...", "..."],
        "technologies": ["...", "..."]
      }
    ],
    "projects": [
      {
        "name": "...",
        "description": "...",
        "technologies": ["...", "..."],
        "link": "...",
        "bullets": ["...", "..."]
      }
    ],
    "skills": {
      "languages": ["...", "..."],
      "frameworksAndTools": ["...", "..."],
      "cloudAndDevOps": ["...", "..."],
      "csFundamentals": ["...", "..."]
    },
    "certifications": [],
    "achievements": []
  },
  "atsCompatibilityScore": 95,
  "scoringBreakdown": {
    "keywordMatchPercent": 90,
    "formattingScore": 100,
    "sectionCompletenessScore": 100,
    "templateFormattingScore": 100,
    "recommendedTemplateId": "ats_strict",
    "overallScore": 95
  },
  "issues": [],
  "suggestions": [],
  "diffNotes": ["..."]
}`;

      log.info("Invoking NIM for resume tailoring", { taskCategory: "tailoring" });
      incrementMetric(METRICS.NIM_CALLS);
      const nimStart = Date.now();
      const completion = await invokeRoutedNim(
        "tailoring",
        (selectedModel) =>
          openai.chat.completions.create({
            model: selectedModel,
            messages: [
              { role: "system", content: `${resumeMakerSkill}\n\n${atsAuditorSkill}` },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
            max_tokens: 1400,
          }),
        { label: "Resume tailoring" }
      );
      const nimDuration = Date.now() - nimStart;
      log.info("Tailoring NIM complete", { durationMs: nimDuration });

      const responseText = completion.choices[0]?.message?.content || "";
      const parsedOutput = cleanAndParseJSON(responseText);

      // Validate schema
      const validatedOutput = TailoredResumeSchema.parse(parsedOutput);
      log.info("Tailoring complete — ready for compilation", { atsScore: validatedOutput.atsCompatibilityScore });

      // 5. Re-inject PII (Restore actual name, email, phone, links)
      validatedOutput.structuredContent = reInjectPersonalInfo(
        validatedOutput.structuredContent,
        profile.personalInfo || { name: "Unknown", email: "Unknown", phone: "Unknown" }
      );

      console.log("🛠️ Step 6: Ready for client-side compilation.");
      // 6. Save tailored resume in database & transition to "compiling" state
      await ctx.runMutation(internal.jobs.internalSetTailoredResume, {
        jobId: args.jobId,
        structuredContent: validatedOutput.structuredContent,
        atsCompatibilityScore: validatedOutput.atsCompatibilityScore,
        atsDetails: validatedOutput.atsDetails,
        diffNotes: validatedOutput.diffNotes,
      });

    } catch (err: any) {
      const message = err instanceof Error ? err.message : "Unknown error";
      log.error("Layer 2 tailoring failed", { error: message });
      captureError(err, log.getContext());
      incrementMetric(METRICS.NIM_FAILURES);
      const userFacingError = message.includes("circuit breaker") || message.includes("rate limit")
        ? "AI service is briefly cooling down. Retrying automatically..."
        : message;
      // Graceful error state transition
      await ctx.runMutation(internal.jobs.internalUpdateJobState, {
        jobId: args.jobId,
        expectedState: "tailoring",
        newState: "failed",
        error: userFacingError,
      });
      throw new ConvexError(userFacingError);
    }
  },
});
