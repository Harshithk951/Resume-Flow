"use client";

import { Briefcase, ArrowUpRight, FileText, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Activity {
  id: string;
  type: "job_created" | "status_updated" | "resume_tailored";
  title: string;
  timestamp: number;
}

interface RecentActivityFeedProps {
  activities: Activity[];
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

export function RecentActivityFeed({ activities = [] }: RecentActivityFeedProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "job_created":
        return <Briefcase className="w-3 h-3 text-[var(--color-ash)]" />;
      case "status_updated":
        return <ArrowUpRight className="w-3 h-3 text-blue-500" />;
      case "resume_tailored":
        return <FileText className="w-3 h-3 text-emerald-500" />;
      default:
        return <Clock className="w-3 h-3 text-[var(--color-stone)]" />;
    }
  };

  const getDotStyle = (type: string) => {
    switch (type) {
      case "job_created":
        return "bg-[var(--color-surface-card)] border-[var(--color-secondary-bg)]";
      case "status_updated":
        return "bg-blue-50 border-blue-200";
      case "resume_tailored":
        return "bg-emerald-50 border-emerald-200";
      default:
        return "bg-[var(--color-surface-soft)] border-[var(--color-hairline)]";
    }
  };

  const displayActivities = activities.slice(0, 5);

  return (
    <Card variant="elevated" className="border-[var(--color-secondary-bg)]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-[var(--color-ash)]" />
          </div>
          <CardTitle>Recent Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {displayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-[var(--color-surface-soft)]/20 rounded-xl border border-dashed border-[var(--color-hairline)]/60">
            <Clock className="w-6 h-6 text-[var(--color-ash)] mb-2" />
            <span className="text-xs font-bold text-[var(--color-charcoal)]">No activity yet</span>
            <span className="text-[10px] text-[var(--color-stone)] mt-0.5">Activities will record here.</span>
          </div>
        ) : (
          <div className="relative pl-4 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--color-surface-card)]">
            {displayActivities.map((act) => (
              <div key={act.id} className="relative flex gap-3 items-start group">
                {/* Timeline connector dot */}
                <div
                  className={`absolute -left-[29px] top-1 w-[24px] h-[24px] rounded-full border flex items-center justify-center shrink-0 z-10 bg-[var(--color-canvas)] transition-all shadow-sm ${getDotStyle(
                    act.type
                  )}`}
                >
                  {getIcon(act.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-[var(--color-ink-soft)] block leading-tight">
                    {act.title}
                  </span>
                  <span className="text-[10px] text-[var(--color-stone)] font-medium block mt-0.5">
                    {timeAgo(act.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
