// lib/latex/resolveTemplate.ts
//
// Consolidated Single-Template Resolution Module
// Always returns "ats_strict" to enforce the master ATS template contract across ResumeFlow.

import { jsonToLatex } from "./jsonToLatex";

export type TemplateId =
  | "ats_strict"
  | "modern_professional"
  | "modern_executive"
  | "tech_innovator";

const renderMaster = (data: any) => jsonToLatex(data, "ats_strict");

export const TEMPLATES: Record<
  TemplateId,
  { label: string; render: (data: any) => string }
> = {
  ats_strict: {
    label: "ATS Strict (Master)",
    render: renderMaster,
  },
  modern_professional: {
    label: "ATS Strict (Master)",
    render: renderMaster,
  },
  modern_executive: {
    label: "ATS Strict (Master)",
    render: renderMaster,
  },
  tech_innovator: {
    label: "ATS Strict (Master)",
    render: renderMaster,
  },
};

export function resolveTemplate(_aiType?: string): TemplateId {
  return "ats_strict";
}

export function recommendTemplateForJd(_hints?: {
  industry?: string;
  cultureKeywords?: string[];
  resumeType?: string;
}): TemplateId {
  return "ats_strict";
}
