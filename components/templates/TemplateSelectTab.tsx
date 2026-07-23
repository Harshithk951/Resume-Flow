"use client";

import { Check, ShieldCheck, FileText } from "lucide-react";

interface TemplateSelectTabProps {
  selectedTemplate: string;
  onSelectTemplate: (id: string) => void;
}

export default function TemplateSelectTab({
  selectedTemplate: _selectedTemplate,
  onSelectTemplate: _onSelectTemplate,
}: TemplateSelectTabProps) {
  return (
    <div className="space-y-6">
      {/* SPACING PRESET */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-stone)] mb-3 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[var(--color-stone)]" />
          Layout & Spacing
        </p>
        <div className="bg-[var(--color-surface-card)]/80 rounded-2xl p-3 border border-[var(--color-hairline)]/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[var(--color-charcoal)]">ATS-Strict Compact</span>
              <p className="text-[10px] text-[var(--color-stone)] mt-0.5">Single-column · 0.65in margins · 11pt type · Standard section spacing</p>
            </div>
            <span className="h-5 px-2 rounded-full bg-rose-100 text-rose-700 text-[9px] font-bold flex items-center">Locked</span>
          </div>
        </div>
      </div>

      {/* MASTER TEMPLATE LOCK BANNER */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-stone)] mb-3">
          Master Template
        </p>
        <div className="group relative flex items-start gap-4 p-4 rounded-2xl border border-rose-500/80 ring-2 ring-rose-500/10 shadow-md shadow-rose-500/5 bg-gradient-to-br from-white to-rose-50/10 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="block text-xs font-bold text-[var(--color-ink)]">
                ATS Strict (Master Template)
              </span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm shadow-rose-500/20">
                <Check className="w-2.5 h-2.5" />
              </span>
            </div>
            <span className="block text-[11px] text-[var(--color-ash)] leading-relaxed">
              Standardized single-column skeleton with non-breaking spaces and guaranteed 100% ATS text-parser compatibility across all applications.
            </span>
            <span className="inline-block text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mt-2">
              100% ATS Guaranteed
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <span className="h-3 w-3 rounded-full border border-white shadow-sm block bg-slate-900" title="ATS Strict Accent: Black" />
          </div>
        </div>
      </div>
    </div>
  );
}
