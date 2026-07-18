// convex/ai/outreach.ts
//
// Background Action: Generate Tailored Cover Letter & Networking Outreach Notes
// Consumes job details and tailored resume, generating professional outreach copy.

"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { OpenAI } from "openai";
import { z } from "zod";

const OutreachPayloadSchema = z.object({
  coverLetter: z.string(),
  outreachEmail: z.string(),
  linkedinNote: z.string(),
});

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
    // Attempt to fix trailing commas before closing brackets/braces
    cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");
    return JSON.parse(cleaned);
  }
}

export const generateCoverLetterAndOutreach = action({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    console.log("ACTION START: generateCoverLetterAndOutreach", args.jobId);
    
    try {
      if (!process.env.NVIDIA_NIM_API_KEY) {
        throw new Error("CRITICAL: NVIDIA API KEY MISSING FROM CONVEX ENV");
      }

      // 1. Fetch job and tailored resume details
      const { job } = await ctx.runQuery(internal.jobs.internalGetJobAndProfile, {
        jobId: args.jobId,
      });
      if (!job) throw new Error("Job not found.");

      const resume = await ctx.runQuery(api.resumes.getResumeForAction, {
        jobId: args.jobId,
      });
      if (!resume) {
        throw new Error("Tailored resume not found. Please tailor your resume before generating outreach materials.");
      }

      const structuredContent = resume.structuredContent;
      const personalInfo = structuredContent.personalInfo || {};

      // 2. Prepare the AI prompt
      const apiKey = process.env.NVIDIA_NIM_API_KEY;
      const openai = new OpenAI({ apiKey, baseURL: "https://integrate.api.nvidia.com/v1" });

      const prompt = `You are an expert career coach and executive copywriter. 
Your objective is to generate three highly tailored networking assets for the candidate based on their tailored resume and the target job description:
1. A professional formal **Cover Letter** (exactly 3 paragraphs, tailored specifically to the company's culture and role requirements, addressing why the candidate is excited and uniquely qualified).
2. A compelling **Cold Outreach Email** (includes a short, high-open-rate subject line and a concise, engaging body highlighting relevant technical skills and projects with a clear call to action for a brief call).
3. A highly concise **LinkedIn Connection Note** (warm, personalized, and strictly under 280 characters to ensure it fits LinkedIn's 300-character limit).

=== TARGET JOB DESCRIPTION ===
Company: ${job.companyName}
Role: ${job.jobTitle}
Job Details: ${job.rawJdText}

=== CANDIDATE TAILORED RESUME ===
${JSON.stringify(structuredContent, null, 2)}

Instructions:
- Use the candidate's real contact info if available: Name: ${personalInfo.name || "Candidate"}, Email: ${personalInfo.email || "Email"}, Phone: ${personalInfo.phone || "Phone"}.
- Maintain a highly professional, confident, and polite tone.
- Do not use placeholders like "[Insert Date]" or "[Company Name]". Use the real company name (${job.companyName}) and role name (${job.jobTitle}).
- Keep the LinkedIn connection note extremely short (under 280 characters).

Return ONLY a valid JSON block matching this schema:
{
  "coverLetter": "Dear Hiring Team at [Company]... [3 paragraphs of tailored cover letter content] ... Sincerely, [Candidate Name]",
  "outreachEmail": "Subject: [Compelling Subject Line]\\n\\nHi [Recruiter Name/Hiring Manager],\\n\\n[Concise, impactful body highlighting specific matching experience from tailored resume]\\n\\nBest regards,\\n\\n[Candidate Name]",
  "linkedinNote": "[Concise connection request message under 280 characters]"
}`;

      // 3. Call Llama 3.3 NIM
      const completion = await openai.chat.completions.create({
        model: "meta/llama-3.2-90b-vision-instruct",
        messages: [
          { role: "system", content: "You are a professional outreach copywriter. You output only valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2048,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      const parsedOutput = cleanAndParseJSON(responseText);
      const validatedOutput = OutreachPayloadSchema.parse(parsedOutput);

      // Ensure LinkedIn note is strictly bounded (truncate if LLM fails character limit slightly)
      let linkedinNote = validatedOutput.linkedinNote.trim();
      if (linkedinNote.length > 295) {
        linkedinNote = linkedinNote.slice(0, 292) + "...";
      }

      const outreachNotesObject = {
        outreachEmail: validatedOutput.outreachEmail,
        linkedinNote: linkedinNote,
      };

      // 4. Save cover letter and outreach notes to database
      await ctx.runMutation(api.resumes.saveCoverLetterAndOutreach, {
        jobId: args.jobId,
        coverLetter: validatedOutput.coverLetter,
        outreachNotes: JSON.stringify(outreachNotesObject),
      });

      return {
        success: true,
        coverLetter: validatedOutput.coverLetter,
        outreachEmail: validatedOutput.outreachEmail,
        linkedinNote: linkedinNote,
      };

    } catch (err: any) {
      console.error("Outreach materials generation failed:", err);
      throw new Error(err.message || "Failed to generate outreach copy.");
    }
  },
});
