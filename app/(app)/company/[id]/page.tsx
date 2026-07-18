"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useConvexAuth, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SkillGapQuestionnaire } from "@/components/SkillGapQuestionnaire";
import {
  ArrowLeft,
  Loader2,
  Maximize2,
  Minimize2,
  AlertTriangle,
  FileText,
  Code,
  Settings,
  Sparkles,
  Copy,
  Check,
  Mail,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { jsonToLatex } from "@/lib/latex/jsonToLatex";
import { compileLatexToPdf } from "@/lib/latex/compiler";
import { normalizeStructuredContent } from "@/lib/pdf/types";
import { redactStructuredContentForDisplay } from "@/lib/redactResumeData";
import { resolveTemplate, type TemplateId } from "@/lib/latex/resolveTemplate";

const ReactPdfPreview = dynamic(
  () =>
    import("@/components/WorkspacePdfPreview").then(
      (mod) => mod.WorkspacePdfPreview
    ),
  { ssr: false, loading: () => (
    <div className="h-[600px] w-full rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
    </div>
  ) }
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CompanySplitWorkspace({ params }: PageProps) {
  const { id } = React.use(params);
  const jobId = id as Id<"jobs">;

  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();

  const job = useQuery(
    api.jobs.getJob,
    isAuthenticated ? { jobId } : "skip"
  );
  const resume = useQuery(
    api.jobs.getTailoredResume,
    isAuthenticated ? { jobId } : "skip"
  );
  const pdfUrl = useQuery(
    api.resumes.getPdfUrl,
    isAuthenticated && resume?.pdfStorageId ? { jobId } : "skip"
  );

  const resetToCompiling = useMutation(api.jobs.resetToCompiling);
  const retryJob = useMutation(api.jobs.retryJob);

  const [isWorkspaceMaximized, setIsWorkspaceMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<"PREVIEW" | "LATEX" | "JSON" | "OUTREACH">(
    "PREVIEW"
  );
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("ats_strict");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (authLoading || (isAuthenticated && job === undefined)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-3">
        <p className="text-sm font-semibold text-slate-700">Job not found</p>
        <Link
          href="/dashboard"
          className="text-xs font-bold text-rose-600 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const structuredContent = resume?.structuredContent
    ? normalizeStructuredContent(resume.structuredContent)
    : null;

  const resolvedTemplate =
    activeTemplate ||
    resolveTemplate(job.extractedRequirements?.resumeType);

  const latexSource =
    resume?.latexSnapshot && resume.latexSnapshot.length > 0
      ? resume.latexSnapshot
      : structuredContent
        ? jsonToLatex(structuredContent, resolvedTemplate)
        : "% No LaTeX snapshot generated yet";

  const handleRecompile = async () => {
    try {
      if (job?.pipelineState === "failed" && !structuredContent) {
        await retryJob({ jobId });
      } else {
        await resetToCompiling({ jobId });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Also revoke blob URLs after a brief delay
    if (url.startsWith("blob:")) {
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  };

  const handleDownload = async () => {
    if (pdfUrl) {
      triggerDownload(pdfUrl, `${job.companyName}-tailored.pdf`);
      return;
    }
    if (!structuredContent || !latexSource) return;

    setIsDownloading(true);
    try {
      const { blob } = await compileLatexToPdf({
        jobId,
        latexCode: latexSource,
        structuredContent,
        templateId: resolvedTemplate,
      });
      if (blob.type !== "application/pdf") {
        throw new Error("PDF compilation failed.");
      }
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `${job.companyName}-tailored.pdf`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Download failed.";
      setDownloadError(message);
      setTimeout(() => setDownloadError(null), 6000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={`grid h-[calc(100vh-4rem)] w-full transition-[grid-template-columns] duration-500 bg-[var(--color-surface-soft)] ${
        isWorkspaceMaximized
          ? "grid-cols-1 lg:grid-cols-[0fr_1fr] overflow-hidden"
          : "grid-cols-1 lg:grid-cols-[40fr_60fr]"
      }`}
    >
      {/* ─── COLUMN A: JOB INTEL & INLINE GAPS (40%) ─── */}
      <div
        className={`border-r border-slate-200/40 bg-white/80 flex flex-col h-full overflow-y-auto p-8 transition-all duration-300 ${
          isWorkspaceMaximized ? "opacity-0 pointer-events-none w-0 p-0 border-0" : "opacity-100"
        }`}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-all duration-200 group mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="space-y-6">
          {/* Company Hero */}
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold text-xl shrink-0 shadow-sm">
              {job.companyName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                {job.companyName}
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                {job.jobTitle}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                  job.pipelineState === "completed" ? "border-emerald-100 bg-emerald-50 text-emerald-700" :
                  job.pipelineState === "failed" ? "border-red-100 bg-red-50 text-red-700" :
                  job.pipelineState === "needs_user_input" ? "border-amber-100 bg-amber-50 text-amber-700" :
                  job.pipelineState === "compiling" ? "border-blue-100 bg-blue-50 text-blue-700" :
                  "border-slate-200 bg-slate-100 text-slate-600"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    job.pipelineState === "completed" ? "bg-emerald-500" :
                    job.pipelineState === "failed" ? "bg-red-500" :
                    job.pipelineState === "needs_user_input" ? "bg-amber-500 animate-pulse" :
                    job.pipelineState === "compiling" ? "bg-blue-500 animate-pulse" :
                    "bg-slate-400"
                  }`} />
                  {job.pipelineState.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          {job.pipelineState === "needs_user_input" && job.skillGapQuestions ? (
            <div className="card-bloom border border-amber-100/60 bg-amber-50/30 rounded-2xl p-5">
              <SkillGapQuestionnaire
                jobId={job._id}
                questions={job.skillGapQuestions}
              />
            </div>
          ) : null}

          {job.pipelineState === "tailoring" ? (
            <div className="card-bloom p-6 border border-slate-200/60 rounded-2xl bg-white/50 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
              <p className="text-sm font-semibold text-slate-800">
                Optimizing Bullet Points...
              </p>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Applying ATS keyword matching to your experience statements in real-time.
              </p>
            </div>
          ) : null}

          {job.pipelineState === "failed" ? (
            <div className="card-bloom p-6 border border-red-100 rounded-2xl bg-red-50/20 flex flex-col items-center justify-center text-center space-y-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <p className="text-sm font-bold text-slate-800">Pipeline Failed</p>
              <p className="text-xs text-red-600 leading-relaxed max-w-xs">
                {job.pipelineError}
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await retryJob({ jobId });
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/10 transition-all active:scale-[0.97]"
              >
                Retry Full Pipeline
              </button>
            </div>
          ) : null}

          {job.pipelineState !== "needs_user_input" &&
          job.pipelineState !== "tailoring" &&
          job.extractedRequirements?.hardSkills ? (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Code className="w-4 h-4 text-rose-500" />
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                 {job.extractedRequirements.hardSkills.map((s: string) => (
                  <span
                    key={s}
                    className="text-[11px] bg-white border border-slate-200/60 px-2.5 py-1 rounded-lg text-slate-700 font-medium shadow-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>      {/* ─── COLUMN B (60% — Visual Workspace) ─── */}
      <div className="flex flex-col h-full overflow-hidden bg-[var(--color-surface-soft)] p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/40 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={activeTemplate}
              onChange={(e) => {
                const next = e.target.value;
                if (
                  next === "ats_strict" ||
                  next === "modern_professional" ||
                  next === "modern_executive" ||
                  next === "tech_innovator"
                ) {
                  setActiveTemplate(next);
                }
              }}
              className="text-xs border border-slate-200 p-2.5 rounded-xl font-bold bg-white text-slate-700 focus:outline-none focus:border-rose-500 transition-all shadow-sm cursor-pointer"
            >
              <option value="ats_strict">ATS Strict (Classic)</option>
              <option value="modern_professional">Startup Accent</option>
              <option value="modern_executive">Finance Classic</option>
              <option value="tech_innovator">Tech Modern</option>
            </select>

          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRecompile}
              className="px-4 h-10 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center gap-2 transition-all active:scale-[0.97] shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-compile
            </button>
            <Link
              href={`/resume/${jobId}/export`}
              className="px-4 h-10 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.97] shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              Export
            </Link>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || (!pdfUrl && !structuredContent)}
              className="px-4 h-10 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all active:scale-[0.97]"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => setIsWorkspaceMaximized(!isWorkspaceMaximized)}
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-700 transition-all shadow-sm"
              title={isWorkspaceMaximized ? "Restore split" : "Maximize canvas"}
            >
              {isWorkspaceMaximized ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Download error toast */}
        {downloadError && (
          <div className="-mt-4 mb-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700 font-medium animate-[fadeIn_0.3s_ease-out]">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}

        {/* Tab bar with glass styling */}
        <div className="flex items-center gap-1 bg-white/60 border border-slate-200/40 rounded-2xl p-1 mb-6 shadow-sm">
          {([{ id: "PREVIEW" as const, label: "Visual Resume", icon: FileText },
             { id: "LATEX" as const, label: "LaTeX Source", icon: Code },
             { id: "JSON" as const, label: "JSON Payload", icon: Settings },
             { id: "OUTREACH" as const, label: "Outreach & Letter", icon: Sparkles }
          ]).map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                activeTab === id
                  ? "bg-white text-rose-600 shadow-sm border border-slate-200/40"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "PREVIEW" ? (
            <div className="h-full w-full">
              {job.pipelineState === "compiling" ? (
                <div className="h-[600px] w-full rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 animate-pulse border border-slate-200/50 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
                  <span className="text-xs text-slate-500 font-medium">
                    Silent compiler compiling PDF...
                  </span>
                </div>
              ) : structuredContent ? (
                <ReactPdfPreview
                  data={structuredContent}
                  templateId={resolvedTemplate}
                />
              ) : (
                <div className="h-[600px] w-full rounded-2xl border border-slate-200/50 flex flex-col items-center justify-center bg-white text-slate-400 text-xs gap-3 elevation-medium">
                  <FileText className="w-10 h-10 text-slate-300" />
                  <p className="font-semibold">No PDF available yet</p>
                  <p className="text-[10px] text-slate-400">Complete tailoring to generate a resume preview.</p>
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "LATEX" ? (
            <div className="h-[600px] bg-slate-950 p-6 rounded-2xl font-mono text-xs text-emerald-400 overflow-auto relative group shadow-lg">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(latexSource)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-1.5 font-bold transition-all backdrop-blur-sm"
              >
                Copy Code
              </button>
              <pre className="leading-relaxed whitespace-pre-wrap">
                {latexSource}
              </pre>
            </div>
          ) : null}

          {activeTab === "JSON" ? (
            <div className="h-[600px] bg-slate-950 p-6 rounded-2xl font-mono text-xs text-blue-400 overflow-auto shadow-lg">
              <pre>
                {structuredContent
                  ? JSON.stringify(
                      redactStructuredContentForDisplay(structuredContent),
                      null,
                      2
                    )
                  : "{}"}
              </pre>
              <p className="mt-4 text-[10px] text-slate-500">
                Contact details are masked in this preview. Full data is only used
                server-side for tailoring and compilation.
              </p>
            </div>
          ) : null}

          {activeTab === "OUTREACH" ? (
            <OutreachWorkspace jobId={jobId} resume={resume} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface OutreachWorkspaceProps {
  jobId: Id<"jobs">;
  resume: any;
}

function OutreachWorkspace({ jobId, resume }: OutreachWorkspaceProps) {
  const generateOutreachAction = useAction(api.ai.outreach.generateCoverLetterAndOutreach);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await generateOutreachAction({ jobId });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate outreach materials.");
    } finally {
      setGenerating(false);
    }
  };

  if (!resume) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 border border-slate-200/60 rounded-3xl bg-slate-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading resume variant...</p>
      </div>
    );
  }

  const coverLetter = resume.coverLetter;
  const outreachNotes = resume.outreachNotes;

  // Parse outreach notes if present
  let outreachEmail = "";
  let linkedinNote = "";
  if (outreachNotes) {
    try {
      const parsed = JSON.parse(outreachNotes);
      outreachEmail = parsed.outreachEmail || "";
      linkedinNote = parsed.linkedinNote || "";
    } catch (e) {
      console.error("Failed to parse outreachNotes:", e);
    }
  }

  const hasGenerated = !!coverLetter && !!outreachNotes;

  if (generating) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-rose-600" />
        <p className="text-sm font-bold text-slate-800">Drafting Outreach Materials...</p>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Our AI copywriter is analyzing the job description and your tailored experience to draft formal and casual templates.
        </p>
      </div>
    );
  }

  if (!hasGenerated) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 border border-slate-200/85 rounded-[32px] bg-white space-y-5 shadow-sm max-w-xl mx-auto my-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm shadow-rose-500/5">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-800">Generate Tailored Outreach Copy</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            Create a customized formal cover letter, a highly engaging cold outreach email, and a concise 300-character LinkedIn request tailored to this role.
          </p>
        </div>
        {error && (
          <p className="text-xs text-rose-600 bg-rose-50/50 border border-rose-100 px-4 py-2.5 rounded-xl">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleGenerate}
          className="bg-rose-600 hover:bg-rose-700 text-white px-6 h-12 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-rose-600/10 hover:shadow-rose-600/15 transition-all active:scale-95 mx-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate outreach materials</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* CARD 1: COVER LETTER */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Tailored Cover Letter</h4>
              <p className="text-[10px] text-slate-400">Formal three-paragraph letter</p>
            </div>
          </div>
          <CopyButton text={coverLetter} />
        </div>
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/40 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap max-h-[350px] overflow-y-auto scrollbar-thin">
          {coverLetter}
        </div>
      </div>

      {/* CARD 2: COLD EMAIL */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Cold Outreach Email</h4>
              <p className="text-[10px] text-slate-400">High-impact email template</p>
            </div>
          </div>
          <CopyButton text={outreachEmail} />
        </div>
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/40 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap max-h-[350px] overflow-y-auto scrollbar-thin">
          {outreachEmail}
        </div>
      </div>

      {/* CARD 3: LINKEDIN NOTE */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">LinkedIn Connection Note</h4>
              <p className="text-[10px] text-slate-400">Concise request (under 300 chars)</p>
            </div>
          </div>
          <CopyButton text={linkedinNote} />
        </div>
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/40 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
          {linkedinNote}
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-semibold font-mono">
          <span>Character Count:</span>
          <span className={linkedinNote.length > 300 ? "text-rose-500" : "text-slate-500"}>
            {linkedinNote.length} / 300
          </span>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
        copied
          ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm"
          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-800"
      }`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

