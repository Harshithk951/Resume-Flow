"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
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

function TemplateCard({ tpl }: { tpl: CarouselTemplate }) {
  return (
    <div className="flex items-center justify-center shrink-0 bg-white/60 hover:bg-white/80 backdrop-blur-md border border-slate-200/50 px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
      <span className="text-sm md:text-base font-bold text-slate-800 tracking-tight group-hover:text-rose-600 transition-colors">
        {tpl.label}
      </span>
    </div>
  );
}

export default function TemplateCarousel({ templates }: TemplateCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const { isSignedIn } = useAuth();
  const templatesHref = getTemplatesHref(isSignedIn);

  const loopItems = [...templates, ...templates, ...templates];

  return (
    <section
      id="templates"
      className="py-16 md:py-20 bg-[#f0f0f0] border-t border-slate-200/60 overflow-hidden"
    >
      <div className="text-center max-w-2xl mx-auto px-6 mb-10 md:mb-14">
        <h2 className="text-2xl md:text-[2rem] font-extrabold text-slate-900 tracking-tight leading-tight">
          Use the templates recruiters like.
        </h2>
        <p className="text-slate-600 mt-2 text-sm md:text-base">
          Download to PDF. Toggle layouts instantly — your content stays the source of truth.
        </p>
        <Link
          href={templatesHref}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50"
        >
          Browse Templates
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="relative max-w-[100vw]">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-[#f0f0f0] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-[#f0f0f0] to-transparent z-10" />

        <div
          className="overflow-hidden py-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={`flex w-max gap-6 md:gap-10 px-8 template-marquee-track ${
              isPaused ? "template-marquee-paused" : ""
            }`}
          >
            {loopItems.map((tpl, i) => (
              <TemplateCard key={`${tpl.id}-${i}`} tpl={tpl} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
