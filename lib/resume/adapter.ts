// lib/resume/adapter.ts
// Bi-directional adapter between Legacy Resume Content and Canonical Phase 1 Resume Schema.
// Keeps all current readers (dashboard, react-pdf, LaTeX jsonToLatex, docx export) working.

import crypto from "crypto";
import {
  CanonicalResume,
  ResumeBullet,
  ResumeSkill,
  CanonicalResumeSchema,
} from "./schema";
import { StructuredResumeContent } from "../pdf/types";

/**
 * Computes a deterministic ID from section name, index, and normalized text.
 * Used for idempotent migration and reproducible IDs.
 */
export function generateDeterministicBulletId(
  section: string,
  index: number,
  text: string
): string {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, " ");
  const hash = crypto
    .createHash("sha256")
    .update(`${section}:${index}:${normalized}`)
    .digest("hex")
    .slice(0, 16);
  return `b_${hash}`;
}

/**
 * Normalizes a single bullet item into the canonical ResumeBullet shape.
 */
export function normalizeBullet(
  item: unknown,
  section: string,
  index: number,
  deterministic: boolean = false
): ResumeBullet {
  if (typeof item === "string") {
    const id = deterministic
      ? generateDeterministicBulletId(section, index, item)
      : typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : generateDeterministicBulletId(section, index, item);

    return {
      id,
      text: item.trim(),
      origin: "legacy",
    };
  }

  if (item && typeof item === "object") {
    const obj = item as Record<string, any>;
    const text = typeof obj.text === "string" ? obj.text.trim() : "";
    const id =
      typeof obj.id === "string" && obj.id.length > 0
        ? obj.id
        : deterministic
        ? generateDeterministicBulletId(section, index, text)
        : typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : generateDeterministicBulletId(section, index, text);

    const validOrigins = ["original", "rewritten", "user_added", "legacy"];
    const origin = validOrigins.includes(obj.origin) ? obj.origin : "legacy";

    return {
      id,
      text,
      sourceBulletId: typeof obj.sourceBulletId === "string" ? obj.sourceBulletId : undefined,
      origin,
    };
  }

  const id = deterministic
    ? generateDeterministicBulletId(section, index, "")
    : typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `b_${Date.now()}_${index}`;

  return {
    id,
    text: "",
    origin: "legacy",
  };
}

/**
 * Normalizes a skill item into the canonical ResumeSkill shape.
 */
export function normalizeSkill(item: unknown): ResumeSkill {
  if (typeof item === "string") {
    return {
      name: item.trim(),
      origin: "legacy",
    };
  }

  if (item && typeof item === "object") {
    const obj = item as Record<string, any>;
    const name = typeof obj.name === "string" ? obj.name.trim() : "";
    const validOrigins = ["resume", "user_confirmed", "legacy"];
    const origin = validOrigins.includes(obj.origin) ? obj.origin : "legacy";
    return { name, origin };
  }

  return { name: "", origin: "legacy" };
}

/**
 * Converts any legacy, partial, or incoming resume data into the strict CanonicalResume format.
 */
