"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center bg-[var(--color-surface-card)]/80 rounded-xl p-1 border border-[var(--color-hairline)]/60",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200",
            activeTab === tab.key
              ? "bg-[var(--color-canvas)] text-rose-600 shadow-sm border border-[var(--color-hairline)]/60 font-bold"
              : "text-[var(--color-ash)] hover:text-[var(--color-charcoal)]"
          )}
        >
          {tab.icon && <span className="flex items-center">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export { Tabs };
export type { TabsProps, Tab };
