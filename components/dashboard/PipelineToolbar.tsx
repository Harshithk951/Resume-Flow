"use client";

import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────
type FilterKey = "all" | "active" | "completed" | "failed" | "needs_action";
type SortKey = "newest" | "oldest" | "ats_score";

interface PipelineToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterKey: FilterKey;
  onFilterChange: (key: FilterKey) => void;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
}

// ─── Filter & Sort Definitions ──────────────────────────────
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Done" },
  { key: "failed", label: "Failed" },
  { key: "needs_action", label: "Action" },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest First" },
  { key: "oldest", label: "Oldest First" },
  { key: "ats_score", label: "ATS Score" },
];

// ─── Component ──────────────────────────────────────────────
function PipelineToolbar({
  searchQuery,
  onSearchChange,
  filterKey,
  onFilterChange,
  sortKey,
  onSortChange,
}: PipelineToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-0 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-stone)] pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search pipelines…"
          className="pl-9 h-9 text-xs"
        />
      </div>

      {/* Filter Pills + Sort — wrap together on mobile */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Filter Pills */}
        <div className="inline-flex items-center bg-[var(--color-surface-card)]/80 rounded-xl p-1 border border-[var(--color-secondary-bg)]/80 shadow-inner">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200",
                filterKey === f.key
                  ? "bg-[var(--color-canvas)] text-rose-600 shadow-sm border border-[var(--color-secondary-bg)]"
                  : "text-[var(--color-ash)] hover:text-[var(--color-charcoal)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="relative flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-[var(--color-stone)] pointer-events-none" />
          <select
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--color-mute)] appearance-none cursor-pointer pr-7 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <svg
            className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-stone)] pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export { PipelineToolbar };
export type { PipelineToolbarProps, FilterKey, SortKey };
