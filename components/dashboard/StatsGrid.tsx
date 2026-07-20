"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  AlertTriangle,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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

// ─── Gradient Color Map ─────────────────────────────────────
const STAT_COLORS: Record<string, string> = {
  companies:  "from-violet-500 to-purple-600",
  resumes:    "from-emerald-500 to-green-600",
  inProgress: "from-sky-500 to-blue-600",
  ats:        "from-amber-500 to-orange-600",
  attention:  "from-rose-500 to-red-600",
  profile:    "from-indigo-500 to-purple-600",
};

// ─── Animated Stat Card ─────────────────────────────────────
function AnimatedStat({
  value,
  label,
  sublabel,
  icon: Icon,
  colorKey,
  delay,
  suffix,
  extra,
  pulseIcon,
  onClick,
}: {
  value: number;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  colorKey: keyof typeof STAT_COLORS;
  delay: number;
  suffix?: string;
  extra?: React.ReactNode;
  pulseIcon?: boolean;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const animatedValue = useCountUp(value, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: delay / 1000, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card
        variant="elevated"
        className={cn(
          "group relative overflow-hidden border-[var(--color-secondary-bg)]",
          onClick ? "cursor-pointer" : "cursor-default"
        )}
        onClick={onClick}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-5 relative">
          <span className="text-[11px] font-semibold text-[var(--color-stone)] uppercase tracking-wider">
            {label}
          </span>
          <p className="text-3xl font-extrabold text-[var(--color-ink-soft)] mt-1.5 tracking-tight tabular-nums">
            {animatedValue}
            {suffix && (
              <span className="text-lg font-bold text-[var(--color-ash)] ml-0.5">{suffix}</span>
            )}
          </p>
          <span className="text-[11px] text-[var(--color-ash)] mt-0.5 block">
            {sublabel}
          </span>
          {extra && <div className="mt-2">{extra}</div>}
          <div
            className={cn(
              `absolute top-4 right-4 w-9 h-9 rounded-xl bg-gradient-to-br ${STAT_COLORS[colorKey]} shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`,
              pulseIcon && "animate-pulse"
            )}
          >
            <Icon className="w-[18px] h-[18px] text-white" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Props ──────────────────────────────────────────────────
interface StatsGridProps {
  metrics: { totalCompanies: number; resumesReady: number; avgMatch: number };
  pipelinesSummary: Array<{ pipelineState: string }>;
  needsAttention: Array<any>;
  completeness: number;
  onStatClick?: (key: string) => void;
}

// ─── Stats Grid Component ───────────────────────────────────
function StatsGrid({
  metrics = { totalCompanies: 0, resumesReady: 0, avgMatch: 0 },
  pipelinesSummary = [],
  needsAttention = [],
  completeness = 0,
  onStatClick,
}: StatsGridProps) {
  const inProgressCount = useMemo(
    () =>
      pipelinesSummary.filter((p) =>
        ["uploaded", "extracting", "tailoring", "compiling"].includes(p.pipelineState)
      ).length,
    [pipelinesSummary]
  );

  const atsScoreColor = useMemo(() => {
    if (metrics.avgMatch >= 80) return "text-emerald-600";
    if (metrics.avgMatch >= 60) return "text-amber-600";
    return "text-red-600";
  }, [metrics.avgMatch]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatedStat
        value={metrics.totalCompanies}
        label="Companies Tracked"
        sublabel="Active Corporate Pipelines"
        icon={TrendingUp}
        colorKey="companies"
        delay={0}
        onClick={onStatClick ? () => onStatClick("companies") : undefined}
      />
      <AnimatedStat
        value={metrics.resumesReady}
        label="Resumes Ready"
        sublabel="Compiled PDF Artifacts Ready"
        icon={CheckCircle2}
        colorKey="resumes"
        delay={100}
        onClick={onStatClick ? () => onStatClick("resumes") : undefined}
      />
      <AnimatedStat
        value={inProgressCount}
        label="In Progress"
        sublabel="Currently Processing"
        icon={Clock}
        colorKey="inProgress"
        delay={200}
        onClick={onStatClick ? () => onStatClick("in_progress") : undefined}
      />
      <AnimatedStat
        value={metrics.avgMatch}
        label="Avg ATS Score"
        sublabel="Average Optimization Score"
        icon={Award}
        colorKey="ats"
        delay={300}
        extra={
          <span className={cn("text-xs font-bold", atsScoreColor)}>
            {metrics.avgMatch >= 80
              ? "Excellent"
              : metrics.avgMatch >= 60
                ? "Good"
                : "Needs Work"}
          </span>
        }
        onClick={onStatClick ? () => onStatClick("ats") : undefined}
      />
      <AnimatedStat
        value={needsAttention.length}
        label="Needs Attention"
        sublabel="Require Your Input"
        icon={AlertTriangle}
        colorKey="attention"
        delay={400}
        pulseIcon={needsAttention.length > 0}
        onClick={onStatClick ? () => onStatClick("attention") : undefined}
      />
      <AnimatedStat
        value={completeness}
        label="Profile Complete"
        sublabel="Your profile completion"
        icon={User}
        colorKey="profile"
        delay={500}
        suffix="%"
        extra={
          <Progress
            value={completeness}
            color={completeness >= 80 ? "emerald" : completeness >= 50 ? "amber" : "rose"}
            className="h-1.5"
          />
        }
        onClick={onStatClick ? () => onStatClick("profile") : undefined}
      />
    </div>
  );
}

export { StatsGrid };
export type { StatsGridProps };
