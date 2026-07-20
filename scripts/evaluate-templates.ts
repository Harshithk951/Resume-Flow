import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import type { EvaluationReport } from "../lib/quality/types";
import { runEvaluation } from "../lib/quality/runEvaluation";
import type { JobDescriptionFixture } from "../lib/quality/types";

dotenv.config({ path: ".env.local" });
dotenv.config();

const ROOT = path.resolve(__dirname, "..");
const FIXTURES_RESUMES = path.join(ROOT, "fixtures", "resumes");
const FIXTURES_JDS = path.join(ROOT, "fixtures", "jds");
const REPORTS_DIR = path.join(ROOT, "reports", "template-quality");

async function loadJsonDir<T>(dir: string): Promise<{ id: string; data: T }[]> {
  const files = await fs.readdir(dir);
  const out: { id: string; data: T }[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const id = file.replace(/\.json$/, "");
    const raw = await fs.readFile(path.join(dir, file), "utf-8");
    out.push({ id, data: JSON.parse(raw) as T });
  }
  return out;
}

function formatMarkdown(report: EvaluationReport): string {
  const lines: string[] = [
    `# Template Quality Scorecard`,
    ``,
    `- **Run ID:** ${report.runId}`,
    `- **Created:** ${report.createdAt}`,
    `- **CI mode:** ${report.ciMode}`,
    `- **Overall pass:** ${report.passed ? "YES" : "NO"}`,
    ``,
    `## Template Summary`,
    ``,
    `| Template | Avg Overall | Pass Rate | Blocking Failures |`,
    `|----------|-------------|-----------|-------------------|`,
  ];

  for (const [tid, summary] of Object.entries(report.templateSummary)) {
    const failures =
      summary.blockingFailures.length > 0
        ? summary.blockingFailures.slice(0, 3).join("; ")
        : "—";
    lines.push(
      `| ${tid} | ${summary.avgOverall} | ${summary.passRate}% | ${failures} |`
    );
  }

  lines.push(``, `## Combinations`, ``);

  for (const c of report.combinations) {
    const status = c.passed ? "PASS" : "FAIL";
    lines.push(
      `### ${status} — \`${c.templateId}\` / ${c.resumeId} / ${c.jdId} (overall ${c.overallScore})`,
      ``
    );
    lines.push(`| Dimension | Score | Pass | Issues |`);
    lines.push(`|-----------|-------|------|--------|`);
    for (const d of c.dimensions) {
      const issue =
        d.issues[0]?.slice(0, 80).replace(/\|/g, "/") ??
        (d.skipped ? "(skipped)" : "—");
      lines.push(
        `| ${d.label} | ${d.skipped ? "—" : d.score} | ${d.passed ? "yes" : "no"} | ${issue} |`
      );
    }
    lines.push(``);
  }

  return lines.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const ciMode = args.includes("--ci") || args.includes("--fail-under-profile");
  const enableLlm = args.includes("--llm") || Boolean(process.env.NVIDIA_NIM_API_KEY);

  const runId =
    new Date().toISOString().replace(/[:.]/g, "-") +
    (ciMode ? "-ci" : "");

  const resumes = await loadJsonDir<unknown>(FIXTURES_RESUMES);
  const jdsRaw = await loadJsonDir<Omit<JobDescriptionFixture, "id">>(FIXTURES_JDS);
  const jds: JobDescriptionFixture[] = jdsRaw.map((item) => ({
    id: item.id,
    ...item.data,
  }));

  if (resumes.length === 0 || jds.length === 0) {
    console.error("Missing fixtures in fixtures/resumes or fixtures/jds");
    process.exit(1);
  }

  const outputDir = path.join(REPORTS_DIR, runId);
  console.log(`Evaluating ${resumes.length} resumes × ${jds.length} JDs × 4 templates…`);

  const report = await runEvaluation({
    runId,
    outputDir,
    ciMode,
    enableLlm: enableLlm && !args.includes("--no-llm"),
    resumes,
    jds,
  });

  const jsonPath = path.join(REPORTS_DIR, `${runId}.json`);
  const latestJson = path.join(REPORTS_DIR, "latest.json");
  const latestMd = path.join(REPORTS_DIR, "latest.md");
  const md = formatMarkdown(report);

  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
  await fs.writeFile(latestJson, JSON.stringify(report, null, 2));
  await fs.writeFile(latestMd, md);
  await fs.writeFile(path.join(outputDir, "scorecard.md"), md);

  console.log(md);
  console.log(`\nWrote ${latestMd}`);

  if (ciMode && !report.passed) {
    console.error("\nCI gate FAILED: one or more combinations below pass profile.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
