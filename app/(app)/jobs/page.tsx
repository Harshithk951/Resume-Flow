"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Plus,
  ExternalLink,
  Trash2,
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
  const isLoading = rawJobs === undefined;
  const jobsData = useMemo(() => {
    if (!rawJobs) return [];
    return rawJobs.filter(
      (j) =>
        j.companyName !== "RDS" &&
        !j.companyName.toLowerCase().includes("ibm") &&
        !j.jobTitle.toLowerCase().includes("software innovation") &&
        !j.jobTitle.toLowerCase().includes("cloud sales")
    );
  }, [rawJobs]);
  const updateCrmStatusMutation = useMutation(api.jobs.updateCrmStatus);
  const deleteJobMutation = useMutation(api.jobs.deleteJobAndResume);
  const createManualJobMutation = useMutation(api.jobs.createManualJob);

  // ─── Auto-purge legacy development/test jobs (e.g. RDS and test IBM records) ──
  useEffect(() => {
    if (rawJobs && rawJobs.length > 0) {
      const legacyTestJobs = rawJobs.filter(
        (j) =>
          j.companyName === "RDS" ||
          j.companyName.toLowerCase().includes("ibm") ||
          j.jobTitle.toLowerCase().includes("software innovation") ||
          j.jobTitle.toLowerCase().includes("cloud sales")
      );
      if (legacyTestJobs.length > 0) {
        legacyTestJobs.forEach((tj) => {
          deleteJobMutation({ jobId: tj._id }).catch(console.error);
        });
      }
    }
  }, [rawJobs, deleteJobMutation]);

  // ─── Filters & Search State ─────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Modal State: Add Application ───────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalCompany, setModalCompany] = useState("");
  const [modalRole, setModalRole] = useState("");
  const [modalLocation, setModalLocation] = useState("");
  const [modalUrl, setModalUrl] = useState("");
  const [modalStatus, setModalStatus] = useState<CrmStatus>("Saved");
  const [modalDate, setModalDate] = useState("");
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

    // Sort newest creation first
    list.sort((a, b) => b._creationTime - a._creationTime);
    return list;
  }, [jobsData, searchQuery]);

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
      const notesParts: string[] = [];
      if (modalLocation.trim()) notesParts.push(`Location: ${modalLocation.trim()}`);
      if (modalDate.trim()) notesParts.push(`Date: ${modalDate.trim()}`);
      if (modalNotes.trim()) notesParts.push(modalNotes.trim());
      const compiledNotes = notesParts.join("\n");

      await createManualJobMutation({
        companyName: modalCompany.trim(),
        jobTitle: modalRole.trim(),
        url: modalUrl.trim() || undefined,
        crmStatus: modalStatus,
        rawJdText: compiledNotes || undefined,
      });

      toast.success("Added application to tracker!");
      setIsAddModalOpen(false);
      setModalCompany("");
      setModalRole("");
      setModalLocation("");
      setModalUrl("");
      setModalDate("");
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Job tracker
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {isLoading
                ? "0 applications"
                : `${totalCount} ${totalCount === 1 ? "application" : "applications"}`}
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
                className="w-44 sm:w-56 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
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
      </div>

      {/* ─── MAIN CONTENT AREA ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          /* ─── SKELETON LOADING STATE (EXACT MATCH TO HIRERAFT) ─── */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[380px] sm:h-[440px] rounded-2xl bg-[#F6F5FB] animate-pulse"
              />
            ))}
          </div>
        ) : jobsData.length === 0 ? (
          /* ─── EMPTY STATE (EXACT MATCH TO HIRERAFT) ─────────── */
          <div className="w-full bg-white rounded-2xl border border-slate-200/80 py-16 sm:py-20 px-6 sm:px-12 text-center shadow-xs flex flex-col items-center justify-center space-y-6 mt-6">
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
          /* ─── NO SEARCH MATCHES ─────────────────────────────── */
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 mt-6">
            <p className="text-sm font-semibold text-slate-700">No applications match your search</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-xs font-bold text-[#5B50E6] hover:underline cursor-pointer"
            >
              Clear search
            </button>
          </div>
        ) : (
          /* ─── KANBAN BOARD VIEW ────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-8 mt-6">
            {KANBAN_STAGES.map((col) => {
              const colJobs = filteredJobs.filter(
                (j) => (j.crmStatus || "Saved") === col.id
              );
              return (
                <div
                  key={col.id}
                  className="bg-[#F8F7FC] border border-slate-200/50 rounded-2xl p-3.5 min-w-[260px] md:min-w-0 flex flex-col justify-start min-h-[440px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                      <h3 className="text-xs font-bold text-slate-800 tracking-tight">
                        {col.label}
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200/80 text-slate-600 shadow-2xs">
                      {colJobs.length}
                    </span>
                  </div>

                  {/* Cards inside column */}
                  <div className="space-y-3 flex-1">
                    {colJobs.map((job) => {
                      const crmStatus = (job.crmStatus || "Saved") as CrmStatus;
                      return (
                        <div
                          key={job._id}
                          className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs hover:shadow-xs transition-all space-y-2.5 group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-[#5B50E6] uppercase tracking-wider block truncate">
                                {job.companyName}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                                {job.jobTitle}
                              </h4>
                            </div>

                            {/* Delete Trigger - Always visible */}
                            {deleteConfirmId === job._id ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(job._id)}
                                  className="text-[9px] bg-red-600 hover:bg-red-700 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                >
                                  Del
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(job._id)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                                title="Delete application"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Badges: Match Score & Auto-logged */}
                          {(job.matchScore !== undefined || job.autoLogged) && (
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
                                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-[#5B50E6] border border-purple-100">
                                  Via Optimizer
                                </span>
                              )}
                            </div>
                          )}

                          {/* Quick Stage Mover & URL */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <select
                              value={crmStatus}
                              onChange={(e) =>
                                handleStatusChange(job._id, e.target.value as CrmStatus)
                              }
                              className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#5B50E6] cursor-pointer"
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
        )}
      </div>

      {/* ─── ADD APPLICATION MODAL (EXACT MATCH TO HIRERAFT) ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Add an application
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  value={modalCompany}
                  onChange={(e) => setModalCompany(e.target.value)}
                  placeholder="Company *"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] transition-all"
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={modalRole}
                  onChange={(e) => setModalRole(e.target.value)}
                  placeholder="Role / position *"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] transition-all"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={modalLocation}
                  onChange={(e) => setModalLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] transition-all"
                />
              </div>

              <div>
                <input
                  type="url"
                  value={modalUrl}
                  onChange={(e) => setModalUrl(e.target.value)}
                  placeholder="Job URL"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as CrmStatus)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] transition-all cursor-pointer"
                >
                  {KANBAN_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] transition-all cursor-pointer"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Notes — recruiter name, salary, follow-up date"
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] transition-all resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add application</span>
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
