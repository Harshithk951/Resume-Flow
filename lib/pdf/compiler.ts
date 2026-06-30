import { pdf } from "@react-pdf/renderer";
import React from "react";
import { AtsStrictPdf } from "./templates/AtsStrictPdf";
import { StructuredResumeContent } from "./types";
import { clientLog } from "@/lib/clientLogger";

/**
 * Compiles structured JSON resume content into a PDF Blob in the browser.
 */
export async function compileStructuredContentToPdf(
  data: StructuredResumeContent,
  templateId: string
): Promise<Blob> {
  clientLog.info(
    `[react-pdf] Compiling JSON resume using template ${templateId}...`
  );

  try {
    const doc = pdf(
      React.createElement(AtsStrictPdf, { data }) as Parameters<typeof pdf>[0]
    );
    const blob = await doc.toBlob();
    return blob;
  } catch (error) {
    console.error("[react-pdf] Browser PDF compilation failed:", error);
    throw new Error(
      "React-PDF compilation engine encountered a rendering exception."
    );
  }
}
