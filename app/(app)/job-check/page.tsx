"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Upload,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
  Bookmark,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import type { JobCheckResult } from "@/convex/ai/jobCheck";

interface SavedResumeDoc {
  _id: Id<"savedResumes">;
  title: string;
  targetRole?: string;
  template?: string;
  rawText?: string;
  sections?: Record<string, unknown>;
  isDefault?: boolean;
}

export default function JobCheckPage() {
  const router = useRouter();

  // ─── Convex APIs ────────────────────────────────────────────
  const checkJobFitAction = useAction(api.ai.jobCheck.checkJobFit);
  const savedResumesData = useQuery(api.savedResumes.getMySavedResumes);

  // ─── Input State ────────────────────────────────────────────
  // Section 1: Resume
  const [resumeTab, setResumeTab] = useState<"paste" | "upload" | "saved">("paste");
  const [resumeText, setResumeText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Section 2: Job
  const [jobTab, setJobTab] = useState<"paste" | "url">("paste");
  const [jobUrl, setJobUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [jobText, setJobText] = useState("");
  const [detectedRole, setDetectedRole] = useState("");
  const [detectedCompany, setDetectedCompany] = useState("");

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<JobCheckResult | null>(null);

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
        toast.success(`Loaded text from ${file.name}`);
      } else {
        toast.error("Could not extract readable text from this file. Please paste your text directly.");
      }
    } catch (err) {
      console.error("File upload error:", err);
      toast.error("Failed to read file contents.");
    }
  };

  // ─── Scrape Job from URL ────────────────────────────────────
  const handleScrapeUrl = async () => {
    if (!jobUrl.trim()) {
      toast.error("Please enter a valid job URL");
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

      setJobText(data.text);
      if (data.title) setDetectedRole(data.title);
      if (data.company) setDetectedCompany(data.company);

      toast.success("Job description fetched successfully!");
      setJobTab("paste");
    } catch (err: unknown) {
      console.error("Scrape error:", err);
      const msg = err instanceof Error ? err.message : "Failed to scrape job URL.";
      toast.error(msg);
    } finally {
      setIsScraping(false);
    }
  };

  // ─── Select Saved Resume ────────────────────────────────────
  const handleSelectSavedResume = (r: SavedResumeDoc) => {
    setSelectedResumeId(r._id);
    if (r.rawText) {
      setResumeText(r.rawText);
    } else if (r.sections) {
      const lines: string[] = [];
      if (r.title) lines.push(r.title);
      if (typeof r.sections === "object") {
        for (const [k, v] of Object.entries(r.sections)) {
          lines.push(`\n## ${k.toUpperCase()}`);
          lines.push(typeof v === "string" ? v : JSON.stringify(v, null, 2));
        }
      }
      setResumeText(lines.join("\n"));
    }
    toast.success(`Loaded saved resume: ${r.title}`);
  };

  // ─── Check Job Fit ──────────────────────────────────────────
  const handleCheckFit = async () => {
    if (!resumeText.trim()) {
      toast.error("Please provide your resume in Section 1.");
      return;
    }
    if (!jobText.trim()) {
      toast.error("Please provide the job description in Section 2.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(1);

    try {
      // Small visual step indicator
      const stepTimer1 = setTimeout(() => setAnalysisStep(2), 600);
      const stepTimer2 = setTimeout(() => setAnalysisStep(3), 1200);

      const checkResult = await checkJobFitAction({
        resumeText: resumeText.trim(),
        jobText: jobText.trim(),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      setResult(checkResult);
      toast.success("Job fit analysis complete!");

      // Scroll smoothly to results
      setTimeout(() => {
        const resultsEl = document.getElementById("fit-results-panel");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err: unknown) {
      console.error("Fit check failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to analyze job fit. Please try again.";
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  // ─── Transition to Optimizer with Prefilled Values ──────────
  const handleProceedToOptimize = () => {
    try {
      sessionStorage.setItem("resumeflow_prefill_resume", resumeText);
      sessionStorage.setItem("resumeflow_prefill_job", jobText);
      if (detectedRole) sessionStorage.setItem("resumeflow_prefill_role", detectedRole);
      if (detectedCompany) sessionStorage.setItem("resumeflow_prefill_company", detectedCompany);
    } catch {
      // Storage unavailable
    }
    router.push("/optimize");
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-slate-900 pb-28">
      {/* ─── PAGE HEADER ─────────────────────────────────────── */}
      <div className="border-b border-slate-200/80 bg-white/60 backdrop-blur-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Should I apply?
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Check a job against your resume first. In a few seconds you&apos;ll know if it&apos;s worth your time, what&apos;s missing, and whether the posting looks genuine. Free, and you always decide.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ─── 2-SECTION INPUT FORM ───────────────────────────── */}
        <div className="space-y-6">
          {/* SECTION 1: YOUR RESUME */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  1 · Your resume
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste the text, or upload the PDF you already send out.
                </p>
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
                {savedResumesData && savedResumesData.resumes.length > 0 && (
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
                )}
              </div>
            </div>

            {/* Paste Tab */}
            {resumeTab === "paste" && (
              <div className="space-y-2">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here — or your LaTeX source (we'll convert it)... Include your work experience, education, skills, and any other relevant sections."
                  rows={6}
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-y leading-relaxed"
                />
                <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
                  <span>{resumeText.trim().length} characters</span>
                  {resumeText.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setResumeText("")}
                      className="text-slate-400 hover:text-purple-600 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Upload Tab */}
            {resumeTab === "upload" && (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-purple-50/20 transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-purple-600 flex items-center justify-center mx-auto mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Click to select resume file (.pdf, .docx, .txt)
                  </p>
                  {uploadedFileName && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Loaded: {uploadedFileName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Saved Tab */}
            {resumeTab === "saved" && (
              <div className="space-y-2">
                {!savedResumesData || savedResumesData.resumes.length === 0 ? (
                  <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-slate-200">
                    <Bookmark className="w-6 h-6 text-slate-400 mx-auto mb-1 opacity-60" />
                    <p className="text-xs text-slate-600">No saved resumes found.</p>
                    <Link
                      href="/resumes"
                      className="inline-block text-xs font-semibold text-purple-600 hover:underline mt-1"
                    >
                      Manage Saved Resumes →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
                    {savedResumesData.resumes.map((r: SavedResumeDoc) => {
                      const isSelected = selectedResumeId === r._id;
                      return (
                        <div
                          key={r._id}
                          onClick={() => handleSelectSavedResume(r)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "border-purple-600 bg-purple-50/70 shadow-2xs ring-1 ring-purple-500"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {r.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {r.targetRole || "General"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* SECTION 2: THE JOB YOU WANT */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  2 · The job you want
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste the posting, or give us its link and we&apos;ll read it.
                </p>
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

            {/* URL Fetch Subpanel */}
            {jobTab === "url" && (
              <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
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
                      placeholder="https://linkedin.com/jobs/... or Indeed/Greenhouse URL"
                      className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
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
              </div>
            )}

            {/* Job Textarea */}
            <div className="space-y-2">
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the full job description here... Include requirements, responsibilities, qualifcations, and any preferred skills."
                rows={6}
                className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-y leading-relaxed"
              />
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
                <span>{jobText.trim().length} characters</span>
                {jobText.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setJobText("")}
                    className="text-slate-400 hover:text-purple-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ACTION CTA: CHECK THIS JOB */}
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleCheckFit}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              !resumeText.trim() || !jobText.trim()
                ? "bg-[#dedbf7] text-white"
                : "bg-[#5B50E6] hover:bg-[#4E43D8] text-white shadow-xs active:scale-[0.99]"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>
                  {analysisStep === 1
                    ? "Analyzing technical skill overlaps..."
                    : analysisStep === 2
                    ? "Evaluating seniority & experience requirements..."
                    : "Scanning for workplace red flags..."}
                </span>
              </>
            ) : (
              <span>Check this job</span>
            )}
          </button>
        </div>

        {/* ─── RESULTS PANEL (DIAGNOSTIC DASHBOARD) ─────────────── */}
        {result && (
          <div
            id="fit-results-panel"
            className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in duration-300"
          >
            {/* Header / Summary Takeaway */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  Diagnostic Result
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Job Fit Assessment
                </h3>
                <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Match Score Gauge / Pill */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
                <div
                  className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-2xl ${
                    result.matchScore >= 75
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : result.matchScore >= 50
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <span>{result.matchScore}%</span>
                  <span className="text-[9px] font-semibold tracking-normal uppercase -mt-1 opacity-80">
                    Match
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-700">
                      {result.matchScore >= 75
                        ? "Strong Candidate Match"
                        : result.matchScore >= 50
                        ? "Moderate Stretch Opportunity"
                        : "Low Alignment Role"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Based on skill taxonomy & keyword overlap
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Experience & Seniority Alignment */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    <h4 className="text-sm font-bold text-slate-800">
                      Experience & Seniority
                    </h4>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      result.experienceLevel.alignment.includes("Strong") ||
                      result.experienceLevel.alignment.includes("Well")
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {result.experienceLevel.alignment}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {result.experienceLevel.analysis}
                </p>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>
                    Your estimated experience:{" "}
                    <strong className="text-slate-800">
                      {result.experienceLevel.candidateEstimatedYears || 0} yrs
                    </strong>
                  </span>
                  <span>·</span>
                  <span>
                    Job requested:{" "}
                    <strong className="text-slate-800">
                      {result.experienceLevel.requiredEstimatedYears
                        ? `${result.experienceLevel.requiredEstimatedYears} yrs`
                        : "Flexible"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Card 2: Genuineness Assessment */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-800">
                      Listing Genuineness
                    </h4>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      result.genuineness.rating === "high"
                        ? "bg-emerald-100 text-emerald-800"
                        : result.genuineness.rating === "moderate"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {result.genuineness.rating} ({result.genuineness.score}%)
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {result.genuineness.explanation}
                </p>
                <p className="text-[11px] text-slate-400">
                  Scanned for standard structure, clear company expectations, and absence of scam markers.
                </p>
              </div>
            </div>

            {/* Skills Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Matched Skills */}
              <div className="p-5 rounded-2xl bg-white border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-800">
                      Matched Skills ({result.matchedSkills.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Found on both
                  </span>
                </div>
                {result.matchedSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No exact technical skill keyword overlaps identified.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Skills */}
              <div className="p-5 rounded-2xl bg-white border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h4 className="text-sm font-bold text-slate-800">
                      Missing Skills ({result.missingSkills.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-amber-700 font-semibold">
                    Target in optimizer
                  </span>
                </div>
                {result.missingSkills.length === 0 ? (
                  <p className="text-xs text-emerald-700 font-medium">
                    Excellent! All primary role keywords are present on your resume.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium"
                      >
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Red Flags Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2">
                {result.redFlags.length > 0 ? (
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                )}
                <h4 className="text-sm font-bold text-slate-800">
                  {result.redFlags.length > 0
                    ? `Red Flags Detected (${result.redFlags.length})`
                    : "Workplace Red Flags: None Detected"}
                </h4>
              </div>

              {result.redFlags.length === 0 ? (
                <p className="text-xs text-slate-600 leading-relaxed">
                  No signs of commission-only compensation, unpaid trials, 24/7 on-call demands, or suspicious recruitment methods. This posting follows standard workplace norms.
                </p>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {result.redFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-red-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-red-700">{flag.flag}</strong>
                        <span className="uppercase text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                          {flag.severity} risk
                        </span>
                      </div>
                      <p className="text-slate-600">{flag.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BOTTOM CALL TO ACTION: OPTIMIZE RESUME */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-purple-100/50 to-indigo-50 border border-purple-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Ready to optimize your resume for this role?
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  We&apos;ll pre-fill both your resume and job description in the Optimizer so you can tailor bullets in 27 seconds.
                </p>
              </div>

              <button
                type="button"
                onClick={handleProceedToOptimize}
                className="py-3 px-5 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
              >
                <span>Optimize resume for this role</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
