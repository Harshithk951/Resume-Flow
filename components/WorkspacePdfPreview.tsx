"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { getTemplateComponent } from "@/lib/pdf/templates";
import {
  normalizeStructuredContent,
  type StructuredResumeContent,
} from "@/lib/pdf/types";

interface WorkspacePdfPreviewProps {
  data: StructuredResumeContent | unknown;
  templateId?: string;
}

export function WorkspacePdfPreview({
  data,
  templateId,
}: WorkspacePdfPreviewProps) {
  const normalized = normalizeStructuredContent(data);
  const TemplateComponent = getTemplateComponent(templateId);

  return (
    <div className="h-[600px] w-full rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <PDFViewer width="100%" height={600} showToolbar={false}>
        <TemplateComponent data={normalized} />
      </PDFViewer>
    </div>
  );
}
