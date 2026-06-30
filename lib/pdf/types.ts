export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
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
  issuer: string;
  year: string;
}

export interface Achievement {
  description: string;
  year?: string;
}

export interface StructuredResumeContent {
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  skills: Skills;
  experience: Experience[];
  projects: Project[];
  certifications?: Certification[];
  achievements?: Achievement[];
}

/**
 * Coerces Convex `structuredContent` (v.any()) into a safe typed payload
 * with defaults for missing fields.
 */
export function normalizeStructuredContent(
  raw: unknown
): StructuredResumeContent {
  const data = (raw ?? {}) as Partial<StructuredResumeContent>;
  return {
    personalInfo: {
      name: data.personalInfo?.name ?? "",
      email: data.personalInfo?.email ?? "",
      phone: data.personalInfo?.phone ?? "",
      linkedin: data.personalInfo?.linkedin,
      github: data.personalInfo?.github,
      portfolio: data.personalInfo?.portfolio,
    },
    summary: data.summary ?? "",
    education: data.education ?? [],
    skills: {
      languages: data.skills?.languages ?? [],
      frameworks: data.skills?.frameworks ?? [],
      tools: data.skills?.tools ?? [],
      databases: data.skills?.databases,
      soft: data.skills?.soft,
    },
    experience: data.experience ?? [],
    projects: data.projects ?? [],
    certifications: data.certifications,
    achievements: data.achievements,
  };
}
