"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { X, Loader2, Coins, AlertTriangle } from "lucide-react";
import { toast } from "@/lib/toast";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits?: number;
}



export function AddJobModal({ isOpen, onClose, credits = 0 }: AddJobModalProps) {
  const createJobMutation = useMutation(api.jobs.createJob);

  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;
function isLikelyGibberish(str: string): boolean {
  const clean = str.trim();
  if (clean.length < 2) return true;
  // If 4+ chars with no vowels at all (e.g. "SDFGH", "dfgbn"), it's an invalid keyboard mash
  if (clean.length >= 4 && !/[aeiouyAEIOUY0-9]/i.test(clean)) return true;
  // If 4+ identical characters in a row (e.g. "aaaaa")
  if (/(.)\1{3,}/i.test(clean)) return true;
  return false;
}

  const handleStartPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) {
      setErrorMessage("Please enter both Company Name and Role Title.");
      return;
    }

    if (isLikelyGibberish(companyName) || isLikelyGibberish(jobTitle)) {
      setErrorMessage("Please enter a valid Company Name and Role Title (e.g. 'Google', 'Software Engineer').");
      return;
    }

    if (!jdText.trim() || jdText.trim().length < 50) {
      setErrorMessage("Please paste a job description of at least 50 characters.");
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);

    try {
      await createJobMutation({
        companyName,
        jobTitle,
        rawJdText: jdText,
        inputType: "text",
      });

      // Success cleanup
      toast.success(`Drive created for ${companyName}!`);
      onClose();
      setCompanyName("");
      setJobTitle("");
      setJdText("");
    } catch (error: any) {
      console.error("Pipeline initialization failed:", error);
      const msg = error?.message || "An unexpected error occurred.";
      toast.error(msg);
      setErrorMessage(msg);
    } finally {
      setIsCreating(false);
    }
  };

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
              {/* Core Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#040404] uppercase tracking-wider">Company Name</label>
                  <Input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google"
                    className="h-10 text-[#040404] placeholder:text-[#525252]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#040404] uppercase tracking-wider">Role Title</label>
                  <Input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Software Engineer Intern"
                    className="h-10 text-[#040404] placeholder:text-[#525252]"
                  />
                </div>
              </div>

              {/* Job Description Text Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#040404] uppercase tracking-wider">Job Description</label>
                <textarea
                  required
                  rows={6}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all resize-none bg-white text-[#040404] placeholder:text-[#525252]"
                  placeholder="Paste raw requirements here (minimum 50 characters)..."
                />
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-600 font-medium">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-tight">{errorMessage}</span>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Coins className="w-3.5 h-3.5 text-[#040404]" />
                  </div>
                  <span className="text-[11px] text-[#525252] font-semibold tabular-nums">
                    Cost: 500 Credits
                  </span>
                  {credits < 500 && (
                    <Badge variant="destructive" size="sm" className="text-[9px]">
                      Low Balance
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="bg-gradient-to-r from-rose-600 to-rose-500 shadow-md shadow-rose-500/20 border-0 h-9 text-xs"
                    size="sm"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        <span>Matching...</span>
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