export function toCanonicalResume(
  raw: unknown,
  options: { deterministic?: boolean } = {}
): CanonicalResume {
  const data = (raw ?? {}) as Record<string, any>;
  const deterministic = options.deterministic ?? false;

  // Personal Info
  const p = data.personalInfo ?? {};
  const personalInfo = {
    name: typeof p.name === "string" ? p.name : "Candidate",
    email: typeof p.email === "string" ? p.email : "",
    phone: typeof p.phone === "string" ? p.phone : "",
    location: typeof p.location === "string" ? p.location : undefined,
    linkedin: typeof p.linkedin === "string" ? p.linkedin : undefined,
    github: typeof p.github === "string" ? p.github : undefined,
    portfolio: typeof p.portfolio === "string" ? p.portfolio : undefined,
  };

  // Education
  const education = Array.isArray(data.education)
    ? data.education.map((edu: any) => ({
        institution: String(edu.institution ?? ""),
        degree: String(edu.degree ?? ""),
        year: String(edu.year ?? ""),
        gpa: edu.gpa ? String(edu.gpa) : undefined,
        relevantCourses: Array.isArray(edu.relevantCourses)
          ? edu.relevantCourses.map((c: any) => String(c))
          : undefined,
      }))
    : [];

  // Experience
  const experience = Array.isArray(data.experience)
    ? data.experience.map((exp: any, expIdx: number) => ({
        company: String(exp.company ?? ""),
        role: String(exp.role ?? ""),
        duration: String(exp.duration ?? ""),
        location: exp.location ? String(exp.location) : undefined,
        bullets: Array.isArray(exp.bullets)
          ? exp.bullets.map((b: any, bIdx: number) =>
              normalizeBullet(b, `exp_${expIdx}`, bIdx, deterministic)
            )
          : [],
      }))
    : [];

  // Projects
  const projects = Array.isArray(data.projects)
    ? data.projects.map((proj: any, projIdx: number) => ({
        name: String(proj.name ?? ""),
        description: String(proj.description ?? ""),
        technologies: Array.isArray(proj.technologies)
          ? proj.technologies.map((t: any) => String(t))
          : Array.isArray(proj.techStack)
          ? proj.techStack.map((t: any) => String(t))
          : [],
        link: proj.link ? String(proj.link) : undefined,
        bullets: Array.isArray(proj.bullets)
          ? proj.bullets.map((b: any, bIdx: number) =>
              normalizeBullet(b, `proj_${projIdx}`, bIdx, deterministic)
            )
          : [],
      }))
    : [];

  // Skills
  const rawSkills = data.skills ?? {};
  const mapSkillList = (list: unknown): ResumeSkill[] => {
    if (!Array.isArray(list)) return [];
    return list.map(normalizeSkill).filter((s) => s.name.length > 0);
  };

  const skills = {
    languages: mapSkillList(rawSkills.languages),
    frameworks: mapSkillList(
      rawSkills.frameworks || rawSkills.frameworksAndTools || []
    ),
    tools: mapSkillList(rawSkills.tools || rawSkills.cloudAndDevOps || []),
    databases: rawSkills.databases ? mapSkillList(rawSkills.databases) : undefined,
    soft: rawSkills.soft ? mapSkillList(rawSkills.soft) : undefined,
  };

  // Certifications
  const certifications = Array.isArray(data.certifications)
    ? data.certifications.map((c: any) => ({
        name: String(c.name ?? ""),
        issuer: c.issuer ? String(c.issuer) : undefined,
        year: c.year ? String(c.year) : undefined,
        id: c.id ? String(c.id) : undefined,
      }))
    : undefined;

  // Achievements
  const achievements = Array.isArray(data.achievements)
    ? data.achievements.map((a: any) => ({
        description: String(a.description ?? ""),
        year: a.year ? String(a.year) : undefined,
      }))
    : undefined;

  // Custom sections
  const customSections = Array.isArray(data.customSections)
    ? data.customSections.map((sec: any, secIdx: number) => ({
        title: String(sec.title ?? "Custom Section"),
        items: Array.isArray(sec.items)
          ? sec.items.map((it: any, itIdx: number) => ({
              title: String(it.title ?? ""),
              subtitle: it.subtitle ? String(it.subtitle) : undefined,
              date: it.date ? String(it.date) : undefined,
              description: it.description ? String(it.description) : undefined,
              bullets: Array.isArray(it.bullets)
                ? it.bullets.map((b: any, bIdx: number) =>
                    normalizeBullet(b, `custom_${secIdx}_${itIdx}`, bIdx, deterministic)
                  )
                : undefined,
            }))
          : [],
      }))
    : undefined;

  const canonical: CanonicalResume = {
    schemaVersion: 1,
    personalInfo,
    summary: typeof data.summary === "string" ? data.summary : "",
    education,
    experience,
    projects,
    skills,
    certifications,
    achievements,
    customSections,
  };

  return CanonicalResumeSchema.parse(canonical);
}

/**
 * Transforms any resume document (Canonical or Legacy) into the flat string-based
 * StructuredResumeContent expected by legacy renderers (react-pdf, LaTeX, Word docx).
 */
export function toLegacyStructuredContent(raw: unknown): StructuredResumeContent {
  const data = (raw ?? {}) as Record<string, any>;

  const extractBulletText = (b: any): string => {
    if (typeof b === "string") return b;
    if (b && typeof b === "object" && typeof b.text === "string") return b.text;
    return "";
  };

  const extractSkillName = (s: any): string => {
    if (typeof s === "string") return s;
    if (s && typeof s === "object" && typeof s.name === "string") return s.name;
    return "";
  };

  const rawSkills = data.skills ?? {};
  const extractSkillNames = (list: unknown): string[] => {
    if (!Array.isArray(list)) return [];
    return list.map(extractSkillName).filter(Boolean);
  };

  return {
    personalInfo: {
      name: data.personalInfo?.name ?? "Candidate",
      email: data.personalInfo?.email ?? "",
      phone: data.personalInfo?.phone ?? "",
      location: data.personalInfo?.location,
      linkedin: data.personalInfo?.linkedin,
      github: data.personalInfo?.github,
      portfolio: data.personalInfo?.portfolio,
    },
    summary: data.summary ?? "",
    education: Array.isArray(data.education) ? data.education : [],
    skills: {
      languages: extractSkillNames(rawSkills.languages),
      frameworks: extractSkillNames(
        rawSkills.frameworks || rawSkills.frameworksAndTools || []
      ),
      tools: extractSkillNames(rawSkills.tools || rawSkills.cloudAndDevOps || []),
      databases: rawSkills.databases ? extractSkillNames(rawSkills.databases) : undefined,
      soft: rawSkills.soft ? extractSkillNames(rawSkills.soft) : undefined,
    },
    experience: Array.isArray(data.experience)
      ? data.experience.map((exp: any) => ({
          company: exp.company ?? "",
          role: exp.role ?? "",
          duration: exp.duration ?? "",
          location: exp.location,
          bullets: Array.isArray(exp.bullets)
            ? exp.bullets.map(extractBulletText).filter(Boolean)
            : [],
        }))
      : [],
    projects: Array.isArray(data.projects)
      ? data.projects.map((proj: any) => ({
          name: proj.name ?? "",
          description: proj.description ?? "",
          technologies: Array.isArray(proj.technologies)
            ? proj.technologies.map((t: any) => String(t))
            : Array.isArray(proj.techStack)
            ? proj.techStack.map((t: any) => String(t))
            : [],
          link: proj.link,
          bullets: Array.isArray(proj.bullets)
            ? proj.bullets.map(extractBulletText).filter(Boolean)
            : [],
        }))
      : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : undefined,
    achievements: Array.isArray(data.achievements) ? data.achievements : undefined,
    publications: Array.isArray(data.publications) ? data.publications : undefined,
  };
}
