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
    normalized.includes("modern_executive") ||
    normalized.includes("finance")
  ) {
    return "modern_executive";
  }
  if (
    normalized.includes("startup") ||
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

/** Pick template from JD culture keywords when user has not chosen one explicitly. */
export function recommendTemplateForJd(hints: {
  industry?: string;
  cultureKeywords?: string[];
  resumeType?: string;
}): TemplateId {
  if (hints.resumeType) return resolveTemplate(hints.resumeType);
  const blob = [
    hints.industry ?? "",
    ...(hints.cultureKeywords ?? []),
  ]
    .join(" ")
    .toLowerCase();
  if (/finance|bank|analyst|executive|consulting/.test(blob)) {
    return "modern_executive";
  }
  if (/startup|founder|ship fast|builder|yc/.test(blob)) {
    return "modern_professional";
  }
  if (/engineer|software|tech|ml|ai|developer/.test(blob)) {
    return "tech_innovator";
  }
  return "ats_strict";
}
