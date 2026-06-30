import { generateAtsStrictTemplate } from "./templates/atsStrict";
import modernProfessionalTemplate from "./templates/modernProfessional";
import modernExecutiveTemplate from "./templates/modernExecutive";
import techInnovatorTemplate from "./templates/techInnovator";

export type TemplateId =
  | "ats_strict"
  | "modern_professional"
  | "modern_executive"
  | "tech_innovator";

export const TEMPLATES: Record<
  TemplateId,
  { label: string; render: (data: any) => string }
> = {
  ats_strict: {
    label: "ATS Strict",
    render: generateAtsStrictTemplate,
  },
  modern_professional: {
    label: "Startup Accent",
    render: modernProfessionalTemplate,
  },
  modern_executive: {
    label: "Finance Classic",
    render: modernExecutiveTemplate,
  },
  tech_innovator: {
    label: "Tech Modern",
    render: techInnovatorTemplate,
  },
};

export function resolveTemplate(aiType: string | undefined): TemplateId {
  if (!aiType) return "ats_strict";
  const normalized = aiType.toLowerCase();
  if (
    normalized.includes("academic") ||
    normalized.includes("executive") ||
    normalized.includes("modern_executive")
  ) {
    return "modern_executive";
  }
  if (
    normalized.includes("professional") ||
    normalized.includes("modern_professional")
  ) {
    return "modern_professional";
  }
  if (
    normalized.includes("tech") ||
    normalized.includes("innovator") ||
    normalized.includes("tech_innovator")
  ) {
    return "tech_innovator";
  }
  return "ats_strict";
}
