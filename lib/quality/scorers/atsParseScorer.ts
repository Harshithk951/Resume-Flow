import type { TemplateId } from "@/lib/latex/resolveTemplate";
import type { DimensionResult, EvaluationInput } from "../types";
import { TEMPLATE_PASS_PROFILES as PROFILES } from "../types";

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function matchKeyword(text: string, keyword: string): boolean {
  const norm = normalizeText(text);
  const kw = normalizeText(keyword);
  if (norm.includes(kw)) return true;
  // Allow partial match for compound skills
  const tokens = kw.split(/[\s/]+/).filter(Boolean);
  return tokens.length > 0 && tokens.every((t) => norm.includes(t));
}

export function extractPdfText(
  pdfBuffer: Buffer
): Promise<{ text: string; pageCount: number }> {
  return import("@cedrugs/pdf-parse").then(async (mod) => {
    const pdfParse = mod.default ?? mod;
    const data = await pdfParse(pdfBuffer);
    return {
      text: data.text ?? "",
      pageCount: data.numpages ?? 1,
    };
  });
}

export function scoreAtsParse(
  input: EvaluationInput,
  pdfText: string,
  templateId: TemplateId
): DimensionResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const profile = PROFILES[templateId];
  const text = pdfText;
  const norm = normalizeText(text);

  let score = 100;

  const sectionChecks = [
    { name: "Experience", pattern: /experience|professional experience|work experience/i },
    { name: "Education", pattern: /education/i },
    { name: "Skills", pattern: /skills|technical skills/i },
  ];

  for (const { name, pattern } of sectionChecks) {
    if (!pattern.test(text)) {
      issues.push(`Section not detected in PDF text: ${name}`);
      score -= 12;
      suggestions.push(`Ensure "${name}" appears as a standard section heading`);
    }
  }

  const pi = input.resume.personalInfo;
  if (pi.email && !norm.includes(normalizeText(pi.email))) {
    issues.push("Email not recoverable from PDF text");
    score -= 10;
  }
  if (pi.phone) {
    const digits = pi.phone.replace(/\D/g, "");
    const textDigits = text.replace(/\D/g, "");
    if (digits.length >= 7 && !textDigits.includes(digits.slice(-7))) {
      issues.push("Phone not recoverable from PDF text");
      score -= 5;
    }
  }
  if (pi.linkedin && !/linkedin/i.test(text)) {
    issues.push("LinkedIn not recoverable from PDF text");
    score -= 5;
  }

  const keywords = [...input.jd.hardSkills, ...input.jd.keywordsToInclude];
  const uniqueKeywords = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))];
  let matched = 0;
  const missing: string[] = [];

  for (const kw of uniqueKeywords) {
    if (matchKeyword(text, kw)) {
      matched++;
    } else {
      missing.push(kw);
    }
  }

  const keywordRecovery =
    uniqueKeywords.length > 0
      ? Math.round((matched / uniqueKeywords.length) * 100)
      : 100;

  if (keywordRecovery < profile.minKeywordRecovery) {
    issues.push(
      `Keyword recovery ${keywordRecovery}% below template floor ${profile.minKeywordRecovery}%`
    );
    if (missing.length > 0) {
      suggestions.push(`Add or surface keywords: ${missing.slice(0, 8).join(", ")}`);
    }
    score -= Math.min(30, profile.minKeywordRecovery - keywordRecovery);
  }

  if (text.length < 200) {
    issues.push("Extracted PDF text is very short — possible parse failure");
    score -= 20;
  }

  score = Math.max(0, Math.min(100, score));
  const formattingScore = score;
  const passed =
    keywordRecovery >= profile.minKeywordRecovery &&
    formattingScore >= profile.minFormattingScore;

  return {
    id: "atsParse",
    label: "ATS Parse & Text Recovery",
    score: formattingScore,
    weight: 0.25,
    passed,
    blocking: keywordRecovery < profile.minKeywordRecovery - 10,
    issues,
    suggestions,
    metadata: {
      keywordRecovery,
      missingKeywords: missing,
      textLength: text.length,
    },
  };
}
