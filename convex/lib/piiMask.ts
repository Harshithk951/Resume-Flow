// convex/lib/piiMask.ts
//
// Security Layer: PII Masking & Re-injection
// Strips PII (contact details) before sending profile data to external AI models,
// and re-injects the original PII when presenting or compiling the final resume.

export type PersonalInfo = {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
};

/**
 * Redacts personal identifiers from a PersonalInfo block.
 */
export function maskPersonalInfo(personalInfo: PersonalInfo): PersonalInfo {
  return {
    name: "[CANDIDATE_NAME]",
    email: "[CANDIDATE_EMAIL]",
    phone: "[CANDIDATE_PHONE]",
    linkedin: personalInfo.linkedin ? "[CANDIDATE_LINKEDIN]" : undefined,
    github: personalInfo.github ? "[CANDIDATE_GITHUB]" : undefined,
    portfolio: personalInfo.portfolio ? "[CANDIDATE_PORTFOLIO]" : undefined,
  };
}

/**
 * Re-injects actual personal contact information into the structured resume content.
 */
export function reInjectPersonalInfo(
  structuredContent: any,
  personalInfo: PersonalInfo
): any {
  return {
    ...structuredContent,
    personalInfo: {
      ...personalInfo,
    },
  };
}
