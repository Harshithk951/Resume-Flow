// lib/latex/jsonToLatex.ts
//
// Pure Deterministic JSON-to-LaTeX Compiler
// Crawls the resume JSON object, recursively escapes LaTeX control characters,
// and maps the data to the selected template.

import { TEMPLATES, type TemplateId } from "./resolveTemplate";

/**
 * Escapes LaTeX control characters in a string.
 * Order is critical: escape backslash FIRST to avoid escaping other control backslashes.
 */
export function escapeLatex(str: string): string {
  return str
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/**
 * Recursively escapes all string values inside a nested object/array.
 */
export function recursiveEscape(data: any): any {
  if (typeof data === "string") {
    return escapeLatex(data);
  }
  if (Array.isArray(data)) {
    return data.map(recursiveEscape);
  }
  if (data !== null && typeof data === "object") {
    const escaped: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        escaped[key] = recursiveEscape(data[key]);
      }
    }
    return escaped;
  }
  return data;
}

/**
 * Compiles a structured resume JSON into a LaTeX string based on the selected template.
 */
export function jsonToLatex(resumeJSON: any, templateName: TemplateId): string {
  // ats_strict template performs its own escaping; other templates rely on recursiveEscape
  if (templateName === "ats_strict") {
    return TEMPLATES.ats_strict.render(resumeJSON);
  }
  const escapedData = recursiveEscape(JSON.parse(JSON.stringify(resumeJSON)));
  return TEMPLATES[templateName].render(escapedData);
}
