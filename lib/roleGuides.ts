// lib/roleGuides.ts
// Programmatic dataset for 203 Job Role Resume Guides

export interface RoleGuide {
  title: string;
  slug: string;
  letter: string;
  category: string;
  shortDescription: string;
  atsKeywords: {
    coreHardSkills: string[];
    toolsAndTech: string[];
    methodologies: string[];
    softSkills: string[];
  };
  skillsWorthListing: {
    category: string;
    skills: string[];
  }[];
  criticalMistakes: {
    mistake: string;
    impact: string;
    fix: string;
  }[];
  companiesHiring: string[];
  sampleBulletPoints: {
    roleContext: string;
    weak: string;
    strong: string;
    metricsExplained: string;
  }[];
}

export interface GroupedRoles {
  [letter: string]: {
    title: string;
    slug: string;
    letter: string;
  }[];
}

import rawData from "@/data/roleGuides.json";

export const ALL_ROLES_RAW = rawData.roles as {
  title: string;
  slug: string;
  letter: string;
}[];

export const GROUPED_ROLES = rawData.grouped as GroupedRoles;
export const ROLE_LETTERS = rawData.letters as string[];

/**
 * Returns broad category based on role title keywords
 */
export function inferCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("developer") || t.includes("engineer") || t.includes("architect") || t.includes("sdet") || t.includes("qa")) {
    if (t.includes("data") || t.includes("machine learning") || t.includes("analytics")) return "Data & AI";
    if (t.includes("cloud") || t.includes("devops") || t.includes("reliability") || t.includes("security") || t.includes("systems")) return "Cloud & Infrastructure";
    if (t.includes("civil") || t.includes("mechanical") || t.includes("chemical") || t.includes("electrical") || t.includes("structural") || t.includes("biomedical") || t.includes("aerospace")) return "Engineering";
    return "Software Engineering";
  }
  if (t.includes("data") || t.includes("analyst") || t.includes("actuary")) {
    if (t.includes("marketing") || t.includes("business") || t.includes("operations")) return "Business Intelligence";
    if (t.includes("finance") || t.includes("credit") || t.includes("risk")) return "Finance & Accounting";
    return "Data & Analytics";
  }
  if (t.includes("product") || t.includes("scrum") || t.includes("project manager") || t.includes("program manager")) return "Product & Project Management";
  if (t.includes("marketing") || t.includes("content") || t.includes("seo") || t.includes("copywriter") || t.includes("social media") || t.includes("brand")) return "Marketing & Growth";
  if (t.includes("sales") || t.includes("account executive") || t.includes("account manager") || t.includes("partnerships") || t.includes("business development") || t.includes("inside sales")) return "Sales & Revenue";
  if (t.includes("finance") || t.includes("accountant") || t.includes("bookkeeper") || t.includes("financial") || t.includes("fp&a") || t.includes("banking") || t.includes("treasury") || t.includes("tax") || t.includes("auditor")) return "Finance & Accounting";
  if (t.includes("hr") || t.includes("recruiter") || t.includes("talent") || t.includes("people") || t.includes("chief of staff")) return "Human Resources & Talent";
  if (t.includes("nurse") || t.includes("medical") || t.includes("clinical") || t.includes("pharmacist") || t.includes("dental") || t.includes("healthcare") || t.includes("therapist") || t.includes("veterinary")) return "Healthcare & Life Sciences";
  if (t.includes("legal") || t.includes("compliance") || t.includes("paralegal") || t.includes("contract")) return "Legal & Compliance";
  if (t.includes("design") || t.includes("motion") || t.includes("ui/ux") || t.includes("photographer") || t.includes("video")) return "Design & Creative";
  if (t.includes("operations") || t.includes("logistics") || t.includes("supply chain") || t.includes("warehouse") || t.includes("inventory") || t.includes("procurement")) return "Operations & Supply Chain";
  return "Professional Services";
}

