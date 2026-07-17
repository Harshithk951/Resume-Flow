"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
    subtitle: "Classic Single-Column Layout (Highly Optimized)",
    accentColor: "#0f172a",
    image: "/images/template-ats-strict.png",
  },
  modern_professional: {
    id: "modern_professional",
    label: "Startup Accent",
    subtitle: "Modern Creative Professional (Accent Color-Focused)",
    accentColor: "#e60023",
    image: "/images/template-modern-professional.png",
  },
  modern_executive: {
    id: "modern_executive",
    label: "Finance Classic",
    subtitle: "Elite Leadership & Corporate Executive Style",
    accentColor: "#1e3a5f",
    image: "/images/template-modern-executive.png",
  },
  tech_innovator: {
    id: "tech_innovator",
    label: "Tech Modern",
    subtitle: "Software & Systems Engineer (Modern Two-Column Layout)",
    accentColor: "#4f46e5",
    image: "/images/template-tech-innovator.png",
  },
};

const templatesData = [
  templateDetails.ats_strict,
  templateDetails.modern_professional,
  templateDetails.modern_executive,
  templateDetails.tech_innovator,
];

export default function TemplateCarousel({ templates }: { templates: CarouselTemplate[] }) {
  const { isSignedIn } = useAuth();
  const [templatesHref, setTemplatesHref] = useState("/sign-up");
  const [currentIndex, setCurrentIndex] = useState(0);

  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isSignedIn) {
      setTemplatesHref("/templates");
    }
  }, [isSignedIn]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(templatesData.length - 1, prev + 1));
  };

  return (
    <section
      id="templates"
      className="py-24 md:py-32 bg-[#FAF9F5] border-t border-slate-200/50 relative overflow-hidden"
    >
      {/* Visual background ambient gradient orbs */}
      <div className="absolute top-0 right-0 w-[45vw] h-[45vw] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1280px] mx-auto px-6 text-center z-10 flex flex-col items-center">
        {/* Section Header */}
        <div className="mb-4">
          <span className="eyebrow-pill">
            <Layers size={10} className="text-rose-600" />
            Purpose-Built Layouts
          </span>
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 tracking-[-0.02em] leading-tight">
          Use the templates recruiters like.
        </h2>

        {/* Active Template details description */}
        <div className="h-16 mt-6 overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: EASE_VANGUARD }}
              className="text-center"
            >
              <h3
                className="font-display text-xl md:text-2xl font-extrabold transition-colors duration-300"
                style={{ color: templatesData[currentIndex].accentColor }}
              >
                {templatesData[currentIndex].label}
              </h3>
              <p className="text-slate-500 mt-1 text-xs md:text-sm font-semibold">
                {templatesData[currentIndex].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Carousel Core Area */}
      <div className="relative w-full mt-10 md:mt-16 flex flex-col items-center">
        {/* Left/Right Glassmorphic Navigation Buttons */}
        <div className="absolute inset-y-0 left-4 md:left-12 z-20 flex items-center">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`h-12 w-12 rounded-full border border-slate-200/80 bg-white/70 backdrop-blur-md text-slate-800 shadow-lg flex items-center justify-center transition-all duration-300 ${
              currentIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "opacity-100 hover:bg-white hover:scale-105 active:scale-95"
            }`}
            aria-label="Previous Template"
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        <div className="absolute inset-y-0 right-4 md:right-12 z-20 flex items-center">
          <button
            onClick={handleNext}
            disabled={currentIndex === templatesData.length - 1}
            className={`h-12 w-12 rounded-full border border-slate-200/80 bg-white/70 backdrop-blur-md text-slate-800 shadow-lg flex items-center justify-center transition-all duration-300 ${
              currentIndex === templatesData.length - 1
                ? "opacity-30 cursor-not-allowed"
                : "opacity-100 hover:bg-white hover:scale-105 active:scale-95"
            }`}
            aria-label="Next Template"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Viewport Mask */}
        <div className="w-full overflow-hidden py-4">
          <motion.div
            className="flex gap-4 md:gap-8 w-max"
            animate={{
              x: shouldReduceMotion
                ? 0
                : `calc(50vw - (var(--card-width) / 2) - (${currentIndex} * (var(--card-width) + var(--gap))))`,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            style={
              {
                "--card-width": "280px",
                "--gap": "16px",
                // Responsive variables passed to CSS transform
                "@media (min-width: 768px)": {
                  "--card-width": "400px",
                  "--gap": "32px",
                },
              } as React.CSSProperties
            }
          >
            {/* Custom responsive media stylesheet injector to handle CSS variables dynamically */}
            <style jsx>{`
              div {
                --card-width: 280px;
                --gap: 16px;
              }
              @media (min-width: 768px) {
                div {
                  --card-width: 400px;
                  --gap: 32px;
                }
              }
            `}</style>

            {templatesData.map((tpl, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={tpl.id}
                  className={`w-[280px] md:w-[400px] shrink-0 transition-all duration-500 origin-center ${
                    isActive
                      ? "scale-[1.02] opacity-100"
                      : "scale-[0.94] opacity-50 pointer-events-none"
                  }`}
                >
                  <Link
                    href="/sign-up"
                    className="group relative flex flex-col w-full aspect-[1/1.414] rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden transition-shadow duration-500 hover:shadow-[0_24px_54px_rgba(0,0,0,0.15)]"
                  >
                    <img
                      src={tpl.image}
                      alt={tpl.label}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none block"
                      loading="eager"
                      decoding="sync"
                    />

                    {/* Glassmorphic Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                      <span className="bg-white text-slate-900 font-extrabold text-xs px-5 py-3 rounded-full shadow-lg flex items-center gap-2 transition-transform duration-300 scale-90 group-hover:scale-100">
                        <span>Use this template</span>
                        <ArrowRight size={15} className="text-rose-600" />
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Indicators & Actions */}
        <div className="mt-12 flex flex-col items-center gap-6 z-10">
          {/* Navigation Dots */}
          <div className="flex gap-2.5 items-center">
            {templatesData.map((tpl, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setCurrentIndex(idx)}
                  className="group relative flex items-center cursor-pointer bg-transparent border-none p-1 focus:outline-none"
                >
                  <span
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isActive ? "w-8" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                    style={{ backgroundColor: isActive ? tpl.accentColor : undefined }}
                  />
                </button>
              );
            })}
          </div>

          <Link
            href={templatesHref}
            className="group inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full border border-slate-200 px-8 py-3.5 text-xs tracking-wider uppercase gap-2 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
          >
            <span>Browse All Templates</span>
            <ArrowRight size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
