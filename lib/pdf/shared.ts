import { Font } from "@react-pdf/renderer";
import path from "path";
import type { StructuredResumeContent } from "./types";

/**
 * Resolves font paths for both Node.js (unit tests, server runtime)
 * and Browser environments.
 */
export function getFontSource(filename: string): string {
  if (typeof window === "undefined") {
    try {
      return path.resolve(process.cwd(), "public/fonts", filename);
    } catch {
      return `/fonts/${filename}`;
    }
  }
  return `/fonts/${filename}`;
}

let fontsRegistered = false;

export function registerFontsOnce(): void {
  if (fontsRegistered) return;

  try {
    Font.register({
      family: "Arimo",
      fonts: [
        {
          src: getFontSource("Arimo-Regular.ttf"),
          fontWeight: "normal",
          fontStyle: "normal",
        },
        {
          src: getFontSource("Arimo-Bold.ttf"),
          fontWeight: "bold",
          fontStyle: "normal",
        },
        {
          src: getFontSource("Arimo-Italic.ttf"),
          fontWeight: "normal",
          fontStyle: "italic",
        },
        {
          src: getFontSource("Arimo-BoldItalic.ttf"),
          fontWeight: "bold",
          fontStyle: "italic",
        },
      ],
    });

    Font.register({
      family: "Tinos",
      fonts: [
        {
          src: getFontSource("Tinos-Regular.ttf"),
          fontWeight: "normal",
          fontStyle: "normal",
        },
        {
          src: getFontSource("Tinos-Bold.ttf"),
          fontWeight: "bold",
          fontStyle: "normal",
        },
        {
          src: getFontSource("Tinos-Italic.ttf"),
          fontWeight: "normal",
          fontStyle: "italic",
        },
        {
          src: getFontSource("Tinos-BoldItalic.ttf"),
          fontWeight: "bold",
          fontStyle: "italic",
        },
      ],
    });

    // Disable mid-word breaking (no hyphens)
    Font.registerHyphenationCallback((word) => [word]);

    fontsRegistered = true;
  } catch (err) {
    console.warn("[react-pdf] Font registration warning:", err);
  }
}

// Register on load
registerFontsOnce();

/**
 * Normalises text before PDF rendering:
 * - Unicode NFC normalization
 * - Strip zero-width characters
 * - Replace arrow glyphs with "to"
 * - Decompose ligatures to plain characters
 * - Keep currency symbols (₹, $, €, £) and standard unicode intact
 */
export function normalizePdfText(text: string | undefined | null): string {
  if (!text) return "";
  let s = String(text).normalize("NFC");

  // Replace arrow symbols
  s = s.replace(/[→⇒]/g, "to");
  s = s.replace(/-->|->/g, "to");

  // Strip zero-width and unwanted control characters (keep standard space, newline, tab)
  s = s.replace(/[\u200B-\u200F\uFEFF]/g, "");

  // Expand standard typographic ligatures to individual characters
  s = s
    .replace(/ﬁ/g, "fi")
    .replace(/ﬂ/g, "fl")
    .replace(/ﬀ/g, "ff")
    .replace(/ﬃ/g, "ffi")
    .replace(/ﬄ/g, "ffl");

  return s;
}

/**
 * Cleans up and strips protocol/trailing slashes for display text
 */
export function cleanUrlDisplay(url: string | undefined): string {
  if (!url) return "";
  return url
    .trim()
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/\/$/, "");
}

/**
 * Formats a web link into a clickable URL
 */
export function formatHref(url: string | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed)) return trimmed;
  if (/^tel:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Standard A4 dimensions in PDF points
 */
export const A4_PAGE_SIZE = {
  width: 595.28,
  height: 841.89,
};

/**
 * Standard palette across all ResumeFlow templates
 */
export const PDF_COLORS = {
  ink: "#0A0A0A",
  title: "#111827",
  body: "#374151",
  muted: "#9CA3AF",
  blue: "#2563EB",
  navy: "#1D3F8F",
  grayBullet: "#6B7280",
  white: "#FFFFFF",
  sidebarBg: "#111827",
  sidebarTitle: "#F9FAFB",
  sidebarText: "#D1D5DB",
  sidebarLabel: "#93C5FD",
  // Accessible muted color with >= 7.2:1 contrast against #111827
  sidebarMuted: "#9EA7B5",
};

/**
 * Compaction ladder for Auto / 1 page / 2 pages fitting.
 * If 1_page mode is requested and content overflows,
 * reduces spacing first, then caps bullet counts.
 */
export function applyCompaction(
  data: StructuredResumeContent,
  lengthSetting?: "auto" | "1_page" | "2_pages" | "cv"
): {
  data: StructuredResumeContent;
  spacingMultiplier: number;
} {
  if (lengthSetting === "1_page") {
    // Trim excess experience bullets to fit 1 page
    const compactedExp = data.experience.map((exp) => ({
      ...exp,
      bullets: exp.bullets.slice(0, 3),
    }));

    return {
      data: {
        ...data,
        experience: compactedExp,
      },
      spacingMultiplier: 0.85,
    };
  }

  return {
    data,
    spacingMultiplier: 1.0,
  };
}
