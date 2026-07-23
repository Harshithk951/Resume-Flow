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
  const data = (raw ?? {}) as Record<string, any>;
  const rawSkills = data.skills ?? {};

  const languages = Array.isArray(rawSkills.languages) ? rawSkills.languages : [];

  const frameworksList = [
    ...(Array.isArray(rawSkills.frameworksAndTools) ? rawSkills.frameworksAndTools : []),
    ...(Array.isArray(rawSkills.frameworks) ? rawSkills.frameworks : []),
  ];
  // Deduplicate
  const frameworks = Array.from(new Set(frameworksList));

  const toolsList = [
    ...(Array.isArray(rawSkills.cloudAndDevOps) ? rawSkills.cloudAndDevOps : []),
    ...(Array.isArray(rawSkills.tools) ? rawSkills.tools : []),
  ];
  const tools = Array.from(new Set(toolsList));

  const softList = [
    ...(Array.isArray(rawSkills.csFundamentals) ? rawSkills.csFundamentals : []),
    ...(Array.isArray(rawSkills.soft) ? rawSkills.soft : []),
  ];
  const soft = Array.from(new Set(softList));

  const databases = Array.isArray(rawSkills.databases) ? rawSkills.databases : undefined;

  return {
    personalInfo: {
      name: data.personalInfo?.name ?? "Candidate",
      email: data.personalInfo?.email ?? "",
      phone: data.personalInfo?.phone ?? "",
      linkedin: data.personalInfo?.linkedin,
      github: data.personalInfo?.github,
      portfolio: data.personalInfo?.portfolio,
    },
    summary: data.summary ?? "",
    education: Array.isArray(data.education) ? data.education : [],
    skills: {
      languages,
      frameworks,
      tools,
      databases,
      soft: soft.length > 0 ? soft : undefined,
    },
    experience: Array.isArray(data.experience)
      ? data.experience.map((exp: any) => ({
          company: exp.company ?? "",
          role: exp.role ?? "",
          duration: exp.duration ?? "",
          location: exp.location,
          bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
        }))
      : [],
    projects: Array.isArray(data.projects)
      ? data.projects.map((proj: any) => ({
          name: proj.name ?? "",
          description: proj.description ?? "",
          technologies: Array.isArray(proj.technologies)
            ? proj.technologies
            : Array.isArray(proj.techStack)
            ? proj.techStack
            : [],
          link: proj.link,
          bullets: Array.isArray(proj.bullets) ? proj.bullets : [],
        }))
      : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : undefined,
    achievements: Array.isArray(data.achievements) ? data.achievements : undefined,
  };
}
