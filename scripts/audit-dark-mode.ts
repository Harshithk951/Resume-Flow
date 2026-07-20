// scripts/audit-dark-mode.ts
//
// Dark Mode Audit — static analysis for light-mode-only patterns
// that would render invisible or low-contrast in dark mode.
//
// Usage:
//   npx tsx scripts/audit-dark-mode.ts
//   npx tsx scripts/audit-dark-mode.ts --json   # JSON output
//   npx tsx scripts/audit-dark-mode.ts --verbose # show every match
//   npx tsx scripts/audit-dark-mode.ts --ci      # exit 1 if any HIGH findings
//
// The script scans .tsx / .ts / .css / .jsx files and flags:
//   HIGH   - hardcoded bg-white / text-slate-* / text-gray-* without CSS variable usage
//   MEDIUM - bg-slate-* / border-slate-* or alpha-white without variables
//   LOW    - hover/focus states using light-mode colors
//   INFO   - inline #hex colors, gradient with hardcoded stops

import * as fs from "fs";
import * as path from "path";

// ─── Configuration ──────────────────────────────────────────

const ROOT = path.resolve(__dirname, "..");
const EXTENSIONS = ["tsx", "ts", "css", "jsx"];
const EXCLUDE_DIRS = [
  "node_modules",
  ".next",
  "out",
  "dist",
  "build",
  "coverage",
  ".git",
  "tmp",
  "mcp-servers",
  "_generated",
  "public",
  "fixtures",
  "reports",
];

