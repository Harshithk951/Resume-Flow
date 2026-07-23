/**
 * lib/latex/escapeLatex.ts
 *
 * Single-pass LaTeX Character Escaper & Quote/Dash Normalizer.
 *
 * Critical Design Guarantee:
 * Uses a single-pass regex replacement with a lookup dictionary rather than
 * chained .replace() calls. Order does not matter because inserted escape sequences
 * (such as \textbackslash{}) are generated in the replacement callback and are
 * NEVER re-scanned or double-escaped into \textbackslash\{\}.
 */

const LATEX_ESCAPES: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "&": "\\&",
  "%": "\\%",
  "$": "\\$",
  "#": "\\#",
  "_": "\\_",
  "{": "\\{",
  "}": "\\}",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
};

export function escapeLatex(input: string | undefined | null): string {
  if (!input) return "";

  // Step 1: Normalize smart quotes and em/en-dashes
  const normalized = String(input)
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/—/g, "---")
    .replace(/–/g, "--");

  // Step 2: Single-pass escaping of all LaTeX special characters
  return normalized.replace(/[\\&%$#_{}~^]/g, (ch) => LATEX_ESCAPES[ch] || ch);
}
