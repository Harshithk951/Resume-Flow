"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Loader2,
  CheckCircle2,
  ChevronRight,
  Clock,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ColumnEmptyState } from "@/components/dashboard/ColumnEmptyState";

type JobDoc = Doc<"jobs">;

const COLUMNS = [
  {
    key: "in_progress" as const,
    label: "In Progress",
    description: "Ingesting, tailoring, or compiling",
    icon: Clock,
    accent: "bg-amber-500",
    lightBg: "bg-amber-50/30",
    filter: (j: any) =>
      ["uploaded", "extracting", "tailoring", "compiling"].includes(j.pipelineState),
  },
  {
    key: "needs_input" as const,
    label: "Needs Input",
    description: "Waiting on your response",
    icon: UserCheck,
    accent: "bg-rose-500",
    lightBg: "bg-rose-50/30",
    filter: (j: any) => j.pipelineState === "needs_user_input",
  },
  {
    key: "resolved" as const,
    label: "Resolved",
    description: "Completed or failed pipelines",
    icon: CheckCircle2,
    accent: "bg-emerald-500",
    lightBg: "bg-emerald-50/30",
    filter: (j: any) => ["completed", "failed"].includes(j.pipelineState),
  },
] as const;

function statusLabel(state: string): string {
  switch (state) {
    case "uploaded": return "Queued for analysis";
    case "extracting": return "Analyzing JD...";
    case "needs_user_input": return "Gaps pending";
    case "tailoring": return "Optimizing bullets...";
    case "compiling": return "Building PDF...";
    case "completed": return "Ready to download";
    case "failed": return "Failed";
    default: return "Processing";
  }
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

interface KanbanBoardProps {
  searchQuery?: string;
  filterKey?: "all" | "active" | "completed" | "failed" | "needs_action";
  sortKey?: "newest" | "oldest" | "ats_score";
  onAddJob?: () => void;
}

export function KanbanBoard({
  searchQuery = "",
  filterKey = "all",
  sortKey = "newest",
  onAddJob,
}: KanbanBoardProps) {
  const jobsData = useQuery(api.dashboard.getMyJobsEnriched) ?? [];
  const retryMutation = useMutation(api.jobs.retryJob);

  const processedJobs = useMemo(() => {
    let list = [...jobsData];

    // Search filter
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      list = list.filter(
        (j) =>
          j.companyName.toLowerCase().includes(queryLower) ||
          j.jobTitle.toLowerCase().includes(queryLower)
      );
    }

    // Nav-bar filter chips logic
    if (filterKey === "active") {
      list = list.filter((j) =>
        ["uploaded", "extracting", "tailoring", "compiling"].includes(j.pipelineState)
      );
    } else if (filterKey === "completed") {
      list = list.filter((j) => j.pipelineState === "completed");
    } else if (filterKey === "failed") {
      list = list.filter((j) => j.pipelineState === "failed");
    } else if (filterKey === "needs_action") {
      list = list.filter((j) => j.pipelineState === "needs_user_input");
    }

    // Sort logic
    if (sortKey === "newest") {
      list.sort((a, b) => b._creationTime - a._creationTime);
    } else if (sortKey === "oldest") {
      list.sort((a, b) => a._creationTime - b._creationTime);
    } else if (sortKey === "ats_score") {
      list.sort((a, b) => {
        const scoreA = a.atsScore ?? 0;
        const scoreB = b.atsScore ?? 0;
        return scoreB - scoreA;
      });
    }

    return list;
  }, [jobsData, searchQuery, filterKey, sortKey]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto snap-x snap-mandatory md:overflow-visible pb-4">
      {COLUMNS.map((col) => {
        const columnJobs = processedJobs.filter(col.filter);
        const Icon = col.icon;

        return (
          <div
            key={col.key}
            className={`rounded-2xl border border-[var(--color-secondary-bg)] ${col.lightBg} p-4 min-h-[300px] snap-start min-w-[280px] md:min-w-0`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1 sticky top-0 z-10 bg-inherit py-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.accent}`} />
                <div>
                  <h3 className="font-bold text-sm text-[var(--color-ink-soft)]">{col.label}</h3>
                  <p className="text-[10px] text-[var(--color-stone)] leading-none mt-0.5">
                    {col.description}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold bg-[var(--color-canvas)] border border-[var(--color-hairline)] px-2 py-0.5 rounded-lg text-[var(--color-mute)] shadow-sm">
                {columnJobs.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {columnJobs.length === 0 ? (
                <ColumnEmptyState columnKey={col.key} onAddJob={onAddJob} />
              ) : (
                columnJobs.map((job) => {
                  const isCompleted = job.pipelineState === "completed";
                  const isFailed = job.pipelineState === "failed";
                  const isNeedsInput = job.pipelineState === "needs_user_input";
                  const isActive = ["uploaded", "extracting", "tailoring", "compiling"].includes(job.pipelineState);

                  return (
                    <motion.div
                      key={job._id}
                      layoutId={`job-${job._id}`}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                      <Link href={`/company/${job._id}`} className="block">
                        <Card className="hover:shadow-md border-[var(--color-hairline)]/80 transition-all duration-200 group bg-[var(--color-canvas)]">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block truncate">
                                  {job.companyName}
                                </span>
                                <h4 className="font-bold text-sm text-[var(--color-ink-soft)] tracking-tight truncate mt-0.5 group-hover:text-rose-600 transition-colors">
                                  {job.jobTitle}
                                </h4>
                                <span className="text-[9px] text-[var(--color-stone)] block mt-0.5">
                                  {timeAgo(job._creationTime)}
                                </span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-[var(--color-stone)] group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                            </div>

                            {/* Enriched badges for completed cards */}
                            {isCompleted && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {job.atsScore !== null && job.atsScore > 0 && (
                                  <Badge
                                    variant={
                                      job.atsScore >= 80 ? "soft_green" :
                                      job.atsScore >= 60 ? "soft_amber" :
                                      "soft_rose"
                                    }
                                    size="sm"
                                  >
                                    ATS {job.atsScore}%
                                  </Badge>
                                )}
                                <Badge variant="secondary" size="sm">
                                  {job.crmStatus || "Saved"}
                                </Badge>
                              </div>
                            )}

                            {/* Failure details + Retry UI */}
                            {isFailed && (
                              <div className="mt-2 bg-red-50/50 rounded-lg p-2 border border-red-100">
                                <p className="text-[10px] text-red-500 leading-snug break-words">
                                  {job.pipelineError
                                    ? job.pipelineError.length > 60
                                      ? `${job.pipelineError.substring(0, 57)}...`
                                      : job.pipelineError
                                    : "An unexpected compilation error occurred"}
                                </p>
                                <button
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    try {
                                      await retryMutation({ jobId: job._id });
                                    } catch (err) {
                                      console.error("Retry failed:", err);
                                    }
                                  }}
                                  className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-rose-600 hover:text-rose-700 transition-colors bg-[var(--color-canvas)] hover:bg-rose-50 px-2 py-1 rounded-md border border-[var(--color-hairline)] shadow-sm"
                                >
                                  <RotateCcw className="w-2.5 h-2.5" />
                                  <span>Retry Ingestion</span>
                                </button>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--color-hairline-soft)]">
                              <span className="text-[10px] text-[var(--color-ash)] font-medium">
                                {statusLabel(job.pipelineState)}
                              </span>
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : isFailed ? (
                                <Badge variant="destructive" size="sm" className="text-[8px] tracking-wide shrink-0">Failed</Badge>
                              ) : isNeedsInput ? (
                                <Badge variant="warning" size="sm" className="text-[8px] tracking-wide shrink-0">Action</Badge>
                              ) : (
                                <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