// Patterns that are safe in dark mode because they use CSS variables already
const CSS_VAR_PATTERN = /var\(--color-/;

// ─── Pattern Definitions ────────────────────────────────────

interface AuditPattern {
  severity: "HIGH" | "MEDIUM" | "LOW" | "INFO";
  category: string;
  regex: RegExp;
  label: string;
  hint: string;
}

const PATTERNS: AuditPattern[] = [
  // ── HIGH: hardcoded white backgrounds (invisible on dark canvas) ──
  {
    severity: "HIGH",
    category: "bg-hardcoded",
    regex: /className="(?:[^"]*\`[^"]*)?bg-white(?!\/)/g,
    label: '`bg-white` without opacity — invisible on dark canvas',
    hint: 'Replace with bg-[var(--color-canvas)] or bg-[var(--color-surface-card)]',
  },
  {
    severity: "HIGH",
    category: "bg-hardcoded",
    regex: /className='(?:[^']*\`[^']*)?bg-white(?!\/)/g,
    label: '`bg-white` without opacity (single quotes)',
    hint: 'Replace with bg-[var(--color-canvas)] or bg-[var(--color-surface-card)]',
  },

  // ── HIGH: hardcoded slate/gray backgrounds (may render dark-on-dark) ──
  {
    severity: "HIGH",
    category: "bg-hardcoded",
    regex: /\bbg-slate-\d{2,3}(?!\b\/)/g,
    label: '`bg-slate-*` — hardcoded light gray',
    hint: 'Use bg-[var(--color-surface-soft)] or bg-[var(--color-surface-card)]',
  },
  {
    severity: "HIGH",
    category: "bg-hardcoded",
    regex: /\bbg-gray-\d{2,3}(?!\/)/g,
    label: '`bg-gray-*` — hardcoded light gray',
    hint: 'Use bg-[var(--color-surface-soft)] or bg-[var(--color-surface-card)]',
  },

  // ── HIGH: hardcoded dark text that fades on dark backgrounds ──
  {
    severity: "HIGH",
    category: "text-hardcoded",
    regex: /\btext-slate-(?:[89]\d{2}|700|600|500)\b/g,
    label: '`text-slate-*` — may be low contrast in dark mode',
    hint: 'Use text-[var(--color-ink)], text-[var(--color-body)], or text-[var(--color-charcoal)]',
  },
  {
    severity: "HIGH",
    category: "text-hardcoded",
    regex: /\btext-gray-(?:[789]\d{2}|600|500)\b/g,
    label: '`text-gray-*` — may be low contrast in dark mode',
    hint: 'Use text-[var(--color-ink)], text-[var(--color-body)], or text-[var(--color-charcoal)]',
  },

  // ── HIGH: text-white on non-primary backgrounds (may be invisible in dark) ──
  // Exclude patterns where text-white is on bg-[var(--color-primary)] or similar dark bg
  {
    severity: "HIGH",
    category: "text-contrast",
    regex: /\btext-white\b(?!.*(?:bg-rose|bg-red|bg-\[var\(--color-primary|bg-gradient|bg-amber-600|bg-emerald|bg-slate-900|bg-black))/g,
    label: '`text-white` without dark backdrop — may render white-on-white',
    hint: 'Ensure parent has a dark background or use CSS variable for color',
  },

  // ── MEDIUM: border colors that become invisible in dark ──
  {
    severity: "MEDIUM",
    category: "border-hardcoded",
    regex: /\bborder-slate-\d{2,3}\b(?!.*\/)/g,
    label: '`border-slate-*` — may fade on dark surfaces',
    hint: 'Should be overridden by .dark .border-slate-* in globals.css',
  },
  {
    severity: "MEDIUM",
    category: "border-hardcoded",
    regex: /\bborder-gray-\d{2,3}\b(?!\/)/g,
    label: '`border-gray-*` — may fade on dark surfaces',
    hint: 'Should be overridden by .dark .border-gray-* in globals.css',
  },

  // ── MEDIUM: alpha-white backgrounds (may need adjustment in dark) ──
  {
    severity: "MEDIUM",
    category: "alpha-white",
    regex: /bg-white\/\d{2}/g,
    label: '`bg-white/*` — semi-transparent white on dark needs review',
    hint: 'Switch to rgba(var(--color-canvas-rgb), opacity) or use a solid dark value',
  },

  // ── LOW: hover states using light colors ──
  {
    severity: "LOW",
    category: "hover-states",
    regex: /hover:bg-slate-\d{2,3}\b/g,
    label: '`hover:bg-slate-*` — hover state may be invisible in dark',
    hint: 'Add dark: variant or use CSS variable hover',
  },
  {
    severity: "LOW",
    category: "hover-states",
    regex: /hover:text-slate-(?:[89]\d{2}|700|600)\b/g,
    label: '`hover:text-slate-*` — hover text may be low contrast in dark',
    hint: 'Add dark: variant or use CSS variable',
  },

  // ── INFO: inline #hex color values that are NOT brand/accent colors ──
  // We skip common brand colors (#e60023, #ff3040, #cc001f, #f5f5f5,
  // #ffffff, #000000, #111111, etc.) to reduce noise.
  {
    severity: "INFO",
    category: "hardcoded-hex",
    regex: /(?:(?:bg|text|border|from|to|via|ring|outline)-)((?!e60023|ff3040|cc001f|ffffff|000000)[0-9a-fA-F]{3,8})/g,
    label: 'Hardcoded utility hex color — verify it adapts in dark mode',
    hint: 'Consider using a CSS variable or dark: variant',
  },
];

// ─── File Discovery (recursive walk — no external deps) ────

function shouldExcludeDir(dirName: string): boolean {
  return EXCLUDE_DIRS.includes(dirName);
}

function walkDir(dir: string, extensions: string[], result: string[]): void {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!shouldExcludeDir(entry.name)) {
          walkDir(fullPath, extensions, result);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).slice(1);
        if (extensions.includes(ext)) {
          result.push(fullPath);
        }
      }
    }
  } catch {
    // Permission denied or other error — skip silently
  }
}

function findSourceFiles(): string[] {
  const files: string[] = [];
  walkDir(ROOT, EXTENSIONS, files);
  return files;
}

// ─── File Classification ────────────────────────────────────

function classifyFile(filePath: string): string {
  const rel = path.relative(ROOT, filePath);
  if (rel.startsWith("app/")) return "app";
  if (rel.startsWith("components/")) return "components";
  if (rel.startsWith("lib/")) return "lib";
  if (rel.startsWith("scripts/")) return "scripts";
  if (rel.startsWith("convex/")) return "convex";
  return "other";
}

function usesCssVariables(content: string): boolean {
  return CSS_VAR_PATTERN.test(content);
}

// ─── Audit Engine ───────────────────────────────────────────

interface Finding {
  file: string;
  line: number;
  match: string;
  pattern: AuditPattern;
}

interface FileReport {
  file: string;
  category: string;
  usesVars: boolean;
  findings: Finding[];
}

function auditFile(filePath: string): FileReport {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const usesVars = usesCssVariables(content);
  const relPath = path.relative(ROOT, filePath);
  const findings: Finding[] = [];

  for (const pattern of PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match: RegExpExecArray | null;
      const regex = new RegExp(pattern.regex.source, "g" + (pattern.regex.flags.includes("i") ? "i" : ""));
      
      while ((match = regex.exec(line)) !== null) {
        // Skip false positives: text-white on bg-primary buttons (they're correct)
        if (pattern.label.includes("text-white") && 
            (line.includes("bg-[var(--color-primary)]") || 
             line.includes("bg-rose-") ||
             line.includes("bg-[var(--color-ink)]"))) {
          continue;
        }

        findings.push({
          file: relPath,
          line: i + 1,
          match: match[0].substring(0, 80),
          pattern: { ...pattern },
        });

        // Avoid infinite loop on zero-length matches
        if (match.index === regex.lastIndex) regex.lastIndex++;
      }
    }
  }

  return {
    file: relPath,
    category: classifyFile(filePath),
    usesVars,
    findings,
  };
}

// ─── Report Generation ──────────────────────────────────────

interface Summary {
  totalFiles: number;
  filesWithFindings: number;
  filesUsingVars: number;
  totalFindings: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  topFiles: { file: string; count: number }[];
}

function generateMarkdownReport(reports: FileReport[], verbose: boolean): string {
  const summary: Summary = {
    totalFiles: reports.length,
    filesWithFindings: reports.filter((r) => r.findings.length > 0).length,
    filesUsingVars: reports.filter((r) => r.usesVars).length,
    totalFindings: reports.reduce((acc, r) => acc + r.findings.length, 0),
    bySeverity: {},
    byCategory: {},
    topFiles: [],
  };

  for (const report of reports) {
    for (const finding of report.findings) {
      summary.bySeverity[finding.pattern.severity] =
        (summary.bySeverity[finding.pattern.severity] || 0) + 1;
      summary.byCategory[finding.pattern.category] =
        (summary.byCategory[finding.pattern.category] || 0) + 1;
    }
  }

  // Top 10 files by finding count
  const fileCounts = reports
    .map((r) => ({ file: r.file, count: r.findings.length }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  summary.topFiles = fileCounts;

  const lines: string[] = [];

  lines.push("# 🌗 Dark Mode Audit Report", "");
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Scanned files:** ${summary.totalFiles}`);
  lines.push(`**Files with findings:** ${summary.filesWithFindings}`);
  lines.push(`**Files already using CSS variables:** ${summary.filesUsingVars} (${Math.round(summary.filesUsingVars / summary.totalFiles * 100)}%)`);
  lines.push(`**Total findings:** ${summary.totalFindings}`);
  lines.push("");

  // ── Summary by Severity ──
  lines.push("## 🔴 Severity Breakdown", "");
  lines.push("| Severity | Count |");
  lines.push("|----------|-------|");
  for (const sev of ["HIGH", "MEDIUM", "LOW", "INFO"]) {
    lines.push(`| ${sev === "HIGH" ? "🔴 HIGH" : sev === "MEDIUM" ? "🟠 MEDIUM" : sev === "LOW" ? "🟡 LOW" : "🔵 INFO"} | ${summary.bySeverity[sev] || 0} |`);
  }
  lines.push("");

  // ── Summary by Category ──
  lines.push("## 📂 Findings by Category", "");
  lines.push("| Category | Count |");
  lines.push("|----------|-------|");
  for (const [cat, count] of Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])) {
    const label: Record<string, string> = {
      "bg-hardcoded": "Hardcoded backgrounds (bg-white/bg-slate)",
      "text-hardcoded": "Hardcoded text colors (text-slate/text-gray)",
      "text-contrast": "text-white without dark backdrop",
      "border-hardcoded": "Hardcoded borders (border-slate/gray)",
      "alpha-white": "Semi-transparent white backgrounds",
      "hover-states": "Light-mode hover states",
      "hardcoded-hex": "Inline hex color values",
      "gradients": "Gradients with hardcoded stops",
    };
    lines.push(`| ${label[cat] || cat} | ${count} |`);
  }
  lines.push("");

  // ── Top Files ──
  lines.push("## 🏆 Files with Most Findings", "");
  lines.push("| File | Count | CSS Vars? |");
  lines.push("|------|-------|-----------|");
  for (const f of summary.topFiles) {
    const report = reports.find((r) => r.file === f.file)!;
    lines.push(`| ${f.file} | ${f.count} | ${report?.usesVars ? "✅" : "❌"} |`);
  }
  lines.push("");

  // ── Detailed Findings by Category (non-verbose only shows HIGH) ──
  if (verbose) {
    lines.push("## 📋 All Findings", "");
    for (const sev of ["HIGH", "MEDIUM", "LOW", "INFO"] as const) {
      const findings = reports.flatMap((r) =>
        r.findings
          .filter((f) => f.pattern.severity === sev)
          .map((f) => ({ ...f, file: r.file }))
      );
      if (findings.length === 0) continue;

      lines.push(`### ${sev === "HIGH" ? "🔴" : sev === "MEDIUM" ? "🟠" : sev === "LOW" ? "🟡" : "🔵"} ${sev}`, "");
      lines.push("| File | Line | Match | Hint |");
      lines.push("|------|------|-------|------|");

      for (const f of findings.slice(0, 100)) {
        lines.push(`| ${f.file} | ${f.line} | \`${f.match}\` | ${f.pattern.hint} |`);
      }
      if (findings.length > 100) {
        lines.push(`| _... and ${findings.length - 100} more_ | | | |`);
      }
      lines.push("");
    }
  } else {
    // Concise mode — only HIGH findings
    const highFindings = reports.flatMap((r) =>
      r.findings
        .filter((f) => f.pattern.severity === "HIGH")
        .map((f) => ({ ...f, file: r.file }))
    );

    if (highFindings.length > 0) {
      lines.push("## 🔴 High-Severity Findings", "");
      lines.push("| File | Line | Pattern | Hint |");
      lines.push("|------|------|---------|------|");
      for (const f of highFindings.slice(0, 50)) {
        lines.push(`| ${f.file} | ${f.line} | \`${f.match}\` | ${f.pattern.hint} |`);
      }
      if (highFindings.length > 50) {
        lines.push(`| _... and ${highFindings.length - 50} more_ | | | |`);
      }
      lines.push("");
      lines.push(`> **${highFindings.length} HIGH findings** — address these first for dark mode compatibility.`);
      lines.push("");
    } else {
      lines.push("## ✅ No High-Severity Findings", "");
      lines.push("All scanned files pass the HIGH severity checks. Run with `--verbose` for lower-severity items.", "");
    }
  }

  // ── Files Already Using CSS Variables ──
  const varFiles = reports.filter((r) => r.usesVars);
  if (varFiles.length > 0) {
    lines.push("## ✅ Files Already Using CSS Variables", "");
    lines.push("These files reference `var(--color-*)` and will adapt automatically:");
    for (const f of varFiles) {
      const findingCount = reports.find((r) => r.file === f.file)?.findings.length ?? 0;
      const badge = findingCount === 0 ? "✅ clean" : `⚠️ ${findingCount} additional findings`;
      lines.push(`- \`${f.file}\` — ${badge}`);
    }
    lines.push("");
  }

  // ── Remediation Guidance ──
  lines.push("## 🛠️ Remediation Guide", "");
  lines.push("| Priority | Action |");
  lines.push("|----------|--------|");
  lines.push("| 🔴 1 | Replace `bg-white` with `bg-[var(--color-canvas)]` or `bg-[var(--color-surface-card)]` |");
  lines.push("| 🔴 2 | Replace `text-slate-700/800/900` with `text-[var(--color-ink)]` or `text-[var(--color-body)]` |");
  lines.push("| 🟠 3 | Replace `bg-slate-50/100` with `bg-[var(--color-surface-soft)]` or `bg-[var(--color-surface-card)]` |");
  lines.push("| 🟠 4 | Ensure all `border-slate-*` have corresponding `.dark` overrides in globals.css |");
  lines.push("| 🟡 5 | Add `dark:` variant to hover states (`hover:bg-slate-50` → `dark:hover:bg-white/10`) |");
  lines.push("| 🔵 6 | Replace hardcoded hex gradients with CSS variable stops |");
  lines.push("");

  lines.push("---", "");
  lines.push("*Audit script: `scripts/audit-dark-mode.ts` — run with `--verbose` for full detail, `--ci` to fail on HIGH findings.*");

  return lines.join("\n");
}

function generateJsonReport(reports: FileReport[]): string {
  const highCount = reports.reduce((acc, r) => acc + r.findings.filter((f) => f.pattern.severity === "HIGH").length, 0);
  return JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: reports.length,
        filesWithFindings: reports.filter((r) => r.findings.length > 0).length,
        filesUsingVars: reports.filter((r) => r.usesVars).length,
        totalFindings: reports.reduce((acc, r) => acc + r.findings.length, 0),
        highCount,
        mediumCount: reports.reduce((acc, r) => acc + r.findings.filter((f) => f.pattern.severity === "MEDIUM").length, 0),
        lowCount: reports.reduce((acc, r) => acc + r.findings.filter((f) => f.pattern.severity === "LOW").length, 0),
        infoCount: reports.reduce((acc, r) => acc + r.findings.filter((f) => f.pattern.severity === "INFO").length, 0),
        topFiles: reports
          .map((r) => ({ file: r.file, count: r.findings.length }))
          .filter((r) => r.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      },
      findings: reports.flatMap((r) =>
        r.findings.map((f) => ({
          file: r.file,
          line: f.line,
          severity: f.pattern.severity,
          category: f.pattern.category,
          match: f.match,
          hint: f.pattern.hint,
        }))
      ),
    },
    null,
    2
  );
}

// ─── Main ───────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes("--json");
  const verbose = args.includes("--verbose");
  const ciMode = args.includes("--ci");

  console.error(`🔍 Scanning ${EXTENSIONS.join(", ")} files in ${ROOT}…`);
  const files = findSourceFiles();
  console.error(`📁 Found ${files.length} source files`);

  const reports: FileReport[] = files.map(auditFile);
  const highFindings = reports.reduce((acc, r) => acc + r.findings.filter((f) => f.pattern.severity === "HIGH").length, 0);

  if (jsonMode) {
    console.log(generateJsonReport(reports));
  } else {
    console.log(generateMarkdownReport(reports, verbose));
  }

  if (ciMode && highFindings > 0) {
    console.error(`\n❌ CI gate FAILED: ${highFindings} HIGH findings detected.`);
    process.exit(1);
  }

  console.error(`\n✅ Audit complete. ${highFindings} HIGH findings.`);
}

main();
