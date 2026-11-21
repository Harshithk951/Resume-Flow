// lib/latex/resolveTemplate.ts
//
// Multi-Template Preamble Resolution Module
// Routes template options (classic, minimal, modern, two-column) to jsonToLatex preambles.

import { jsonToLatex, PREAMBLES } from "./jsonToLatex";

export type TemplateId =
  | "classic"
  | "minimal"
  | "modern"
  | "two-column"
  | "ats_strict"
  | "startup"
  | "finance_tech"
  | "tech_modern";

export const TEMPLATES: Record<
  string,
  { label: string; render: (data: any) => string }
> = {
  classic: {
    label: "Classic Professional",
    render: (data: any) => jsonToLatex(data, "classic"),
  },
  modern: {
    label: "Modern Accent",
    render: (data: any) => jsonToLatex(data, "modern"),
  },
  minimal: {
    label: "Minimal",
    render: (data: any) => jsonToLatex(data, "minimal"),
  },
  "two-column": {
    label: "Two-column",
    render: (data: any) => jsonToLatex(data, "two-column"),
  },
  // Backward-compatibility keys
  ats_strict: {
    label: "Classic Professional (Legacy ATS)",
    render: (data: any) => jsonToLatex(data, "classic"),
  },
  startup: {
    label: "Modern Accent (Legacy)",
    render: (data: any) => jsonToLatex(data, "modern"),
  },
  finance_tech: {
    label: "Classic Professional (Legacy)",
    render: (data: any) => jsonToLatex(data, "classic"),
  },
  tech_modern: {
    label: "Minimal (Legacy)",
    render: (data: any) => jsonToLatex(data, "minimal"),
  },
  modern_professional: {
    label: "Modern Accent",
    render: (data: any) => jsonToLatex(data, "modern"),
  },
  modern_executive: {
    label: "Classic Professional",
    render: (data: any) => jsonToLatex(data, "classic"),
  },
  tech_innovator: {
    label: "Minimal",
    render: (data: any) => jsonToLatex(data, "minimal"),
  },
};

export function resolveTemplate(id?: string): TemplateId {
  if (!id) return "classic";
  const norm = id.toLowerCase().replace(/_/g, "-");
  if (norm === "classic") return "classic";
  if (norm === "modern") return "modern";
  if (norm === "minimal") return "minimal";
  if (norm === "two-column" || norm === "twocolumn") return "two-column";
  if (norm === "startup" || norm === "modern-professional") return "modern";
  if (norm === "finance-tech" || norm === "modern-executive") return "classic";
  if (norm === "tech-modern" || norm === "tech-innovator") return "minimal";
  if (norm === "ats-strict" || norm === "ats-master") return "classic";
  return PREAMBLES[id] ? (id as TemplateId) : "classic";
}

export function recommendTemplateForJd(hints?: {
  industry?: string;
  cultureKeywords?: string[];
  resumeType?: string;
}): TemplateId {
  if (hints?.resumeType) return resolveTemplate(hints.resumeType);
  const blob = [hints?.industry ?? "", ...(hints?.cultureKeywords ?? [])].join(" ").toLowerCase();
  if (/finance|bank|analyst|executive|consulting/.test(blob)) return "classic";
  if (/startup|founder|ship fast|builder|yc/.test(blob)) return "modern";
  if (/engineer|software|tech|ml|ai|developer/.test(blob)) return "minimal";
  return "classic";
}
