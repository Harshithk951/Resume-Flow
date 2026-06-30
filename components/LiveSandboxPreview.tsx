"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface PreviewProps {
  compiledHtml: string;
}

export const LiveSandboxPreview: React.FC<PreviewProps> = ({ compiledHtml }) => {
  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    if (!compiledHtml) return;

    // Wrap in useEffect with revokeObjectURL cleanup to prevent memory leaks
    const blob = new Blob([compiledHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [compiledHtml]);

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 h-full">
      {blobUrl ? (
        <iframe
          src={blobUrl}
          title="Resume visual sandbox"
          className="w-full flex-1 bg-white border border-slate-200/60 rounded-2xl h-[600px]"
          sandbox="allow-scripts"
          loading="lazy"
        />
      ) : (
        <div className="flex-grow flex items-center justify-center bg-slate-50 border border-slate-200/50 rounded-2xl h-[600px] text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-rose-500 mr-2" />
          <span>Loading preview...</span>
        </div>
      )}
    </div>
  );
};
