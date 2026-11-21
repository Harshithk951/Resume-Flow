import { describe, it, expect } from "vitest";
import { validateLatexSecurity, compileLatexSandboxed, MAX_LATEX_SIZE_BYTES } from "../sandbox";
import { PREAMBLES, jsonToLatex } from "../jsonToLatex";

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

  describe("Our Own Templates Pass Validation", () => {
    it("confirms ATS master template preamble passes validator", () => {
      const latex = `${PREAMBLES.ats_strict}\n\\begin{document}\nHello World\n\\end{document}`;
      const res = validateLatexSecurity(latex);
      expect(res.valid).toBe(true);
    });

    it("confirms jsonToLatex output passes validator", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sampleResume: any = {
        personalInfo: {
          fullName: "Jane Doe",
          email: "jane@example.com",
          phone: "+1 234 567 8900",
          location: "San Francisco, CA",
        },
        summary: "Senior Full-Stack Engineer with 8 years of experience building scalable systems.",
        experience: [
          {
            title: "Staff Engineer",
            company: "Tech Corp",
            startDate: "2021",
            endDate: "Present",
            bullets: [
              "Architected multi-region event streaming pipeline handling 20k events/sec.",
              "Mentored 6 junior engineers and improved team velocity by 30%.",
            ],
          },
        ],
        skills: [
          { category: "Languages", skills: ["TypeScript", "Python", "Go", "SQL"] },
          { category: "Infrastructure", skills: ["Docker", "Kubernetes", "AWS", "Terraform"] },
        ],
        education: [
          {
            degree: "B.S. in Computer Science",
            institution: "UC Berkeley",
            graduationDate: "2018",
          },
        ],
      };

      const compiledLatex = jsonToLatex(sampleResume, "ats_strict");
      const res = validateLatexSecurity(compiledLatex);
      expect(res.valid).toBe(true);
    });
  });

  describe("Forbidden Primitives & Exploitation Vectors", () => {
    it("rejects \\write18 shell execution attempts", () => {
      const malicious = `
\\documentclass{article}
\\begin{document}
\\immediate\\write18{cat /etc/passwd > output.txt}
\\end{document}
      `;
      const res = validateLatexSecurity(malicious);
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("prohibited");
    });

    it("rejects \\immediate primitives", () => {
      expect(validateLatexSecurity("\\immediate\\write18{ls}").valid).toBe(false);
      expect(validateLatexSecurity("\\immediate\\openout 1=file.txt").valid).toBe(false);
      expect(validateLatexSecurity("\\immediate").valid).toBe(false);
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

    it("rejects \\InputIfFileExists and \\@@input primitives", () => {
      expect(validateLatexSecurity("\\InputIfFileExists{/etc/passwd}{}{pass}").valid).toBe(false);
      expect(validateLatexSecurity("\\@@input /etc/passwd").valid).toBe(false);
    });

    it("rejects \\verbatiminput and \\lstinputlisting primitives", () => {
      expect(validateLatexSecurity("\\verbatiminput{../secret.txt}").valid).toBe(false);
      expect(validateLatexSecurity("\\lstinputlisting{/etc/shadow}").valid).toBe(false);
    });

    it("rejects dangerous package imports (catchfile, shellesc)", () => {
      expect(validateLatexSecurity("\\usepackage{catchfile}").valid).toBe(false);
      expect(validateLatexSecurity("\\usepackage[debug]{shellesc}").valid).toBe(false);
    });

    it("rejects \\openin and \\openout commands with relative or absolute paths", () => {
      expect(validateLatexSecurity("\\openin 1=../secret.txt").valid).toBe(false);
      expect(validateLatexSecurity("\\openin 1=/etc/passwd").valid).toBe(false);
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

  describe("Sandbox Rejection of File Traversal", () => {
    it("rejects compileLatexSandboxed when attempting \\openin with relative path ../", async () => {
      const malicious = `
\\documentclass{article}
\\begin{document}
\\openin 1=../secret.txt
\\end{document}
      `;
      await expect(compileLatexSandboxed(malicious)).rejects.toThrow("SECURITY_VIOLATION");
    });

    it("rejects compileLatexSandboxed when attempting \\openin with absolute path /etc/passwd", async () => {
      const malicious = `
\\documentclass{article}
\\begin{document}
\\openin 1=/etc/passwd
\\end{document}
      `;
      await expect(compileLatexSandboxed(malicious)).rejects.toThrow("SECURITY_VIOLATION");
    });
  });
});
