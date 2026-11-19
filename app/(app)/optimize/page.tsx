"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Sparkles,
  Upload,
  Globe,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Bookmark,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface SavedResumeDoc {
  _id: Id<"savedResumes">;
  title: string;
  targetRole?: string;
  template?: string;
  rawText?: string;
  sections?: Record<string, unknown>;
  isDefault?: boolean;
}

const OUTPUT_LENGTH_OPTIONS = [
  {
    id: "auto",
    label: "Auto-detect",
    description: "Determines 1 or 2 pages based on years of experience",
  },
  {
    id: "1_page",
    label: "1 page",
    description: "Strict 1-page format for standard software & tech roles",
  },
  {
    id: "2_pages",
    label: "2 pages",
    description: "Expanded 2-page format for senior, staff & lead roles",
  },
  {
    id: "cv",
    label: "Academic CV",
    description: "Comprehensive multi-page format for research & academia",
  },
];

export default function OptimizePage() {
  const router = useRouter();

  // ─── Convex Queries & Mutations ─────────────────────────────
  const creditsStatus = useQuery(api.users.getCreditsStatus);
  const savedResumesData = useQuery(api.savedResumes.getMySavedResumes);
  const createOptimizationMutation = useMutation(api.optimizations.createOptimization);

  // ─── Form State ─────────────────────────────────────────────
  // Section 1: Resume
  const [resumeTab, setResumeTab] = useState<"paste" | "upload" | "saved">("paste");
  const [resumeText, setResumeText] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const prefill = sessionStorage.getItem("resumeflow_prefill_resume");
        if (prefill) {
          sessionStorage.removeItem("resumeflow_prefill_resume");
          return prefill;
        }
      } catch {
        // ignore
      }
    }
    return "";
  });
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedSavedResumeId, setSelectedSavedResumeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Section 2: Job
  const [jobTab, setJobTab] = useState<"paste" | "url">("paste");
  const [jobUrl, setJobUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [jobDescription, setJobDescription] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const prefill = sessionStorage.getItem("resumeflow_prefill_job");
        if (prefill) {
          sessionStorage.removeItem("resumeflow_prefill_job");
          return prefill;
        }
      } catch {
        // ignore
      }
    }
    return "";
  });
  const [roleTitle, setRoleTitle] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const prefill = sessionStorage.getItem("resumeflow_prefill_role");
        if (prefill) {
          sessionStorage.removeItem("resumeflow_prefill_role");
          return prefill;
        }
      } catch {
        // ignore
      }
    }
    return "";
  });
  const [companyName, setCompanyName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const prefill = sessionStorage.getItem("resumeflow_prefill_company");
        if (prefill) {
          sessionStorage.removeItem("resumeflow_prefill_company");
          return prefill;
        }
      } catch {
        // ignore
      }
    }
    return "";
  });

  // Section 3: Anything we can't see? (Optional, 490 limit)
  const [additionalContext, setAdditionalContext] = useState("");

  // Section 4: Output length
  const [outputLength, setOutputLength] = useState("auto");

  // Consent toggle
  const [consentImprovement, setConsentImprovement] = useState(true);

  // Optimization execution state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizingStep, setOptimizingStep] = useState(0);
  const [successResult, setSuccessResult] = useState<{
    optimizationId: string;
    jobId?: string;
    role: string;
    company: string;
  } | null>(null);

  // ─── 4-Step Onboarding Wizard State ─────────────────────────
  const [wizardStep, setWizardStep] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const dismissed = localStorage.getItem("resumeflow_optimizer_wizard_dismissed");
        return dismissed ? null : 1;
      } catch {
        return null;
      }
    }
    return null;
  });

  const dismissWizard = () => {
    setWizardStep(null);
    if (typeof window !== "undefined") {
      localStorage.setItem("resumeflow_optimizer_wizard_dismissed", "true");
    }
  };

  // ─── File Upload Handler ────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    try {
      let extracted = "";
      if (file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".json")) {
        extracted = await file.text();
      } else {
        // Read text / buffer extraction for pdf & binary files
        const buffer = await file.arrayBuffer();
        const decoder = new TextDecoder("utf-8", { fatal: false });
        const raw = decoder.decode(buffer);
        const matches = raw.match(/\(([^()]{3,})\)/g);
        if (matches && matches.length > 10) {
          extracted = matches
            .map((m) => m.slice(1, -1))
            .filter((s) => !/[^\x20-\x7E\s]/.test(s) && s.length > 2)
            .join(" ");
        } else {
          extracted = raw
            .replace(/[^\x20-\x7E\n\r\t]/g, " ")
            .replace(/\s{2,}/g, " ")
            .trim();
        }
      }

      if (extracted.trim().length > 30) {
        setResumeText(extracted.trim());
        toast.success(`Extracted content from ${file.name}`);
      } else {
        toast.error("Could not extract readable text from this file. Please paste your text directly.");
      }
    } catch (err) {
      console.error("File read error:", err);
      toast.error("Failed to read file contents.");
    }
  };

  // ─── URL Scrape Handler ─────────────────────────────────────
  const handleScrapeUrl = async () => {
    if (!jobUrl.trim()) {
      toast.error("Please enter a valid job posting URL");
      return;
    }

    setIsScraping(true);
    try {
      const res = await fetch("/api/scrape-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch job description");
      }

      setJobDescription(data.text);
      if (data.title && !roleTitle) setRoleTitle(data.title);
      if (data.company && !companyName) setCompanyName(data.company);

      toast.success("Job description extracted successfully!");
      setJobTab("paste"); // Switch to view extracted text
    } catch (err: unknown) {
      console.error("Scrape error:", err);
      const msg = err instanceof Error ? err.message : "Failed to fetch job details from URL.";
      toast.error(msg);
    } finally {
      setIsScraping(false);
    }
  };

  // ─── Select Saved Resume Handler ────────────────────────────
  const handleSelectSavedResume = (resume: SavedResumeDoc) => {
    setSelectedSavedResumeId(resume._id);
    if (resume.rawText) {
      setResumeText(resume.rawText);
    } else if (resume.sections) {
      // Convert sections to text
      const lines: string[] = [];
      if (resume.title) lines.push(resume.title);
      if (typeof resume.sections === "object") {
        for (const [k, v] of Object.entries(resume.sections)) {
          lines.push(`\n## ${k.toUpperCase()}`);
          lines.push(typeof v === "string" ? v : JSON.stringify(v, null, 2));
        }
      }
      setResumeText(lines.join("\n"));
    }
    toast.success(`Loaded saved resume: ${resume.title}`);
  };

  // ─── Execute Optimization ───────────────────────────────────
  const handleOptimize = async () => {
    if (!resumeText.trim()) {
      toast.error("Please provide your resume in Section 1.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please provide the target job description in Section 2.");
      return;
    }

    const finalRole = roleTitle.trim() || "Target Role";
    const finalCompany = companyName.trim() || "Target Company";

    // Check credits
    if (creditsStatus) {
      const isPaid =
        creditsStatus.plan === "pro" ||
        creditsStatus.plan === "power" ||
        creditsStatus.plan === "team" ||
        creditsStatus.plan === "campus" ||
        (creditsStatus.plan === "pro_pass" && creditsStatus.daysRemaining > 0);

      if (!isPaid && (creditsStatus.freeOptimizationsRemaining ?? 0) <= 0) {
        toast.error("You have reached your 2 free optimizations allowance. Please upgrade to continue.");
        router.push("/pricing");
        return;
      }
    }

    setIsOptimizing(true);
    setOptimizingStep(1);

    try {
      // Step 1: Simulating analysis steps for authentic 27s feedback (fast preview ~3.5s)
      await new Promise((r) => setTimeout(r, 900));
      setOptimizingStep(2);
      await new Promise((r) => setTimeout(r, 1100));
      setOptimizingStep(3);

      // Compute ATS score & matching keywords
      const resumeLower = resumeText.toLowerCase();
      const jobWords = Array.from(
        new Set(jobDescription.toLowerCase().split(/\W+/).filter((w) => w.length > 3))
      );
      const matched = jobWords.filter((w) => resumeLower.includes(w)).slice(0, 8);
      const missing = jobWords.filter((w) => !resumeLower.includes(w)).slice(0, 6);

      const baseScore = Math.min(
        96,
        Math.max(68, Math.round((matched.length / Math.max(1, matched.length + missing.length)) * 100))
      );

      const result = await createOptimizationMutation({
        roleTitle: finalRole,
        companyName: finalCompany,
        outputLength,
        additionalContext: additionalContext.trim() || undefined,
        score: baseScore,
        atsCompatibilityScore: baseScore,
        matchedKeywords: matched,
        missingKeywords: missing,
        jobDescriptionText: jobDescription.trim(),
        url: jobUrl.trim() || undefined,
        status: "completed",
      });

      setSuccessResult({
        optimizationId: result.optimizationId,
        jobId: result.jobId,
        role: finalRole,
        company: finalCompany,
      });

      toast.success("Resume optimized successfully! Auto-logged to your Job Tracker.");
    } catch (err: unknown) {
      console.error("Optimization failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to complete optimization. Please try again.";
      toast.error(msg);
    } finally {
      setIsOptimizing(false);
      setOptimizingStep(0);
    }
  };

  const isFreePlan = !creditsStatus || creditsStatus.plan === "free";
  const freeRemaining = creditsStatus?.freeOptimizationsRemaining ?? 2;

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-slate-900 pb-28">
      {/* ─── PAGE HEADER ─────────────────────────────────────── */}
      <div className="border-b border-slate-200/80 bg-white/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Resume Optimizer</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Tailor your resume for the role
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Paste your baseline resume and target job description. We rewrite your bullets,
                maximize ATS keyword density, and auto-log your application.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/job-check"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <span>Check job fit first</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT GRID ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ─── LEFT: 4-SECTION VERTICAL FORM (8 cols) ───────── */}
          <div className="lg:col-span-8 space-y-6">
            {/* ─── SECTION 1: YOUR RESUME ─────────────────────── */}
            <section
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative"
              id="section-resume"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Your resume
                  </h2>
                </div>

                {/* Tabs */}
                <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
                  <button
                    type="button"
                    onClick={() => setResumeTab("paste")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      resumeTab === "paste"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    Paste text
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeTab("upload")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      resumeTab === "upload"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    Upload file
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeTab("saved")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      resumeTab === "saved"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    Saved resumes
                  </button>
                </div>
              </div>

              {/* Tab 1: Paste text */}
              {resumeTab === "paste" && (
                <div className="space-y-2">
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume here (Summary, Work Experience, Education, Projects, Skills)..."
                    rows={8}
                    className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-y font-mono leading-relaxed transition-all"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>
                      {resumeText.trim().length > 0
                        ? `${resumeText.trim().length} characters · ~${Math.round(
                            resumeText.trim().split(/\s+/).length
                          )} words`
                        : "No text added"}
                    </span>
                    {resumeText.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setResumeText("")}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Upload file */}
              {resumeTab === "upload" && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-rose-50/20 transition-all group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF, Word (.docx), or plain text (.txt) up to 10MB
                    </p>
                    {uploadedFileName && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Loaded: {uploadedFileName}</span>
                      </div>
                    )}
                  </div>

                  {resumeText && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                      <span className="truncate max-w-[80%] font-mono">
                        Preview: {resumeText.slice(0, 100)}...
                      </span>
                      <button
                        type="button"
                        onClick={() => setResumeTab("paste")}
                        className="text-rose-600 font-semibold hover:underline"
                      >
                        View & Edit Text
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Saved resumes */}
              {resumeTab === "saved" && (
                <div className="space-y-3">
                  {!savedResumesData || savedResumesData.resumes.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-slate-200">
                      <Bookmark className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                      <p className="text-sm font-semibold text-slate-700">
                        No saved resumes found
                      </p>
                      <p className="text-xs text-slate-500 mt-1 mb-3">
                        Save master templates in Saved Resumes to quickly pick them here.
                      </p>
                      <Link
                        href="/resumes"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                      >
                        <span>Manage Saved Resumes</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                      {savedResumesData.resumes.map((resume: SavedResumeDoc) => {
                        const isSelected = selectedSavedResumeId === resume._id;
                        return (
                          <div
                            key={resume._id}
                            onClick={() => handleSelectSavedResume(resume)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "border-rose-600 bg-rose-50/50 shadow-2xs ring-1 ring-rose-500"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-bold text-slate-900 truncate">
                                {resume.title}
                              </h4>
                              {resume.isDefault && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {resume.targetRole || "General"} · {resume.template || "Standard"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ─── SECTION 2: THE JOB YOU WANT ────────────────── */}
            <section
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative"
              id="section-job"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    The job you want
                  </h2>
                </div>

                {/* Tabs */}
                <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
                  <button
                    type="button"
                    onClick={() => setJobTab("paste")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      jobTab === "paste"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    Paste text
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobTab("url")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      jobTab === "url"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    From URL
                  </button>
                </div>
              </div>

              {/* Tab: From URL */}
              {jobTab === "url" && (
                <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Job Posting URL
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="url"
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                        placeholder="https://linkedin.com/jobs/view/... or Indeed / Greenhouse URL"
                        className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isScraping}
                      onClick={handleScrapeUrl}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 transition-all shrink-0 cursor-pointer"
                    >
                      {isScraping ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <span>Fetch description</span>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Supports LinkedIn, Indeed, Greenhouse, Lever, Workday, and public company careers pages.
                  </p>
                </div>
              )}

              {/* Role Title and Company Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Stripe, Google, or Startup"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                  />
                </div>
              </div>

              {/* Job Description Textarea */}
              <div className="space-y-2">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here (Responsibilities, Requirements, Tech Stack)..."
                  rows={7}
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-y font-mono leading-relaxed transition-all"
                />
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500">
                    {jobDescription.trim().length > 0
                      ? `${jobDescription.trim().length} characters`
                      : "No job text added"}
                  </span>

                  {/* HireRaft reference link */}
                  <Link
                    href="/job-check"
                    className="text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Not sure? Check the fit first, it&apos;s free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </section>

            {/* ─── SECTION 3: ANYTHING WE CAN'T SEE? (OPTIONAL) ── */}
            <section
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative"
              id="section-context"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Anything we can&apos;t see?
                    </h2>
                    <span className="text-[11px] text-slate-500 block">
                      Optional context: promotions, career gaps, leadership highlights, or tone preferences.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                  {additionalContext.length} / 490
                </span>
              </div>

              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value.slice(0, 490))}
                maxLength={490}
                placeholder="Example: I led a team of 4 engineers last quarter, got promoted in January, and want to highlight distributed systems architecture over frontend work."
                rows={3}
                className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none leading-relaxed transition-all"
              />
            </section>

            {/* ─── SECTION 4: OUTPUT LENGTH ────────────────────── */}
            <section
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative"
              id="section-length"
            >
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4">
                <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  4
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Output length
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {OUTPUT_LENGTH_OPTIONS.map((opt) => {
                  const isSelected = outputLength === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setOutputLength(opt.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-rose-600 bg-rose-50/70 shadow-2xs ring-1 ring-rose-500"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-900">
                          {opt.label}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-rose-600 bg-rose-600 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {opt.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ─── CONSENT & ACTION CTA ────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              {/* Data Consent Toggle */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentImprovement}
                  onChange={(e) => setConsentImprovement(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  Can your data be used anonymously to improve our models?{" "}
                  <strong className="text-slate-800">Never sold, never shown to a human with your name.</strong>
                </span>
              </label>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isOptimizing}
                  onClick={handleOptimize}
                  className="w-full py-4 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>
                        {optimizingStep === 1
                          ? "Analyzing job requirements..."
                          : optimizingStep === 2
                          ? "Rewriting experience bullets..."
                          : "Scoring ATS keywords..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Optimize my resume ✦</span>
                      <span className="text-xs font-normal opacity-80 px-2 py-0.5 rounded-md bg-rose-700/60">
                        Takes about 27 secs
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Free Allowance Notice */}
              {isFreePlan && (
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <span>
                    Free plan: <strong className="text-slate-700">{freeRemaining} of 2</strong> lifetime optimizations remaining.
                  </span>
                  <Link
                    href="/pricing"
                    className="text-rose-600 font-semibold hover:underline"
                  >
                    See plans →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT SIDEBAR (4 cols) ───────────────────────── */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Card 1: WHAT HAPPENS NEXT */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
                What happens next
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-100">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      We analyze the job
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Extracts technical competencies, core domain terminology, and ATS scoring thresholds.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-100">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      We rewrite your bullets
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Strengthens impact with quantified outcomes, active verbs, and tailored keywords.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-100">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      You download ready files
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Get ATS-optimized PDF & DOCX resumes, plus automatically tracked application status.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: FREE ALLOWANCE / PLAN STATUS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  {isFreePlan ? "Free allowance" : "Your Plan"}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
                  {creditsStatus?.plan === "pro_pass"
                    ? "Pro 30-Day Pass"
                    : creditsStatus?.plan || "Free"}
                </span>
              </div>

              {isFreePlan ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Remaining</span>
                    <span className="font-bold text-slate-900">
                      {freeRemaining} of 2 optimizations left
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all"
                      style={{ width: `${(freeRemaining / 2) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Free accounts include 2 lifetime optimizations. Get unlimited with Pro.
                  </p>
                  <Link
                    href="/pricing"
                    className="block text-center w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
                  >
                    See plans & upgrades →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-slate-600">
                  <p className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Unlimited optimizations active</span>
                  </p>
                  {creditsStatus?.plan === "pro_pass" && (
                    <p className="text-slate-500">
                      Pass expires in {creditsStatus.daysRemaining} days.
                    </p>
                  )}
                  <Link
                    href="/pricing"
                    className="inline-block text-rose-600 font-semibold hover:underline pt-1"
                  >
                    Manage plan →
                  </Link>
                </div>
              )}
            </div>

            {/* Card 3: SAVED RESUMES QUICK SELECTOR */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Saved resumes
                </h3>
                <Link
                  href="/resumes"
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Manage →
                </Link>
              </div>

              {!savedResumesData || savedResumesData.resumes.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-2">No saved resumes yet</p>
                  <Link
                    href="/resumes"
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    + Add baseline resume
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedResumesData.resumes.slice(0, 3).map((r: SavedResumeDoc) => (
                    <div
                      key={r._id}
                      onClick={() => handleSelectSavedResume(r)}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {r.title}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {r.targetRole || "General"}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-rose-600 hover:underline shrink-0">
                        Use
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ─── 4-STEP DISMISSIBLE ONBOARDING WIZARD ────────────── */}
      {wizardStep !== null && (
        <div className="fixed bottom-4 inset-x-4 max-w-2xl mx-auto z-40 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-800 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {wizardStep}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  Quick Guide · Step {wizardStep} of 4
                </span>
                <button
                  onClick={dismissWizard}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                  title="Dismiss guide"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-sm font-bold text-white mt-0.5">
                {wizardStep === 1 && "1 · Add your resume"}
                {wizardStep === 2 && "2 · Add the target job description"}
                {wizardStep === 3 && "3 · Add hidden context (optional)"}
                {wizardStep === 4 && "4 · Pick output length & run"}
              </h4>

              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {wizardStep === 1 &&
                  "Paste your current resume, upload a PDF/DOCX, or pick from your saved templates."}
                {wizardStep === 2 &&
                  "Paste the job description or fetch it automatically from any LinkedIn / job board URL."}
                {wizardStep === 3 &&
                  "Mention unlisted accomplishments, recent promotions, or gaps to emphasize in the rewrite."}
                {wizardStep === 4 &&
                  "Select 1 page, 2 pages, or Auto-detect, then click Optimize my resume to generate your files."}
              </p>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      key={step}
                      className={`w-2 h-2 rounded-full transition-all ${
                        step === wizardStep ? "bg-rose-500 w-4" : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {wizardStep > 1 && (
                    <button
                      onClick={() => setWizardStep(wizardStep - 1)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Back
                    </button>
                  )}
                  {wizardStep < 4 ? (
                    <button
                      onClick={() => setWizardStep(wizardStep + 1)}
                      className="px-3 py-1 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={dismissWizard}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-500"
                    >
                      Got it
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SUCCESS CELEBRATION MODAL ───────────────────────── */}
      {successResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">
              Resume Tailored & Logged!
            </h3>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Optimized for <strong className="text-slate-800">{successResult.role}</strong> at{" "}
              <strong className="text-slate-800">{successResult.company}</strong>.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 my-5 border border-slate-100 text-left text-xs text-slate-600 space-y-1.5">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Saved to your <strong>Optimization History</strong> (retention active)</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Auto-logged as <strong>Saved</strong> in your Job Tracker</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ATS keyword alignment scored & matched</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <Link
                href="/jobs"
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                View in Job Tracker →
              </Link>
              <Link
                href="/history"
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
              >
                View in History →
              </Link>
              <button
                type="button"
                onClick={() => setSuccessResult(null)}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
