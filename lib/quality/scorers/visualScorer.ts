import { exportToHtml } from "@/lib/html/exporter";
import type { StructuredResumeContent } from "@/lib/pdf/types";
import type { TemplateId } from "@/lib/latex/resolveTemplate";
import type { DimensionResult } from "../types";

export function scoreVisualQuality(
  resume: StructuredResumeContent,
  templateId: TemplateId,
  pageCount: number
): DimensionResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  if (pageCount !== 1) {
    issues.push(`PDF page count is ${pageCount}, expected exactly 1`);
    score -= pageCount > 1 ? 40 : 15;
    suggestions.push("Tighten spacing, reduce bullets, or use compact preset to fit one page");
  }

  const html = exportToHtml(resume, templateId, "compact");
  const name = resume.personalInfo?.name ?? "";
  if (name && !html.includes(name.replace(/'/g, "&#039;")) && !html.includes(name)) {
    issues.push("Name not visible in HTML preview");
    score -= 15;
  }
  if (resume.personalInfo?.email && !html.includes(resume.personalInfo.email)) {
    issues.push("Email not visible in HTML preview above the fold");
    score -= 10;
  }

  if (!html.includes("10pt") && !html.includes("text-") && html.length < 500) {
    issues.push("HTML preview may be incomplete");
    score -= 10;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    id: "visual",
    label: "Recruiter Scan / Visual Quality",
    score,
    weight: 0.1,
    passed: pageCount === 1 && score >= 70,
    blocking: pageCount > 1,
    issues,
    suggestions,
    metadata: { pageCount },
  };
}
