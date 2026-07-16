"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Sparkles, Shield, Building2, Cpu } from "lucide-react";
import { getTemplatesHref } from "@/lib/templates/navigation";

export interface CarouselTemplate {
  id: string;
  label: string;
  image: string;
  withPhoto?: boolean;
  twoColumn?: boolean;
  ats?: boolean;
  creative?: boolean;
}

interface TemplateCarouselProps {
  templates: CarouselTemplate[];
}

const templateIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ats_strict: Shield,
  modern_professional: Sparkles,
  modern_executive: Building2,
  tech_innovator: Cpu,
};

const templateBgColors: Record<string, string> = {
  ats_strict: "bg-slate-50 text-slate-800 hover:bg-slate-100",
  modern_professional: "bg-rose-50 text-rose-800 hover:bg-rose-100",
  modern_executive: "bg-blue-50 text-blue-800 hover:bg-blue-100",
  tech_innovator: "bg-indigo-50 text-indigo-800 hover:bg-indigo-100",
};

function TemplateCard({ tpl }: { tpl: CarouselTemplate }) {
  const Icon = templateIcons[tpl.id] || Shield;
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 px-10 py-8 rounded-2xl border-2 transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-xl ${templateBgColors[tpl.id] || "bg-slate-50 text-slate-800 hover:bg-slate-100"}`}
    >
      <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm bg-white/80">
        <Icon className="w-7 h-7" />
      </div>
      <span className="text-xl md:text-2xl font-extrabold tracking-tight group-hover:scale-105 transition-transform duration-300">
        {tpl.label}
      </span>
    </div>
  );
}

export default function TemplateCarousel({ templates }: TemplateCarouselProps) {
  const { isSignedIn } = useAuth();
  const templatesHref = getTemplatesHref(isSignedIn);

  return (
    <section
      id="templates"
      className="py-20 md:py-28 bg-[#f0f0f0] border-t border-slate-200/60"
    >
      <div className="text-center max-w-2xl mx-auto px-6 mb-12 md:mb-16">
        <h2 className="text-2xl md:text-[2rem] font-extrabold text-slate-900 tracking-tight leading-tight">
          Use the templates recruiters like.
        </h2>
        <p className="text-slate-600 mt-2 text-sm md:text-base">
          Choose from four purpose-built layouts — each optimized for different industries and roles.
        </p>
        <Link
          href={templatesHref}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50"
        >
          Browse Templates
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {templates.map((tpl) => (
            <TemplateCard key={tpl.id} tpl={tpl} />
          ))}
        </div>
      </div>
    </section>
  );
}
