"use client";

// components/FileUpload.tsx
//
// FileUpload component using react-dropzone.
// Designed with Design.md tokens: warm cream theme, 16px radius, Lucide icons.
// Performs client-side validations for size (<5MB) and mime type (PDF, DOCX).

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface FileUploadProps {
  onFileAccepted: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUpload({ onFileAccepted, isProcessing }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);
      
      if (rejectedFiles && rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.file.size > 5 * 1024 * 1024) {
          setError("File size exceeds 5MB limit.");
        } else {
          setError("Unsupported format. Please upload a PDF or DOCX file.");
        }
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Page-count validation for PDFs (max 4 pages)
      if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const arr = new Uint8Array(e.target?.result as ArrayBuffer);
            // Search ascii tags for page count
            const text = new TextDecoder("ascii").decode(arr.slice(0, 2000000)); // scan first 2MB
            const pageMatches = text.match(/\/Type\s*\/Page\b/g);
            const pageCount = pageMatches ? pageMatches.length : 1;

            if (pageCount > 4) {
              setError(`Document has ${pageCount} pages. Resumes must be 1 to 4 pages long.`);
              setSelectedFile(null);
              return;
            }

            setSelectedFile(file);
            onFileAccepted(file);
          } catch (err) {
            // Fallback if parsing fails
            setSelectedFile(file);
            onFileAccepted(file);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        // Enforce max 1MB for .docx to prevent uploading massive manuals/books
        if (file.name.endsWith(".docx") && file.size > 1.5 * 1024 * 1024) {
          setError("DOCX file is too large. Resumes must be 1 to 4 pages (max 1.5MB).");
          setSelectedFile(null);
          return;
        }

        setSelectedFile(file);
        onFileAccepted(file);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: isProcessing,
    maxSize: 5 * 1024 * 1024,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-[16px] p-8 text-center cursor-pointer transition-all duration-200 ${
        isDragActive
          ? "border-[var(--color-primary)] bg-[rgba(230,0,35,0.03)]"
          : "border-[var(--color-hairline)] bg-[var(--color-surface-card)] hover:border-[var(--color-ash)]"
      } ${isProcessing ? "pointer-events-none opacity-60" : ""}`}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center gap-3">
        {isProcessing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full"
          />
        ) : selectedFile ? (
          <FileText className="w-12 h-12 text-[var(--color-primary)]" />
        ) : (
          <UploadCloud className="w-12 h-12 text-[var(--color-mute)]" />
        )}

        <div>
          <h3 className="type-body-strong">
            {isProcessing
              ? "Parsing resume with AI..."
              : selectedFile
                ? selectedFile.name
                : "Upload your resume"}
          </h3>
          <p className="type-body-sm mt-1">
            {isProcessing
              ? "Extracting experience, education, projects and skills..."
              : "Drag & drop your resume file here, or click to browse"}
          </p>
          <div className="flex flex-col gap-1 mt-3">
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg inline-block mx-auto uppercase tracking-wider">
              ⚠️ Strict Rule: Resumes must be 1 to 4 pages maximum
            </span>
            <span className="text-[10px] text-[var(--color-ash)] uppercase tracking-wider block mt-1">
              Accepted: PDF, DOCX (up to 5MB)
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-2 text-[var(--color-error)] text-sm justify-center">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
