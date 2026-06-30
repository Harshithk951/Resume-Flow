import type { StructuredResumeContent } from "@/lib/pdf/types";

/** Masks PII for developer-facing JSON previews in the UI. */
export function redactStructuredContentForDisplay(
  data: StructuredResumeContent
): StructuredResumeContent {
  const mask = (value: string | undefined) =>
    value && value.length > 0 ? "••••••••" : value;

  return {
    ...data,
    personalInfo: {
      ...data.personalInfo,
      email: mask(data.personalInfo.email) ?? "",
      phone: mask(data.personalInfo.phone) ?? "",
      linkedin: mask(data.personalInfo.linkedin),
      github: mask(data.personalInfo.github),
      portfolio: mask(data.personalInfo.portfolio),
    },
  };
}
