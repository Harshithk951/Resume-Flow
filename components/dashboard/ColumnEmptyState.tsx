"use client";

import { Clock, UserCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ColumnEmptyStateProps {
  columnKey: "in_progress" | "needs_input" | "resolved";
  onAddJob?: () => void;
}

export function ColumnEmptyState({ columnKey, onAddJob }: ColumnEmptyStateProps) {
  const config = {
    in_progress: {
      icon: Clock,
      title: "No active pipelines",
      subtitle: "Add a company drive to start",
      actionLabel: "Add Drive",
    },
    needs_input: {
      icon: UserCheck,
      title: "No skill gaps pending",
      subtitle: "Great — you're all caught up!",
      actionLabel: null,
    },
    resolved: {
      icon: CheckCircle2,
      title: "No completed or failed jobs",
      subtitle: "Start your first pipeline",
      actionLabel: "Add Drive",
    },
  };

  const current = config[columnKey];
  const Icon = current.icon;

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <span className="text-xs font-bold text-slate-700 block">
        {current.title}
      </span>
      <span className="text-[10px] text-slate-400 mt-1 block">
        {current.subtitle}
      </span>
      {current.actionLabel && onAddJob && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddJob}
          className="mt-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 text-[10px] font-bold"
        >
          {current.actionLabel}
        </Button>
      )}
    </div>
  );
}
