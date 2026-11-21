import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";

const execFilePromise = promisify(execFile);

// Maximum allowed raw LaTeX size: 500 KB
export const MAX_LATEX_SIZE_BYTES = 500 * 1024;

// Default compilation timeout: 10 seconds
export const LATEX_COMPILE_TIMEOUT_MS = 10_000;

/**
 * List of forbidden TeX commands and tokens that could lead to:
 * - Remote shell execution (\write18, \immediate, etc.)
 * - File system traversal & arbitrary file reads (\input, \include, \openin, \@@input, \InputIfFileExists, \verbatiminput, \lstinputlisting, etc.)
 * - Arbitrary file writes (\openout, \write, etc.)
 * - Macro injection & endless loops (\csname, \catcode, etc.)
 * - Potentially dangerous packages (\usepackage{catchfile}, \usepackage{shellesc})
 */
export const FORBIDDEN_LATEX_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { pattern: /\\write18\b/i, description: "\\write18 shell execution is strictly prohibited" },
  { pattern: /\\immediate\b/i, description: "\\immediate is strictly prohibited" },
  { pattern: /\\write\b/i, description: "\\write is strictly prohibited" },
  { pattern: /\\newwrite\b/i, description: "\\newwrite is strictly prohibited" },
  { pattern: /\\openout\b/i, description: "\\openout file creation is strictly prohibited" },
  { pattern: /\\openin\b/i, description: "\\openin file reading is strictly prohibited" },
  { pattern: /\\read\b/i, description: "\\read stream input is strictly prohibited" },
  { pattern: /\\input\b/i, description: "\\input file inclusion is strictly prohibited" },
  { pattern: /\\include\b/i, description: "\\include file inclusion is strictly prohibited" },
  { pattern: /\\InputIfFileExists\b/i, description: "\\InputIfFileExists is strictly prohibited" },
  { pattern: /\\@@input\b/i, description: "\\@@input low-level input is strictly prohibited" },
  { pattern: /\\verbatiminput\b/i, description: "\\verbatiminput is strictly prohibited" },
  { pattern: /\\lstinputlisting\b/i, description: "\\lstinputlisting is strictly prohibited" },
  { pattern: /\\usepackage(\[[^\]]*\])?\s*\{\s*(catchfile|shellesc)\s*\}/i, description: "\\usepackage of catchfile/shellesc is strictly prohibited" },
  { pattern: /\\import\b/i, description: "\\import file inclusion is strictly prohibited" },
  { pattern: /\\subimport\b/i, description: "\\subimport is strictly prohibited" },
  { pattern: /\\catcode\b/i, description: "\\catcode redefinition is strictly prohibited" },
  { pattern: /\\csname\b/i, description: "\\csname dynamic token construction is strictly prohibited" },
  { pattern: /\\loop\b/i, description: "\\loop constructs are strictly prohibited" },
  { pattern: /\\repeat\b/i, description: "\\repeat constructs are strictly prohibited" },
  { pattern: /\\every\w+/i, description: "\\every* token hooks are strictly prohibited" },
  { pattern: /\\special\b/i, description: "\\special driver commands are strictly prohibited" },
];

export interface LatexSecurityValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates LaTeX source code against strict security constraints.
 */
export function validateLatexSecurity(latex: string): LatexSecurityValidationResult {
  if (!latex || typeof latex !== "string") {
    return { valid: false, reason: "LaTeX source must be a non-empty string" };
  }

  // Check payload size
  const byteLength = Buffer.byteLength(latex, "utf-8");
  if (byteLength > MAX_LATEX_SIZE_BYTES) {
    return {
      valid: false,
      reason: `LaTeX source exceeds maximum allowed size of ${MAX_LATEX_SIZE_BYTES / 1024} KB (received ${(byteLength / 1024).toFixed(1)} KB)`,
    };
  }

  // Check forbidden commands
  for (const { pattern, description } of FORBIDDEN_LATEX_PATTERNS) {
    if (pattern.test(latex)) {
      return { valid: false, reason: description };
    }
  }

  return { valid: true };
}

/**
 * Locates the pdflatex executable path.
 */
