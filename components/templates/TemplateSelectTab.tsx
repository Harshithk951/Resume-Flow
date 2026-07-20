"use client";

import { Check, Sparkles, Briefcase, GraduationCap, Layout, FileText } from "lucide-react";
import { TEMPLATE_QUALITY_BADGES } from "@/lib/quality/templateProfiles";

interface TemplateSelectTabProps {
  selectedTemplate: string;
  onSelectTemplate: (id: string) => void;
}

interface MasterTemplate {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

const masterTemplates: MasterTemplate[] = [
  {
    id: "ats_strict",
    label: "ATS Strict (Classic)",
    description: "A highly structured, classic layout optimized for ATS parsers. Ideal for traditional industries.",
    icon: Briefcase,
    accent: "black",
  },
  {
    id: "modern_professional",
    label: "Startup Accent",
    description: "A contemporary design with stylish rose accents. Great for tech startups and modern teams.",
    icon: Sparkles,
    accent: "#e60023",
  },
  {
    id: "modern_executive",
    label: "Finance Classic",
    description: "Refined serif typography with deep navy accents. Excellent for senior leadership and finance.",
    icon: GraduationCap,
    accent: "#0f172a",
  },
  {
    id: "tech_innovator",
    label: "Tech Modern",
    description: "A clean developer-centric layout with monospace tags and subtle indigo accents. Perfect for engineers.",
    icon: Layout,
    accent: "#4f46e5",
  },
];

export default function TemplateSelectTab({
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectTabProps) {
  return (
    <div className="space-y-6">
      {/* SPACING PRESET — Simplified to single option */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-stone)] mb-3 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[var(--color-stone)]" />
          Layout & Spacing
        </p>
        <div className="bg-[var(--color-surface-card)]/80 rounded-2xl p-3 border border-[var(--color-hairline)]/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[var(--color-charcoal)]">Compact (Standard)</span>
              <p className="text-[10px] text-[var(--color-stone)] mt-0.5">Single-column · 0.5in margins · 10pt type · Tight section spacing</p>
            </div>
            <span className="h-5 px-2 rounded-full bg-rose-100 text-rose-700 text-[9px] font-bold flex items-center">Default</span>
          </div>
        </div>
      </div>

      {/* TEMPLATE LIST */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-stone)] mb-3">
          Select Template
        </p>
        <div className="grid grid-cols-1 gap-3.5">
          {masterTemplates.map((tpl) => {
            const selected = selectedTemplate === tpl.id;
            const Icon = tpl.icon;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onSelectTemplate(tpl.id)}
                className={`group relative flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200 bg-[var(--color-canvas)] ${
                  selected
                    ? "border-rose-500/80 ring-2 ring-rose-500/10 shadow-md shadow-rose-500/5 bg-gradient-to-br from-white to-rose-50/10"
                    : "border-[var(--color-hairline)]/80 hover:border-[var(--color-secondary-bg)] hover:shadow-sm"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                    selected
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : "bg-[var(--color-surface-soft)] border-[var(--color-hairline-soft)] text-[var(--color-stone)] group-hover:text-[var(--color-mute)]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="block text-xs font-bold text-[var(--color-ink-soft)] transition-colors group-hover:text-[var(--color-ink)]">
                      {tpl.label}
                    </span>
                    {selected && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm shadow-rose-500/20">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <span className="block text-[11px] text-[var(--color-ash)] leading-relaxed">
                    {tpl.description}
                  </span>
                  {TEMPLATE_QUALITY_BADGES[tpl.id]?.onePageGuaranteed && (
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[var(--color-surface-card)] text-[var(--color-mute)] border border-[var(--color-hairline)] mt-2">
                      1-page
                    </span>
                  )}
                </div>

                {/* Accent indicator */}
                <div className="absolute top-4 right-4">
                  <span
                    className="h-3 w-3 rounded-full border border-white shadow-sm block"
                    style={{ backgroundColor: tpl.accent }}
                    title={`Accent: ${tpl.accent}`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
