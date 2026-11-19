"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Clock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface OptimizationItem {
  _id: Id<"optimizations">;
  roleTitle: string;
  companyName: string;
  createdAt: number;
  expiresAt: number;
  daysRemaining: number;
  isExpired: boolean;
  score?: number;
  atsCompatibilityScore?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  outputLength?: string;
  bulletDiffs?: unknown;
  additionalContext?: string;
  jobDescriptionText?: string;
}

export default function OptimizationHistoryPage() {
  const router = useRouter();

  // ─── Convex Data ────────────────────────────────────────────
  const optimizationsData = useQuery(api.optimizations.getMyOptimizations) ?? [];
  const creditsStatus = useQuery(api.users.getCreditsStatus);
  const deleteOptimizationMutation = useMutation(api.optimizations.deleteOptimization);

  // Expanded card tracking
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<Id<"optimizations"> | null>(null);

  // ─── Delete Handler ─────────────────────────────────────────
  const handleDelete = async (id: Id<"optimizations">) => {
    try {
      await deleteOptimizationMutation({ id });
      toast.success("Optimization run deleted.");
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      console.error("Failed to delete optimization:", err);
      const msg = err instanceof Error ? err.message : "Failed to delete optimization record.";
      toast.error(msg);
    }
  };

  // ─── Re-optimize Handler ────────────────────────────────────
  const handleReoptimize = (opt: OptimizationItem) => {
    try {
      if (opt.roleTitle) sessionStorage.setItem("resumeflow_prefill_role", opt.roleTitle);
      if (opt.companyName) sessionStorage.setItem("resumeflow_prefill_company", opt.companyName);
      if (opt.jobDescriptionText) sessionStorage.setItem("resumeflow_prefill_job", opt.jobDescriptionText);
    } catch {
      // ignore
    }
    router.push("/optimize");
  };

  const totalRuns = optimizationsData.length;

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-slate-900 pb-28">
      {/* ─── PAGE HEADER ─────────────────────────────────────── */}
      <div className="border-b border-slate-200/80 bg-white/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Your optimizations
                </h1>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                  {totalRuns} {totalRuns === 1 ? "run" : "runs"}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Every optimization run you make lands here. Past optimization runs with tier-based
                retention countdowns.
              </p>
            </div>

            {/* Top Action */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/optimize"
                className="py-2.5 px-4 rounded-xl bg-[#5B50E6] hover:bg-[#4E44D6] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" />
                <span>New optimization</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* ─── RETENTION POLICY NOTICE BANNER ──────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Tier-Based Retention Policy
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Free accounts retain optimizations for <strong>1 month (30 days)</strong> · Pro accounts for{" "}
                <strong>3 months (90 days)</strong> · Power accounts for <strong>6 months (180 days)</strong>.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <span className="text-xs text-slate-500">
              Current plan: <strong className="text-slate-800 capitalize">{creditsStatus?.plan || "Free"}</strong>
            </span>
            {creditsStatus?.plan === "free" && (
              <Link
                href="/pricing"
                className="text-xs font-bold text-purple-600 hover:underline"
              >
                Extend retention →
              </Link>
            )}
          </div>
        </div>

        {/* ─── OPTIMIZATION HISTORY OR EMPTY STATE ─────────────── */}
        {optimizationsData.length === 0 ? (
          /* EMPTY STATE */
          <div className="max-w-xl mx-auto my-12 text-center bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-2xs border border-purple-100">
              <FolderOpen className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">
                No optimizations yet
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your first run takes about 27 seconds. Everything you make lands here for your plan&apos;s
                retention period.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/optimize"
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#5B50E6] hover:bg-[#4E44D6] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Optimize a resume</span>
              </Link>

              <Link
                href="/resumes"
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <span>Build one from scratch</span>
              </Link>
            </div>
          </div>
        ) : (
          /* LIST OF OPTIMIZATIONS */
          <div className="space-y-4">
            {optimizationsData.map((opt: OptimizationItem) => {
              const isExpanded = expandedCardId === opt._id;
              const dateFormatted = new Date(opt.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              const isExpiringSoon = opt.daysRemaining <= 7 && !opt.isExpired;

              return (
                <div
                  key={opt._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Role & Company */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                          {opt.companyName}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400">{dateFormatted}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {opt.roleTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {opt.outputLength && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                            Length: {opt.outputLength.replace("_", " ")}
                          </span>
                        )}
                        {opt.additionalContext && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                            Custom Context Included
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Scores & Retention Countdown */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      {/* Score Badge */}
                      {opt.score !== undefined && (
                        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                          <span className="text-xs font-black text-slate-800">
                            ATS {opt.score}%
                          </span>
                          <span className="text-[9px] text-slate-500 block uppercase -mt-0.5 font-bold">
                            Score
                          </span>
                        </div>
                      )}

                      {/* Retention Countdown Pill */}
                      <div
                        className={`px-3 py-1.5 rounded-xl border text-center ${
                          opt.isExpired
                            ? "bg-slate-100 border-slate-200 text-slate-600"
                            : isExpiringSoon
                            ? "bg-amber-50 border-amber-200 text-amber-800"
                            : "bg-emerald-50 border-emerald-200 text-emerald-800"
                        }`}
                      >
                        <span className="text-xs font-bold block">
                          {opt.isExpired
                            ? "Expired"
                            : `${opt.daysRemaining} ${
                                opt.daysRemaining === 1 ? "day" : "days"
                              } left`}
                        </span>
                        <span className="text-[9px] uppercase tracking-tight block -mt-0.5 opacity-80">
                          Retention
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReoptimize(opt)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Re-optimize</span>
                        </button>

                        <Link
                          href={`/jobs?search=${encodeURIComponent(opt.companyName)}`}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="View in Job Tracker"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Delete Trigger */}
                        {deleteConfirmId === opt._id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(opt._id)}
                              className="text-[10px] bg-red-600 text-white font-bold px-2 py-1 rounded-lg"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-slate-400 p-1 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(opt._id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete optimization"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Expand Details Trigger */}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCardId(isExpanded ? null : opt._id)
                          }
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Toggle details"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Panel: Keywords & Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                      {/* Keywords Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Matched Keywords */}
                        {opt.matchedKeywords && opt.matchedKeywords.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                              Matched ATS Keywords ({opt.matchedKeywords.length})
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {opt.matchedKeywords.map((kw: string) => (
                                <span
                                  key={kw}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] border border-emerald-200 font-medium"
                                >
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>{kw}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Missing Keywords */}
                        {opt.missingKeywords && opt.missingKeywords.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                              Missing Target Keywords ({opt.missingKeywords.length})
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {opt.missingKeywords.map((kw: string) => (
                                <span
                                  key={kw}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] border border-amber-200 font-medium"
                                >
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                  <span>{kw}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Additional Context Provided */}
                      {opt.additionalContext && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                          <strong className="text-slate-700 block mb-0.5">
                            Additional Context Provided:
                          </strong>
                          <p className="text-slate-600 leading-relaxed">
                            {opt.additionalContext}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
