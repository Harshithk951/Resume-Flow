// lib/latex/templates/atsStrict.ts
//
// Hardened ATS Strict Template Bridge
import { jsonToLatex } from "../jsonToLatex";

export function generateAtsStrictTemplate(data: any): string {
  return jsonToLatex(data, "ats_strict");
}

export default generateAtsStrictTemplate;
