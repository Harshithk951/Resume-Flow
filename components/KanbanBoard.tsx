"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  UserCheck,
} from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type JobDoc = Doc<"jobs">;

const COLUMNS = [
  {
    key: "in_progress" as const,
    label: "In Progress",
    description: "Ingesting, tailoring, or compiling",
    icon: Clock,
    accent: "bg-amber-500",
    lightBg: "bg-amber-50/30",
    filter: (j: JobDoc) =>
      ["uploaded", "extracting", "tailoring", "compiling"].includes(j.pipelineState),
  },
  {
    key: "needs_input" as const,
    label: "Needs Input",
    description: "Waiting on your response",
    icon: UserCheck,
    accent: "bg-rose-500",
    lightBg: "bg-rose-50/30",
    filter: (j: JobDoc) => j.pipelineState === "needs_user_input",
  },
  {
    key: "resolved" as const,
    label: "Resolved",
    description: "Completed or failed pipelines",
    icon: CheckCircle2,
    accent: "bg-emerald-500",
    lightBg: "bg-emerald-50/30",
    filter: (j: JobDoc) => ["completed", "failed"].includes(j.pipelineState),
  },
] as const;

function statusLabel(state: JobDoc["pipelineState"]): string {
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

export function KanbanBoard() {
  const jobs = useQuery(api.jobs.getMyJobs) ?? [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const columnJobs = jobs.filter(col.filter);
        const Icon = col.icon;

        return (
          <div
            key={col.key}
            className={`rounded-2xl border border-slate-300 ${col.lightBg} p-4 min-h-[300px]`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.accent}`} />
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{col.label}</h3>
                  <p className="text-[10px] text-slate-400">{col.description}</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-white border border-slate-300 px-2 py-0.5 rounded-lg text-slate-600">
                {columnJobs.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {columnJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-xs">
                  <Icon className="w-6 h-6 mb-2 opacity-40" />
                  <span>No jobs</span>
                </div>
              ) : (
                columnJobs.map((job) => (
                  <motion.div
                    key={job._id}
                    layoutId={`job-${job._id}`}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <Link href={`/company/${job._id}`} className="block">
                      <Card className="hover:shadow-md border-slate-300 transition-all duration-200 group">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block truncate">
                                {job.companyName}
                              </span>
                              <h4 className="font-bold text-sm text-slate-800 tracking-tight truncate mt-0.5">
                                {job.jobTitle}
                              </h4>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <span className="text-[11px] text-slate-500">
                              {statusLabel(job.pipelineState)}
                            </span>
                            {job.pipelineState === "completed" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : job.pipelineState === "failed" ? (
                              <Badge variant="destructive" className="text-[9px]">Failed</Badge>
                            ) : job.pipelineState === "needs_user_input" ? (
                              <Badge variant="warning" className="text-[9px]">Action</Badge>
                            ) : (
                              <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
