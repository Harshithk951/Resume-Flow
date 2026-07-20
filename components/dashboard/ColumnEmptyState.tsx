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
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-[var(--color-secondary-bg)] rounded-2xl bg-[var(--color-surface-soft)]/30">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-card)] flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-[var(--color-stone)]" />
      </div>
      <span className="text-xs font-bold text-[var(--color-charcoal)] block">
        {current.title}
      </span>
      <span className="text-[10px] text-[var(--color-stone)] mt-1 block">
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
