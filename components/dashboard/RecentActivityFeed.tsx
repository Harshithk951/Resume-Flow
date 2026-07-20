"use client";

import React from "react";
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
        return <Briefcase className="w-3 h-3 text-slate-500" />;
      case "status_updated":
        return <ArrowUpRight className="w-3 h-3 text-blue-500" />;
      case "resume_tailored":
        return <FileText className="w-3 h-3 text-emerald-500" />;
      default:
        return <Clock className="w-3 h-3 text-slate-400" />;
    }
  };

  const getDotStyle = (type: string) => {
    switch (type) {
      case "job_created":
        return "bg-slate-100 border-slate-300";
      case "status_updated":
        return "bg-blue-50 border-blue-200";
      case "resume_tailored":
        return "bg-emerald-50 border-emerald-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const displayActivities = activities.slice(0, 5);

  return (
    <Card variant="elevated" className="border-slate-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <CardTitle>Recent Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {displayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/20 rounded-xl border border-dashed border-slate-200/60">
            <Clock className="w-6 h-6 text-slate-300 mb-2" />
            <span className="text-xs font-bold text-slate-700">No activity yet</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Activities will record here.</span>
          </div>
        ) : (
          <div className="relative pl-4 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
            {displayActivities.map((act) => (
              <div key={act.id} className="relative flex gap-3 items-start group">
                {/* Timeline connector dot */}
                <div
                  className={`absolute -left-[29px] top-1 w-[24px] h-[24px] rounded-full border flex items-center justify-center shrink-0 z-10 bg-white transition-all shadow-sm ${getDotStyle(
                    act.type
                  )}`}
                >
                  {getIcon(act.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-slate-800 block leading-tight">
                    {act.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
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
