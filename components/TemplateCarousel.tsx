"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Sparkles, Shield, Building2, Cpu } from "lucide-react";
import { getTemplatesHref } from "@/lib/templates/navigation";
import { motion } from "framer-motion";

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

// CSS Resume Previews for Interactive Card Demos
function AtsPreview() {
  return (
    <div className="w-full h-28 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 flex flex-col gap-1.5 shadow-sm overflow-hidden relative select-none">
      <div className="w-1/3 h-1.5 bg-slate-400 dark:bg-slate-600 rounded mx-auto" />
      <div className="w-1/2 h-1 bg-slate-300 dark:bg-slate-700 rounded mx-auto" />
      <div className="flex flex-col gap-1 mt-2">
        <div className="w-full border-b border-slate-100 dark:border-slate-800/80 pb-0.5">
          <div className="w-1/5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded" />
        </div>
        <div className="w-5/6 h-1 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-900/50 rounded" />
      </div>
      <div className="flex flex-col gap-1 mt-1">
        <div className="w-full border-b border-slate-100 dark:border-slate-800/80 pb-0.5">
          <div className="w-1/5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded" />
        </div>
        <div className="w-4/5 h-1 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}

function ModernPreview() {
  return (
    <div className="w-full h-28 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 flex gap-2.5 shadow-sm overflow-hidden relative select-none">
      <div className="w-[30%] border-r border-rose-100 dark:border-rose-950/80 flex flex-col gap-1.5 pr-1">
        <div className="w-4.5 h-4.5 rounded-full bg-rose-100 dark:bg-rose-950/80 mx-auto" />
        <div className="w-full h-1 bg-rose-300 dark:bg-rose-800 rounded" />
        <div className="w-4/5 h-1 bg-rose-200 dark:bg-rose-900 rounded" />
      </div>
      <div className="w-[70%] flex flex-col gap-1.5">
        <div className="w-3/4 h-2 bg-slate-400 dark:bg-slate-600 rounded" />
        <div className="w-1/2 h-1 bg-slate-300 dark:bg-slate-700 rounded" />
        <div className="flex flex-col gap-1 mt-1">
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="w-11/12 h-1 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
      </div>
    </div>
  );
}

function FinancePreview() {
  return (
    <div className="w-full h-28 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 flex flex-col gap-1.5 shadow-sm overflow-hidden relative select-none">
      <div className="flex justify-between items-center">
        <div className="w-1/3 h-2 bg-blue-900 dark:bg-blue-400 rounded" />
        <div className="w-1/4 h-1 bg-slate-400 dark:bg-slate-600 rounded" />
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <div className="flex justify-between border-b border-blue-900/10 dark:border-blue-900/30 pb-0.5">
          <div className="w-1/4 h-1.5 bg-blue-800 dark:bg-blue-500 rounded" />
          <div className="w-1/6 h-1 bg-slate-300 dark:bg-slate-700 rounded" />
        </div>
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="w-11/12 h-1 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex justify-between border-b border-blue-900/10 dark:border-blue-900/30 pb-0.5">
          <div className="w-1/5 h-1.5 bg-blue-800 dark:bg-blue-500 rounded" />
        </div>
        <div className="w-5/6 h-1 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}

function TechPreview() {
  return (
    <div className="w-full h-28 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 flex flex-col gap-1.5 shadow-sm overflow-hidden relative select-none">
      <div className="w-2/5 h-2 bg-indigo-900 dark:bg-indigo-400 rounded" />
      <div className="w-1/2 h-1 bg-slate-400 dark:bg-slate-600 rounded" />
      <div className="flex flex-col gap-1.5 mt-1.5">
        <div className="w-1/5 h-1.5 bg-indigo-700 dark:bg-indigo-500 rounded" />
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="flex gap-1 mt-1">
          <div className="px-1 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 rounded-[3px] text-[5px] text-indigo-600 dark:text-indigo-400 font-semibold scale-90 origin-left">React</div>
          <div className="px-1 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 rounded-[3px] text-[5px] text-indigo-600 dark:text-indigo-400 font-semibold scale-90 origin-left">Node</div>
          <div className="px-1 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 rounded-[3px] text-[5px] text-indigo-600 dark:text-indigo-400 font-semibold scale-90 origin-left">AWS</div>
        </div>
      </div>
    </div>
  );
}

const templatePreviews: Record<string, React.ComponentType> = {
  ats_strict: AtsPreview,
  modern_professional: ModernPreview,
  modern_executive: FinancePreview,
  tech_innovator: TechPreview,
};

const templateTaglines: Record<string, string> = {
  ats_strict: "Strictly compliant, single-column design. Best for corporate, government, & traditional roles.",
  modern_professional: "Clean sidebar layout with balanced visual cues. Best for marketing, product, & creative roles.",
  modern_executive: "Traditional serif styling with bold separators. Best for banking, MBA grads, & executives.",
  tech_innovator: "Modern tag-based project matrix. Best for software developers, engineers, & designers.",
};

const templateBorders: Record<string, string> = {
  ats_strict: "group-hover:border-slate-800/80 group-hover:shadow-slate-500/10",
  modern_professional: "group-hover:border-rose-500/80 group-hover:shadow-rose-500/10",
  modern_executive: "group-hover:border-blue-600/80 group-hover:shadow-blue-500/10",
  tech_innovator: "group-hover:border-indigo-600/80 group-hover:shadow-indigo-500/10",
};

const templateGlows: Record<string, string> = {
  ats_strict: "bg-slate-500/5",
  modern_professional: "bg-rose-500/5",
  modern_executive: "bg-blue-500/5",
  tech_innovator: "bg-indigo-500/5",
};

function TemplateCard({ tpl, href }: { tpl: CarouselTemplate; href: string }) {
  const Icon = templateIcons[tpl.id] || Shield;
  const Preview = templatePreviews[tpl.id] || AtsPreview;
  const tagline = templateTaglines[tpl.id] || "";
  const borderHover = templateBorders[tpl.id] || "";
  const glowBg = templateGlows[tpl.id] || "";

  return (
    <Link href={href} className="group relative block h-full select-none cursor-pointer">
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10 ${glowBg}`} />
      
      <div
        className={`flex flex-col h-full bg-white/75 dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 gap-4 transition-all duration-300 hover:-translate-y-1.5 shadow-sm group-hover:shadow-lg ${borderHover}`}
      >
        <div className="relative group-hover:scale-[1.02] transition-transform duration-300">
          <Preview />
        </div>

        <div className="flex flex-col gap-1.5 mt-2 flex-grow">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Icon className="w-4.5 h-4.5" />
            </div>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {tpl.label}
            </span>
          </div>
          <p className="text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
            {tagline}
          </p>
        </div>

        <div className="flex items-center text-[12px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-rose-600 transition-colors mt-auto pt-3 border-t border-slate-100/50 dark:border-slate-800/50">
          <span>Use template</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default function TemplateCarousel({ templates }: TemplateCarouselProps) {
  const { isSignedIn } = useAuth();
  const templatesHref = getTemplatesHref(isSignedIn);

  return (
    <section
      id="templates"
      className="py-24 md:py-32 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 border-t border-slate-200/40 relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-rose-500/5 to-indigo-500/0 blur-[120px] rounded-full" />
      </div>

      <div className="text-center max-w-2xl mx-auto px-6 mb-16 md:mb-20">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-[11px] font-bold text-rose-700 mb-4 tracking-wide uppercase">
          <Sparkles className="w-3 h-3" />
          Designed for Impact
        </div>
        <h2 className="text-3xl md:text-[2.5rem] font-black text-slate-900 tracking-tight leading-none">
          Use the templates recruiters like.
        </h2>
        <p className="text-slate-600 mt-3 text-sm md:text-base max-w-lg mx-auto">
          Choose from four purpose-built layouts — each optimized for different industries and roles.
        </p>
        <Link
          href={templatesHref}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:scale-95"
        >
          Browse Templates
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {templates.map((tpl) => (
            <TemplateCard key={tpl.id} tpl={tpl} href={templatesHref} />
          ))}
        </div>
      </div>
    </section>
  );
}
