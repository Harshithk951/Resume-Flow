"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { X, Loader2, Clipboard, FileText, Camera, Coins, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import FileUpload from "@/components/FileUpload";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits?: number;
}

type InputTab = "text" | "pdf" | "screenshot";

export function AddJobModal({ isOpen, onClose, credits = 0 }: AddJobModalProps) {
  const createJobMutation = useMutation(api.jobs.createJob);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);

  const [activeTab, setActiveTab] = useState<InputTab>("text");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
  };

  const handleStartPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) {
      setErrorMessage("Please enter both Company Name and Role Title.");
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);

    try {
      if (activeTab === "text") {
        if (!jdText.trim() || jdText.trim().length < 50) {
          setErrorMessage("Please paste a job description of at least 50 characters.");
          setIsCreating(false);
          return;
        }
        await createJobMutation({
          companyName,
          jobTitle,
          rawJdText: jdText,
          inputType: "text",
        });
      } else {
        // PDF or Screenshot tab
        if (!selectedFile) {
          setErrorMessage(`Please upload a ${activeTab === "pdf" ? "PDF" : "Screenshot"} file.`);
          setIsCreating(false);
          return;
        }

        setIsUploading(true);
        // 1. Generate Storage Upload URL
        const uploadUrl = await generateUploadUrl();

        // 2. PUT File to Convex Storage
        const response = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });

        if (!response.ok) {
          throw new Error("File upload failed. Please try again.");
        }

        // 3. Extract storage ID
        const { storageId } = await response.json();
        setIsUploading(false);

        // 4. Trigger createJob mutation
        await createJobMutation({
          companyName,
          jobTitle,
          rawJdText: `[Uploaded ${activeTab === "pdf" ? "PDF" : "Screenshot"}: ${selectedFile.name}]`,
          inputType: activeTab,
          rawFileStorageId: storageId,
        });
      }

      // Success cleanup
      onClose();
      setCompanyName("");
      setJobTitle("");
      setJdText("");
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Pipeline initialization failed:", error);
      const msg = error?.message || "An unexpected error occurred during matching. Please check input formats.";
      setErrorMessage(msg);
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  };

  const tabsConfig = [
    { key: "text", label: "Paste JD", icon: <Clipboard className="w-3.5 h-3.5" /> },
    { key: "pdf", label: "Upload PDF", icon: <FileText className="w-3.5 h-3.5" /> },
    { key: "screenshot", label: "Screenshot", icon: <Camera className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-surface-dark)]/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-xl mx-4"
      >
        <Card className="shadow-2xl border-[var(--color-hairline)]/80 overflow-hidden bg-[var(--color-canvas)]">
          {/* Dialog header with gradient */}
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-lg">Add Company Job Drive</CardTitle>
                <CardDescription className="text-rose-100 text-xs mt-0.5">
                  Submit a new placement drive for AI matching
                </CardDescription>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleStartPipeline} className="space-y-5">
              {/* Tab Selector */}
              <div className="flex justify-center pb-2">
                <Tabs
                  tabs={tabsConfig}
                  activeTab={activeTab}
                  onTabChange={(tabKey) => {
                    setActiveTab(tabKey as InputTab);
                    setSelectedFile(null);
                    setErrorMessage(null);
                  }}
                />
              </div>

              {/* Core Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider">Company Name</label>
                  <Input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider">Role Title</label>
                  <Input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Software Engineer Intern"
                    className="h-10"
                  />
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "text" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider">Job Description</label>
                  <textarea
                    required
                    rows={6}
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    className="w-full p-4 border border-[var(--color-hairline)] rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all resize-none bg-[var(--color-canvas)] placeholder:text-[var(--color-stone)]"
                    placeholder="Paste raw requirements here (minimum 50 characters)..."
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider">
                    {activeTab === "pdf" ? "Upload Job PDF" : "Upload Screenshot"}
                  </label>
                  <FileUpload
                    onFileAccepted={handleFileSelect}
                    isProcessing={isUploading}
                  />
                  {selectedFile && !isUploading && (
                    <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 mt-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      <span>Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-600 font-medium">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-tight">{errorMessage}</span>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-hairline-soft)]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[var(--color-surface-card)] flex items-center justify-center">
                    <Coins className="w-3.5 h-3.5 text-[var(--color-ash)]" />
                  </div>
                  <span className="text-[11px] text-[var(--color-ash)] font-semibold tabular-nums">
                    Cost: 500 Credits
                  </span>
                  {credits < 500 && (
                    <Badge variant="destructive" size="sm" className="text-[9px]">
                      Low Balance
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isCreating || isUploading}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating || isUploading || (activeTab !== "text" && !selectedFile)}
                    className="bg-gradient-to-r from-rose-600 to-rose-500 shadow-md shadow-rose-500/20 border-0 h-9 text-xs"
                    size="sm"
                  >
                    {isCreating || isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        <span>{isUploading ? "Uploading file..." : "Matching..."}</span>
                      </>
                    ) : (
                      "Start Pipeline"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
