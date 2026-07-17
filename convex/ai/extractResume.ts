// convex/ai/extractResume.ts
//
// Background Action: Resume Information Extraction
// Extracts structured resume data from PDFs or images, validating with Zod and returning
// a JSON object matching MasterProfile schema. Enforces PII masking on text streams.

"use node";

import { action } from "../_generated/server";
import { v, ConvexError } from "convex/values";
import { OpenAI } from "openai";
import pdf from "@cedrugs/pdf-parse";
import { validateUpload } from "../lib/uploadValidation";
import { z } from "zod";
import { api, internal } from "../_generated/api";

// ─── Zod Schema for Validation ──────────────────────────────

const MasterProfileSchema = z.object({
  personalInfo: z.object({
    name: z.string().default(""),
    email: z.string().default(""),
    phone: z.string().default(""),
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
});

// ─── PII Masking Utilities ───────────────────────────────────

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractAndMaskPII(text: string): {
  maskedText: string;
  pii: { name?: string; email?: string; phone?: string };
} {
  let maskedText = text;
  const pii: { name?: string; email?: string; phone?: string } = {};

  // Extract Email
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const emails = text.match(emailRegex);
  if (emails && emails.length > 0) {
    pii.email = emails[0];
    maskedText = maskedText.replace(emailRegex, "[CANDIDATE_EMAIL]");
  }

  // Extract Phone
  const phoneRegex = /(\+?[0-9][0-9\-\s\(\)]{7,15}[0-9])/g;
  const phones = text.match(phoneRegex);
  if (phones && phones.length > 0) {
    const validPhones = phones.filter((p) => p.replace(/[\-\s\(\)]/g, "").length >= 10);
    if (validPhones.length > 0) {
      pii.phone = validPhones[0];
      maskedText = maskedText.replace(
        new RegExp(escapeRegExp(validPhones[0]), "g"),
        "[CANDIDATE_PHONE]"
      );
    }
  }

  // Extract Name (heuristic: first non-empty line)
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 0 && lines[0].length < 50) {
    pii.name = lines[0];
    maskedText = maskedText.replace(new RegExp(escapeRegExp(lines[0]), "g"), "[CANDIDATE_NAME]");
  }

  return { maskedText, pii };
}

// Helper to clean Markdown tags and parse JSON with robust fallbacks
function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "");
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

