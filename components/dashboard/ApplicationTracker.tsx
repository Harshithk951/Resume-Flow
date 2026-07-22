"use client";

import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckCircle2, ChevronRight, Download, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ApplicationTrackerProps {
  jobs: Array<{
    _id: string;
    companyName: string;
    jobTitle: string;
    _creationTime: number;
    crmStatus?: string;
    pipelineState: string;
    atsScore?: number | null;
    pdfStorageId?: string | null;
  }>;
  statusCounts: { Saved: number; Applied: number; Interviewing: number; Offered: number; Rejected: number };
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

export function ApplicationTracker({
  jobs = [],
  statusCounts = { Saved: 0, Applied: 0, Interviewing: 0, Offered: 0, Rejected: 0 },
}: ApplicationTrackerProps) {
  const updateStatusMutation = useMutation(api.jobs.updateApplicationStatus);

  const completedJobs = jobs.filter((j) => j.pipelineState === "completed");

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await updateStatusMutation({
        jobId: jobId as any,
        status: newStatus as "new" | "applied" | "interview" | "offered" | "rejected",
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const statusOptions = [
    { value: "new", label: "Saved" },
    { value: "applied", label: "Applied" },
    { value: "interview", label: "Interviewing" },
    { value: "offered", label: "Offered" },
    { value: "rejected", label: "Rejected" },
  ];

  const getStatusSelectStyle = (status?: string) => {
    switch (status) {
      case "Applied":
        return "bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500/20";
      case "Interviewing":
        return "bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500/20";
      case "Offered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500/20";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200 focus:ring-red-500/20";
      default:
        return "bg-[var(--color-surface-soft)] text-[var(--color-charcoal)] border-[var(--color-hairline)] focus:ring-slate-500/20";
    }
  };

  const getStatusValueFromCrm = (crmStatus?: string): string => {
    switch (crmStatus) {
      case "Saved": return "new";
      case "Applied": return "applied";
      case "Interviewing": return "interview";
      case "Offered": return "offered";
      case "Rejected": return "rejected";
      default: return "new";
    }
  };

  return (
    <Card variant="elevated" className="overflow-hidden border-[var(--color-secondary-bg)] shadow-sm bg-[var(--color-canvas)]">
      <CardHeader className="pb-4 border-b border-[var(--color-hairline-soft)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Application Tracker</CardTitle>
            <CardDescription>Track post-matching interviews and offers</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" size="sm">
              Saved: {statusCounts.Saved}
            </Badge>
            <Badge variant="default" size="sm" className="bg-blue-600 border-transparent text-white shadow-sm">
              Applied: {statusCounts.Applied}
            </Badge>
            <Badge variant="warning" size="sm">
              Interviewing: {statusCounts.Interviewing}
            </Badge>
            <Badge variant="success" size="sm">
              Offered: {statusCounts.Offered}
            </Badge>
            <Badge variant="destructive" size="sm">
              Rejected: {statusCounts.Rejected}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {completedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-[var(--color-stone)]">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-card)] flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-[var(--color-ash)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--color-charcoal)]">No applications to track yet</p>
            <p className="text-xs text-[var(--color-stone)] mt-1 max-w-sm">
              Completed matching jobs automatically appear here so you can track your placement status.
            </p>
          </div>
        ) : (
          <>
            {/* ─── DESKTOP TABLE VIEW ─────── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-[10px] font-extrabold text-[#040404] uppercase tracking-wider">
                    <th className="px-6 py-3.5">Company</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">ATS Match</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Added</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {completedJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-[#040404]">
                        <Link
                          href={`/company/${job._id}`}
                          className="hover:text-red-600 transition-colors inline-flex items-center gap-1"
                        >
                          <span>{job.companyName}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-neutral-700 transition-opacity" />
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-[#525252] font-semibold">{job.jobTitle}</td>
                      <td className="px-6 py-4">
                        {job.atsScore ? (
                          <Badge
                            variant={
                              job.atsScore >= 80 ? "soft_green" :
                              job.atsScore >= 60 ? "soft_amber" :
                              "soft_rose"
                            }
                            size="sm"
                          >
                            {job.atsScore}%
                          </Badge>
                        ) : (
                          <span className="text-[#525252]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={getStatusValueFromCrm(job.crmStatus)}
                          onChange={(e) => handleStatusChange(job._id, e.target.value)}
                          className={`text-[10px] font-bold uppercase tracking-wider rounded-lg px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all cursor-pointer ${getStatusSelectStyle(
                            job.crmStatus
                          )}`}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white text-[#040404]">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-[#525252] font-semibold tabular-nums">{timeAgo(job._creationTime)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {job.pdfStorageId && (
                            <Link
                              href={`/resume/${job._id}/export`}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-neutral-800 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/company/${job._id}`}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-bold text-neutral-900 hover:text-red-600 transition-all shadow-sm"
                          >
                            <span>Open</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ─── MOBILE CARD STACK VIEW ─────── */}
            <div className="block sm:hidden divide-y divide-[var(--color-hairline-soft)]">
              {completedJobs.map((job) => (
                <Link
                  key={job._id}
                  href={`/company/${job._id}`}
                  className="flex items-start gap-3 px-4 py-4 hover:bg-[var(--color-surface-soft)]/50 transition-colors active:bg-[var(--color-surface-soft)]"
                >
                  {/* Company initial avatar */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 bg-rose-50 text-rose-600 border border-rose-100">
                    {job.companyName?.charAt(0).toUpperCase() || '?'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--color-ink-soft)] truncate">
                          {job.companyName}
                        </p>
                        <p className="text-xs text-[var(--color-mute)] truncate mt-0.5">
                          {job.jobTitle}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-stone)] shrink-0 mt-1" />
                    </div>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {/* ATS badge */}
                      {job.atsScore ? (
                        <Badge
                          variant={
                            job.atsScore >= 80 ? "soft_green" :
                            job.atsScore >= 60 ? "soft_amber" :
                            "soft_rose"
                          }
                          size="sm"
                        >
                          {job.atsScore}%
                        </Badge>
                      ) : null}

                      {/* Status dropdown */}
                      <select
                        value={getStatusValueFromCrm(job.crmStatus)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(job._id, e.target.value)}
                        className={`text-[10px] font-bold uppercase tracking-wider rounded-lg px-2.5 py-1.5 border transition-all ${getStatusSelectStyle(
                          job.crmStatus
                        )}`}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[var(--color-canvas)] text-[var(--color-ink)]">
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {/* Download button */}
                      {job.pdfStorageId && (
                        <Link
                          href={`/resume/${job._id}/export`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ash)] hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm text-[10px] font-bold"
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </Link>
                      )}

                      <span className="text-[10px] text-[var(--color-stone)] ml-auto">
                        {timeAgo(job._creationTime)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
