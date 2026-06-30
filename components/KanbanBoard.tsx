"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

type JobDoc = Doc<"jobs">;

type ColumnKey = "ingestion" | "gaps" | "tailoring" | "completed" | "failed";

function getColumns(jobs: JobDoc[]) {
  return {
    ingestion: jobs.filter(
      (j) => j.pipelineState === "uploaded" || j.pipelineState === "extracting"
    ),
    gaps: jobs.filter((j) => j.pipelineState === "needs_user_input"),
    tailoring: jobs.filter(
      (j) => j.pipelineState === "tailoring" || j.pipelineState === "compiling"
    ),
    completed: jobs.filter((j) => j.pipelineState === "completed"),
    failed: jobs.filter((j) => j.pipelineState === "failed"),
  };
}

const columnHeaders: { key: ColumnKey; label: string }[] = [
  { key: "ingestion", label: "Ingestion & Analysis" },
  { key: "gaps", label: "Gaps Review" },
  { key: "tailoring", label: "Tailoring Resume" },
  { key: "completed", label: "Completed Resumes" },
  { key: "failed", label: "Failed Pipelines" },
];

function statusLabel(state: JobDoc["pipelineState"]): string {
  switch (state) {
    case "extracting":
      return "Analyzing JD...";
    case "needs_user_input":
      return "Gaps pending";
    case "tailoring":
      return "Optimizing bullets...";
    case "compiling":
      return "Building PDF...";
    case "completed":
      return "Ready to download";
    case "failed":
      return "Failed";
    default:
      return "Queued";
  }
}

export function KanbanBoard() {
  const jobs = useQuery(api.jobs.getMyJobs) ?? [];
  const columns = getColumns(jobs);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-8 overflow-x-auto pb-6">
      {columnHeaders.map((col) => (
        <div
          key={col.key}
          className="flex flex-col bg-slate-100/50 rounded-3xl p-4 border border-slate-100 min-h-[500px]"
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-sm text-slate-800 tracking-tight">
              {col.label}
            </h3>
            <span className="text-xs bg-slate-200/80 px-2 py-1 rounded-lg text-slate-600 font-semibold">
              {columns[col.key].length}
            </span>
          </div>

          <div className="flex-1 space-y-4">
            {columns[col.key].map((job) => (
              <motion.div
                key={job._id}
                layoutId={`job-${job._id}`}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
              >
                <Link href={`/company/${job._id}`} className="block">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                      {job.companyName}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm tracking-tight line-clamp-1">
                    {job.jobTitle}
                  </h4>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {statusLabel(job.pipelineState)}
                    </span>
                    {job.pipelineState === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : job.pipelineState === "failed" ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
