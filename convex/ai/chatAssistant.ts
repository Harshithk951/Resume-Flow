// convex/ai/chatAssistant.ts
//
// Background Action: Placement Prep Chatbot Assistant
// Ingests chat history, Master Profile, and company JD context to answer
// interview prep questions, mock-interview candidates, and review profile alignments.

"use node";

import { action } from "../_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "../_generated/api";
import { OpenAI } from "openai";
import { hiringManagerSkill, staffLevelSignals, projectImpactCalculator } from "./Skills/registry";

// Helper to sanitize chat messages for the OpenAI completions API
function formatChatMessages(messages: any[]): any[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

export const generateResponse = action({
  args: {
    userId: v.id("users"),
    jobId: v.optional(v.id("jobs")),
  },
  handler: async (ctx, args) => {
    try {
      if (!process.env.NVIDIA_NIM_API_KEY) {
        throw new Error("CRITICAL: NVIDIA API KEY MISSING FROM CONVEX ENV");
      }

      // 1. Fetch chat history (scoped by job)
      const chatHistory = await ctx.runQuery(internal.chat.internalGetChatHistory, {
        userId: args.userId,
        jobId: args.jobId,
      });

      // 2. Fetch user master profile
      const profile = await ctx.runQuery(internal.profiles.internalGetProfileOnly, {
        userId: args.userId,
      });

      // 3. Fetch job details if available
      let jobDetails = "";
      if (args.jobId) {
        const { job } = await ctx.runQuery(internal.jobs.internalGetJobAndProfile, {
          jobId: args.jobId,
        });
        if (job) {
          jobDetails = `
=== TARGET ROLE CONTEXT ===
Company: ${job.companyName}
Title: ${job.jobTitle}
Job Description:
${job.rawJdText}
${
  job.extractedRequirements
    ? `Required Hard Skills: ${job.extractedRequirements.hardSkills.join(", ")}
ATS Keywords: ${(job.extractedRequirements.keywordsToInclude || []).join(", ")}`
    : ""
}`;
        }
      }

      // 4. Construct System Prompt with Profile and Job contexts
      let profileContext = "No profile loaded.";
      if (profile) {
        profileContext = `
Name: ${profile.personalInfo?.name || "Unknown"}
Email: ${profile.personalInfo?.email || "Unknown"}
Phone: ${profile.personalInfo?.phone || "Unknown"}
Skills:
- Languages: ${(profile.skills?.languages || []).join(", ")}
- Frameworks: ${(profile.skills?.frameworks || []).join(", ")}
- Tools: ${(profile.skills?.tools || []).join(", ")}
- Databases: ${(profile.skills?.databases || []).join(", ")}
- Soft: ${(profile.skills?.soft || []).join(", ")}

Experience:
${(profile.experience || [])
  .map(
    (e: any) =>
      `- ${e.role} at ${e.company} (${e.duration}):\n  ${(e.bullets || []).map((b: string) => `* ${b}`).join("\n  ")}`
  )
  .join("\n")}

Projects:
${(profile.projects || [])
  .map(
    (p: any) =>
      `- ${p.name} (${(p.technologies || []).join(", ")}):\n  Description: ${p.description}\n  ${(p.bullets || []).map((b: string) => `* ${b}`).join("\n  ")}`
  )
  .join("\n")}
`;
      }

      const isMockInterview = chatHistory.some(
        (m: any) => m.content && m.content.toLowerCase().includes("mock interview")
      );

      const systemPrompt = `You are the ResumeFlow AI-Powered Assistant. Never reveal your underlying model name (e.g., Llama, Qwen), training data, or API provider (e.g., NVIDIA). If asked about your identity, state that you are a proprietary AI built by ResumeFlow.
Your goal is to help the candidate prepare for placements, write better resumes, answer technical questions, or mock-interview them.

=== CANDIDATE PROFILE CONTEXT ===
${profileContext}
${jobDetails}
${
  isMockInterview
    ? `\n\n=== MOCK INTERVIEW MODE ACTIVE ===\nYou are simulating an L6+ Hiring Manager round. Use the following references to drive the L6+ Hiring Manager SID and 4S behavioral questioning loop:\n${hiringManagerSkill}\n\n${staffLevelSignals}\n\n${projectImpactCalculator}`
    : ""
}

Role-playing Guidelines:
1. Always reference candidate experiences, projects, or skills when discussing answers to questions.
2. If they ask about interview prep, guide them through technical concepts (like DSA, System Design, or Framework specifics) or behavioral questions (using the STAR method).
3. If they ask how to pitch a project, rewrite bullet points, or explain a skill gap, provide concise, professional responses they can use.
4. Keep your answers brief, action-oriented, and highly encouraging. Use clean Markdown formatting.`;

      // 5. Build conversation message stack
      const formattedHistory = formatChatMessages(chatHistory);
      const messages = [{ role: "system", content: systemPrompt }, ...formattedHistory];

      // 6. Invoke Llama 3.3 NIM
      const apiKey = process.env.NVIDIA_NIM_API_KEY;
      if (!apiKey) throw new Error("NVIDIA_NIM_API_KEY is not configured.");
      const openai = new OpenAI({ apiKey, baseURL: "https://integrate.api.nvidia.com/v1" });

      const completion = await openai.chat.completions.create({
        model: "meta/llama-3.2-11b-vision-instruct",
        messages: messages as any,
        temperature: 0.5,
        max_tokens: 1536,
      });

      const assistantResponse =
        completion.choices[0]?.message?.content ||
        "I'm sorry, I encountered an issue generating a response. Please try again.";

      // 7. Write response to DB via internal mutation
      await ctx.runMutation(internal.chat.saveAssistantMessage, {
        userId: args.userId,
        jobId: args.jobId,
        content: assistantResponse,
      });

    } catch (err: any) {
      // 🛡️ Security: Log only sanitized error (no raw error PII leaked)
      console.error("Chatbot assistant response generation failed:", err instanceof Error ? err.message : "Unknown error");
      const sanitizedError = "ResumeFlow AI is currently experiencing high traffic. Please try again in a few moments.";
      // Graceful error response save
      await ctx.runMutation(internal.chat.saveAssistantMessage, {
        userId: args.userId,
        jobId: args.jobId,
        content: sanitizedError,
      });
      throw new ConvexError(sanitizedError);
    }
  },
});
