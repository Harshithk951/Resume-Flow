import fs from "fs/promises";
import path from "path";
import { jsonToLatex } from "@/lib/latex/jsonToLatex";
import type { TemplateId } from "@/lib/latex/resolveTemplate";
import { normalizeStructuredContent } from "@/lib/pdf/types";
import type {
  CombinationResult,
  EvaluationReport,
  JobDescriptionFixture,
} from "./types";
import {
  DIMENSION_WEIGHTS,
  TEMPLATE_PASS_PROFILES,
} from "./types";
import { scoreLatexIntegrity } from "./scorers/latexScorer";
import {
  compileLatexToPdfBuffer,
  scoreCompileReliability,
} from "./scorers/compileScorer";
import { extractPdfText, scoreAtsParse } from "./scorers/atsParseScorer";
import { scoreXyzBullets } from "./scorers/xyzScorer";
import { scoreVisualQuality as scoreVisual } from "./scorers/visualScorer";
import { scoreParity } from "./scorers/parityScorer";
import {
  runLlmShortlistReview,
  scoreLlmReview,
} from "./scorers/llmReviewScorer";

const ALL_TEMPLATE_IDS: TemplateId[] = ["ats_strict"];

/** Sensible resume↔JD pairings for CI gates (avoids cross-domain keyword noise). */
export const RESUME_JD_PAIRINGS: Record<string, string[]> = {
  "swe-mid": ["swe-bigtech", "swe-startup"],
  "swe-staff": ["swe-bigtech", "swe-startup"],
  "finance-analyst": ["finance-analyst"],
};

export function shouldEvaluatePair(
  resumeId: string,
  jdId: string,
  ciMode: boolean
): boolean {
  if (!ciMode) return true;
  const allowed = RESUME_JD_PAIRINGS[resumeId];
  return allowed ? allowed.includes(jdId) : true;
}

function computeOverall(
  dimensions: CombinationResult["dimensions"]
): number {
  let total = 0;
  let weightSum = 0;
  for (const d of dimensions) {
    if (d.skipped) continue;
    const w = DIMENSION_WEIGHTS[d.id] ?? d.weight;
    if (w <= 0) continue;
    total += d.score * w;
    weightSum += w;
  }
  return weightSum > 0 ? Math.round(total / weightSum) : 0;
}

function combinationPassed(
  templateId: TemplateId,
  dimensions: CombinationResult["dimensions"]
): boolean {
  const profile = TEMPLATE_PASS_PROFILES[templateId];
  const blockingFail = dimensions.some((d) => d.blocking && !d.passed && !d.skipped);
  if (blockingFail) return false;
  const overall = computeOverall(dimensions);
  if (overall < profile.minOverallScore) return false;
  const ats = dimensions.find((d) => d.id === "atsParse");
  if (ats && !ats.passed) return false;
  return true;
}

export interface RunEvaluationOptions {
  runId: string;
  outputDir: string;
  ciMode: boolean;
  enableLlm: boolean;
  resumes: { id: string; data: unknown }[];
  jds: JobDescriptionFixture[];
}

export async function runEvaluation(
  options: RunEvaluationOptions
): Promise<EvaluationReport> {
  const { runId, outputDir, ciMode, enableLlm, resumes, jds } = options;
  await fs.mkdir(outputDir, { recursive: true });

  const combinations: CombinationResult[] = [];

  for (const templateId of ALL_TEMPLATE_IDS) {
    for (const { id: resumeId, data } of resumes) {
      for (const jd of jds) {
        if (!shouldEvaluatePair(resumeId, jd.id, ciMode)) continue;

        const resume = normalizeStructuredContent(data);
        const latex = jsonToLatex(resume, templateId);
        const artifactDir = path.join(
          outputDir,
          templateId,
          `${resumeId}__${jd.id}`
        );
        await fs.mkdir(artifactDir, { recursive: true });

        const texPath = path.join(artifactDir, "resume.tex");
        await fs.writeFile(texPath, latex, "utf-8");

        const dimensions: CombinationResult["dimensions"] = [];
        dimensions.push(scoreLatexIntegrity(latex));
        dimensions.push(scoreXyzBullets(resume));

        const compileResult = await compileLatexToPdfBuffer(latex, artifactDir);
        dimensions.push(scoreCompileReliability(compileResult));

        let pdfText = "";
        let pageCount = 0;
        let pdfPath: string | undefined;

        if (compileResult.success && compileResult.pdfBuffer) {
          pdfPath = path.join(artifactDir, "resume.pdf");
          await fs.writeFile(pdfPath, compileResult.pdfBuffer);
          try {
            const extracted = await extractPdfText(compileResult.pdfBuffer);
            pdfText = extracted.text;
            pageCount = extracted.pageCount;
          } catch {
            dimensions.push({
              id: "atsParse",
              label: "ATS Parse & Text Recovery",
              score: 0,
              weight: 0.25,
              passed: false,
              blocking: true,
              issues: ["pdf-parse failed to extract text"],
              suggestions: [],
            });
          }
        }

        if (pdfText) {
          const evalInput = {
            templateId,
            resume,
            jd,
            latex,
            pdfText,
          };
          dimensions.push(scoreAtsParse(evalInput, pdfText, templateId));
          dimensions.push(scoreVisual(resume, templateId, pageCount));
          dimensions.push(scoreParity(resume, templateId, latex, pdfText));

          if (enableLlm) {
            const llm = await runLlmShortlistReview(evalInput, pdfText);
            dimensions.push(scoreLlmReview(templateId, llm));
          } else {
            dimensions.push(scoreLlmReview(templateId, null));
          }
        } else if (!dimensions.some((d) => d.id === "atsParse")) {
          dimensions.push({
            id: "atsParse",
            label: "ATS Parse & Text Recovery",
            score: 0,
            weight: 0.25,
            passed: false,
            blocking: true,
            issues: ["No PDF available for text extraction"],
            suggestions: ["Fix LaTeX compile errors first"],
          });
          dimensions.push(scoreVisual(resume, templateId, pageCount));
          dimensions.push(scoreLlmReview(templateId, null));
        }

        const overallScore = computeOverall(dimensions);
        const passed = combinationPassed(templateId, dimensions);

        combinations.push({
          templateId,
          resumeId,
          jdId: jd.id,
          dimensions,
          overallScore,
          passed,
          artifacts: { texPath, pdfPath },
        });
      }
    }
  }

  const templateSummary = {} as EvaluationReport["templateSummary"];
  for (const tid of ALL_TEMPLATE_IDS) {
    const subset = combinations.filter((c) => c.templateId === tid);
    const avgOverall =
      subset.length > 0
        ? Math.round(
            subset.reduce((s, c) => s + c.overallScore, 0) / subset.length
          )
        : 0;
    const passRate =
      subset.length > 0
        ? Math.round(
            (subset.filter((c) => c.passed).length / subset.length) * 100
          )
        : 0;
    const blockingFailures = [
      ...new Set(
        subset
          .filter((c) => !c.passed)
          .flatMap((c) =>
            c.dimensions
              .filter((d) => d.blocking && !d.passed)
              .map((d) => `${c.resumeId}/${c.jdId}: ${d.label}`)
          )
      ),
    ];
    templateSummary[tid] = { avgOverall, passRate, blockingFailures };
  }

  const passed = combinations.every((c) => c.passed);

  return {
    runId,
    createdAt: new Date().toISOString(),
    ciMode,
    combinations,
    templateSummary,
    passed,
  };
}
