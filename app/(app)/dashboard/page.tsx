"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KanbanBoard } from "@/components/KanbanBoard";
import {
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Plus,
  Activity,
  Coins,
  Award,
  Sparkles,
  TrendingUp,
  UserCheck,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { EASE_VANGUARD, magneticHover, scaleIn } from "@/lib/animations";

// Animated count-up hook
function useCountUp(target: number, isInView: boolean, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let rafId: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out-expo
      const eased = 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isInView, target, duration]);
  return count;
}

function AnimatedStat({ value, label, sublabel, icon: Icon, delay }: {
  value: number; label: string; sublabel: string;
  icon: React.ComponentType<{ className?: string }>; delay: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const animatedValue = useCountUp(value, isInView);

  return (
    <div ref={ref} className="bezel-card bezel-card-sm group stagger-enter" style={{ animationDelay: delay }}>
      <div className="bezel-card-inner relative overflow-hidden">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          {label}
        </span>
        <p className="text-4xl font-extrabold text-slate-800 mt-2 tracking-tight tabular-nums">
          {animatedValue}
        </p>
        <span className="text-xs text-slate-500 block mt-1">
          {sublabel}
        </span>
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-rose-500 group-hover:scale-110 transition-all duration-300"
          style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardCommandCenter() {
  const statsData = useQuery(api.dashboard.getDashboardStats);
  const summaryData = useQuery(api.dashboard.getDashboardSummary);
  const createJobMutation = useMutation(api.jobs.createJob);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isToppingUp, setIsToppingUp] = useState(false);
  
  const grantFreeCredits = useMutation(api.users.grantFreeCredits);
  
  const handleTopUpCredits = async () => {
    setIsToppingUp(true);
    try {
      await grantFreeCredits();
    } catch (err) {
      console.error(err);
    } finally {
      setIsToppingUp(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobTitle || !jdText || isCreating) return;
    setIsCreating(true);
    try {
      await createJobMutation({
        companyName,
        jobTitle,
        rawJdText: jdText,
        inputType: "text",
      });
      setIsAddOpen(false);
      setCompanyName("");
      setJobTitle("");
      setJdText("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  if (statsData === undefined || summaryData === undefined) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
      </div>
    );
  }

  const { metrics, needsAttention, pipelinesSummary } = statsData;
  const { completeness, statusCounts, recentActivities, user } = summaryData;
  const total = metrics.totalCompanies || 1;

  const tailoringCount = pipelinesSummary.filter(
    (p: any) => p.pipelineState === "tailoring" || p.pipelineState === "compiling"
  ).length;
  const gapsCount = pipelinesSummary.filter(
    (p: any) => p.pipelineState === "needs_user_input"
  ).length;
  const completedCount = pipelinesSummary.filter(
    (p: any) => p.pipelineState === "completed"
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 selection:bg-[var(--color-primary)] selection:text-white">
      {/* Header (Awards Design: Typography Architecture & Micro-details) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-slate-900 leading-tight">
            Placement Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage active corporate listings, track matching status, and edit configurations.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Credit balance display (T1.3.5) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-sm text-sm">
              <Coins className="w-4 h-4 text-rose-500" />
              <span className="font-bold text-slate-800">{user.credits}</span>
              <span className="text-slate-400 text-xs">Credits</span>
            </div>
            
            <button
              type="button"
              onClick={handleTopUpCredits}
              disabled={isToppingUp}
              className="px-3.5 h-11 text-[11px] font-bold text-rose-600 hover:text-white border border-rose-200 hover:bg-rose-600 rounded-2xl transition-all duration-200 active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
              title="Add Free Credits"
            >
              {isToppingUp ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Add 100 Credits</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white px-5 h-11 text-xs rounded-full font-bold flex items-center gap-2 shadow-lg shadow-rose-600/20 shrink-0 transition-all duration-300 active:scale-[0.97]"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Company Drive</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Bento-style (Awards Design: Visual Composition) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Side: Stats & Metrics */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Row Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AnimatedStat
              value={metrics.totalCompanies}
              label="Tracking Funnel"
              sublabel="Active Corporate Pipelines"
              icon={TrendingUp}
              delay="0ms"
            />
            <AnimatedStat
              value={metrics.resumesReady}
              label="Asset Matrix"
              sublabel="Compiled PDF Artifacts Ready"
              icon={CheckCircle2}
              delay="100ms"
            />
            <AnimatedStat
              value={metrics.avgMatch}
              label="ATS Performance"
              sublabel="Average Optimization Score"
              icon={Award}
              delay="200ms"
            />
          </div>

          {/* Funnel Metrics Card */}
          <div className="bezel-card">
            <div className="bezel-card-inner space-y-4">
            <h3 className="font-bold text-sm tracking-tight text-slate-800 uppercase">
              Application Funnel Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-600">Tailoring &amp; Analysis</span>
                  <span className="text-slate-700 font-mono font-semibold">
                    {tailoringCount}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-500"
                    style={{ width: `${(tailoringCount / total) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-600">Action Required</span>
                  <span className="text-slate-700 font-mono font-semibold">
                    {gapsCount}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full transition-all duration-500"
                    style={{ width: `${(gapsCount / total) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-600">Completed Specifications</span>
                  <span className="text-slate-700 font-mono font-semibold">
                    {completedCount}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${(completedCount / total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Right Side: Profile Completeness, Warnings, Activity Feed */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* PROFILE COMPLETENESS BENTO CARD (T1.3.6) */}
          <div className="bezel-card">
            <div className="bezel-card-inner space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold tracking-tight text-slate-800 uppercase flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-rose-500" />
                Profile Completeness
              </h3>
              <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {completeness}%
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Animated Progress Circle */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#e60023"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 100 - completeness }}
                    transition={{ ease: EASE_VANGUARD, duration: 1.2 }}
                  />
                </svg>
                <span className="absolute text-xs font-bold">{completeness}%</span>
              </div>

              <div className="text-xs space-y-1">
                <h4 className="font-bold text-slate-800">
                  {completeness === 100 ? "Your Profile is Complete!" : "Complete your profile"}
                </h4>
                <p className="text-slate-500">
                  {completeness === 100 
                    ? "Your resume data is fully optimized for campus placement drives." 
                    : "Add missing segments in Master Profile tab to unlock advanced matching scores."}
                </p>
              </div>
            </div>

            <Link
              href="/resume/builder"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 mt-2 group"
            >
              <span>Edit Master Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          </div>

          {/* WARNINGS / NEEDS ATTENTION */}
          <div className="bezel-card">
            <div className="bezel-card-inner space-y-4">
            <h3 className="text-xs font-bold tracking-tight text-slate-800 uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Attention Required
            </h3>
            {needsAttention.length === 0 ? (
              <div className="flex items-center space-x-3 py-1 text-slate-500 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>All pipelines running smoothly. No warnings.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto pr-1">
                {needsAttention.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/company/${item.id}`}
                    className="flex items-center justify-between py-2.5 group hover:bg-slate-50/60 px-1 rounded-xl transition-colors duration-150"
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {item.companyName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.roleTitle}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                          item.pipelineState === "failed"
                            ? "bg-rose-50/50 border-rose-100 text-rose-600"
                            : "bg-amber-50/50 border-amber-100 text-amber-600"
                        }`}
                      >
                        {item.pipelineState === "failed" ? "Fault" : "Review"}
                      </span>
                      <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-rose-500 transition-colors duration-150" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            </div>
          </div>

          {/* RECENT ACTIVITY LEDGER (T1.3.5) */}
          <div className="bezel-card">
            <div className="bezel-card-inner space-y-4">
            <h3 className="text-xs font-bold tracking-tight text-slate-800 uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
              Activity Ledger
            </h3>
            
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No placement activities logged yet.</p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-y-1 before:left-[11px] before:w-[1px] before:bg-slate-200">
                {recentActivities.map((act: any) => (
                  <div key={act.id} className="flex gap-3 text-xs items-start relative pl-1">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 z-10">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="text-slate-800 font-medium leading-normal">{act.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>

        </div>
      </div>

      {/* Kanban Pipeline Section */}
      <div className="pt-6 border-t border-slate-200/60">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-800 mb-4">
          Application Pipeline
        </h2>
        <KanbanBoard />
      </div>

      {/* Add Company Drive Dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bezel-card max-w-xl w-full mx-4 shadow-2xl">
            <div className="bezel-card-inner space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              Add Company Job Drive
            </h2>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 h-11 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 h-11 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Job Description
                </label>
                <textarea
                  required
                  rows={6}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                  placeholder="Paste raw requirements here..."
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 h-11 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-5 h-11 text-xs rounded-full font-bold flex items-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-50"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Start Pipeline"
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
