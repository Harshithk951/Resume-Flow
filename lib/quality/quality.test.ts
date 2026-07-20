import { describe, expect, it } from "vitest";
import { scoreXyzBullets, collectBullets } from "./scorers/xyzScorer";
import { normalizeStructuredContent } from "@/lib/pdf/types";
import fs from "fs";
import path from "path";

describe("xyzScorer", () => {
  it("scores golden swe-mid bullets at ≥90% perfect XYZ", () => {
    const raw = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "fixtures/resumes/swe-mid.json"),
        "utf-8"
      )
    );
    const resume = normalizeStructuredContent(raw);
    expect(collectBullets(resume).length).toBeGreaterThan(0);
    const result = scoreXyzBullets(resume);
    expect(result.metadata?.pctPerfect).toBeGreaterThanOrEqual(90);
    expect(result.passed).toBe(true);
  });
});

describe("latexScorer", () => {
  it("accepts generated ats_strict LaTeX", async () => {
    const { scoreLatexIntegrity } = await import("./scorers/latexScorer");
    const { jsonToLatex } = await import("@/lib/latex/jsonToLatex");
    const raw = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "fixtures/resumes/swe-mid.json"),
        "utf-8"
      )
    );
    const latex = jsonToLatex(raw, "ats_strict");
    const result = scoreLatexIntegrity(latex);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });
});
