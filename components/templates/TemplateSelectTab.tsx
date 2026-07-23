"use client";

import { Check, ShieldCheck, FileText, Sparkles, Briefcase, Layout } from "lucide-react";

interface TemplateSelectTabProps {
  selectedTemplate: string;
  onSelectTemplate: (id: string) => void;
}

interface TemplateOption {
  id: string;
  label: string;
  fontTag: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  badge?: string;
}

const templates: TemplateOption[] = [
  {
    id: "ats_strict",
    label: "ATS Strict",
    fontTag: "Computer Modern (Serif)",
    description: "Classic single-column layout with disabled ligatures. Maximum ATS text-parser compatibility for corporate & enterprise roles.",
    icon: ShieldCheck,
    accent: "#0f172a",
    badge: "Enterprise Standard",
  },
  {
    id: "startup",
    label: "Startup",
    fontTag: "Helvetica (Sans-Serif)",
    description: "Modern sans-serif typography with tight 0.6in margins. Engineered for SaaS, product companies, and high-growth startups.",
    icon: Sparkles,
    accent: "#4f46e5",
    badge: "SaaS & Product",
  },
  {
    id: "finance_tech",
    label: "Finance Tech",
    fontTag: "Times (Serif)",
    description: "Refined Times serif typography with disabled ligatures. Ideal for fintech, quantitative roles, and institutional tech.",
    icon: Briefcase,
    accent: "#0284c7",
    badge: "Fintech & Quant",
  },
  {
    id: "tech_modern",
    label: "Tech Modern",
    fontTag: "Latin Modern (Accent-Bar)",
    description: "Developer-centric minimalist layout with Latin Modern typography and accent-bar section headers. Optimized for software engineering and systems roles.",
    icon: Layout,
    accent: "#38bdf8",
    badge: "Engineering Minimalist",
  },
];

export default function TemplateSelectTab({
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectTabProps) {
  const currentTemplate = selectedTemplate || "ats_strict";

  return (
    <div className="space-y-6">
      {/* SPACING & TYPOGRAPHY PRESET */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-stone)] mb-3 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[var(--color-stone)]" />
          Preamble & Typography
        </p>
        <div className="bg-[var(--color-surface-card)]/80 rounded-2xl p-3 border border-[var(--color-hairline)]/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[var(--color-charcoal)]">Deterministic Macro Skeleton</span>
              <p className="text-[10px] text-[var(--color-stone)] mt-0.5">Single-pass character escaping · Non-breaking skill colons · Auto-omitted empty sections</p>
            </div>
            <span className="h-5 px-2 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold flex items-center">Active</span>
          </div>
        </div>
      </div>

      {/* TEMPLATE LIST */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-stone)] mb-3">
          Select Template
        </p>
        <div className="grid grid-cols-1 gap-3.5">
          {templates.map((tpl) => {
            const selected = currentTemplate === tpl.id || (currentTemplate === "modern_professional" && tpl.id === "startup");
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
                  <div className="flex items-center gap-2 mb-1">
                    <span className="block text-xs font-bold text-[var(--color-ink-soft)] transition-colors group-hover:text-[var(--color-ink)]">
                      {tpl.label}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">({tpl.fontTag})</span>
                    {selected && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm shadow-rose-500/20">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <span className="block text-[11px] text-[var(--color-ash)] leading-relaxed">
                    {tpl.description}
                  </span>
                  {tpl.badge && (
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 mt-2">
                      {tpl.badge}
                    </span>
                  )}
                </div>

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