export function getPdfLatexPath(): string {
  const candidatePaths = [
    "/Library/TeX/texbin/pdflatex",
    "/usr/local/bin/pdflatex",
    "/usr/bin/pdflatex",
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return "pdflatex";
}

export interface SandboxedCompileOptions {
  timeoutMs?: number;
  maxBufferBytes?: number;
}

/**
 * Compiles a sanitized LaTeX document inside an isolated sandbox directory.
 *
 * Security Features:
 * - -no-shell-escape flag enforced
 * - openin_any=p and openout_any=p enforced via env vars AND local texmf.cnf
 * - shell_escape=f enforced
 * - Execution timeout (default 10s)
 * - Isolated unique directory per compilation with guaranteed cleanup
 */
export async function compileLatexSandboxed(
  latex: string,
  options: SandboxedCompileOptions = {}
): Promise<{ pdfBuffer: Buffer; logContent: string }> {
  // Step 1: Pre-execution static security check
  const security = validateLatexSecurity(latex);
  if (!security.valid) {
    throw new Error(`SECURITY_VIOLATION: ${security.reason}`);
  }

  const timeoutMs = options.timeoutMs ?? LATEX_COMPILE_TIMEOUT_MS;
  const maxBuffer = options.maxBufferBytes ?? 1024 * 1024; // 1 MB buffer cap

  // Step 2: Create an isolated sandbox directory
  const sandboxId = crypto.randomBytes(16).toString("hex");
  const sandboxDir = path.join(os.tmpdir(), `rf_tex_${sandboxId}`);
  await fsPromises.mkdir(sandboxDir, { recursive: true, mode: 0o700 });

  const texFile = path.join(sandboxDir, "document.tex");
  const pdfFile = path.join(sandboxDir, "document.pdf");
  const logFile = path.join(sandboxDir, "document.log");
  const texmfCnfFile = path.join(sandboxDir, "texmf.cnf");

  try {
    // Write document source
    await fsPromises.writeFile(texFile, latex, { encoding: "utf-8", mode: 0o600 });

    // Enforce paranoid security settings in local texmf.cnf as well as environment
    await fsPromises.writeFile(
      texmfCnfFile,
      `openin_any = p\nopenout_any = p\nshell_escape = f\n`,
      { encoding: "utf-8", mode: 0o600 }
    );

    const pdflatexPath = getPdfLatexPath();
    const args = [
      "-no-shell-escape",
      "-interaction=nonstopmode",
      "-halt-on-error",
      `-output-directory=${sandboxDir}`,
      texFile,
    ];

    const env = {
      ...process.env,
      openin_any: "p",
      openout_any: "p",
      shell_escape: "f",
      TEXMFCNF: `${sandboxDir}:`,
      TEXMFOUTPUT: sandboxDir,
    };

    let compileStdout = "";
    try {
      const result = await execFilePromise(pdflatexPath, args, {
        cwd: sandboxDir,
        env,
        timeout: timeoutMs,
        maxBuffer,
      });
      compileStdout = result.stdout;
    } catch (execErr: unknown) {
      const err = execErr as { stdout?: string; stderr?: string; message?: string; killed?: boolean };
      let logSnippet = "";
      try {
        const fullLog = await fsPromises.readFile(logFile, "utf-8");
        logSnippet = fullLog.slice(-2000);
      } catch {
        logSnippet = err.stdout || err.message || "Unknown error";
      }

      if (err.killed) {
        throw new Error(`LATEX_TIMEOUT: Compilation exceeded time limit of ${timeoutMs / 1000}s`);
      }
      throw new Error(`LATEX_COMPILE_FAILED: ${logSnippet}`);
    }

    if (!fs.existsSync(pdfFile)) {
      let logSnippet = "";
      try {
        const fullLog = await fsPromises.readFile(logFile, "utf-8");
        logSnippet = fullLog.slice(-2000);
      } catch {
        logSnippet = compileStdout.slice(-2000);
      }
      throw new Error(`LATEX_NO_PDF: Output PDF was not generated. Details: ${logSnippet}`);
    }

    const pdfBuffer = await fsPromises.readFile(pdfFile);
    let logContent = "";
    try {
      logContent = await fsPromises.readFile(logFile, "utf-8");
    } catch {
      // ignore log read failure
    }

    return { pdfBuffer, logContent };
  } finally {
    // Guaranteed sandbox cleanup
    try {
      await fsPromises.rm(sandboxDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.warn(`[latex-sandbox] Failed to remove ${sandboxDir}:`, cleanupErr);
    }
  }
}
