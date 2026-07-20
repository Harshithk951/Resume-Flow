/**
 * CI-verified template quality badges (from npm run evaluate:templates).
 * Update after changing LaTeX/HTML templates or fixtures.
 */
export interface TemplateQualityBadge {
  atsScore: number;
  onePageGuaranteed: boolean;
  label: string;
}

export const TEMPLATE_QUALITY_BADGES: Record<
  string,
  TemplateQualityBadge
> = {
  ats_strict: {
    atsScore: 92,
    onePageGuaranteed: true,
    label: "Max ATS pass",
  },
  modern_professional: {
    atsScore: 84,
    onePageGuaranteed: true,
    label: "Startup polish",
  },
  modern_executive: {
    atsScore: 82,
    onePageGuaranteed: true,
    label: "Finance & leadership",
  },
  tech_innovator: {
    atsScore: 83,
    onePageGuaranteed: true,
    label: "Engineer-forward",
  },
};
