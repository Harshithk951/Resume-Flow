import type { TemplateId } from "@/lib/latex/resolveTemplate";
import type { StructuredResumeContent } from "@/lib/pdf/types";

export type DimensionId =
  | "latex"
  | "compile"
  | "atsParse"
  | "xyz"
  | "visual"
  | "llmReview"
  | "parity";

export interface DimensionResult {
  id: DimensionId;
  label: string;
  score: number;
  weight: number;
  passed: boolean;
  blocking: boolean;
  issues: string[];
  suggestions: string[];
  skipped?: boolean;
  metadata?: Record<string, unknown>;
}

export interface TemplatePassProfile {
  minKeywordRecovery: number;
  minFormattingScore: number;
  minOverallScore: number;
  minLlmAtsScore: number;
  minLlmHmScore: number;
}

export const TEMPLATE_PASS_PROFILES: Record<TemplateId, TemplatePassProfile> = {
  ats_strict: {
    minKeywordRecovery: 85,
    minFormattingScore: 90,
    minOverallScore: 80,
    minLlmAtsScore: 80,
    minLlmHmScore: 80,
  },
  modern_professional: {
    minKeywordRecovery: 80,
    minFormattingScore: 75,
    minOverallScore: 75,
    minLlmAtsScore: 75,
    minLlmHmScore: 80,
  },
  modern_executive: {
    minKeywordRecovery: 80,
    minFormattingScore: 75,
    minOverallScore: 75,
    minLlmAtsScore: 75,
    minLlmHmScore: 80,
  },
  tech_innovator: {
    minKeywordRecovery: 80,
    minFormattingScore: 75,
    minOverallScore: 75,
    minLlmAtsScore: 75,
    minLlmHmScore: 80,
  },
};

export const DIMENSION_WEIGHTS: Record<DimensionId, number> = {
  latex: 0.15,
  compile: 0.15,
  atsParse: 0.25,
  xyz: 0.2,
  visual: 0.1,
  llmReview: 0.15,
  parity: 0,
};

export interface JobDescriptionFixture {
  id: string;
  title: string;
  company: string;
  hardSkills: string[];
  keywordsToInclude: string[];
  rawText: string;
}

export interface EvaluationInput {
  templateId: TemplateId;
  resume: StructuredResumeContent;
  jd: JobDescriptionFixture;
  latex: string;
  pdfBuffer?: Buffer;
  pdfText?: string;
}

export interface CombinationResult {
  templateId: TemplateId;
  resumeId: string;
  jdId: string;
  dimensions: DimensionResult[];
  overallScore: number;
  passed: boolean;
  artifacts: {
    texPath?: string;
    pdfPath?: string;
  };
}

export interface EvaluationReport {
  runId: string;
  createdAt: string;
  ciMode: boolean;
  combinations: CombinationResult[];
  templateSummary: Record<
    TemplateId,
    {
      avgOverall: number;
      passRate: number;
      blockingFailures: string[];
    }
  >;
  passed: boolean;
}
