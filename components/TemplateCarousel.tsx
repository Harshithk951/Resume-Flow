"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { EASE_VANGUARD } from "@/lib/animations";

export interface CarouselTemplate {
  id: string;
  label: string;
  image: string;
  withPhoto?: boolean;
  twoColumn?: boolean;
  ats?: boolean;
  creative?: boolean;
}

interface TemplateDetail {
  id: string;
  label: string;
  subtitle: string;
  accentColor: string;
  image: string;
}

const templateDetails: Record<string, TemplateDetail> = {
  ats_strict: {
    id: "ats_strict",
    label: "ATS Strict",
    subtitle: "Classic Single-Column Layout",
    accentColor: "#0f172a",
    image: "/images/template-ats-strict.png",
  },
  modern_professional: {
    id: "modern_professional",
    label: "Startup Accent",
    subtitle: "Modern Creative Professional",
    accentColor: "#e60023",
    image: "/images/template-modern-professional.png",
  },
  modern_executive: {
    id: "modern_executive",
    label: "Finance Classic",
    subtitle: "Elite Leadership & Corporate",
    accentColor: "#1e3a5f",
    image: "/images/template-modern-executive.png",
  },
  tech_innovator: {
    id: "tech_innovator",
    label: "Tech Modern",
    subtitle: "Software & Systems Engineer",
    accentColor: "#4f46e5",
    image: "/images/template-tech-innovator.png",
  },
};

export default function TemplateCarousel({ templates }: { templates: CarouselTemplate[] }) {
  const { isSignedIn } = useAuth();
  const [isPaused, setIsPaused] = useState(false);
  const [templatesHref, setTemplatesHref] = useState("/sign-up");

  useEffect(() => {
    if (isSignedIn) {
      setTemplatesHref("/templates");
    }
  }, [isSignedIn]);

  const marqueeItems = templates && templates.length > 0 ? templates : Object.values(templateDetails);

  return (
    <section
      id="templates"
      className="py-24 md:py-32 bg-[#FAF1F8]/30 relative overflow-hidden"
    >
      {/* Visual background ambient gradient orbs */}
      <div className="absolute top-0 right-0 w-[45vw] h-[45vw] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] bg-fuchsia-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1280px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_VANGUARD }}
            className="mb-4"
          >
            <span className="eyebrow-pill">
              <Layers size={10} className="text-rose-600" />
              Purpose-Built Layouts
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_VANGUARD }}
            className="font-display text-3xl md:text-5xl font-extrabold text-[var(--color-ink)] tracking-[-0.02em] leading-tight"
          >
            Use the templates recruiters like.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE_VANGUARD }}
            className="text-[var(--color-ash)] mt-4 text-sm md:text-base leading-relaxed animate-fade-in"
          >
            Choose from purpose-built layouts — each optimized for different industries and roles.
            Hover to pause and click any template to get started instantly.
          </motion.p>
        </div>
      </div>

      {/* Marquee Flow Bounded Container */}
      <div className="max-w-[1280px] mx-auto px-6">
        <div
          className="w-full relative overflow-hidden py-8 select-none cursor-pointer rounded-3xl border-2 border-slate-900/25 bg-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-[1px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Soft edge fade overlays restricted inside the container */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none rounded-l-3xl" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none rounded-r-3xl" />

          <div
            className={`flex w-max template-marquee-track ${
              isPaused ? "template-marquee-paused" : ""
            }`}
          >
            {/* Render three identical sets of template items to form an infinite marquee loop */}
            {[0, 1, 2].map((setIndex) => (
              <div key={setIndex} className="flex gap-10 pr-10 shrink-0">
                {marqueeItems.map((tpl) => {
                  const details = templateDetails[tpl.id];
                  const displayLabel = details ? details.label : tpl.label;

                  return (
                    <Link
                      key={`${tpl.id}-${setIndex}`}
                      href="/sign-up"
                      className="group flex flex-col w-[320px] md:w-[400px] shrink-0"
                    >
                      {/* Template name displayed directly above the card */}
                      <div className="text-center mb-4">
                        <span className="inline-block font-display text-sm md:text-base font-extrabold text-[var(--color-ink-soft)] group-hover:text-rose-600 transition-colors duration-300">
                          {displayLabel}
                        </span>
                      </div>

                      {/* Resume image mockup */}
                      <div className="relative aspect-[1/1.414] w-full rounded-2xl border border-[var(--color-hairline)]/80 bg-[var(--color-canvas)] shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-500 group-hover:shadow-[0_24px_54px_rgba(0,0,0,0.15)] group-hover:scale-[1.02]">
                        <img
                          src={tpl.image}
                          alt={displayLabel}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none block"
                          loading="eager"
                          decoding="sync"
                        />

                        {/* Glassmorphic Overlay showing "Use this Template" on hover */}
                        <div className="absolute inset-0 bg-[var(--color-surface-dark)]/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                          <span className="bg-[var(--color-canvas)] text-[var(--color-ink)] font-extrabold text-xs px-5 py-3 rounded-full shadow-lg flex items-center gap-2 transition-transform duration-300 scale-90 group-hover:scale-100">
                            <span>Use this template</span>
                            <ArrowRight size={15} className="text-rose-600" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Browse Action */}
      <div className="mt-16 text-center">
        <Link
          href={templatesHref}
          className="group inline-flex items-center justify-center bg-[var(--color-canvas)] hover:bg-[var(--color-surface-soft)] text-[var(--color-charcoal)] font-bold rounded-full border border-[var(--color-hairline)] px-8 py-3.5 text-xs tracking-wider uppercase gap-2 shadow-sm transition-all hover:shadow-md hover:border-[var(--color-secondary-bg)]"
        >
          <span>Browse All Templates</span>
          <ArrowRight size={12} className="text-[var(--color-stone)] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
