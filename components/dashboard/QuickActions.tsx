"use client";

import Link from "next/link";
import { Plus, FileText, User, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface QuickActionsProps {
  onAddJob?: () => void;
}

const ACTIONS = [
  {
    key: "add_drive",
    label: "Add Company Drive",
    description: "Start a new pipeline",
    icon: Plus,
    gradient: "from-rose-500 to-rose-600",
    href: null as string | null,
  },
  {
    key: "templates",
    label: "Browse Templates",
    description: "Explore resume designs",
    icon: FileText,
    gradient: "from-indigo-500 to-purple-600",
    href: "/templates",
  },
  {
    key: "profile",
    label: "Edit Master Profile",
    description: "Update your info",
    icon: User,
    gradient: "from-emerald-500 to-green-600",
    href: "/resume/builder",
  },
];

export function QuickActions({ onAddJob }: QuickActionsProps) {
  return (
    <Card variant="elevated" className="border-[var(--color-secondary-bg)]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <ExternalLink className="w-3.5 h-3.5 text-[var(--color-ash)]" />
          </div>
          <CardTitle>Quick Actions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-2">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            const content = (
              <div
                className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-secondary-bg)] bg-[var(--color-canvas)] hover:bg-[var(--color-surface-soft)]/80 hover:border-[var(--color-secondary-bg)]/80 transition-all duration-200 cursor-pointer group"
              >
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-[var(--color-ink-soft)] block">
                    {action.label}
                  </span>
                  <span className="text-[10px] text-[var(--color-stone)]">
                    {action.description}
                  </span>
                </div>
              </div>
            );

            if (action.href) {
              return (
                <Link key={action.key} href={action.href} className="block">
                  {content}
                </Link>
              );
            }

            return (
              <div key={action.key} onClick={onAddJob} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onAddJob?.(); }}>
                {content}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
