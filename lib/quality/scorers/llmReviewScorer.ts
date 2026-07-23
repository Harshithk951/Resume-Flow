import OpenAI from "openai";
import type { TemplateId } from "@/lib/latex/resolveTemplate";
import type { DimensionResult, EvaluationInput } from "../types";
import { TEMPLATE_PASS_PROFILES } from "../types";
import { atsAuditorSkill, hiringManagerSkill } from "@/convex/ai/Skills/registry";

export interface LlmReviewScores {
  atsScore: number;
  hmScore: number;
  summary: string;
}

export async function runLlmShortlistReview(
  input: EvaluationInput,
  pdfText: string
): Promise<LlmReviewScores | null> {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) return null;

  const openai = new OpenAI({
    apiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });

  const prompt = `You are evaluating a resume PDF text extract for shortlisting potential.

TEMPLATE ID: ${input.templateId}
JOB DESCRIPTION:
${input.jd.rawText}

RESUME TEXT (from PDF extraction):
${pdfText.slice(0, 12000)}

Return ONLY valid JSON:
{
  "atsScore": 0-100,
  "hmScore": 0-100,
  "summary": "one paragraph"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.3-70b-instruct",
      messages: [
        {
          role: "system",
          content: `${atsAuditorSkill.slice(0, 8000)}\n\n${hiringManagerSkill.slice(0, 4000)}`,
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 512,
    });

    const text = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text) as LlmReviewScores;
    return {
      atsScore: Math.min(100, Math.max(0, Number(parsed.atsScore) || 0)),
      hmScore: Math.min(100, Math.max(0, Number(parsed.hmScore) || 0)),
      summary: parsed.summary ?? "",
    };
  } catch {
    return null;
  }
}

export function scoreLlmReview(
  templateId: TemplateId,
  llm: LlmReviewScores | null
): DimensionResult {
  if (!llm) {
    return {
      id: "llmReview",
      label: "LLM Shortlist Review",
      score: 0,
      weight: 0.15,
      passed: true,
      blocking: false,
      skipped: true,
      issues: ["NVIDIA_NIM_API_KEY not set — LLM review skipped"],
      suggestions: [],
    };
  }

  const profile = TEMPLATE_PASS_PROFILES[templateId];
  const score = Math.round((llm.atsScore + llm.hmScore) / 2);
  const issues: string[] = [];
  if (llm.atsScore < profile.minLlmAtsScore) {
    issues.push(`LLM ATS score ${llm.atsScore} below ${profile.minLlmAtsScore}`);
  }
  if (llm.hmScore < profile.minLlmHmScore) {
    issues.push(`LLM HM score ${llm.hmScore} below ${profile.minLlmHmScore}`);
  }

  return {
    id: "llmReview",
    label: "LLM Shortlist Review",
    score,
    weight: 0.15,
    passed:
      llm.atsScore >= profile.minLlmAtsScore &&
      llm.hmScore >= profile.minLlmHmScore,
    blocking: false,
    issues,
    suggestions: [],
    metadata: {
      atsScore: llm.atsScore,
      hmScore: llm.hmScore,
      summary: llm.summary,
    },
  };
}
