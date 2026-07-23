"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AlertTriangle, UserCheck, User, Award, CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AttentionJob {
  id: string;
  companyName: string;
  roleTitle: string;
  pipelineState: string;
}

interface NeedsAttentionPanelProps {
  attentionJobs: AttentionJob[];
  profileCompleteness: number;
  lowAtsJobs?: Array<{ id: string; companyName: string; matchScore: number }>;
}

export function NeedsAttentionPanel({
  attentionJobs = [],
  profileCompleteness = 0,
  lowAtsJobs = [],
}: NeedsAttentionPanelProps) {
  const retryMutation = useMutation(api.jobs.retryJob);
  const deleteJobAndResume = useMutation(api.jobs.deleteJobAndResume);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRetry = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await retryMutation({ jobId: jobId as any });
    } catch (err) {
      console.error("Retry failed:", err);
    }
  };

  const handleDelete = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteJobAndResume({ jobId: jobId as Id<"jobs"> });
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Compile attention items
  const items: Array<{
    id: string;
    jobId?: string;
    type: "failed" | "needs_input" | "profile" | "low_ats";
    title: string;
    description: string;
    href: string;
    action?: React.ReactNode;
  }> = [];

  // 1. Failed pipelines
  attentionJobs
    .filter((j) => j.pipelineState === "failed")
    .forEach((job) => {
      items.push({
        id: `failed-${job.id}`,
        jobId: job.id,
        type: "failed",
        title: `${job.companyName} Ingestion Failed`,
        description: "Pipeline compilation failed. Click to retry.",
        href: `/company/${job.id}`,
        action: (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => handleRetry(job.id, e)}
            className="h-7 px-2.5 text-[9px] font-bold text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50/50 bg-[var(--color-canvas)]"
          >
            <RotateCcw className="w-2.5 h-2.5 mr-1" />
            Retry Ingest
          </Button>
        ),
      });
    });

  // 2. Skill gaps pending user input
  attentionJobs
    .filter((j) => j.pipelineState === "needs_user_input")
    .forEach((job) => {
      items.push({
        id: `input-${job.id}`,
        jobId: job.id,
        type: "needs_input",
        title: `${job.companyName} Skill Gaps Pending`,
        description: "Answer questionnaire to tailor resume.",
        href: `/company/${job.id}`,
      });
    });

  // 3. Profile incomplete
  if (profileCompleteness < 100) {
    items.push({
      id: "profile-incomplete",
      type: "profile",
      title: "Master Profile Incomplete",
      description: `Complete profile elements (${profileCompleteness}% complete).`,
      href: "/resume/builder",
    });
  }

  // 4. Low ATS scores (< 60)
  lowAtsJobs
    .filter((j) => j.matchScore < 60)
    .forEach((job) => {
      items.push({
        id: `low-ats-${job.id}`,
        jobId: job.id,
        type: "low_ats",
        title: `${job.companyName} Match Score Low`,
        description: `Optimize bullet points (${job.matchScore}% score).`,
        href: `/company/${job.id}`,
      });
    });

  const displayItems = items.slice(0, 5);

  const getBorderColor = (type: string) => {
    switch (type) {
      case "failed":
        return "border-l-red-500 bg-red-50/30";
      case "needs_input":
        return "border-l-amber-500 bg-amber-50/30";
      case "low_ats":
        return "border-l-orange-500 bg-orange-50/30";
      default:
        return "border-l-blue-500 bg-blue-50/30";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />;
      case "needs_input":
        return <UserCheck className="w-4 h-4 text-amber-500 shrink-0" />;
      case "low_ats":
        return <Award className="w-4 h-4 text-orange-500 shrink-0" />;
      default:
        return <User className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <Card variant="elevated" className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-[#040404]" />
          </div>
          <CardTitle className="text-[#040404] font-extrabold">Needs Attention</CardTitle>
        </div>
        {items.length > 0 && (
          <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full animate-pulse">
            {items.length} Action{items.length !== 1 ? "s" : ""}
          </span>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" />
            <span className="text-xs font-bold text-[#040404]">All caught up!</span>
            <span className="text-[10px] text-[#525252] font-medium mt-0.5">No items need your attention.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-xl border-l-3 border border-slate-200 transition-all hover:bg-slate-50 ${getBorderColor(
                  item.type
                )}`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1 pr-2">
                  <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={item.href}
                      className="text-xs font-bold text-[#040404] hover:text-red-600 transition-colors block truncate"
                    >
                      {item.title}
                    </Link>
                    <span className="text-[10px] text-[#525252] font-medium block truncate mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.action ? (
                    <div>{item.action}</div>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-[10px] font-bold text-red-600 hover:underline transition-colors flex items-center"
                    >
                      Resolve
                    </Link>
                  )}
                  {item.jobId && (
                    <>
                      {deletingId === item.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[9px] font-bold text-red-600">Delete?</span>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(item.jobId!, e)}
                            className="text-[9px] font-bold px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                            className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingId(item.id); }}
                          className="p-1 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors"
                          title="Delete this drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
