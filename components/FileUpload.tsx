"use client";

// components/FileUpload.tsx
//
// FileUpload component using react-dropzone.
// Designed with Design.md tokens: warm cream theme, 16px radius, Lucide icons.
// Performs client-side validations for size (<5MB) and mime type (PDF, PNG, JPEG).

import React, { useCallback, useState } from "react";
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
          setError("Unsupported file format. Please upload a PDF, PNG, or JPEG.");
        }
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileAccepted(file);
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
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
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
              : "Drag & drop your PDF or image here, or click to browse"}
          </p>
          <span className="text-[11px] text-[var(--color-ash)] uppercase tracking-wider block mt-2">
            PDF, PNG, JPG up to 5MB
          </span>
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
