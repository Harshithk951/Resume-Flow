// convex/ai/jsonSanitizer.ts
//
// Robust multi-pass JSON cleaner and parser for LLM responses.
// Handles code fence removal, trailing comma cleanup, unescaped control chars,
// and auto-balancing of truncated JSON objects/arrays.

export function cleanAndParseJSON(text: string): any {
  if (!text || typeof text !== "string") {
    throw new Error("Empty or invalid response from AI engine");
  }

  let cleaned = text.trim();

  // Strip Markdown code block wrappers (e.g. ```json ... ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // Extract JSON block starting with '{' and ending with '}'
  const startIdx = cleaned.indexOf("{");
  const endIdx = cleaned.lastIndexOf("}");
  if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  cleaned = cleaned.trim();

  // Pass 1: Standard JSON parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // Proceed to cleanup
  }

  // Pass 2: Clean trailing commas before closing braces/brackets
  let sanitized = cleaned.replace(/,\s*([\]}])/g, "$1");
  try {
    return JSON.parse(sanitized);
  } catch {
    // Proceed to control character escaping
  }

  // Pass 3: Escape raw unescaped control characters inside JSON strings (e.g. raw newlines, tabs)
  sanitized = sanitized.replace(/[\u0000-\u001F]/g, (char) => {
    if (char === "\n") return "\\n";
    if (char === "\r") return "\\r";
    if (char === "\t") return "\\t";
    return "";
  });

  try {
    return JSON.parse(sanitized);
  } catch {
    // Proceed to auto-closing truncated structures
  }

  // Pass 4: Balance unclosed string quotes, brackets, and braces if response was truncated
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < sanitized.length; i++) {
    const char = sanitized[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === "{") openBraces++;
      if (char === "}") openBraces = Math.max(0, openBraces - 1);
      if (char === "[") openBrackets++;
      if (char === "]") openBrackets = Math.max(0, openBrackets - 1);
    }
  }

  if (inString) {
    sanitized += '"';
  }

  // Remove trailing comma if present at truncated end
  sanitized = sanitized.trim().replace(/,\s*$/, "");

  while (openBrackets > 0) {
    sanitized += "]";
    openBrackets--;
  }
  while (openBraces > 0) {
    sanitized += "}";
    openBraces--;
  }

  try {
    return JSON.parse(sanitized);
  } catch (finalError: any) {
    console.error("Failed to parse JSON content from LLM response:", text);
    throw new Error(`AI returned invalid JSON format: ${finalError.message}`);
  }
}
