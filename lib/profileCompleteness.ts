export interface CompletenessResult {
  isComplete: boolean;
  score: number;
  missingSections: string[];
}

export function checkProfileCompleteness(profile: any): CompletenessResult {
  if (!profile) {
    return {
      isComplete: false,
      score: 0,
      missingSections: ["Personal Information", "Education", "Work Experience or Projects", "Technical Skills"],
    };
  }

  const missingSections: string[] = [];
  let points = 0;
  const totalPoints = 4;

  // 1. Personal Information
  const hasName = Boolean(profile.personalInfo?.name && profile.personalInfo.name.trim().length > 0);
  const hasEmail = Boolean(profile.personalInfo?.email && profile.personalInfo.email.trim().length > 0);
  if (hasName && hasEmail) {
    points += 1;
  } else {
    missingSections.push("Personal Contact Details");
  }

  // 2. Education
  const hasEducation =
    Array.isArray(profile.education) &&
    profile.education.length > 0 &&
    profile.education.some((edu: any) => edu.institution && edu.institution.trim().length > 0);
  if (hasEducation) {
    points += 1;
  } else {
    missingSections.push("Education");
  }

  // 3. Work Experience OR Projects
  const hasExperience =
    Array.isArray(profile.experience) &&
    profile.experience.length > 0 &&
    profile.experience.some((exp: any) => (exp.company || exp.role) && exp.company.trim().length > 0);
  const hasProjects =
    Array.isArray(profile.projects) &&
    profile.projects.length > 0 &&
    profile.projects.some((proj: any) => proj.name && proj.name.trim().length > 0);

  if (hasExperience || hasProjects) {
    points += 1;
  } else {
    missingSections.push("Work Experience or Projects");
  }

  // 4. Skills
  const skills = profile.skills || {};
  const hasSkills = Boolean(
    (skills.languages && skills.languages.length > 0) ||
    (skills.frameworks && skills.frameworks.length > 0) ||
    (skills.tools && skills.tools.length > 0) ||
    (skills.databases && skills.databases.length > 0) ||
    (skills.soft && skills.soft.length > 0)
  );
  if (hasSkills) {
    points += 1;
  } else {
    missingSections.push("Technical Skills");
  }

  const score = Math.round((points / totalPoints) * 100);
  const isComplete = missingSections.length === 0;

  return {
    isComplete,
    score,
    missingSections,
  };
}
