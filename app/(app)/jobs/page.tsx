"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Plus,
  ExternalLink,
  Trash2,
  Table as TableIcon,
  Columns3,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type CrmStatus = "Saved" | "Applied" | "Interviewing" | "Offered" | "Rejected";

function JobTrackerEmptyIllustration() {
  return (
    <svg
      width="240"
      height="130"
      viewBox="0 0 240 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="max-w-full h-auto select-none"
    >
      {/* Background Soft Mint Cloud / Blob */}
      <path
        d="M32 75C24 64 28 46 42 38C53 32 68 36 78 32C92 26 108 20 126 22C144 24 158 35 174 36C188 37 202 44 208 57C214 70 206 86 193 94C180 102 163 98 148 101C132 104 116 112 100 110C84 108 72 98 58 96C46 94 36 85 32 75Z"
        fill="#E8FAF3"
      />

      {/* Purple Star Sparkle (Top Left) */}
      <path
        d="M26 43C26 39 23 36 19 36C23 36 26 33 26 29C26 33 29 36 33 36C29 36 26 39 26 43Z"
        fill="#6355FF"
      />
      <circle cx="21" cy="48" r="1.5" fill="#6355FF" opacity="0.6" />

      {/* Mint Star Sparkle (Right) */}
      <path
        d="M218 45C218 41.5 215.5 39 212 39C215.5 39 218 36.5 218 33C218 36.5 220.5 39 224 39C220.5 39 218 41.5 218 45Z"
        fill="#10B981"
      />
      <circle cx="221" cy="51" r="1.5" fill="#10B981" opacity="0.6" />

      {/* Card 1 (Left - Active/In-Progress) */}
      <g filter="drop-shadow(0 4px 10px rgba(0,0,0,0.03))">
        <rect
          x="54"
          y="35"
          width="48"
          height="62"
          rx="6"
          fill="white"
          stroke="#E2E8F0"
          strokeWidth="1.2"
        />
        {/* Top Header Strip */}
        <rect x="58" y="39" width="40" height="7" rx="3" fill="#6355FF" />
        {/* Bullet Row 1 */}
        <circle cx="62" cy="53" r="2" fill="#6355FF" />
        <rect x="67" y="51.5" width="27" height="3" rx="1.5" fill="#CBD5E1" />
        {/* Bullet Row 2 */}
        <circle cx="62" cy="62" r="2" fill="#6355FF" />
        <rect x="67" y="60.5" width="22" height="3" rx="1.5" fill="#E2E8F0" />
        {/* Bullet Row 3 */}
        <circle cx="62" cy="71" r="2" fill="#6355FF" />
        <rect x="67" y="69.5" width="25" height="3" rx="1.5" fill="#E2E8F0" />
        {/* Row 4 Line */}
        <rect x="59" y="81" width="38" height="2.5" rx="1.2" fill="#F1F5F9" />
      </g>

      {/* Card 2 (Middle - In Pipeline) */}
      <g filter="drop-shadow(0 4px 10px rgba(0,0,0,0.03))">
        <rect
          x="110"
          y="30"
          width="50"
          height="67"
          rx="6"
          fill="white"
          stroke="#CBD5E1"
          strokeWidth="1.2"
          strokeDasharray="2.5 2"
        />
        <rect x="115" y="36" width="22" height="4" rx="2" fill="#E2E8F0" />
        {/* Badge / Document Icon */}
        <rect
          x="115"
          y="46"
          width="40"
          height="28"
          rx="4"
          fill="#F8FAFC"
          stroke="#E2E8F0"
          strokeWidth="1"
        />
        <rect x="120" y="52" width="20" height="3" rx="1.5" fill="#94A3B8" />
        <rect x="120" y="59" width="30" height="2.5" rx="1.2" fill="#CBD5E1" />
        <rect x="120" y="65" width="16" height="2.5" rx="1.2" fill="#E2E8F0" />
        <rect x="115" y="82" width="32" height="3" rx="1.5" fill="#F1F5F9" />
      </g>

      {/* Card 3 (Right - Target / Completed) */}
      <g filter="drop-shadow(0 4px 10px rgba(0,0,0,0.03))">
        <rect
          x="168"
          y="38"
          width="46"
          height="58"
          rx="6"
          fill="white"
          stroke="#E2E8F0"
          strokeWidth="1.2"
        />
        <rect x="173" y="44" width="26" height="4" rx="2" fill="#E2E8F0" />
        <rect x="173" y="53" width="36" height="3" rx="1.5" fill="#F1F5F9" />
        <rect x="173" y="60" width="30" height="3" rx="1.5" fill="#F1F5F9" />
        <rect x="173" y="67" width="34" height="3" rx="1.5" fill="#F1F5F9" />
        <rect x="173" y="74" width="22" height="3" rx="1.5" fill="#F1F5F9" />
      </g>

      {/* Curved Mint Dashed Arrow from Card 1 to Card 3 */}
      <path
        d="M86 42C102 24 150 22 178 46"
        stroke="#10B981"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="3.5 3.5"
      />
      {/* Arrowhead */}
      <path
        d="M174 46L180 47L178 41"
        stroke="#10B981"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const KANBAN_STAGES: Array<{
  id: CrmStatus;
  label: string;
  color: string;
  badgeBg: string;
  dotColor: string;
}> = [
  { id: "Saved", label: "Saved", color: "text-amber-700", badgeBg: "bg-amber-50 border-amber-200", dotColor: "bg-amber-500" },
  { id: "Applied", label: "Applied", color: "text-blue-700", badgeBg: "bg-blue-50 border-blue-200", dotColor: "bg-blue-500" },
  { id: "Interviewing", label: "Interviewing", color: "text-purple-700", badgeBg: "bg-purple-50 border-purple-200", dotColor: "bg-purple-500" },
  { id: "Offered", label: "Offered", color: "text-emerald-700", badgeBg: "bg-emerald-50 border-emerald-200", dotColor: "bg-emerald-500" },
  { id: "Rejected", label: "Rejected", color: "text-slate-600", badgeBg: "bg-slate-100 border-slate-200", dotColor: "bg-slate-400" },
];

export default function JobTrackerPage() {
  // ─── Convex Data ────────────────────────────────────────────
  const rawJobs = useQuery(api.jobs.getMyJobs);
  const jobsData = useMemo(() => rawJobs ?? [], [rawJobs]);
  const updateCrmStatusMutation = useMutation(api.jobs.updateCrmStatus);
  const deleteJobMutation = useMutation(api.jobs.deleteJobAndResume);
  const createManualJobMutation = useMutation(api.jobs.createManualJob);

  // ─── Filters & View State ───────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | CrmStatus>("all");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // ─── Modal State: Add Application ───────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalCompany, setModalCompany] = useState("");
  const [modalRole, setModalRole] = useState("");
  const [modalUrl, setModalUrl] = useState("");
  const [modalStatus, setModalStatus] = useState<CrmStatus>("Saved");
  const [modalNotes, setModalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<Id<"jobs"> | null>(null);

  // ─── Filtered Jobs ──────────────────────────────────────────
  const filteredJobs = useMemo(() => {
    let list = [...jobsData];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (j) =>
          j.companyName.toLowerCase().includes(q) ||
          j.jobTitle.toLowerCase().includes(q) ||
          (j.url && j.url.toLowerCase().includes(q))
      );
    }

    if (activeTab !== "all") {
      list = list.filter((j) => (j.crmStatus || "Saved") === activeTab);
    }

    // Sort newest creation first
    list.sort((a, b) => b._creationTime - a._creationTime);
    return list;
  }, [jobsData, searchQuery, activeTab]);

  // ─── Status Update Handler ──────────────────────────────────
  const handleStatusChange = async (jobId: Id<"jobs">, nextStatus: CrmStatus) => {
    try {
      await updateCrmStatusMutation({ jobId, crmStatus: nextStatus });
      toast.success(`Updated status to ${nextStatus}`);
    } catch (err: unknown) {
      console.error("Failed to update status:", err);
      const msg = err instanceof Error ? err.message : "Failed to update application status.";
      toast.error(msg);
    }
  };

  // ─── Delete Handler ─────────────────────────────────────────
  const handleDelete = async (jobId: Id<"jobs">) => {
    try {
      await deleteJobMutation({ jobId });
      toast.success("Application removed from tracker.");
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      console.error("Failed to delete job:", err);
      const msg = err instanceof Error ? err.message : "Failed to delete application.";
      toast.error(msg);
    }
  };

  // ─── Submit Manual Job ──────────────────────────────────────
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCompany.trim() || !modalRole.trim()) {
      toast.error("Company name and job title are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createManualJobMutation({
        companyName: modalCompany.trim(),
        jobTitle: modalRole.trim(),
        url: modalUrl.trim() || undefined,
        crmStatus: modalStatus,
        rawJdText: modalNotes.trim() || undefined,
      });

      toast.success("Added application to tracker!");
      setIsAddModalOpen(false);
      setModalCompany("");
      setModalRole("");
      setModalUrl("");
      setModalNotes("");
      setModalStatus("Saved");
    } catch (err: unknown) {
      console.error("Failed to create application:", err);
      const msg = err instanceof Error ? err.message : "Failed to create application.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCount = jobsData.length;

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-slate-900 pb-28">
      {/* ─── PAGE HEADER & CONTROLS ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Job tracker
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {totalCount} {totalCount === 1 ? "application" : "applications"}
            </p>
          </div>

          {/* Action Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company or ro..."
                className="w-44 sm:w-56 rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <Link
              href="/job-check"
              className="py-2 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-semibold text-xs transition-all shadow-2xs"
            >
              Should I apply?
            </Link>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.99] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add application</span>
            </button>
          </div>
        </div>

        {/* View Switcher & Filter Tabs: Only when applications exist */}
        {jobsData.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Quick Stage Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === "all"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                All ({jobsData.length})
              </button>
              {KANBAN_STAGES.map((s) => {
                const stageCount = jobsData.filter((j) => (j.crmStatus || "Saved") === s.id).length;
                const isActive = activeTab === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveTab(s.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dotColor}`} />
                    <span>{s.label}</span>
                    <span className="opacity-70 text-[10px]">({stageCount})</span>
                  </button>
                );
              })}
            </div>

            {/* View Switcher: Kanban vs Table */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setViewMode("kanban")}
                  className={`p-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all ${
                    viewMode === "kanban"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  <Columns3 className="w-3.5 h-3.5" />
                  <span>Pipeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all ${
                    viewMode === "table"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MAIN CONTENT: EMPTY STATE OR VIEWS ──────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {jobsData.length === 0 ? (
          /* EMPTY STATE CARD MATCHING SCREENSHOT */
          <div className="w-full bg-white rounded-2xl border border-slate-200/80 py-16 sm:py-20 px-6 sm:px-12 text-center shadow-xs flex flex-col items-center justify-center space-y-6">
            {/* Vector Illustration */}
            <div className="flex justify-center">
              <JobTrackerEmptyIllustration />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Nothing tracked yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Add your first application, or let the optimizer log it for you the next time you tailor a resume.
              </p>
            </div>

            <div className="flex flex-row items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="py-2.5 px-5 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-medium text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-[0.99]"
              >
                Add an application
              </button>

              <Link
                href="/optimize"
                className="py-2.5 px-5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs sm:text-sm transition-all shadow-2xs"
              >
                Optimize a resume
              </Link>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          /* NO FILTER MATCHES */
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">No applications match your filter</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveTab("all");
              }}
              className="mt-2 text-xs font-bold text-purple-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : viewMode === "kanban" ? (
          /* ─── KANBAN PIPELINE VIEW ─────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6">
            {KANBAN_STAGES.map((col) => {
              const colJobs = filteredJobs.filter(
                (j) => (j.crmStatus || "Saved") === col.id
              );
              return (
                <div
                  key={col.id}
                  className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-3.5 min-w-[260px] md:min-w-0 flex flex-col justify-start"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                      <h3 className="text-xs font-bold text-slate-800 tracking-tight">
                        {col.label}
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
                      {colJobs.length}
                    </span>
                  </div>

                  {/* Cards inside column */}
                  <div className="space-y-3">
                    {colJobs.map((job) => {
                      const crmStatus = (job.crmStatus || "Saved") as CrmStatus;
                      return (
                        <div
                          key={job._id}
                          className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs hover:shadow-xs transition-all space-y-2.5 group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block truncate">
                                {job.companyName}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                                {job.jobTitle}
                              </h4>
                            </div>

                            {/* Delete Trigger */}
                            {deleteConfirmId === job._id ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(job._id)}
                                  className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded"
                                >
                                  Del
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="text-slate-400 text-xs px-1"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(job._id)}
                                className="text-slate-300 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Badges: Match Score & Auto-logged */}
                          <div className="flex flex-wrap items-center gap-1">
                            {job.matchScore !== undefined && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  job.matchScore >= 75
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {job.matchScore}% Match
                              </span>
                            )}
                            {job.autoLogged && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                                Via Optimizer
                              </span>
                            )}
                          </div>

                          {/* Quick Stage Mover */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <select
                              value={crmStatus}
                              onChange={(e) =>
                                handleStatusChange(job._id, e.target.value as CrmStatus)
                              }
                              className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                            >
                              {KANBAN_STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  → {s.label}
                                </option>
                              ))}
                            </select>

                            {job.url && (
                              <a
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-slate-700 p-1"
                                title="View posting URL"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── TABLE VIEW ───────────────────────────────────── */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Company & Role</th>
                    <th className="py-3.5 px-4">Stage</th>
                    <th className="py-3.5 px-4">Match Score</th>
                    <th className="py-3.5 px-4">Source</th>
                    <th className="py-3.5 px-4">Date Added</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map((job) => {
                    const crmStatus = (job.crmStatus || "Saved") as CrmStatus;
                    const dateFormatted = new Date(job._creationTime).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                    return (
                      <tr key={job._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{job.companyName}</span>
                          <span className="text-slate-500 text-[11px] block">{job.jobTitle}</span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={crmStatus}
                            onChange={(e) =>
                              handleStatusChange(job._id, e.target.value as CrmStatus)
                            }
                            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            {KANBAN_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          {job.matchScore !== undefined ? (
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                job.matchScore >= 75
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {job.matchScore}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {job.autoLogged ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                              Auto-logged
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">Manual</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{dateFormatted}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {job.url && (
                              <a
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-slate-400 hover:text-slate-700"
                                title="Open URL"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(job._id)}
                              className="p-1 text-slate-400 hover:text-red-600"
                              title="Delete application"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── ADD APPLICATION MODAL ───────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Track New Application
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Name <span className="text-purple-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalCompany}
                  onChange={(e) => setModalCompany(e.target.value)}
                  placeholder="e.g. Stripe, Figma, Apple"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Title <span className="text-purple-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalRole}
                  onChange={(e) => setModalRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Posting URL (Optional)
                </label>
                <input
                  type="url"
                  value={modalUrl}
                  onChange={(e) => setModalUrl(e.target.value)}
                  placeholder="https://linkedin.com/jobs/..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Status Stage
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as CrmStatus)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  {KANBAN_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Job Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Key requirements, recruiter contacts, or referral details..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Add to Tracker</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
