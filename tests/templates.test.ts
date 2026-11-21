import { describe, it, expect } from "vitest";
import { compileStructuredContentToPdf } from "@/lib/pdf/compiler";
import { normalizeTemplateId, type TemplateId } from "@/lib/pdf/types";
import { TEMPLATES_REGISTRY } from "@/lib/pdf/templates";
import { PDF_COLORS } from "@/lib/pdf/shared";
import { jordanAlvarezResume } from "./fixtures/jordanAlvarez";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

function hexToRgb(hex: string): [number, number, number] {
  const num = parseInt(hex.replace("#", ""), 16);
  return [(num >> 16) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

function getLuminance([r, g, b]: [number, number, number]): number {
  const a = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hexToRgb(hex1));
  const l2 = getLuminance(hexToRgb(hex2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

describe("Resume Templates System", () => {
  describe("Template ID Resolution & Fallbacks", () => {
    it("resolves valid template IDs correctly", () => {
      expect(normalizeTemplateId("classic")).toBe("classic");
      expect(normalizeTemplateId("modern")).toBe("modern");
      expect(normalizeTemplateId("minimal")).toBe("minimal");
      expect(normalizeTemplateId("two-column")).toBe("two-column");
    });

    it("falls back to classic for legacy or unknown template IDs", () => {
      expect(normalizeTemplateId(undefined)).toBe("classic");
      expect(normalizeTemplateId("")).toBe("classic");
      expect(normalizeTemplateId("ats-strict")).toBe("classic");
      expect(normalizeTemplateId("ats_strict")).toBe("classic");
      expect(normalizeTemplateId("startup")).toBe("classic");
      expect(normalizeTemplateId("finance-tech")).toBe("classic");
      expect(normalizeTemplateId("tech-modern")).toBe("classic");
      expect(normalizeTemplateId("nonexistent-template")).toBe("classic");
    });

    it("contains exactly the four registered templates", () => {
      const keys = Object.keys(TEMPLATES_REGISTRY).sort();
      expect(keys).toEqual(["classic", "minimal", "modern", "two-column"].sort());
    });
  });

  describe("Sidebar Contrast Requirements (WCAG AAA >= 7:1)", () => {
    const bg = PDF_COLORS.sidebarBg; // #111827

    it("ensures every sidebar text color has contrast >= 7:1 against sidebar background", () => {
      const sidebarColors = [
        { name: "White (Name)", color: PDF_COLORS.white },
        { name: "Sidebar Title (Education)", color: PDF_COLORS.sidebarTitle },
        { name: "Sidebar Text (Skills/Body)", color: PDF_COLORS.sidebarText },
        { name: "Sidebar Label (Education/Skills Heading)", color: PDF_COLORS.sidebarLabel },
        { name: "Sidebar Muted (Contact Muted)", color: PDF_COLORS.sidebarMuted },
      ];

      for (const item of sidebarColors) {
        const ratio = getContrastRatio(item.color, bg);
        expect(
          ratio,
          `${item.name} (${item.color}) failed contrast check with ratio ${ratio.toFixed(2)}:1`
        ).toBeGreaterThanOrEqual(7.0);
      }
    });
  });

  describe("Template Rendering & Measurements", () => {
    const templates: TemplateId[] = ["minimal", "modern", "classic", "two-column"];

    for (const templateId of templates) {
      it(`renders ${templateId} to A4 dimensions and compiles valid PDF`, async () => {
        const blob = await compileStructuredContentToPdf(jordanAlvarezResume, templateId);
        expect(blob.size).toBeGreaterThan(5000);

        const arr = new Uint8Array(await blob.arrayBuffer());
        const doc = await pdfjs.getDocument({ data: arr }).promise;
        expect(doc.numPages).toBe(1);

        const page = await doc.getPage(1);
        const view = page.view; // [x, y, width, height]
        const width = view[2] - view[0];
        const height = view[3] - view[1];

        // A4 is 595.28 x 841.89 pt
        expect(Math.abs(width - 595.28)).toBeLessThan(1.0);
        expect(Math.abs(height - 841.89)).toBeLessThan(1.0);
      });
    }

    it("extracts plain heading 'SUMMARY' without letter-spacing word splits in Classic", async () => {
      const blob = await compileStructuredContentToPdf(jordanAlvarezResume, "classic");
      const arr = new Uint8Array(await blob.arrayBuffer());
      const doc = await pdfjs.getDocument({ data: arr }).promise;
      const page = await doc.getPage(1);
      const textContent = await page.getTextContent();
      const strings = textContent.items
        .filter((i: any) => "str" in i && i.str.trim().length > 0)
        .map((i: any) => i.str);

      expect(strings).toContain("SUMMARY");
      expect(strings).not.toContain("S U M M A R Y");
    });

    it("preserves correct ATS extraction order for Two-Column layout", async () => {
      const blob = await compileStructuredContentToPdf(jordanAlvarezResume, "two-column");
      const arr = new Uint8Array(await blob.arrayBuffer());
      const doc = await pdfjs.getDocument({ data: arr }).promise;
      const page = await doc.getPage(1);
      const textContent = await page.getTextContent();
      const strings = textContent.items
        .filter((i: any) => "str" in i && i.str.trim().length > 0)
        .map((i: any) => i.str);

      // Verify sequence: Name -> Contact -> SUMMARY -> EXPERIENCE -> EDUCATION -> SKILLS
      const nameIndex = strings.indexOf("Jordan Alvarez");
      const emailIndex = strings.indexOf("jordan.alvarez@email.com");
      const summaryIndex = strings.indexOf("SUMMARY");
      const experienceIndex = strings.indexOf("EXPERIENCE");
      const educationIndex = strings.indexOf("EDUCATION");
      const skillsIndex = strings.indexOf("SKILLS");

      expect(nameIndex).toBeGreaterThanOrEqual(0);
      expect(emailIndex).toBeGreaterThan(nameIndex);
      expect(summaryIndex).toBeGreaterThan(emailIndex);
      expect(experienceIndex).toBeGreaterThan(summaryIndex);
      expect(educationIndex).toBeGreaterThan(experienceIndex);
      expect(skillsIndex).toBeGreaterThan(educationIndex);

      // Verify no hyphen breaks in extracted tokens
      const joined = strings.join(" ");
      expect(joined).not.toContain("Uni-versity");
      expect(joined).toContain("University");
    });

    it("matches reference header measurements within 1pt for Minimal", async () => {
      const blob = await compileStructuredContentToPdf(jordanAlvarezResume, "minimal");
      const arr = new Uint8Array(await blob.arrayBuffer());
      const doc = await pdfjs.getDocument({ data: arr }).promise;
      const page = await doc.getPage(1);
      const textContent = await page.getTextContent();
      const pageHeight = page.view[3] - page.view[1];

      const nameItem = textContent.items.find(
        (i: any) => "str" in i && i.str === "Jordan Alvarez"
      );
      expect(nameItem).toBeDefined();

      const nameY = pageHeight - (nameItem as any).transform[5];
      const nameX = (nameItem as any).transform[4];
      const nameSize = Math.hypot((nameItem as any).transform[0], (nameItem as any).transform[1]);

      // Reference: y=72.2pt, x=60.0pt, sz=18pt
      expect(Math.abs(nameY - 72.2)).toBeLessThan(1.0);
      expect(Math.abs(nameX - 60.0)).toBeLessThan(1.0);
      expect(Math.abs(nameSize - 18.0)).toBeLessThan(0.5);
    });

    it("matches reference header measurements within 1pt for Modern", async () => {
      const blob = await compileStructuredContentToPdf(jordanAlvarezResume, "modern");
      const arr = new Uint8Array(await blob.arrayBuffer());
      const doc = await pdfjs.getDocument({ data: arr }).promise;
      const page = await doc.getPage(1);
      const textContent = await page.getTextContent();
      const pageHeight = page.view[3] - page.view[1];

      const nameItem = textContent.items.find(
        (i: any) => "str" in i && i.str === "Jordan Alvarez"
      );
      expect(nameItem).toBeDefined();

      const nameY = pageHeight - (nameItem as any).transform[5];
      const nameX = (nameItem as any).transform[4];
      const nameSize = Math.hypot((nameItem as any).transform[0], (nameItem as any).transform[1]);

      // Reference: y=47.6pt, x=48.0pt, sz=24pt
      expect(Math.abs(nameY - 47.6)).toBeLessThan(1.0);
      expect(Math.abs(nameX - 48.0)).toBeLessThan(1.0);
      expect(Math.abs(nameSize - 24.0)).toBeLessThan(0.5);
    });

    it("matches reference header measurements within 1pt for Classic", async () => {
      const blob = await compileStructuredContentToPdf(jordanAlvarezResume, "classic");
      const arr = new Uint8Array(await blob.arrayBuffer());
      const doc = await pdfjs.getDocument({ data: arr }).promise;
      const page = await doc.getPage(1);
      const textContent = await page.getTextContent();
      const pageHeight = page.view[3] - page.view[1];

      const nameItem = textContent.items.find(
        (i: any) => "str" in i && i.str === "Jordan Alvarez"
      );
      expect(nameItem).toBeDefined();

      const nameY = pageHeight - (nameItem as any).transform[5];
      const nameSize = Math.hypot((nameItem as any).transform[0], (nameItem as any).transform[1]);

      // Reference: y=62.4pt, sz=20pt
      expect(Math.abs(nameY - 62.4)).toBeLessThan(1.0);
      expect(Math.abs(nameSize - 20.0)).toBeLessThan(0.5);
    });

    it("matches reference header measurements within 1pt for Two-Column", async () => {
      const blob = await compileStructuredContentToPdf(jordanAlvarezResume, "two-column");
      const arr = new Uint8Array(await blob.arrayBuffer());
      const doc = await pdfjs.getDocument({ data: arr }).promise;
      const page = await doc.getPage(1);
      const textContent = await page.getTextContent();
      const pageHeight = page.view[3] - page.view[1];

      const nameItem = textContent.items.find(
        (i: any) => "str" in i && i.str === "Jordan Alvarez"
      );
      expect(nameItem).toBeDefined();

      const nameY = pageHeight - (nameItem as any).transform[5];
      const nameX = (nameItem as any).transform[4];
      const nameSize = Math.hypot((nameItem as any).transform[0], (nameItem as any).transform[1]);

      // Reference: y=51.3pt, x=20.0pt, sz=17pt
      expect(Math.abs(nameY - 51.3)).toBeLessThan(1.0);
      expect(Math.abs(nameX - 20.0)).toBeLessThan(1.0);
      expect(Math.abs(nameSize - 17.0)).toBeLessThan(0.5);
    });
  });
});
