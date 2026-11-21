import { toLegacyStructuredContent } from "@/lib/resume/adapter";

export type TemplateId = "minimal" | "modern" | "classic" | "two-column";
export const DEFAULT_TEMPLATE_ID: TemplateId = "classic";
export const VALID_TEMPLATE_IDS: TemplateId[] = [
  "minimal",
  "modern",
  "classic",
  "two-column",
];

export function normalizeTemplateId(templateId?: string): TemplateId {
  if (!templateId) return DEFAULT_TEMPLATE_ID;
  const lower = templateId.toLowerCase().replace(/_/g, "-");
  if (lower === "minimal") return "minimal";
  if (lower === "modern") return "modern";
  if (lower === "classic") return "classic";
  if (lower === "two-column" || lower === "twocolumn") return "two-column";
  return DEFAULT_TEMPLATE_ID;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Education {
  institution: string;
  degree: string;
  gpa?: string;
  year: string;
  relevantCourses?: string[];
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  bullets: string[];
  location?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  bullets: string[];
}

export interface Skills {
  languages: string[];
  frameworks: string[];
  tools: string[];
  databases?: string[];
  soft?: string[];
}

export interface Certification {
  name: string;
  issuer?: string;
  year?: string;
  id?: string;
}

export interface Achievement {
  description: string;
  year?: string;
}

export interface Publication {
  title: string;
  venue?: string;
  date?: string;
  link?: string;
  description?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface StructuredResumeContent {
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  skills: Skills;
  categorizedSkills?: SkillCategory[];
  experience: Experience[];
  projects: Project[];
  certifications?: Certification[];
  achievements?: Achievement[];
  publications?: Array<Publication | string>;
}

/**
 * Coerces Convex `structuredContent` (v.any()) into a safe typed payload
 * with defaults for missing fields.
 */
export function normalizeStructuredContent(
  raw: unknown
): StructuredResumeContent {
  return toLegacyStructuredContent(raw);
}
