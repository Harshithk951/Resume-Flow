"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sparkles } from "lucide-react";

interface CreditsBadgeProps {
  className?: string;
  onClick?: () => void;
}

export function CreditsBadge({ className = "", onClick }: CreditsBadgeProps) {
  const status = useQuery(api.users.getCreditsStatus);

  if (status === undefined) {
    return (
      <div
        className={`h-7 w-28 animate-pulse rounded-full border border-slate-200/60 bg-slate-100 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const { plan, freeOptimizationsRemaining, daysRemaining, isPro, isPower, isTeam } = status;

  let label: string;
  let pillStyle =
    "border-slate-200 bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 hover:border-slate-300 hover:shadow-[0_0_12px_rgba(148,163,184,0.35)]";

  if (plan === "pro_pass") {
    label = `Pro Pass · ${daysRemaining}d left`;
    pillStyle =
      "border-purple-200/90 bg-purple-50/90 text-purple-700 hover:bg-purple-100 hover:border-purple-300 hover:shadow-[0_0_12px_rgba(147,51,234,0.25)]";
  } else if (plan === "power" || isPower) {
    label = "Power · Unlimited";
    pillStyle =
      "border-purple-200/90 bg-purple-50/90 text-purple-700 hover:bg-purple-100 hover:border-purple-300 hover:shadow-[0_0_12px_rgba(168,85,247,0.25)]";
  } else if (plan === "team" || isTeam) {
    label = "Team · Active";
    pillStyle =
      "border-blue-200/90 bg-blue-50/90 text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:shadow-[0_0_12px_rgba(59,130,246,0.25)]";
  } else if (plan === "pro" || isPro) {
    label = "Pro · Active";
    pillStyle =
      "border-purple-200/90 bg-purple-50/90 text-purple-700 hover:bg-purple-100 hover:border-purple-300 hover:shadow-[0_0_12px_rgba(147,51,234,0.25)]";
  } else if (plan === "campus") {
    label = "Campus · Active";
    pillStyle =
      "border-emerald-200/90 bg-emerald-50/90 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]";
  } else {
    // Free plan: "Free · " + freeOptimizationsRemaining + " of 2 left"
    const remaining = freeOptimizationsRemaining ?? 2;
    label = `Free · ${remaining} of 2 left`;
    pillStyle =
      remaining > 0
        ? "border-purple-200/80 bg-[#F0EEFF] text-[#5B50E6] hover:bg-purple-100/90 hover:border-purple-300 shadow-2xs"
        : "border-amber-200/90 bg-amber-50/90 text-amber-800 hover:bg-amber-100 hover:border-amber-300 shadow-2xs";
  }

  return (
    <Link
      href="/pricing"
      onClick={onClick}
      title="View plans & credits"
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer select-none ${pillStyle} ${className}`}
    >
      <Sparkles className="w-3 h-3 shrink-0 opacity-70" />
      <span>{label}</span>
    </Link>
  );
}