export const extractProfile = action({
  args: {
    storageId: v.id("_storage"),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    console.log("ACTION START: extractProfile");
    let profileId: string | null = null;
    try {
      if (!process.env.NVIDIA_NIM_API_KEY) {
        throw new Error("CRITICAL: NVIDIA API KEY MISSING FROM CONVEX ENV");
      }

      profileId = await ctx.runMutation(api.profiles.updateExtractionStatus, {
        status: "extracting",
      });

      console.log("📥 Step 1: Fetching file from Convex storage...");
      // 1. Fetch file from Convex storage
      const downloadUrl = await ctx.storage.getUrl(args.storageId);
      if (!downloadUrl) {
        throw new Error("Uploaded file could not be retrieved from storage.");
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error("Failed to download file from storage.");
      }
      const arrayBuffer = await response.arrayBuffer();
      console.log("📏 Step 2: File downloaded. Size:", arrayBuffer.byteLength, "bytes");

      console.log("🔍 Step 3: Determining file type...");
      let mimeType: string | null = null;
      try {
        // Attempt magic bytes validation
        const validated = validateUpload(arrayBuffer, args.fileSize);
        mimeType = validated.mimeType;
        console.log("MIME type determined by magic bytes:", mimeType);
      } catch (validationErr: any) {
        console.warn("Magic bytes check failed, trying fallback detection...", validationErr.message);
      }

      // Check if the original file bytes represent a PDF by trying a parsed PDF fallback
      if (!mimeType) {
        console.log("MIME type undetermined. Attempting PDF parsing fallback...");
        try {
          const pdfBuffer = Buffer.from(arrayBuffer);
          const parsedPdf = await pdf(pdfBuffer);
          // If @cedrugs/pdf-parse successfully extracts text content, classify as PDF
          if (parsedPdf && parsedPdf.text && parsedPdf.text.trim().length > 0) {
            mimeType = "application/pdf";
            console.log("PDF parse fallback succeeded. Treated as application/pdf.");
          }
        } catch (pdfErr: any) {
          console.warn("PDF parse fallback check failed:", pdfErr.message);
        }
      }

      // Final default fallback
      if (!mimeType) {
        console.log("MIME type undetermined after fallback. Defaulting safely to image/png.");
        mimeType = "image/png";
      }

      // Initialize OpenAI client for NVIDIA NIM
      const apiKey = process.env.NVIDIA_NIM_API_KEY;
      if (!apiKey) {
        throw new Error("NVIDIA_NIM_API_KEY environment variable is not set.");
      }
      const openai = new OpenAI({
        apiKey,
        baseURL: "https://integrate.api.nvidia.com/v1",
      });

      let resumeData: any = null;
      let extractedPii: { name?: string; email?: string; phone?: string } = {};

      const systemPrompt = `You are a professional ATS-optimized resume parsing engine.
Your goal is to parse the provided resume content and format it into a single, valid JSON block.
Do not output any explanations, markdown notes, or formatting. Output only the JSON.

Follow this exact JSON structure:
{
  "personalInfo": {
    "name": "Full Name",
    "email": "Email Address",
    "phone": "Phone Number",
    "linkedin": "LinkedIn profile URL (optional)",
    "github": "GitHub profile URL (optional)",
    "portfolio": "Portfolio URL (optional)"
  },
  "education": [
    {
      "institution": "University/School Name",
      "degree": "Degree and Major (e.g. B.Tech in Computer Science)",
      "gpa": "GPA or Percentage (e.g. 9.1/10 or 85% - optional)",
      "year": "Graduation Year (e.g. 2026)",
      "relevantCourses": ["Course A", "Course B"]
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Duration (e.g. June 2024 - Present)",
      "bullets": ["Bullet point detail 1", "Bullet point detail 2"],
      "technologies": ["React", "Node.js"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Short description",
      "technologies": ["Python", "Flask"],
      "link": "Project URL (optional)",
      "bullets": ["Highlight bullet point 1", "Highlight bullet point 2"]
    }
  ],
  "skills": {
    "languages": ["JavaScript", "Python"],
    "frameworks": ["Next.js", "Django"],
    "tools": ["Git", "Docker"],
    "databases": ["PostgreSQL", "MongoDB"],
    "soft": ["Communication", "Problem Solving"]
  },
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuer Organization",
      "year": "Year Earned"
    }
  ],
  "achievements": [
    {
      "description": "Achievement details and context",
      "year": "Year"
    }
  ]
}

If any section or field is completely missing in the resume, return an empty array [] or empty string "" for that field rather than skipping the key. Do not hallucinate any information.`;

      if (mimeType === "application/pdf") {
        console.log("📄 Processing file as PDF...");
        // ─── PDF Parsing Stream ───
        const pdfBuffer = Buffer.from(arrayBuffer);
        const parsedPdf = await pdf(pdfBuffer);
        const rawText = parsedPdf.text;

        // Mask PII on the server before sending to LLM
        const { maskedText, pii } = extractAndMaskPII(rawText);
        extractedPii = pii;

        console.log("Step 4: Sending payload to model");

        const completion = await openai.chat.completions.create({
          model: "meta/llama-3.2-11b-vision-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Extract the resume content from the following MASKED text:\n\n${maskedText}`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 3072,
        });

        const responseText = completion.choices[0]?.message?.content || "";
        console.log("✅ Step 5: Qwen responded successfully. Parsing JSON...");
        resumeData = cleanAndParseJSON(responseText);

        // Re-inject PII
        if (resumeData && resumeData.personalInfo) {
          if (extractedPii.name) resumeData.personalInfo.name = extractedPii.name;
          if (extractedPii.email) resumeData.personalInfo.email = extractedPii.email;
          if (extractedPii.phone) resumeData.personalInfo.phone = extractedPii.phone;
        }
      } else {
        console.log("🖼️ Processing file as Image (" + mimeType + ")...");
        // ─── Image Vision Parsing Stream ───
        const base64Image = Buffer.from(arrayBuffer).toString("base64");

        console.log("Step 4: Sending image payload to model");

        const completion = await openai.chat.completions.create({
          model: "meta/llama-3.2-11b-vision-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract the resume content from this uploaded image. Output the structured JSON schema only.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 3072,
        });

        const responseText = completion.choices[0]?.message?.content || "";
        console.log("✅ Step 5: Qwen responded successfully. Parsing JSON...");
        resumeData = cleanAndParseJSON(responseText);
      }

      // 3. Schema validation with Zod
      let validatedData;
      try {
        validatedData = MasterProfileSchema.parse(resumeData);
      } catch (zodError) {
        console.error("Zod validation failed:", zodError);
        throw new Error("AI returned invalid data format.");
      }

      if (profileId) {
        await ctx.runMutation(internal.profiles.markExtractionSuccess, {
          profileId: profileId as any,
          ...validatedData,
        });
      }

      return validatedData;
    } catch (error) {
      const err = error as any;
      // 🛡️ Security: Log only sanitized error (no raw error/PII leaked)
      console.error("Extraction failed:", err instanceof Error ? err.message : "Unknown error");
      if (profileId) {
        try {
          await ctx.runMutation(internal.profiles.markExtractionFailed, {
            profileId: profileId as any,
            errorMessage: err.message || String(err),
          });
        } catch (mutationErr) {
          console.error("Failed to call markExtractionFailed mutation:", mutationErr);
        }
      }
      throw new ConvexError(
        err.message || "ResumeFlow AI is currently experiencing high traffic. Please try again in a few moments."
      );
    }
  },
});
