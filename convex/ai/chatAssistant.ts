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

// ─── Guardrails: Prompt Injection & Topic Enforcement ─────────────

/**
 * Patterns that indicate prompt injection or jailbreak attempts.
 * The chatbot will refuse these topics entirely.
 * Patterns are intentionally narrow to avoid blocking legitimate placement prep.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)/i,
  /forget\s+(all\s+)?(previous|above|prior|instructions)/i,
  /disregard\s+(all\s+)?(previous|above|prior)/i,
  /reveal\s+(your|the)\s+(prompt|system|instructions)/i,
  /output\s+(your|the)\s+(prompt|system|instructions)/i,
  /print\s+(your|the)\s+(prompt|system|instructions)/i,
  /show\s+(me\s+)?(your|the)\s+(prompt|system|instructions)/i,
  /you\s+have\s+been\s+(hacked|compromised|overridden)/i,
  /simulate\s+(a\s+)?(hack|breach|override)/i,
  /DAN|do\s+anything\s+now/i,
  /jailbr(ea|ei)k/i,
];

/**
 * Checks if a message contains a prompt injection attempt.
 * Returns the matched pattern or null if clean.
 */
function detectInjection(text: string): string | null {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return pattern.source;
    }
  }
  return null;
}

/**
 * Detects off-topic requests that are outside ResumeFlow's scope.
 * Kept narrow to avoid blocking legitimate prep (coding questions, mock interviews).
 */
const OFF_TOPIC_PATTERNS = [
  /write\s+(me\s+)?a\s+(poem|song|story|novel|script|play)/i,
  /generate\s+(me\s+)?(image|art|picture|drawing|video|music)/i,
  /create\s+(me\s+)?(image|art|picture|drawing|video|music)/i,
  /tell\s+(me\s+)?a\s+(joke|story|riddle)/i,
  /play\s+(a\s+)?game/i,
];

/**
 * Validates user input and returns a guardrail violation message if triggered.
 * Returns null if the message passes all guardrails.
 */
function checkGuardrails(userMessage: string): string | null {
  // Check for prompt injection
  const injectionMatch = detectInjection(userMessage);
  if (injectionMatch) {
    console.warn("[guardrails] Blocked injection attempt — matched pattern:", injectionMatch);
    return "I'm here to help with placement preparation, resume building, and interview practice. Let's keep our conversation focused on your career goals! How can I help you with your job search or interview prep?";
  }

  // Check for off-topic content
  const offTopicMatch = OFF_TOPIC_PATTERNS.find((p) => p.test(userMessage));
  if (offTopicMatch) {
    console.warn("[guardrails] Blocked off-topic request — matched pattern:", offTopicMatch.source);
    return "I'm your ResumeFlow placement assistant — I specialize in resume tailoring, interview preparation, and career guidance. I'll need to pass on that request, but I'm happy to help with your placement prep! What role or company are you targeting?";
  }

  return null;
}

/**
 * Scans assistant response for PII leakage before saving to the database.
 * Masks any detected email addresses or phone numbers.
 */
function sanitizeResponse(text: string): string {
  // Mask email addresses (match existing codebase convention)
  let sanitized = text.replace(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    "[CANDIDATE_EMAIL]"
  );
  // Mask phone numbers (10+ digits with optional formatting)
  sanitized = sanitized.replace(
    /(\+?[0-9][0-9\-\s\(\)]{7,15}[0-9])/g,
    "[CANDIDATE_PHONE]"
  );
  return sanitized;
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

      // 5. Guardrails: Check latest user message for injection / off-topic content
      const lastUserMessage = [...chatHistory]
        .reverse()
        .find((m: any) => m.role === "user");

      if (lastUserMessage) {
        const guardrailViolation = checkGuardrails(lastUserMessage.content);
        if (guardrailViolation) {
          await ctx.runMutation(internal.chat.saveAssistantMessage, {
            userId: args.userId,
            jobId: args.jobId,
            content: guardrailViolation,
          });
          return;
        }
      }

      // 6. Build conversation message stack
      const formattedHistory = formatChatMessages(chatHistory);
      const messages = [{ role: "system", content: systemPrompt }, ...formattedHistory];

      // 7. Invoke Llama 3.2 11B NIM
      const apiKey = process.env.NVIDIA_NIM_API_KEY;
      if (!apiKey) throw new Error("NVIDIA_NIM_API_KEY is not configured.");
      const openai = new OpenAI({ apiKey, baseURL: "https://integrate.api.nvidia.com/v1" });

      const completion = await openai.chat.completions.create({
        model: "meta/llama-3.2-90b-vision-instruct",
        messages: messages as any,
        temperature: 0.5,
        max_tokens: 1536,
      });

      const assistantResponse =
        completion.choices[0]?.message?.content ||
        "I'm sorry, I encountered an issue generating a response. Please try again.";

      // 8. Output guardrails: sanitize PII before saving
      const sanitizedResponse = sanitizeResponse(assistantResponse);

      // 9. Write response to DB via internal mutation
      await ctx.runMutation(internal.chat.saveAssistantMessage, {
        userId: args.userId,
        jobId: args.jobId,
        content: sanitizedResponse,
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
