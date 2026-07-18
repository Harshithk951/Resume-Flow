"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KanbanBoard } from "@/components/KanbanBoard";
import {
  CheckCircle2,
  Loader2,
  Plus,
  Coins,
  Award,
  TrendingUp,
  Briefcase,
  X,
  LayoutDashboard,
  Search,
  Zap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// ─── Animated Count-Up Hook ─────────────────────────────────
function useCountUp(target: number, isInView: boolean, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let rafId: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, target, duration]);
  return count;
}

// ─── Animated Stat Card (Bold, with gradient icon backdrop) ─
// Each stat passes its colorKey explicitly — avoids minification issues in production
const STAT_COLORS: Record<string, string> = {
  funnel:   "from-violet-500 to-purple-600",
  matrix:   "from-emerald-500 to-green-600",
  ats:      "from-amber-500 to-orange-600",
  drives:   "from-sky-500 to-blue-600",
};

function AnimatedStat({ value, label, sublabel, icon: Icon, colorKey, delay }: {
  value: number; label: string; sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  colorKey: keyof typeof STAT_COLORS; delay: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const animatedValue = useCountUp(value, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: parseInt(delay) / 1000, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card variant="elevated" className="group cursor-default relative overflow-hidden border-slate-300">
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-5 relative">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </span>
          <p className="text-3xl font-extrabold text-slate-800 mt-1.5 tracking-tight tabular-nums">
            {animatedValue}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {sublabel}
          </span>
          <div className={`absolute top-4 right-4 w-9 h-9 rounded-xl bg-gradient-to-br ${STAT_COLORS[colorKey]} shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <Icon className="w-[18px] h-[18px] text-white" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Filter Pills ───────────────────────────────────────────
type FilterKey = "all" | "active" | "needs_input" | "completed";

const FILTERS: { key: FilterKey; label: string; desc: string }[] = [
  { key: "all", label: "All", desc: "All job drives" },
  { key: "active", label: "Active", desc: "Currently processing" },
  { key: "needs_input", label: "Needs Input", desc: "Requires your response" },
  { key: "completed", label: "Completed", desc: "Finished pipelines" },
];

// ─── Main Dashboard ─────────────────────────────────────────
export default function DashboardCommandCenter() {
  const router = useRouter();
  const statsData = useQuery(api.dashboard.getDashboardStats);
  const summaryData = useQuery(api.dashboard.getDashboardSummary);
  const createJobMutation = useMutation(api.jobs.createJob);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  // ─── Filtered company drives list (MUST be before early return for hooks ordering) ───
  const filteredDrives = useMemo(() => {
    const drives = (statsData?.pipelinesSummary ?? []) as any[];
    switch (activeFilter) {
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
  }, [statsData, activeFilter]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobTitle || !jdText || isCreating) return;
    setIsCreating(true);
    try {
      await createJobMutation({ companyName, jobTitle, rawJdText: jdText, inputType: "text" });
      setIsAddOpen(false);
      setCompanyName(""); setJobTitle(""); setJdText("");
    } catch (err) { console.error(err); }
    finally { setIsCreating(false); }
  };

  if (statsData === undefined || summaryData === undefined) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
      </div>
    );
  }

  const { metrics, pipelinesSummary } = statsData;
  const { user } = summaryData;
  const isFree = (user?.plan || "free") === "free";

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER: Mesh gradient hero ─── */}
      <div className="relative rounded-3xl p-8 overflow-hidden mesh-gradient-hero border border-slate-200/30">
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-slate-900 leading-tight">
                Command Center
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage corporate listings, track matching, and configure pipelines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Glass credit card */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-slate-800 tabular-nums">{user.credits}</span>
                  <span className="text-[10px] text-slate-400 font-medium">/ 100,000</span>
                </div>
                <div className="w-20 h-1 bg-slate-200/60 rounded-full overflow-hidden mt-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(user.credits / 100000) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      user.credits > 25000 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" :
                      user.credits > 10000 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
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
              <Button size="sm" className="bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-500/20 border-0 hover:from-rose-700 hover:to-rose-600">
                <Zap className="w-3.5 h-3.5" />
                <span>Upgrade</span>
              </Button>
            )}

            <Button onClick={() => setIsAddOpen(true)} size="sm" className="bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-500/20 border-0 hover:from-rose-700 hover:to-rose-600">
              <Plus className="w-4 h-4" />
              <span>Add Drive</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ─── 4 Stat Cards with gradient icon backgrounds ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatedStat value={metrics.totalCompanies} label="Tracking Funnel" sublabel="Active Corporate Pipelines" icon={TrendingUp} colorKey="funnel" delay="0ms" />
        <AnimatedStat value={metrics.resumesReady} label="Asset Matrix" sublabel="Compiled PDF Artifacts Ready" icon={CheckCircle2} colorKey="matrix" delay="100ms" />
        <AnimatedStat value={metrics.avgMatch} label="ATS Performance" sublabel="Average Optimization Score" icon={Award} colorKey="ats" delay="200ms" />
        <AnimatedStat value={pipelinesSummary.length} label="Total Job Drives" sublabel="All-time drives created" icon={Briefcase} colorKey="drives" delay="300ms" />
      </div>

      {/* ─── Company Drives Section ─── */}
      <Card variant="elevated" className="overflow-hidden border-slate-300">
        <CardHeader className="pb-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <CardTitle>Company Drives</CardTitle>
                <CardDescription>{filteredDrives.length} drive{filteredDrives.length !== 1 ? "s" : ""}</CardDescription>
              </div>
            </div>
            {/* Filter Pills - pill-style toggle */}
            <div className="inline-flex items-center bg-slate-100/80 rounded-xl p-1 border border-slate-300/80 shadow-inner">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                    activeFilter === f.key
                      ? "bg-white text-rose-600 shadow-sm border border-slate-300"
                      : "text-slate-500 hover:text-slate-700"
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
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">No drives match this filter</p>
              <Button variant="ghost" size="sm" className="mt-2 text-rose-600" onClick={() => setActiveFilter("all")}>
                Clear filter
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredDrives.map((drive: any, idx: number) => {
                const isFailed = drive.pipelineState === "failed";
                const isCompleted = drive.pipelineState === "completed";
                const isActive = ["uploaded", "extracting", "tailoring", "compiling"].includes(drive.pipelineState);
                const isNeedsInput = drive.pipelineState === "needs_user_input";

                return (
                  <div
                    key={drive.id}
                    onClick={() => router.push(`/company/${drive.id}`)}
                    className={`flex items-center justify-between px-6 py-4 group transition-all duration-200 hover:bg-gradient-to-r hover:from-rose-50/50 hover:to-transparent cursor-pointer ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Company initial circle with status ring */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ring-2 ring-offset-1 ${
                        isFailed ? "bg-red-50 text-red-600 ring-red-200" :
                        isCompleted ? "bg-emerald-50 text-emerald-600 ring-emerald-200" :
                        isNeedsInput ? "bg-amber-50 text-amber-600 ring-amber-200 animate-pulse" :
                        isActive ? "bg-amber-50 text-amber-600 ring-amber-200" :
                        "bg-slate-100 text-slate-500 ring-slate-200"
                      }`}>
                        {drive.companyName?.charAt(0).toUpperCase() || "?"}
                      </div>

                      {/* Company + Role */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 truncate group-hover:text-rose-700 transition-colors">
                            {drive.companyName}
                          </span>
                          {drive.matchScore > 0 && (
                            <Badge variant={drive.matchScore >= 80 ? "soft_green" : drive.matchScore >= 60 ? "soft_amber" : "soft_rose"} size="sm">
                              {drive.matchScore}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {drive.roleTitle}
                        </p>
                      </div>
                    </div>

                    {/* Status + Download + Arrow */}
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
                      {/* Download PDF — visible only for completed drives */}
                      {isCompleted && (
                        <Link
                          href={`/resume/${drive.id}/export`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[10px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all whitespace-nowrap"
                          title="Download this tailored resume"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          PDF
                        </Link>
                      )}
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/40 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:border-rose-200 group-hover:text-rose-600 transition-all duration-200">
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

      {/* ─── Pipeline Section ─── */}
      <Separator className="my-2" />
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-display text-xl font-extrabold tracking-tight text-slate-800">
            Application Pipeline
          </h2>
        </div>
        <KanbanBoard />
      </div>

      {/* ─── Add Company Drive Dialog ─── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-xl mx-4"
          >
            <Card className="shadow-2xl border-slate-200/80 overflow-hidden">
              {/* Dialog header with gradient */}
              <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">Add Company Job Drive</CardTitle>
                    <CardDescription className="text-rose-100 text-xs mt-0.5">
                      Submit a new placement drive for AI matching
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => setIsAddOpen(false)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <CardContent className="p-6">
                <form onSubmit={handleCreateJob} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
                    <Input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Google" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role Title</label>
                    <Input type="text" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer Intern" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Description</label>
                    <textarea
                      required rows={6}
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all resize-none bg-white"
                      placeholder="Paste raw requirements here..."
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isCreating} className="bg-gradient-to-r from-rose-600 to-rose-500 shadow-md shadow-rose-500/20 border-0">
                      {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {isCreating ? "Starting..." : "Start Pipeline"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
