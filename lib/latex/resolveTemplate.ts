// lib/latex/resolveTemplate.ts
//
// Multi-Template Preamble Resolution Module
// Routes template options (ats_strict, startup, finance_tech, tech_modern) to jsonToLatex preambles.

import { jsonToLatex, PREAMBLES } from "./jsonToLatex";

export type TemplateId = "ats_strict" | "startup" | "finance_tech" | "tech_modern";

export const TEMPLATES: Record<
  string,
  { label: string; render: (data: any) => string }
> = {
  ats_strict: {
    label: "ATS Strict (Classic)",
    render: (data: any) => jsonToLatex(data, "ats_strict"),
  },
  startup: {
    label: "Startup Accent (Helvetica)",
    render: (data: any) => jsonToLatex(data, "startup"),
  },
  finance_tech: {
    label: "Finance Classic (Times)",
    render: (data: any) => jsonToLatex(data, "finance_tech"),
  },
  tech_modern: {
    label: "Tech Modern (Latin)",
    render: (data: any) => jsonToLatex(data, "tech_modern"),
  },
  // Backward-compatibility alias keys
  modern_professional: {
    label: "Startup Accent",
    render: (data: any) => jsonToLatex(data, "startup"),
  },
  modern_executive: {
    label: "Finance Classic",
    render: (data: any) => jsonToLatex(data, "finance_tech"),
  },
  tech_innovator: {
    label: "Tech Modern",
    render: (data: any) => jsonToLatex(data, "tech_modern"),
  },
};

export function resolveTemplate(id?: string): TemplateId {
  if (!id) return "ats_strict";
  const norm = id.toLowerCase();
  if (norm === "startup" || norm === "modern_professional") return "startup";
  if (norm === "finance_tech" || norm === "modern_executive") return "finance_tech";
  if (norm === "tech_modern" || norm === "tech_innovator") return "tech_modern";
  return PREAMBLES[id] ? (id as TemplateId) : "ats_strict";
}

export function recommendTemplateForJd(hints?: {
  industry?: string;
  cultureKeywords?: string[];
  resumeType?: string;
}): TemplateId {
  if (hints?.resumeType) return resolveTemplate(hints.resumeType);
  const blob = [hints?.industry ?? "", ...(hints?.cultureKeywords ?? [])].join(" ").toLowerCase();
  if (/finance|bank|analyst|executive|consulting/.test(blob)) return "finance_tech";
  if (/startup|founder|ship fast|builder|yc/.test(blob)) return "startup";
  if (/engineer|software|tech|ml|ai|developer/.test(blob)) return "tech_modern";
  return "ats_strict";
}
