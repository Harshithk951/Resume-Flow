import { exportToHtml } from "@/lib/html/exporter";
import type { StructuredResumeContent } from "@/lib/pdf/types";
import type { TemplateId } from "@/lib/latex/resolveTemplate";
import type { DimensionResult } from "../types";
import { collectBullets } from "./xyzScorer";

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.filter((p) => p.test(text)).length;
}

export function scoreParity(
  resume: StructuredResumeContent,
  templateId: TemplateId,
  latex: string,
  pdfText: string
): DimensionResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  const html = exportToHtml(resume, templateId, "compact");
  const bulletCount = collectBullets(resume).length;

  const expCount = resume.experience?.length ?? 0;
  const eduCount = resume.education?.length ?? 0;

  for (const company of resume.experience?.map((e) => e.company) ?? []) {
    if (company && !pdfText.includes(company) && !latex.includes(company)) {
      issues.push(`Company missing from PDF/LaTeX: ${company}`);
      score -= 8;
    }
  }

  const htmlBullets = (html.match(/<li/gi) ?? []).length;
  if (bulletCount > 0 && htmlBullets < bulletCount) {
    issues.push(
      `HTML bullet count (${htmlBullets}) lower than resume bullets (${bulletCount})`
    );
    score -= 10;
  }

  const sectionPatterns = [/experience/i, /education/i, /skills/i];
  const htmlSections = countMatches(html, sectionPatterns);
  const pdfSections = countMatches(pdfText, sectionPatterns);
  const latexSections = countMatches(latex, sectionPatterns);

  if (htmlSections !== pdfSections && pdfSections < htmlSections) {
    issues.push(
      `Section parity: HTML ${htmlSections} vs PDF text ${pdfSections} standard sections`
    );
    score -= 12;
    suggestions.push("Align LaTeX section titles with HTML preview section labels");
  }

  if (expCount > 0 && !/experience/i.test(pdfText)) {
    issues.push("Experience section not found in extracted PDF text");
    score -= 15;
  }
  if (eduCount > 0 && !/education/i.test(pdfText)) {
    issues.push("Education section not found in extracted PDF text");
    score -= 10;
  }

  const contactFields = [
    resume.personalInfo?.email,
    resume.personalInfo?.phone,
  ].filter(Boolean);
  for (const field of contactFields) {
    if (field && !pdfText.includes(field.replace(/\D/g, "").slice(-7)) && !pdfText.includes(field)) {
      // phone partial check handled in atsParse
      if (field.includes("@") && !pdfText.includes(field)) {
        issues.push(`Contact field not in PDF: ${field}`);
        score -= 5;
      }
    }
  }

  score = Math.max(0, Math.min(100, score));

  return {
    id: "parity",
    label: "Cross-Surface Parity",
    score,
    weight: 0,
    passed: score >= 75,
    blocking: false,
    issues,
    suggestions,
    metadata: {
      htmlSections,
      pdfSections,
      latexSections,
      bulletCount,
    },
  };
}
