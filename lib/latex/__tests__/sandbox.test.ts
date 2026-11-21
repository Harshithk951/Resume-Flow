import { describe, it, expect } from "vitest";
import { validateLatexSecurity, MAX_LATEX_SIZE_BYTES } from "../sandbox";

describe("LaTeX Security Sandbox Validator", () => {
  it("allows safe ATS resume LaTeX source", () => {
    const safeLatex = `
\\documentclass[letterpaper,10pt]{article}
\\usepackage[margin=0.5in]{geometry}
\\begin{document}
\\textbf{John Doe}
\\begin{itemize}
  \\item Built full-stack app with React and TypeScript.
\\end{itemize}
\\end{document}
    `;
    const res = validateLatexSecurity(safeLatex);
    expect(res.valid).toBe(true);
    expect(res.reason).toBeUndefined();
  });

  it("rejects \\write18 shell execution attempts", () => {
    const malicious = `
\\documentclass{article}
\\begin{document}
\\immediate\\write18{cat /etc/passwd > output.txt}
\\end{document}
    `;
    const res = validateLatexSecurity(malicious);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("shell execution");
  });

  it("rejects \\input file traversal attempts", () => {
    const malicious = `
\\documentclass{article}
\\begin{document}
\\input{/etc/passwd}
\\end{document}
    `;
    const res = validateLatexSecurity(malicious);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("\\input");
  });

  it("rejects \\include file reading attempts", () => {
    const malicious = `
\\documentclass{article}
\\begin{document}
\\include{.env}
\\end{document}
    `;
    const res = validateLatexSecurity(malicious);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("\\include");
  });

  it("rejects \\openin and \\openout commands", () => {
    expect(validateLatexSecurity("\\openin 1=test.txt").valid).toBe(false);
    expect(validateLatexSecurity("\\openout 1=test.txt").valid).toBe(false);
    expect(validateLatexSecurity("\\read 1 to \\myline").valid).toBe(false);
  });

  it("rejects dynamic token construction with \\csname", () => {
    const malicious = `\\csname input\\endcsname{secret.txt}`;
    expect(validateLatexSecurity(malicious).valid).toBe(false);
  });

  it("rejects oversized LaTeX payloads (> 500 KB)", () => {
    const oversized = "a".repeat(MAX_LATEX_SIZE_BYTES + 10);
    const res = validateLatexSecurity(oversized);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("exceeds maximum allowed size");
  });

  it("rejects empty or non-string inputs", () => {
    expect(validateLatexSecurity("").valid).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(validateLatexSecurity(null as any).valid).toBe(false);
  });
});