export function getRoleBySlug(slug: string): RoleGuide | null {
  const match = ALL_ROLES_RAW.find((r) => r.slug === slug);
  if (!match) return null;

  const category = inferCategory(match.title);
  
  return {
    title: match.title,
    slug: match.slug,
    letter: match.letter,
    category,
    shortDescription: `Authoritative 2026 ATS resume guide for ${match.title}s. Discover recruiter-tested keywords, essential technical and domain competencies, critical bullet-point pitfalls, and top hiring employers.`,
    atsKeywords: {
      coreHardSkills: [
        `${match.title} Competencies`,
        "Workflow Automation",
        "Performance Optimization",
        "Cross-functional Collaboration",
        "Data-Driven Decision Making",
        "Stakeholder Communication",
        "Quality Assurance",
        "Compliance & Standards",
      ],
      toolsAndTech: [
        "Industry-Standard Software Suites",
        "Analytics & Telemetry Dashboards",
        "Enterprise Resource Planning (ERP)",
        "Version Control & Documentation Tools",
        "Project Tracking & Kanban Systems",
      ],
      methodologies: [
        "Agile / Scrum Methodologies",
        "Root Cause Analysis",
        "Continuous Improvement (Kaizen)",
        "Lifecycle Management",
        "Risk Mitigation Frameworks",
      ],
      softSkills: [
        "Strategic Problem Solving",
        "Executive Presentation",
        "Cross-Disciplinary Leadership",
        "Resource Allocation",
        "Client Relationship Building",
      ],
    },
    skillsWorthListing: [
      {
        category: "Core Technical & Operational Proficiencies",
        skills: [
          `Advanced ${match.title} Execution`,
          "Systems Integration & Architecture",
          "Automated Reporting & Metrics",
          "Vendor & Tool Evaluation",
          "Process Re-engineering",
        ],
      },
      {
        category: "Domain & Regulatory Knowledge",
        skills: [
          "Regulatory Compliance & SLA Adherence",
          "Security Best Practices",
          "Documentation & Governance Standards",
          "Audit Readiness & Verification",
        ],
      },
      {
        category: "Execution & Management",
        skills: [
          "Time-Critical Deliverable Management",
          "Stakeholder Alignment & Expectation Setting",
          "Sprint & Milestone Planning",
          "Mentorship & Knowledge Transfer",
        ],
      },
    ],
    criticalMistakes: [
      {
        mistake: "Listing passive duty lists instead of measured accomplishments",
        impact: "Recruiters and ATS parsers rank generic 'Responsible for...' bullets in the bottom 20% of applicants.",
        fix: "Apply the Google XYZ formula: 'Accomplished [X], measured by [Y], by doing [Z]' with hard percentages and dollar figures.",
      },
      {
        mistake: "Keyword stuffing or placing invisible text",
        impact: "Modern ATS algorithms (Taleo, Greenhouse, Workday) flag repetitive keyword walls and disqualify candidates instantly.",
        fix: "Distribute relevant terms contextually inside descriptive achievement bullets where you actually applied the skill.",
      },
      {
        mistake: "Using unparseable multi-column or graphic-heavy resume layouts",
        impact: "Multi-column tables, text boxes, and SVG rating bars scramble text extraction during initial machine parsing.",
        fix: "Use standard single-column, cleanly structured ATS-friendly templates (such as ResumeFlow's ATS Strict LaTeX export).",
      },
      {
        mistake: "Omitting specific tool versioning and industry metrics",
        impact: "ATS filters specifically look for exact keyword phrases specified in the employer's Job Description.",
        fix: "Align your technical toolkit directly with the target job posting before submitting your application.",
      },
    ],
    companiesHiring: [
      "Google",
      "Microsoft",
      "Amazon",
      "Deloitte",
      "Salesforce",
      "JPMorgan Chase",
      "Meta",
      "Accenture",
      "Oracle",
      "Stripe",
    ],
    sampleBulletPoints: [
      {
        roleContext: "High-Impact Project Execution",
        weak: `Responsible for managing ${match.title} deliverables and communicating progress with the team.`,
        strong: `Spearheaded 4 high-priority ${match.title} initiatives, accelerating delivery cycles by 38% and reducing operational bottleneck downtime by 45 hours monthly across 6 cross-functional squads.`,
        metricsExplained: "Includes specific initiative count, exact turnaround speedup percentage, and quantifiable monthly operational savings.",
      },
      {
        roleContext: "Efficiency & Quality Optimization",
        weak: `Assisted with routine testing, audits, and performance reviews.`,
        strong: `Engineered standardized evaluation protocols and automated checkpoints, lifting first-pass validation rates from 71% to 94.6% while ensuring 100% compliance with industry benchmarks.`,
        metricsExplained: "Clear baseline-to-target improvement metric with definitive compliance verification.",
      },
    ],
  };
}

export function getAllRoleSlugs(): string[] {
  return ALL_ROLES_RAW.map((r) => r.slug);
}
