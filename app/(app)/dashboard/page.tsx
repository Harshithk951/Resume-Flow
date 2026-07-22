"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { KanbanBoard } from "@/components/KanbanBoard";
import {
  LayoutDashboard,
  Coins,
  Plus,
  Briefcase,
  Search,
  ArrowRight,
  Trash2,
  X,
  Sparkles,
  Crown,
  Infinity,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Custom dashboard components
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { PipelineToolbar, type FilterKey, type SortKey } from "@/components/dashboard/PipelineToolbar";
import { AddJobModal } from "@/components/dashboard/AddJobModal";
import { ApplicationTracker } from "@/components/dashboard/ApplicationTracker";
import { NeedsAttentionPanel } from "@/components/dashboard/NeedsAttentionPanel";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { RazorpayCheckout } from "@/components/RazorpayCheckout";
import confetti from "canvas-confetti";

type CompanyFilter = "all" | "active" | "needs_input" | "completed";

export default function DashboardCommandCenter() {
  const router = useRouter();

  // Queries
  const statsData = useQuery(api.dashboard.getDashboardStats);
  const summaryData = useQuery(api.dashboard.getDashboardSummary);
  const enrichedJobs = useQuery(api.dashboard.getMyJobsEnriched);

  // Layout and view state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewTab, setViewTab] = useState<"pipeline" | "applications">("pipeline");

  // Company list filtering
  const [companyFilter, setCompanyFilter] = useState<CompanyFilter>("all");

  // Kanban toolbar state
  const [kanbanSearch, setKanbanSearch] = useState("");
  const [kanbanFilter, setKanbanFilter] = useState<FilterKey>("all");
  const [kanbanSort, setKanbanSort] = useState<SortKey>("newest");
  const [deletingDriveId, setDeletingDriveId] = useState<string | null>(null);
  const deleteJobAndResume = useMutation(api.jobs.deleteJobAndResume);

  // Payment success celebration
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);

  const fireUpgradeConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.6 },
        colors: ["#e11d48", "#f43f5e", "#fb7185", "#fbbf24"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.6 },
        colors: ["#e11d48", "#f43f5e", "#fb7185", "#fbbf24"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const handleUpgradeSuccess = useCallback(() => {
    setShowUpgradeSuccess(true);
    fireUpgradeConfetti();

    // Auto-dismiss after 8 seconds
    setTimeout(() => setShowUpgradeSuccess(false), 8000);
  }, [fireUpgradeConfetti]);

  // Scrolling references for click interactions
  const kanbanRef = useRef<HTMLDivElement>(null);
  const widgetsRef = useRef<HTMLDivElement>(null);

  // Filtered company list
  const filteredDrives = useMemo(() => {
    const drives = (statsData?.pipelinesSummary ?? []) as any[];
    switch (companyFilter) {
      case "active":
        return drives.filter((p: any) =>
          ["uploaded", "extracting", "tailoring", "compiling"].includes(p.pipelineState)
        );
      case "needs_input":
        return drives.filter((p: any) => p.pipelineState === "needs_user_input");
      case "completed":
        return drives.filter((p: any) => p.pipelineState === "completed");
      default:
        return drives;
    }
  }, [statsData, companyFilter]);

  if (statsData === undefined || summaryData === undefined || enrichedJobs === undefined) {
    return <DashboardSkeleton />;
  }

  const { metrics, pipelinesSummary, needsAttention } = statsData;
  const { user, completeness, recentActivities, statusCounts } = summaryData;
  const isFree = (user?.plan || "free") === "free";

  const handleStatClick = (statKey: string) => {
    if (statKey === "attention") {
      widgetsRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (statKey === "in_progress") {
      setViewTab("pipeline");
      setKanbanFilter("active");
      kanbanRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (statKey === "resumes") {
      setViewTab("pipeline");
      setKanbanFilter("completed");
      kanbanRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      kanbanRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const COMPANY_FILTERS: { key: CompanyFilter; label: string; desc: string }[] = [
    { key: "all", label: "All", desc: "All job drives" },
    { key: "active", label: "Active", desc: "Currently processing" },
    { key: "needs_input", label: "Needs Input", desc: "Requires your response" },
    { key: "completed", label: "Completed", desc: "Finished pipelines" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER: Mesh gradient hero ─── */}
      <div className="relative rounded-3xl p-8 overflow-hidden mesh-gradient-hero border border-[var(--color-hairline)]/30 shadow-sm">
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-[var(--color-canvas)]/30 backdrop-blur-[1px]" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-slate-900 dark:text-white leading-tight">
                Command Center
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
                Manage corporate listings, track matching, and configure pipelines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Glass credit card */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-white/40 dark:border-slate-800 shadow-sm glass-card-dark">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">{(user.credits).toLocaleString()}</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold">credits</span>
                </div>
                <div className="w-20 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(user.credits / 10000) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      user.credits > 2500 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" :
                      user.credits > 1000 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                      "bg-gradient-to-r from-rose-400 to-rose-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            <Badge variant={isFree ? "premium" : user.plan === "pro" ? "default" : "success"} size="sm">
              {user.plan || "free"}
            </Badge>

            {isFree && (
              <RazorpayCheckout
                plan="pro"
                interval="monthly"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 px-4 text-white text-sm font-bold shadow-md shadow-rose-500/20 hover:from-rose-700 hover:to-rose-600 transition-all"
                label="Upgrade"
                onSuccess={handleUpgradeSuccess}
              />
            )}

            <Button onClick={() => setIsAddOpen(true)} size="sm" className="bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-500/20 border-0 hover:from-rose-700 hover:to-rose-600">
              <Plus className="w-4 h-4" />
              <span>Add Drive</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Enhanced 6 Stats Grid Component ─── */}
      <StatsGrid
        metrics={metrics}
        pipelinesSummary={pipelinesSummary}
        needsAttention={needsAttention}
        completeness={completeness}
        onStatClick={handleStatClick}
      />

      {/* ─── Two Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Main Content Area */}
        <div className="space-y-8 min-w-0">
          
          {/* Company Drives list view */}
          <Card variant="elevated" className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-sm">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-900 dark:text-white">Company Drives</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300 font-medium">{filteredDrives.length} drive{filteredDrives.length !== 1 ? "s" : ""}</CardDescription>
                  </div>
                </div>
                {/* Filter Pills */}
                <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-inner">
                  {COMPANY_FILTERS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setCompanyFilter(f.key)}
                      className={`px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                        companyFilter === f.key
                          ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200 dark:border-slate-700"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title={f.desc}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredDrives.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-600 dark:text-slate-300">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                    <Search className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No drives match this filter</p>
                  <Button variant="ghost" size="sm" className="mt-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold" onClick={() => setCompanyFilter("all")}>
                    Clear filter
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-hairline-soft)]">
                  {filteredDrives.map((drive: any, idx: number) => {
                    const isFailed = drive.pipelineState === "failed";
                    const isCompleted = drive.pipelineState === "completed";
                    const isActive = ["uploaded", "extracting", "tailoring", "compiling"].includes(drive.pipelineState);
                    const isNeedsInput = drive.pipelineState === "needs_user_input";

                    return (
                      <div
                        key={drive.id}
                        onClick={() => router.push(`/company/${drive.id}`)}
                        className={`flex items-center justify-between px-6 py-4 group transition-all duration-200 hover:bg-[var(--color-surface-soft)]/50 cursor-pointer ${
                          idx % 2 === 0 ? "bg-[var(--color-canvas)]" : "bg-[var(--color-surface-soft)]/30"
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          {/* Company initial with ring */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ring-2 ring-offset-1 ${
                            isFailed ? "bg-red-50 text-red-600 ring-red-200" :
                            isCompleted ? "bg-emerald-50 text-emerald-600 ring-emerald-200" :
                            isNeedsInput ? "bg-amber-50 text-amber-600 ring-amber-200 animate-pulse" :
                            isActive ? "bg-amber-50 text-amber-600 ring-amber-200" :
                            "bg-[var(--color-surface-card)] text-[var(--color-ash)] ring-[var(--color-hairline)]"
                          }`}>
                            {drive.companyName?.charAt(0).toUpperCase() || "?"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                {drive.companyName}
                              </span>
                              {drive.matchScore > 0 && (
                                <Badge variant={drive.matchScore >= 80 ? "soft_green" : drive.matchScore >= 60 ? "soft_amber" : "soft_rose"} size="sm">
                                  {drive.matchScore}%
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">
                              {drive.roleTitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <Badge
                            variant={
                              isFailed ? "destructive" :
                              isCompleted ? "soft_green" :
                              isNeedsInput ? "warning" :
                              "secondary"
                            }
                            size="sm"
                          >
                            {isFailed ? "Failed" :
                             isCompleted ? "Completed" :
                             isNeedsInput ? "Needs Input" :
                             "Active"}
                          </Badge>
                          {isCompleted && (
                            <Link
                              href={`/resume/${drive.id}/export`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all whitespace-nowrap shadow-sm"
                              title="Download tailored resume PDF"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>PDF</span>
                            </Link>
                          )}
                          {/* Delete button */}
                          {deletingDriveId === drive.id ? (
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <span className="text-[10px] font-bold text-red-600">Delete?</span>
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await deleteJobAndResume({ jobId: drive.id as Id<"jobs"> });
                                  } finally {
                                    setDeletingDriveId(null);
                                  }
                                }}
                                className="text-[10px] font-bold px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setDeletingDriveId(null); }}
                                className="text-[10px] font-bold px-2 py-1 bg-[var(--color-canvas)] border border-[var(--color-hairline)] text-[var(--color-mute)] rounded-lg transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setDeletingDriveId(drive.id); }}
                              className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-[var(--color-surface-soft)] border border-[var(--color-hairline)]/40 flex items-center justify-center text-[var(--color-stone)] hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all duration-200 shadow-sm"
                              title="Delete this drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-soft)] border border-[var(--color-hairline)]/40 flex items-center justify-center text-[var(--color-stone)] group-hover:bg-rose-50 group-hover:border-rose-200 group-hover:text-rose-600 transition-all duration-200 shadow-sm">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─── Toggle View Control (Pipeline Board vs Applications CRM) ─── */}
          <div className="border-b border-[var(--color-hairline)]/60 flex items-center justify-between pb-2" ref={kanbanRef}>
            <div className="flex gap-4">
              <button
                onClick={() => setViewTab("pipeline")}
                className={`text-sm font-bold pb-2 transition-all border-b-2 relative ${
                  viewTab === "pipeline" ? "border-rose-600 text-rose-600 font-extrabold" : "border-transparent text-[var(--color-ash)] hover:text-[var(--color-ink-soft)]"
                }`}
              >
                Pipeline Board
              </button>
              <button
                onClick={() => setViewTab("applications")}
                className={`text-sm font-bold pb-2 transition-all border-b-2 relative ${
                  viewTab === "applications" ? "border-rose-600 text-rose-600 font-extrabold" : "border-transparent text-[var(--color-ash)] hover:text-[var(--color-ink-soft)]"
                }`}
              >
                Application Tracker
              </button>
            </div>
            {viewTab === "pipeline" && (
              <PipelineToolbar
                searchQuery={kanbanSearch}
                onSearchChange={setKanbanSearch}
                filterKey={kanbanFilter}
                onFilterChange={setKanbanFilter}
                sortKey={kanbanSort}
                onSortChange={setKanbanSort}
              />
            )}
          </div>

          {/* Toggle render of views */}
          {viewTab === "pipeline" ? (
            <div className="pt-2">
              <KanbanBoard
                searchQuery={kanbanSearch}
                filterKey={kanbanFilter}
                sortKey={kanbanSort}
                onAddJob={() => setIsAddOpen(true)}
              />
            </div>
          ) : (
            <div className="pt-2">
              <ApplicationTracker
                jobs={enrichedJobs}
                statusCounts={statusCounts}
              />
            </div>
          )}

        </div>

        {/* Right Rail Sidebar Widgets */}
        <div className="space-y-6 lg:sticky lg:top-4" ref={widgetsRef}>
          {/* Needs Attention Alert List widget */}
          <NeedsAttentionPanel
            attentionJobs={needsAttention}
            profileCompleteness={completeness}
            lowAtsJobs={enrichedJobs.map(j => ({ id: j._id, companyName: j.companyName, matchScore: j.atsScore ?? 0 }))}
          />

          {/* Activity Feed log timeline */}
          <RecentActivityFeed activities={recentActivities} />

          {/* Custom quick navigations actions widget */}
          <QuickActions onAddJob={() => setIsAddOpen(true)} />
        </div>
      </div>

      {/* ─── Add Company Drive Dialog Modal ─── */}
      <AddJobModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        credits={user.credits}
      />

      {/* ─── Congratulations Overlay ─── */}
      <AnimatePresence>
        {showUpgradeSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowUpgradeSuccess(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md mx-4 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-rose-500 to-pink-600 shadow-2xl shadow-rose-500/30 border border-white/20"
            >
              {/* Decorative glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-300/10 rounded-full blur-3xl" />

              <div className="relative z-10 p-8 text-center">
                {/* Close button */}
                <button
                  onClick={() => setShowUpgradeSuccess(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Crown icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
                  <Crown className="w-10 h-10 text-yellow-300" />
                </div>

                {/* Sparkles decoration */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                    Payment Successful
                  </span>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                  Congratulations!
                </h2>
                <p className="text-lg font-semibold text-white/90 mb-1">
                  You&apos;re now on <span className="text-yellow-300">Pro</span>
                </p>
                <p className="text-sm text-white/60 mb-8 max-w-xs mx-auto">
                  Unlimited resume tailoring, priority support, and all premium features unlocked!
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-3 flex flex-col items-center justify-center">
                    <Infinity className="w-6 h-6 text-white mb-1" />
                    <p className="text-[10px] font-semibold text-white/70">Resumes</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-3 flex flex-col items-center justify-center">
                    <Target className="w-6 h-6 text-yellow-300 mb-1" />
                    <p className="text-[10px] font-semibold text-white/70">ATS Optimized</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-3 flex flex-col items-center justify-center">
                    <Zap className="w-6 h-6 text-amber-300 mb-1" />
                    <p className="text-[10px] font-semibold text-white/70">Priority</p>
                  </div>
                </div>

                {/* CTA button */}
                <button
                  onClick={() => setShowUpgradeSuccess(false)}
                  className="w-full py-3 px-6 rounded-2xl bg-white text-rose-600 font-extrabold text-sm hover:bg-white/90 transition-all active:scale-[0.98] shadow-lg"
                >
                  Start Building Resumes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
