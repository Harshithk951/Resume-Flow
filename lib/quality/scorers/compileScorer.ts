import { execFile } from "child_process";
import fs from "fs/promises";
import fsSync from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";
import type { DimensionResult } from "../types";

const execFileAsync = promisify(execFile);

function getPdfLatexPath(): string {
  const customPath = "/Library/TeX/texbin/pdflatex";
  if (fsSync.existsSync(customPath)) return customPath;
  return "pdflatex";
}

export interface CompileResult {
  success: boolean;
  pdfBuffer?: Buffer;
  logTail?: string;
  durationMs: number;
  engine: "pdflatex" | "none";
}

export async function compileLatexToPdfBuffer(
  latex: string,
  workDir?: string
): Promise<CompileResult> {
  const start = Date.now();
  const tmpDir = workDir ?? await fs.mkdtemp(path.join(os.tmpdir(), "rf-quality-"));
  const uniqueId = Math.random().toString(36).slice(2, 9);
  const texPath = path.join(tmpDir, `resume_${uniqueId}.tex`);
  const pdfPath = path.join(tmpDir, `resume_${uniqueId}.pdf`);
  const logPath = path.join(tmpDir, `resume_${uniqueId}.log`);

  try {
    await fs.writeFile(texPath, latex, "utf-8");
    const pdflatexPath = getPdfLatexPath();
    const args = [
      "-interaction=nonstopmode",
      `-output-directory=${tmpDir}`,
      texPath,
    ];

    try {
      await execFileAsync(pdflatexPath, args, { timeout: 60000 });
    } catch (err: unknown) {
      const e = err as { stdout?: string; stderr?: string };
      let logTail = e.stdout || e.stderr || String(err);
      try {
        logTail = await fs.readFile(logPath, "utf-8");
      } catch {
        // ignore
      }
      return {
        success: false,
        logTail: logTail.slice(-2000),
        durationMs: Date.now() - start,
        engine: "none",
      };
    }

    try {
      const pdfBuffer = await fs.readFile(pdfPath);
      return {
        success: true,
        pdfBuffer,
        durationMs: Date.now() - start,
        engine: "pdflatex",
      };
    } catch {
      let logTail = "";
      try {
        logTail = await fs.readFile(logPath, "utf-8");
      } catch {
        // ignore
      }
      return {
        success: false,
        logTail: logTail.slice(-2000),
        durationMs: Date.now() - start,
        engine: "none",
      };
    }
  } finally {
    if (!workDir) {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

export function scoreCompileReliability(
  compileResult: CompileResult
): DimensionResult {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!compileResult.success) {
    issues.push("pdflatex compilation failed");
    if (compileResult.logTail) {
      issues.push(`Log tail: ${compileResult.logTail.slice(-400)}`);
    }
    suggestions.push("Fix LaTeX syntax errors and missing packages");
    return {
      id: "compile",
      label: "PDF Compile Reliability",
      score: 0,
      weight: 0.15,
      passed: false,
      blocking: true,
      issues,
      suggestions,
      metadata: {
        durationMs: compileResult.durationMs,
        engine: compileResult.engine,
      },
    };
  }

  return {
    id: "compile",
    label: "PDF Compile Reliability",
    score: 100,
    weight: 0.15,
    passed: true,
    blocking: true,
    issues,
    suggestions,
    metadata: {
      durationMs: compileResult.durationMs,
      engine: compileResult.engine,
    },
  };
}
