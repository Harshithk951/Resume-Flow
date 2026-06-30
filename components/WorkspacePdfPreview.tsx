"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { AtsStrictPdf } from "@/lib/pdf/templates/AtsStrictPdf";
import {
  normalizeStructuredContent,
  type StructuredResumeContent,
} from "@/lib/pdf/types";

interface WorkspacePdfPreviewProps {
  data: StructuredResumeContent | unknown;
  templateId: string;
}

export function WorkspacePdfPreview({
  data,
  templateId,
}: WorkspacePdfPreviewProps) {
  const normalized = normalizeStructuredContent(data);

  return (
    <div className="h-[600px] w-full rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <PDFViewer width="100%" height={600} showToolbar={false}>
        <AtsStrictPdf data={normalized} templateId={templateId} />
      </PDFViewer>
    </div>
  );
}
