"use client";

import { Check, Sparkles, Briefcase, GraduationCap, Layout, AlignLeft } from "lucide-react";

interface TemplateSelectTabProps {
  selectedTemplate: string;
  onSelectTemplate: (id: string) => void;
  spacingPreset: "compact" | "executive";
  onSpacingPresetChange: (preset: "compact" | "executive") => void;
}

const masterTemplates = [
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
    description: "A contemporary design with a stylish sidebar border and vibrant crimson accents. Great for tech startups.",
    icon: Sparkles,
    accent: "#e60023",
  },
  {
    id: "modern_executive",
    label: "Finance Classic",
    description: "Refined serif typography and a centered header layout. Excellent for senior leadership and finance.",
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
  spacingPreset,
  onSpacingPresetChange,
}: TemplateSelectTabProps) {
  return (
    <div className="space-y-6">
      {/* SPACING PRESET */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
          Spacing Preset
        </p>
        <div className="flex bg-slate-100/80 rounded-2xl p-1 border border-slate-200/40 w-full">
          <button
            type="button"
            onClick={() => onSpacingPresetChange("compact")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              spacingPreset === "compact"
                ? "bg-white text-rose-600 shadow-sm border border-slate-200/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Compact (Standard)
          </button>
          <button
            type="button"
            onClick={() => onSpacingPresetChange("executive")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              spacingPreset === "executive"
                ? "bg-white text-rose-600 shadow-sm border border-slate-200/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Executive (Spacious)
          </button>
        </div>
      </div>

      {/* TEMPLATE LIST */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
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
                className={`group relative flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200 bg-white ${
                  selected
                    ? "border-rose-500/80 ring-2 ring-rose-500/10 shadow-md shadow-rose-500/5 bg-gradient-to-br from-white to-rose-50/10"
                    : "border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                    selected
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : "bg-slate-50 border-slate-100 text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1 pr-4">
                  <span className="block text-xs font-bold text-slate-800 transition-colors group-hover:text-slate-900">
                    {tpl.label}
                  </span>
                  <span className="block mt-1 text-[11px] text-slate-500 leading-relaxed">
                    {tpl.description}
                  </span>
                </div>

                {/* Accent indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: tpl.accent }}
                  />
                  {selected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm shadow-rose-500/20">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
