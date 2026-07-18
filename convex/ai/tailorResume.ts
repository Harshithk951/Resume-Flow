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
      languages: z.array(z.string()).default([]),
      frameworks: z.array(z.string()).default([]),
      tools: z.array(z.string()).default([]),
      databases: z.array(z.string()).optional().default([]),
      soft: z.array(z.string()).optional().default([]),
    }).default({ languages: [], frameworks: [], tools: [], databases: [], soft: [] }),
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
    issues: z.array(z.string()).default([]),
    suggestions: z.array(z.string()).default([]),
  }).default({
    keywordMatchPercent: 70,
    formattingScore: 80,
    sectionCompletenessScore: 90,
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
    console.log("ACTION START: tailorResume");
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

      const prompt = `You are an expert resume writer and ATS optimizer.
Your objective is to tailor the candidate's Master Profile to match the Job Description requirements, integrate user answers about missing skills, compute an ATS compatibility score, and return a single valid JSON block.

=== EXTRACTED JOB REQUIREMENTS ===
Required Hard Skills: ${job.extractedRequirements.hardSkills.join(", ")}
Keywords to Include: ${(job.extractedRequirements.keywordsToInclude || []).join(", ")}
Company Industry/Culture: ${job.extractedRequirements.companyInsights?.industry || "Tech"} (${(job.extractedRequirements.companyInsights?.cultureKeywords || []).join(", ")})

=== USER SKILL GAP ANSWERS ===
${gapAnswers || "No gaps responded."}

=== CANDIDATE MASTER PROFILE (PII Redacted) ===
PersonalInfo: (Keep placeholder values: [CANDIDATE_NAME], [CANDIDATE_EMAIL], [CANDIDATE_PHONE])
${JSON.stringify(maskedProfile, null, 2)}

Instructions:
1. **Resume Tailoring**:
   - Rewrite bullet points in experience and projects to emphasize relevant technologies and keywords from the JD.
   - Begin all experience/project bullets with active action verbs (e.g. "Developed", "Optimized", "Architected").
   - Include specific metrics/impact where possible (e.g. "improving performance by 15%").
   - Integrate the "User Skill Gap Answers" context. If the user answered "Yes" to having a skill and gave context, add this skill to the skills section, and write a realistic bullet point in projects or experience highlighting that context!
   - Keep the general timeline, institution names, and company names unchanged.

2. **ATS Scoring**:
   - Compute a heuristic ATS score based on:
     - keywordMatchPercent: What percentage of keywords/skills in the JD are represented in the tailored resume?
     - formattingScore: Grade style (100 is simple, standard single-column, clear section headings).
     - sectionCompletenessScore: Grade presence of Contact, Education, Experience, Projects, and Skills.
     - overallScore: Weighted average of the three.
   - List specific "issues" found (e.g. "Missing certifications section") and actionable "suggestions" for improvement.

3. **Diff Notes**:
   - Provide a list of brief, professional explanations (e.g. "Integrated Docker experience into AWS project description") explaining what you changed and why.

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
      "frameworks": ["...", "..."],
      "tools": ["...", "..."],
      "databases": ["...", "..."],
      "soft": ["...", "..."]
    },
    "certifications": [],
    "achievements": []
  },
  "atsCompatibilityScore": 88,
  "atsDetails": {
    "keywordMatchPercent": 85,
    "formattingScore": 95,
    "sectionCompletenessScore": 90,
    "issues": ["...", "..."],
    "suggestions": ["...", "..."]
  },
  "diffNotes": ["...", "..."]
}`;

      const completion = await openai.chat.completions.create({
        model: "meta/llama-3.2-90b-vision-instruct",
        messages: [
          { role: "system", content: `${resumeMakerSkill}\n\n${atsAuditorSkill}` },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 2048,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      const parsedOutput = cleanAndParseJSON(responseText);

      // Validate schema
      const validatedOutput = TailoredResumeSchema.parse(parsedOutput);
      console.log("🎯 Step 5: Combined heuristic ATS scoring & validation complete.");

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
      // 🛡️ Security: Log only sanitized error (no raw error PII leaked)
      console.error("Layer 2 tailoring failed:", err instanceof Error ? err.message : "Unknown error");
      const sanitizedError = "ResumeFlow AI is currently experiencing high traffic. Please try again in a few moments.";
      // Graceful error state transition
      await ctx.runMutation(internal.jobs.internalUpdateJobState, {
        jobId: args.jobId,
        expectedState: "tailoring",
        newState: "failed",
        error: sanitizedError,
      });
      throw new ConvexError(sanitizedError);
    }
  },
});
