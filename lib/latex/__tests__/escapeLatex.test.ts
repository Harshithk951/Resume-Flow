import { describe, it, expect } from "vitest";
import { escapeLatex } from "../escapeLatex";

describe("escapeLatex", () => {
  it("escapes special LaTeX characters in company names and text", () => {
    const input = "AT&T % Growth #1 $100k C_PROG {tag} ~tilde ^caret";
    const expected = "AT\\&T \\% Growth \\#1 \\$100k C\\_PROG \\{tag\\} \\textasciitilde{} \\textasciicircum{}";
    expect(escapeLatex(input)).toBe(expected);
  });

  it("does NOT double-escape backslashes and generated braces in single pass", () => {
    const input = "C:\\Path\\To\\File & {data}";
    const output = escapeLatex(input);
    // \ -> \textbackslash{}
    // { -> \{
    // } -> \}
    expect(output).toBe("C:\\textbackslash{}Path\\textbackslash{}To\\textbackslash{}File \\& \\{data\\}");
    expect(output).not.toContain("\\textbackslash\\{\\}");
  });

  it("normalizes smart quotes and em/en dashes", () => {
    const input = "“Smart Quotes” — em dash – en dash ‘single’";
    const expected = '"Smart Quotes" --- em dash -- en dash \'single\'';
    expect(escapeLatex(input)).toBe(expected);
  });

  it("handles null, undefined, and empty string safely", () => {
    expect(escapeLatex(undefined)).toBe("");
    expect(escapeLatex(null as any)).toBe("");
    expect(escapeLatex("")).toBe("");
  });
});
