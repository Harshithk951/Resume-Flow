// lib/resume/schema.ts
// Shared Canonical Resume Schema & Provenance Types (Phase 1)

import { z } from "zod";

// ── Bullet Provenance ──
export const BulletOriginSchema = z.enum([
  "original",
  "rewritten",
  "user_added",
  "legacy",
]);
export type BulletOrigin = z.infer<typeof BulletOriginSchema>;

export const ResumeBulletSchema = z.object({
  id: z.string(),
  text: z.string(),
  sourceBulletId: z.string().optional(),
  origin: BulletOriginSchema,
});
export type ResumeBullet = z.infer<typeof ResumeBulletSchema>;

// ── Skill Provenance ──
export const SkillOriginSchema = z.enum([
  "resume",
  "user_confirmed",
  "legacy",
]);
export type SkillOrigin = z.infer<typeof SkillOriginSchema>;

export const ResumeSkillSchema = z.object({
  name: z.string(),
  origin: SkillOriginSchema,
});
export type ResumeSkill = z.infer<typeof ResumeSkillSchema>;

// ── Personal Information ──
export const PersonalInfoSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
});
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

// ── Education ──
export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  year: z.string(),
  gpa: z.string().optional(),
  relevantCourses: z.array(z.string()).optional(),
});
export type Education = z.infer<typeof EducationSchema>;

// ── Work Experience ──
export const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  duration: z.string(),
  location: z.string().optional(),
  bullets: z.array(ResumeBulletSchema),
});
export type Experience = z.infer<typeof ExperienceSchema>;

// ── Projects ──
export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  link: z.string().optional(),
  bullets: z.array(ResumeBulletSchema),
});
export type Project = z.infer<typeof ProjectSchema>;

// ── Categorized Skills ──
export const CategorizedSkillsSchema = z.object({
  languages: z.array(ResumeSkillSchema).default([]),
  frameworks: z.array(ResumeSkillSchema).default([]),
  tools: z.array(ResumeSkillSchema).default([]),
  databases: z.array(ResumeSkillSchema).optional(),
  soft: z.array(ResumeSkillSchema).optional(),
});
export type CategorizedSkills = z.infer<typeof CategorizedSkillsSchema>;

// ── Certifications & Achievements ──
export const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  year: z.string().optional(),
  id: z.string().optional(),
});
export type Certification = z.infer<typeof CertificationSchema>;

export const AchievementSchema = z.object({
  description: z.string(),
  year: z.string().optional(),
});
export type Achievement = z.infer<typeof AchievementSchema>;

// ── Custom Sections (Publications, Awards, etc.) ──
export const CustomSectionItemSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
  bullets: z.array(ResumeBulletSchema).optional(),
});
export type CustomSectionItem = z.infer<typeof CustomSectionItemSchema>;

export const CustomSectionSchema = z.object({
  title: z.string(),
  items: z.array(CustomSectionItemSchema),
});
export type CustomSection = z.infer<typeof CustomSectionSchema>;

// ── Canonical Resume Schema with schemaVersion ──
export const CanonicalResumeSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  personalInfo: PersonalInfoSchema,
  summary: z.string(),
  education: z.array(EducationSchema),
  experience: z.array(ExperienceSchema),
  projects: z.array(ProjectSchema),
  skills: CategorizedSkillsSchema,
  certifications: z.array(CertificationSchema).optional(),
  achievements: z.array(AchievementSchema).optional(),
  customSections: z.array(CustomSectionSchema).optional(),
});
export type CanonicalResume = z.infer<typeof CanonicalResumeSchema>;
