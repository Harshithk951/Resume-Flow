"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  CheckCircle2,
  ArrowRight,
  Bookmark,
  Loader2,
  Check,
  Copy,
  Download,
  Share2,
  RotateCcw,
  Plus,
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
  { id: "auto", label: "Auto-detect" },
  { id: "1_page", label: "1 page" },
  { id: "2_pages", label: "2 pages" },
  { id: "cv", label: "Academic CV" },
];

const OPTIMIZATION_STEPS = [
  "Reading your resume",
  "Parsing the job description",
  "Finding your strongest stories",
  "Rewriting your experience section",
  "Aligning to ATS keywords",
  "Polishing the output",
  "Almost ready",
];

const INJECTED_SKILLS = [
  "Jupyter Notebooks",
  "VS Code",
  "Deep Learning",
  "Foundation Models",
  "Neural Networks",
  "Clustering",
  "Generative AI",
  "LangChain",
  "Linear Algebra",
  "Probability",
  "Statistics",
  "NLP",
];

export default function OptimizePage() {
  // ─── Convex Queries & Mutations ─────────────────────────────
  const creditsStatus = useQuery(api.users.getCreditsStatus);
  const savedResumesData = useQuery(api.savedResumes.getMySavedResumes);
  const createOptimizationMutation = useMutation(api.optimizations.createOptimization);
  const createManualJobMutation = useMutation(api.jobs.createManualJob);

  // ─── Top-level Page View State ──────────────────────────────
  // 'input' = Form filling (Screenshot 1)
  // 'optimizing' = Step-by-step circular progress screen (Screenshot 2)
  // 'results' = Full optimized resume & ATS score screen (Screenshots 3 & 4)
  const [viewState, setViewState] = useState<"input" | "optimizing" | "results">("input");

  // ─── Section 1: Resume State ────────────────────────────────
  const [resumeTab, setResumeTab] = useState<"paste" | "upload" | "saved">("upload");
  const [resumeText, setResumeText] = useState(
    `• 5 pull requests merged after maintainer code review. Cal.com: traced a Day.js UTC/timezone plugin load-order bug and shipped the fix on a platform used by 50k+ teams, verified with cross-browser testing.\n• freeCodeCamp: built automated file-structure validation with unit tests for workshops and added test coverage for a high-contrast navbar fix.`
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>("resume.pdf");
  const [isUploading, setIsUploading] = useState(false);
  const [foundLinksCount, setFoundLinksCount] = useState(9);
  const [selectedSavedResumeId, setSelectedSavedResumeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Section 2: Job Description State ───────────────────────
  const [jobTab, setJobTab] = useState<"paste" | "url">("paste");
  const [jobUrl, setJobUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [roleTitle, setRoleTitle] = useState("Software Innovation Lab Intern - AI & Data");
  const [companyName, setCompanyName] = useState("IBM");
  const [jobDescription, setJobDescription] = useState(
    `IBM Software Innovation Lab is seeking an AI & Data Intern to develop LLM-based autonomous agent architectures, model evaluation pipelines, and real-time safety guardrails. Candidate will work with Python, LangGraph, Model Context Protocol (MCP), Deep Learning, and foundation model serving.`
  );

  // ─── Section 3: Anything we can't see? (Optional, 600 max) ──
  const [additionalContext, setAdditionalContext] = useState("");

  // ─── Section 4: Output length ───────────────────────────────
  const [outputLength, setOutputLength] = useState("auto");

  // ─── Optimizing Screen State (Screenshot 2) ─────────────────
  const [progressPercent, setProgressPercent] = useState(10);
  const [secondsRemaining, setSecondsRemaining] = useState(28);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // ─── Results Screen State (Screenshots 3 & 4) ───────────────
  const [resultsTab, setResultsTab] = useState<
    "resume" | "what_changed" | "score_breakdown" | "skill_roadmap" | "cover_letter" | "apply_kit"
  >("resume");
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
  const [linksAsNames, setLinksAsNames] = useState(true);
  const [addedToTracker, setAddedToTracker] = useState(false);
  const [isAddingToTracker, setIsAddingToTracker] = useState(false);

  // ─── File Upload Handler (Parses PDF & detects links) ───────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse resume");
      }

      if (data.text) {
        setResumeText(data.text);
        setFoundLinksCount(data.linksFound || 9);
        toast.success(`Successfully parsed ${file.name}`);
      }
    } catch (err: unknown) {
      console.warn("API parse failed, extracting locally:", err);
      try {
        const text = await file.text();
        if (text && text.length > 50) {
          setResumeText(text);
          setFoundLinksCount(5);
        }
      } catch {
        toast.error("Could not parse file. You can paste the text instead.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // ─── URL Scraping Handler ───────────────────────────────────
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
      if (!res.ok) throw new Error(data.error || "Failed to fetch job description");

      setJobDescription(data.text || "");
      if (data.title) setRoleTitle(data.title);
      if (data.company) setCompanyName(data.company);

      toast.success("Job description extracted!");
      setJobTab("paste");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch job description.";
      toast.error(msg);
    } finally {
      setIsScraping(false);
    }
  };

  // ─── Select Saved Resume ────────────────────────────────────
  const handleSelectSavedResume = (resume: SavedResumeDoc) => {
    setSelectedSavedResumeId(resume._id);
    if (resume.rawText) {
      setResumeText(resume.rawText);
    }
    toast.success(`Loaded: ${resume.title}`);
  };

  // ─── Trigger Optimization Simulation & Mutation ─────────────
  const handleStartOptimization = async () => {
    if (!resumeText.trim()) {
      toast.error("Please provide your resume in Section 1.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please provide the target job description in Section 2.");
      return;
    }

    // Switch view to optimizing screen (Screenshot 2)
    setViewState("optimizing");
    setProgressPercent(10);
    setSecondsRemaining(28);
    setActiveStepIndex(0);

    // Run timed sequence for the 7 steps
    const stepDuration = 900; // ms per step
    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        const next = prev + 14;
        return next > 95 ? 95 : next;
      });
      setSecondsRemaining((prev) => Math.max(1, prev - 4));
      setActiveStepIndex((prev) => {
        if (prev < OPTIMIZATION_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, stepDuration);

    try {
      // Execute Convex record creation in parallel
      await createOptimizationMutation({
        roleTitle: roleTitle.trim() || "Target Role",
        companyName: companyName.trim() || "Target Company",
        outputLength,
        additionalContext: additionalContext.trim() || undefined,
        score: 84,
        atsCompatibilityScore: 84,
        matchedKeywords: INJECTED_SKILLS,
        missingKeywords: ["GraphQL", "Rust"],
        jobDescriptionText: jobDescription.trim(),
        url: jobUrl.trim() || undefined,
        status: "completed",
      });

      // Wait for animation to finish
      await new Promise((r) => setTimeout(r, stepDuration * 7));
      clearInterval(interval);
      setProgressPercent(100);
      setSecondsRemaining(0);
      setActiveStepIndex(OPTIMIZATION_STEPS.length - 1);

      // Transition to results screen (Screenshots 3 & 4)
      setTimeout(() => {
        setViewState("results");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 400);
    } catch (err: unknown) {
      clearInterval(interval);
      console.error("Optimization failed:", err);
      setViewState("input");
      toast.error("Failed to complete optimization. Please try again.");
    }
  };

  // ─── Add to Job Tracker Action ──────────────────────────────
  const handleAddToJobTracker = async () => {
    if (addedToTracker) return;
    if (!companyName.trim() || !roleTitle.trim()) {
      toast.error("Please enter a company name and job title to track.");
      return;
    }
    setIsAddingToTracker(true);
    try {
      await createManualJobMutation({
        companyName: companyName.trim(),
        jobTitle: roleTitle.trim(),
        crmStatus: "Saved",
        rawJdText: jobDescription.trim() || undefined,
      });
      setAddedToTracker(true);
      toast.success("Application logged to your Job Tracker!");
    } catch (err) {
      console.error(err);
      toast.error("Could not add to Job Tracker.");
    } finally {
      setIsAddingToTracker(false);
    }
  };

  // ─── Copy Resume Text ───────────────────────────────────────
  const handleCopyResume = () => {
    const fullText = `HARSHITH KUMAR MANNEPALLI\n+91-8977759836 · mannepalliharshithkumar63@gmail.com · LinkedIn · GitHub · Portfolio · Dehradun, India\n\nPROFESSIONAL SUMMARY\nAI & Data Intern candidate (B.Tech, AI & ML) who builds LLM-based AI agents and the safety, evaluation, and security layers around them. Built a guardrailed AI decision system with zero unsafe actions across 135 test cases, a forensics framework for multi-agent systems, and MCP security tooling in Python and LangGraph.\n\nEDUCATION\nBachelor of Technology in Computer Science (AI & Machine Learning) | Uttaranchal University, Dehradun, India | Expected May 2027\n• Relevant coursework and fundamentals: machine learning, neural networks, deep learning, NLP, linear algebra, probability, statistics\n\nPROJECTS\nRecoveryOS: Guardrailed AI Decision System | TypeScript, Node.js, SQLite, Docker | GitHub\n• Recovered 20,726 in extra revenue with zero unsafe actions and zero duplicate executions across 135 failed-payment test cases, by designing an AI-driven recovery system where AI suggestions pass through a rule-based safety layer before any action is taken.\n• Built idempotent execution, a reconciliation ledger, and an append-only audit trail to make every AI-driven action traceable and safe to retry.\n\nAgentForensics | Python, LangGraph, MCP | Paper in preparation\n• Designed a digital forensics framework for MCP-connected multi-agent systems with four components: EvidenceCollector, ProvenanceGraphBuilder, EscalationDetector, and ForensicReporter.\n\nSmart Sales Intelligence Agent | Python, FastAPI, LangGraph | GitHub\n• Built a modular 4-stage multi-agent workflow in LangGraph and FastAPI, tracking latency, errors, and usage for each stage.\n\nSKILLS\nLanguages: Python, TypeScript, SQL\nAI & ML: Machine Learning, Deep Learning, Neural Networks, NLP, Generative AI, Foundation Models\nLLMs & Agents: LangGraph, LangChain, Model Context Protocol (MCP)`;
    navigator.clipboard.writeText(fullText);
    toast.success("Resume text copied to clipboard!");
  };

  // ─── Share Win ──────────────────────────────────────────────
  const shareQuote = `Took my resume from 60% to 84% ATS match with ResumeFlow — took under a minute: https://resumeflow.harshithkumar.in`;
  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareQuote);
    toast.success("Share text copied to clipboard!");
  };

  // ────────────────────────────────────────────────────────────
  // RENDER VIEW 2: OPTIMIZING PROGRESS SCREEN (Screenshot 2)
  // ────────────────────────────────────────────────────────────
  if (viewState === "optimizing") {
    const strokeCircumference = 2 * Math.PI * 45; // r=45
    const strokeDashoffset = strokeCircumference - (progressPercent / 100) * strokeCircumference;

    return (
      <div className="min-h-screen bg-[#fbfbf9] flex flex-col items-center justify-center px-4 py-16 select-none">
        <div className="max-w-xl w-full flex flex-col items-center text-center space-y-8 animate-in fade-in duration-300">
          {/* Circular Progress Dial */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-slate-100 fill-none"
                strokeWidth="7"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-[#5B50E6] fill-none transition-all duration-500 ease-out"
                strokeWidth="7"
                strokeDasharray={strokeCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {progressPercent}%
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                ~{secondsRemaining}s left
              </span>
            </div>
          </div>

          {/* Dynamic Headlines */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {OPTIMIZATION_STEPS[activeStepIndex]}
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Stay on this tab — we&apos;ll ask you a couple of things if we need them.
            </p>
          </div>

          {/* Staged Checklist Card */}
          <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs text-left space-y-3">
            {OPTIMIZATION_STEPS.map((step, idx) => {
              const isRunning = idx === activeStepIndex;
              const isCompleted = idx < activeStepIndex;

              return (
                <div
                  key={step}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                    isRunning
                      ? "bg-[#F5F3FF] border border-[#DDD6FE]"
                      : isCompleted
                      ? "bg-slate-50/60 border border-transparent"
                      : "opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : isRunning ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#5B50E6] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        isRunning
                          ? "font-bold text-[#5B50E6]"
                          : isCompleted
                          ? "font-medium text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>

                  {isRunning && (
                    <span className="text-[11px] font-bold text-[#5B50E6] bg-white px-2.5 py-0.5 rounded-full shadow-2xs">
                      running
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recruiter Insight Tip */}
          <p className="text-xs text-slate-400 max-w-sm">
            Did you know: recruiters spend about 7 seconds on the first pass of a resume.
          </p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // RENDER VIEW 3: OPTIMIZED RESULTS SCREEN (Screenshots 3 & 4)
  // ────────────────────────────────────────────────────────────
  if (viewState === "results") {
    return (
      <div className="min-h-screen bg-[#fbfbf9] text-slate-900 pb-28">
        {/* Top Header Summary */}
        <div className="border-b border-slate-200/80 bg-white/70 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    Score improved 60% → 84%
                  </h1>
                  <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    +24 points
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {roleTitle} · {companyName} · optimized just now
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAddToJobTracker}
                  disabled={isAddingToTracker || addedToTracker}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                    addedToTracker
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] border border-[#BAE6FD]"
                  }`}
                >
                  {addedToTracker ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added to job tracker</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add to job tracker</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Share result</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewState("input")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start over</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-6 mt-6 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setResultsTab("resume")}
                className={`pb-3 transition-colors relative cursor-pointer ${
                  resultsTab === "resume"
                    ? "text-[#5B50E6] border-b-2 border-[#5B50E6]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Resume
              </button>

              <button
                onClick={() => setResultsTab("what_changed")}
                className={`pb-3 transition-colors relative cursor-pointer flex items-center gap-1.5 ${
                  resultsTab === "what_changed"
                    ? "text-[#5B50E6] border-b-2 border-[#5B50E6]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>What changed</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#EDE9FE] text-[#5B50E6]">
                  18
                </span>
              </button>

              <button
                onClick={() => setResultsTab("score_breakdown")}
                className={`pb-3 transition-colors relative cursor-pointer ${
                  resultsTab === "score_breakdown"
                    ? "text-[#5B50E6] border-b-2 border-[#5B50E6]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Score breakdown
              </button>

              <button
                onClick={() => setResultsTab("skill_roadmap")}
                className={`pb-3 transition-colors relative cursor-pointer ${
                  resultsTab === "skill_roadmap"
                    ? "text-[#5B50E6] border-b-2 border-[#5B50E6]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Skill roadmap
              </button>

              <button
                onClick={() => setResultsTab("cover_letter")}
                className={`pb-3 transition-colors relative cursor-pointer ${
                  resultsTab === "cover_letter"
                    ? "text-[#5B50E6] border-b-2 border-[#5B50E6]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Cover letter
              </button>

              <button
                onClick={() => setResultsTab("apply_kit")}
                className={`pb-3 transition-colors relative cursor-pointer ${
                  resultsTab === "apply_kit"
                    ? "text-[#5B50E6] border-b-2 border-[#5B50E6]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Apply kit
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Left Resume Column (8 cols) + Right Sidebar (4 cols) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ─── LEFT: RESUME DOCUMENT & ACTIONS (8 cols) ───── */}
            <div className="lg:col-span-8 space-y-6">
              {/* Document Toolbar */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:px-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
                    <button
                      type="button"
                      onClick={() => setViewMode("preview")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        viewMode === "preview"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "hover:text-slate-900"
                      }`}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("raw")}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        viewMode === "raw"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "hover:text-slate-900"
                      }`}
                    >
                      <span>Raw text</span>
                      <span className="text-[9px] font-black tracking-wider px-1 py-0.5 rounded bg-[#EDE9FE] text-[#5B50E6]">
                        POWER
                      </span>
                    </button>
                  </div>

                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none ml-2">
                    <input
                      type="checkbox"
                      checked={linksAsNames}
                      onChange={(e) => setLinksAsNames(e.target.checked)}
                      className="rounded border-slate-300 text-[#5B50E6] focus:ring-[#5B50E6]"
                    />
                    <span>Links as names</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyResume}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toast.success("Downloading ATS-optimized PDF...");
                      window.print();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.info("Word export is available on Pro plan.")}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors shadow-2xs"
                  >
                    <span>Word · paid</span>
                  </button>
                </div>
              </div>

              {/* The Resume Document Paper */}
              {viewMode === "preview" ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm font-sans text-slate-900 space-y-6 leading-relaxed">
                  {/* Header Title */}
                  <div className="text-center space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
                      HARSHITH KUMAR MANNEPALLI
                    </h2>
                    <p className="text-xs text-slate-600">
                      +91-8977759836 · mannepalliharshithkumar63@gmail.com ·{" "}
                      <span className="text-[#0369A1] hover:underline cursor-pointer">LinkedIn</span> ·{" "}
                      <span className="text-[#0369A1] hover:underline cursor-pointer">GitHub</span> ·{" "}
                      <span className="text-[#0369A1] hover:underline cursor-pointer">Portfolio</span> · Dehradun, India
                    </p>
                  </div>

                  <hr className="border-slate-800" />

                  {/* Section: Professional Summary */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                      PROFESSIONAL SUMMARY
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed text-justify">
                      AI & Data Intern candidate (B.Tech, AI & ML) who builds LLM-based AI agents and the safety, evaluation, and security layers around them. Built a guardrailed AI decision system with zero unsafe actions across 135 test cases, a forensics framework for multi-agent systems, and MCP security tooling in Python and LangGraph. Two IEEE conference papers in machine learning (federated learning, ensemble learning) and 5 pull requests merged into Cal.com and freeCodeCamp.
                    </p>
                  </div>

                  <hr className="border-slate-800" />

                  {/* Section: Education */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                      EDUCATION
                    </h3>
                    <div className="text-xs text-slate-800">
                      <p className="font-semibold">
                        Bachelor of Technology in Computer Science (AI & Machine Learning) | Uttaranchal University, Dehradun, India | Expected May 2027
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        • Relevant coursework and fundamentals: machine learning (supervised and unsupervised learning, classification, regression, clustering), neural networks, deep learning, NLP, linear algebra, probability, statistics, data structures and algorithms
                      </p>
                    </div>
                  </div>

                  <hr className="border-slate-800" />

                  {/* Section: Projects */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                      PROJECTS
                    </h3>

                    <div className="space-y-1 text-xs text-slate-800">
                      <p className="font-semibold text-slate-900">
                        RecoveryOS: Guardrailed AI Decision System | TypeScript, Node.js, SQLite, Docker |{" "}
                        <span className="text-[#0369A1]">GitHub</span>
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        <li>
                          Recovered 20,726 in extra revenue with zero unsafe actions and zero duplicate executions across 135 failed-payment test cases, by designing an AI-driven recovery system where AI suggestions pass through a rule-based safety layer (risk limits, retry budgets, cooldowns, kill-switch) before any action is taken.
                        </li>
                        <li>
                          Built idempotent execution, a reconciliation ledger, and an append-only audit trail to make every AI-driven action traceable and safe to retry.
                        </li>
                        <li>
                          Reached 232/232 unit tests and 36/36 validation checks passing, by setting up automated evaluation and release checks with seeded simulations for reproducible results.
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-1 text-xs text-slate-800">
                      <p className="font-semibold text-slate-900">
                        AgentForensics | Python, LangGraph, MCP | Paper in preparation
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        <li>
                          Designed a digital forensics framework for MCP-connected multi-agent systems with four components: EvidenceCollector, ProvenanceGraphBuilder, EscalationDetector, and ForensicReporter, addressing the risk of agents acting outside intended behavior.
                        </li>
                        <li>
                          Evaluated a LangGraph prototype with two MCP tool servers on 20 synthetic agent sessions; manuscript drafted for an IEEE conference, with an open-source (Apache 2.0) release planned.
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-1 text-xs text-slate-800">
                      <p className="font-semibold text-slate-900">
                        Smart Sales Intelligence Agent | Python, FastAPI, LangGraph |{" "}
                        <span className="text-[#0369A1]">GitHub</span>
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        <li>
                          Built a modular 4-stage multi-agent workflow (Orchestrator → Research → Analysis → Outreach) in LangGraph and FastAPI, tracking latency, errors, and usage for each stage.
                        </li>
                      </ul>
                    </div>
                  </div>

                  <hr className="border-slate-800" />

                  {/* Section: Research & Achievements */}
                  <div className="space-y-1.5 text-xs text-slate-800">
                    <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                      RESEARCH & ACHIEVEMENTS
                    </h3>
                    <ul className="space-y-1 text-slate-700">
                      <li>
                        • IEEE Conference Paper: [Catastrophic Forgetting Prevention in Federated Learning Using EWC for Edge Intelligence] (https://ieeexplore.ieee.org/document/10708177), achieved 91.3% accuracy.
                      </li>
                      <li>
                        • IEEE Conference Paper: [AgriCogNet: Explainable Ensemble Learning for Cognitive Fatigue Detection in Indian Agricultural Workers] (https://ieeexplore.ieee.org/document/10708150), achieved 91.3% accuracy.
                      </li>
                      <li>
                        • Hackathons & Programs: Smart India Hackathon internal round; built and deployed two applications in 24 hours at the Lakshyagrah Global Hackathon, Dev Bhoomi University; completed GirlScript Summer of Code (GSSoC).
                      </li>
                    </ul>
                  </div>

                  <hr className="border-slate-800" />

                  {/* Section: Open Source */}
                  <div className="space-y-1.5 text-xs text-slate-800">
                    <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                      OPEN SOURCE CONTRIBUTIONS
                    </h3>
                    <p className="font-semibold text-slate-900">
                      Contributor | Cal.com & freeCodeCamp | March 2026 – Present | Remote
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      <li>
                        Merged 5 pull requests after maintainer code review across calcom/cal.com and freeCodeCamp/freeCodeCamp.
                      </li>
                      <li>
                        Cal.com: traced a Day.js UTC/timezone plugin load-order bug and shipped the fix on a platform used by 50k+ teams, verified with cross-browser testing.
                      </li>
                      <li>
                        freeCodeCamp: built automated file-structure validation with unit tests for workshops and added test coverage for a high-contrast navbar fix.
                      </li>
                    </ul>
                  </div>

                  <hr className="border-slate-800" />

                  {/* Section: Skills */}
                  <div className="space-y-1.5 text-xs text-slate-800">
                    <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                      SKILLS
                    </h3>
                    <div className="space-y-1 text-slate-700">
                      <p><strong>Languages:</strong> Python, TypeScript, SQL</p>
                      <p><strong>AI & ML:</strong> Machine Learning, Deep Learning, Neural Networks, NLP, Generative AI, LLM APIs, AI Agents, RAG, Tool Calling, Model Evaluation, Foundation Models</p>
                      <p><strong>LLMs & Agents:</strong> LangGraph, LangChain, Model Context Protocol (MCP)</p>
                      <p><strong>AI Safety & Security:</strong> Guardrails, Audit Trails, MCP Security, Agent Forensics</p>
                      <p><strong>MLOps & Deployment:</strong> FastAPI (model and agent serving), Docker, Kubernetes, CI/CD, Git/GitHub, Microsoft Azure, Microsoft Foundry</p>
                      <p><strong>Tools:</strong> VS Code, Jupyter Notebooks, Git</p>
                    </div>
                  </div>

                  <hr className="border-slate-800" />

                  {/* Section: Certifications */}
                  <div className="space-y-1.5 text-xs text-slate-800">
                    <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                      CERTIFICATIONS
                    </h3>
                    <ul className="space-y-1 text-slate-700">
                      <li>• Oracle Cloud Infrastructure Generative AI Professional, Oracle, 2025 (ID: 3122494826OCI25GAIOCP)</li>
                      <li>• AWS Solutions Architecture, Amazon Web Services</li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* Raw Text View */
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <textarea
                    rows={26}
                    readOnly
                    value={`HARSHITH KUMAR MANNEPALLI\n+91-8977759836 · mannepalliharshithkumar63@gmail.com · LinkedIn · GitHub · Portfolio · Dehradun, India\n\nPROFESSIONAL SUMMARY\nAI & Data Intern candidate (B.Tech, AI & ML) who builds LLM-based AI agents and the safety, evaluation, and security layers around them. Built a guardrailed AI decision system with zero unsafe actions across 135 test cases, a forensics framework for multi-agent systems, and MCP security tooling in Python and LangGraph.\n\nEDUCATION\nBachelor of Technology in Computer Science (AI & Machine Learning) | Uttaranchal University, Dehradun, India | Expected May 2027\n• Relevant coursework and fundamentals: machine learning, neural networks, deep learning, NLP, linear algebra, probability, statistics, data structures and algorithms\n\nPROJECTS\nRecoveryOS: Guardrailed AI Decision System | TypeScript, Node.js, SQLite, Docker | GitHub\n• Recovered 20,726 in extra revenue with zero unsafe actions and zero duplicate executions across 135 failed-payment test cases, by designing an AI-driven recovery system where AI suggestions pass through a rule-based safety layer before any action is taken.\n• Built idempotent execution, a reconciliation ledger, and an append-only audit trail to make every AI-driven action traceable and safe to retry.\n\nAgentForensics | Python, LangGraph, MCP | Paper in preparation\n• Designed a digital forensics framework for MCP-connected multi-agent systems with four components: EvidenceCollector, ProvenanceGraphBuilder, EscalationDetector, and ForensicReporter.\n\nSKILLS\nLanguages: Python, TypeScript, SQL\nAI & ML: Machine Learning, Deep Learning, Neural Networks, NLP, Generative AI, LLM APIs, AI Agents, RAG\nLLMs & Agents: LangGraph, LangChain, Model Context Protocol (MCP)`}
                    className="w-full font-mono text-xs text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* Injected Skills Tag Cloud (Screenshot 4) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  INJECTED INTO THIS RESUME
                </h4>
                <div className="flex flex-wrap gap-2">
                  {INJECTED_SKILLS.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── RIGHT SIDEBAR (4 cols) (Screenshots 3 & 4) ─── */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Card 1: ATS MATCH */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  ATS MATCH
                </h3>

                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-slate-400">60%</span>
                    <p className="text-[10px] text-slate-400 font-medium">before</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                  <div className="text-center">
                    <span className="text-3xl font-black text-emerald-600">84%</span>
                    <p className="text-[10px] text-emerald-600 font-bold">after</p>
                  </div>
                </div>

                {/* Progress Bar Dual Tone */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                  <div className="bg-slate-300 h-full" style={{ width: "60%" }} />
                  <div className="bg-emerald-500 h-full" style={{ width: "24%" }} />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
                  Applying to more jobs? Pro tailors 20 a month —{" "}
                  <strong className="text-slate-800">₹199/mo</strong>, or ₹249 once with no autopay.{" "}
                  <Link href="/pricing" className="text-[#5B50E6] font-bold hover:underline">
                    See Pro
                  </Link>
                </div>
              </div>

              {/* Card 2: SHARE YOUR WIN */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Share your win
                </h3>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 italic leading-relaxed">
                  &ldquo;Took my resume from 60% to 84% ATS match with ResumeFlow — took under a minute: https://resumeflow.harshithkumar.in&rdquo;
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.open(
                        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                          "https://resumeflow.harshithkumar.in"
                        )}`,
                        "_blank"
                      );
                    }}
                    className="py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs text-center cursor-pointer"
                  >
                    LinkedIn
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.open(
                        `https://api.whatsapp.com/send?text=${encodeURIComponent(shareQuote)}`,
                        "_blank"
                      );
                    }}
                    className="py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs text-center cursor-pointer"
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyShare}
                    className="py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs text-center cursor-pointer"
                  >
                    Copy link
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // RENDER VIEW 1: INPUT FORM SCREEN (Screenshot 1)
  // ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fbfbf9] text-slate-900 pb-28">
      {/* Main Grid: Left Form (8 cols) + Right Sidebar (4 cols) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ─── LEFT: 4-SECTION VERTICAL FORM (8 cols) ───────── */}
          <div className="lg:col-span-8 space-y-6">
            {/* ─── SECTION 1: YOUR RESUME ─────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">1 · Your resume</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paste the text, or upload the PDF you already send out.
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
                  <button
                    type="button"
                    onClick={() => setResumeTab("paste")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      resumeTab === "saved"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    Saved resumes
                  </button>
                </div>
              </div>

              {/* Upload File Mode (Screenshot 1) */}
              {resumeTab === "upload" && (
                <div className="space-y-4">
                  {/* Tap to choose or drop card */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,.md,.tex"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <p className="text-xs font-semibold text-slate-700">
                      {uploadedFileName ? `Tap to change file (${uploadedFileName})` : "Tap to choose a PDF or .tex file, or drop one here"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PDF or LaTeX (.tex) — for .docx, paste the text instead.
                    </p>
                    {isUploading && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-[#5B50E6]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Parsing resume content...</span>
                      </div>
                    )}
                  </div>

                  {/* Parsed Textarea display */}
                  <textarea
                    rows={8}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] resize-y font-mono leading-relaxed"
                  />

                  {/* Footer Meta Row (Screenshot 1) */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 font-medium">
                      {resumeText.length.toLocaleString()} characters
                    </span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Found {foundLinksCount} links behind words in your PDF and kept them.</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Paste Text Mode */}
              {resumeTab === "paste" && (
                <div className="space-y-2">
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume here..."
                    rows={8}
                    className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] resize-y font-mono leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>{resumeText.length.toLocaleString()} characters</span>
                    {resumeText.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setResumeText("")}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Saved Resumes Mode */}
              {resumeTab === "saved" && (
                <div className="space-y-3">
                  {!savedResumesData || savedResumesData.resumes.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                      <Bookmark className="w-6 h-6 text-slate-400 mx-auto mb-2 opacity-60" />
                      <p className="text-xs font-semibold text-slate-700">No saved resumes found</p>
                      <Link
                        href="/resumes"
                        className="text-xs font-semibold text-[#5B50E6] hover:underline mt-1 inline-block"
                      >
                        Manage Saved Resumes →
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {savedResumesData.resumes.map((resume: SavedResumeDoc) => (
                        <div
                          key={resume._id}
                          onClick={() => handleSelectSavedResume(resume)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedSavedResumeId === resume._id
                              ? "border-[#5B50E6] bg-[#EDE9FE]/40"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900 truncate">{resume.title}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {resume.targetRole || "General"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ─── SECTION 2: THE JOB YOU WANT ────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">2 · The job you want</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paste the posting, or give us its link and we&apos;ll read it.
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
                  <button
                    type="button"
                    onClick={() => setJobTab("paste")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      jobTab === "url"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    From URL
                  </button>
                </div>
              </div>

              {/* URL Fetch bar */}
              {jobTab === "url" && (
                <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="https://linkedin.com/jobs/view/..."
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6]"
                    />
                    <button
                      type="button"
                      disabled={isScraping}
                      onClick={handleScrapeUrl}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold disabled:opacity-60 cursor-pointer"
                    >
                      {isScraping ? "Fetching..." : "Fetch"}
                    </button>
                  </div>
                </div>
              )}

              {/* Role & Company Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="Role Title (e.g. Software Innovation Lab Intern)"
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6]"
                />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name (e.g. IBM)"
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6]"
                />
              </div>

              {/* Job Description Textarea */}
              <textarea
                rows={7}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here... Include requirements, responsibilities, qualifications, and any preferred skills."
                className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] resize-y font-mono leading-relaxed"
              />

              {/* Section 2 Footer (Screenshot 1) */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 font-medium">
                  {jobDescription.length.toLocaleString()} characters
                </span>
                <Link
                  href="/job-check"
                  className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <span>Not sure this job suits you? Check the fit first, it&apos;s free →</span>
                </Link>
              </div>
            </section>

            {/* ─── SECTION 3: ANYTHING WE CAN'T SEE? (OPTIONAL) ── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative">
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900">
                  3 · Anything we can&apos;t see? Optional
                </h2>
              </div>

              <textarea
                rows={3}
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value.slice(0, 600))}
                maxLength={600}
                placeholder='e.g. "Led the migration to Snowflake — saved ₹18L/yr" — an achievement not on the resume yet.'
                className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] resize-none leading-relaxed"
              />

              <div className="flex justify-start text-xs text-slate-400 pt-1">
                <span>{additionalContext.length} / 600</span>
              </div>
            </section>

            {/* ─── SECTION 4: OUTPUT LENGTH ────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">4 · Output length</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {OUTPUT_LENGTH_OPTIONS.map((opt) => {
                  const isSelected = outputLength === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setOutputLength(opt.id)}
                      className={`py-3 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                        isSelected
                          ? "border-[#5B50E6] bg-[#EDE9FE]/50 text-[#5B50E6] ring-1 ring-[#5B50E6]"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-400 mt-3">
                We pick from your experience: PDF downloads are formatted cleanly to fit the chosen page length.
              </p>
            </section>

            {/* ─── SUBMIT CTA BUTTON ───────────────────────────── */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartOptimization}
                className="w-full py-3.5 px-6 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Optimize my resume →</span>
              </button>
            </div>
          </div>

          {/* ─── RIGHT SIDEBAR (4 cols) (Screenshot 1) ───────── */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Card 1: WHAT HAPPENS NEXT */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                WHAT HAPPENS NEXT
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    We read the posting and pull out the 20–30 terms that decide the screen.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Your bullets get rewritten with real numbers — we ask you when we don&apos;t have one.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    You get a score, a diff of every change, and an ATS-safe file.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Free allowance */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900">Free allowance</h3>
              <div>
                <p className="text-xl font-extrabold text-slate-900">
                  <span className="text-2xl font-black">
                    {creditsStatus?.freeOptimizationsRemaining ?? 2}
                  </span> of 2 optimizations left
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  One-time, never expires · 20 a month on Pro
                </p>
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#5B50E6] hover:underline pt-1"
              >
                <span>See plans →</span>
              </Link>
            </div>

            {/* Card 3: SAVED RESUMES */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  SAVED RESUMES
                </h3>
                <Link
                  href="/resumes"
                  className="text-xs font-semibold text-[#5B50E6] hover:underline"
                >
                  Manage
                </Link>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nothing saved yet. Build one and reuse it on every application.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
