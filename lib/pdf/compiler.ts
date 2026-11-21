import { pdf } from "@react-pdf/renderer";
import React from "react";
import { getTemplateComponent } from "./templates";
import { normalizeTemplateId, StructuredResumeContent } from "./types";
import { clientLog } from "@/lib/clientLogger";

/**
 * Compiles structured JSON resume content into a PDF Blob in the browser or Node.js.
 */
export async function compileStructuredContentToPdf(
  data: StructuredResumeContent,
  templateId?: string
): Promise<Blob> {
  const resolvedId = normalizeTemplateId(templateId);
  clientLog.info(
    `[react-pdf] Compiling JSON resume using template ${resolvedId}...`
  );

  try {
    const Component = getTemplateComponent(resolvedId);
    const doc = pdf(
      React.createElement(Component, { data }) as Parameters<typeof pdf>[0]
    );
    const blob = await doc.toBlob();
    return blob;
  } catch (error) {
    console.error("[react-pdf] PDF compilation failed:", error);
    throw new Error(
      "React-PDF compilation engine encountered a rendering exception."
    );
  }
}
