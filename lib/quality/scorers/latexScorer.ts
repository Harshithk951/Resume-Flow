import type { DimensionResult } from "../types";

const STANDARD_SECTIONS = [
  /experience/i,
  /education/i,
  /skills/i,
];

const FORBIDDEN_PATTERNS: { pattern: RegExp; message: string }[] = [
  { pattern: /\\begin\{multicols\}/, message: "Multi-column layout detected (ATS risk)" },
  { pattern: /\\includegraphics/, message: "Image/graphic detected (ATS parse risk)" },
  { pattern: /\\begin\{minipage\}/, message: "Minipage layout detected (ATS risk)" },
];

function countUnbalancedBraces(tex: string): number {
  let depth = 0;
  let escaped = false;
  for (const ch of tex) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth < 0) return -1;
  }
  return depth;
}

export function scoreLatexIntegrity(latex: string): DimensionResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  if (!latex.includes("\\documentclass")) {
    issues.push("Missing \\documentclass");
    score -= 25;
  }
  if (!latex.includes("\\begin{document}")) {
    issues.push("Missing \\begin{document}");
    score -= 25;
  }
  if (!latex.includes("\\end{document}")) {
    issues.push("Missing \\end{document}");
    score -= 25;
  }

  const braceDepth = countUnbalancedBraces(latex);
  if (braceDepth !== 0) {
    issues.push(`Unbalanced braces (depth=${braceDepth})`);
    score -= 20;
  }

  for (const section of STANDARD_SECTIONS) {
    if (!section.test(latex)) {
      issues.push(`Standard section not found: ${section.source}`);
      score -= 8;
      suggestions.push(`Add a recognizable ${section.source.replace(/\\|\//g, "")} section header`);
    }
  }

  for (const { pattern, message } of FORBIDDEN_PATTERNS) {
    if (pattern.test(latex)) {
      issues.push(message);
      score -= 10;
    }
  }

  if (!/\\href\{/.test(latex) && /linkedin|github|mailto/i.test(latex)) {
    suggestions.push("Ensure links use \\href with extractable anchor text");
  }

  // Raw unescaped special chars outside LaTeX commands (ignore \\&, \\#, etc.)
  const stripped = latex.replace(/\\[a-zA-Z]+(\[[^\]]*\])?(\{[^}]*\})*/g, " ");
  const rawSpecial = stripped.match(/[&%#](?=\s|$|[^a-zA-Z])/g);
  if (rawSpecial && rawSpecial.length > 0) {
    issues.push(`Possible unescaped special characters: ${[...new Set(rawSpecial)].join(", ")}`);
    score -= 5;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    id: "latex",
    label: "LaTeX Structural Integrity",
    score,
    weight: 0.15,
    passed: score >= 80,
    blocking: score < 60,
    issues,
    suggestions,
  };
}
