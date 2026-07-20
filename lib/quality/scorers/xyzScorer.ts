import type { StructuredResumeContent } from "@/lib/pdf/types";
import type { DimensionResult } from "../types";

const ACTION_VERBS = [
  "built",
  "architected",
  "developed",
  "designed",
  "led",
  "shipped",
  "optimized",
  "reduced",
  "improved",
  "automated",
  "created",
  "delivered",
  "implemented",
  "migrated",
  "facilitated",
  "conducted",
  "prepared",
  "mentored",
];

const WEAK_PATTERNS = [
  /responsible for/i,
  /worked on/i,
  /helped with/i,
  /various projects/i,
  /synergy/i,
  /leverage synergies/i,
];

const METRIC_PATTERN =
  /\d+(\.\d+)?%|\$\d|[$€£]\d|\d+\+|\d+\s*(ms|sec|seconds|minutes|hours|weeks|months|years|days|k|m|b|million|billion)|<\d+|>\d+|\d+x/i;

const METHOD_PATTERN =
  /\b(using|via|with|through|by|in)\b|\b(React|TypeScript|Python|Excel|SQL|Redis|Next\.js|Docker|AWS|Kubernetes|Rust|GraphQL|VBA|Bloomberg|FactSet|LaTeX|Node\.js|PostgreSQL|C\+\+|Go|credit risk|DCF|LBO)\b/i;

function scoreBullet(bullet: string): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 0;
  const trimmed = bullet.trim();
  if (!trimmed) return { score: 0, issues: ["Empty bullet"] };

  for (const weak of WEAK_PATTERNS) {
    if (weak.test(trimmed)) {
      issues.push(`Weak phrasing: ${weak.source}`);
      return { score: 0, issues };
    }
  }

  const firstWord = trimmed.split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, "").toLowerCase();
  if (firstWord && ACTION_VERBS.includes(firstWord)) {
    score += 1;
  } else {
    issues.push("Missing strong action verb at start");
  }

  if (METRIC_PATTERN.test(trimmed)) {
    score += 1;
  } else {
    issues.push("Missing quantifiable metric");
  }

  if (METHOD_PATTERN.test(trimmed)) {
    score += 1;
  } else {
    issues.push("Missing method/technology (Z)");
  }

  return { score, issues };
}

export function collectBullets(resume: StructuredResumeContent): string[] {
  const bullets: string[] = [];
  for (const exp of resume.experience ?? []) {
    bullets.push(...(exp.bullets ?? []));
  }
  for (const proj of resume.projects ?? []) {
    bullets.push(...(proj.bullets ?? []));
  }
  return bullets.filter(Boolean);
}

export function scoreXyzBullets(resume: StructuredResumeContent): DimensionResult {
  const bullets = collectBullets(resume);
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (bullets.length === 0) {
    return {
      id: "xyz",
      label: "Content Impact (XYZ Bullets)",
      score: 0,
      weight: 0.2,
      passed: false,
      blocking: true,
      issues: ["No experience/project bullets found"],
      suggestions: ["Add bullets with action verb, metric, and method"],
    };
  }

  let totalScore = 0;
  let perfect = 0;

  for (const bullet of bullets) {
    const { score, issues: bulletIssues } = scoreBullet(bullet);
    totalScore += score;
    if (score === 3) perfect++;
    else if (bulletIssues.length) {
      issues.push(`${bullet.slice(0, 60)}…: ${bulletIssues.join("; ")}`);
    }
  }

  const maxScore = bullets.length * 3;
  const pctPerfect = Math.round((perfect / bullets.length) * 100);
  const score = Math.round((totalScore / maxScore) * 100);
  const passed = pctPerfect >= 90;

  if (!passed) {
    suggestions.push(
      "Rewrite bullets using XYZ: Accomplished [X] as measured by [Y] by doing [Z]"
    );
  }

  return {
    id: "xyz",
    label: "Content Impact (XYZ Bullets)",
    score,
    weight: 0.2,
    passed,
    blocking: pctPerfect < 70,
    issues: issues.slice(0, 10),
    suggestions,
    metadata: {
      bulletCount: bullets.length,
      pctPerfect,
      avgScore: totalScore / bullets.length,
    },
  };
}
