"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Layers } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
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

interface ScrollDrivenTemplateCardProps {
  tpl: TemplateDetail;
  index: number;
  scrollYProgress: any;
}

function ScrollDrivenTemplateCard({ tpl, index, scrollYProgress }: ScrollDrivenTemplateCardProps) {
  // Define scroll animation ranges for each card index i (0 to 3)
  // i = 0: [0, 0.05, 0.17, 0.30]
  // i = 1: [0.10, 0.17, 0.30, 0.42, 0.55, 0.65]
  // i = 2: [0.35, 0.42, 0.55, 0.67, 0.80, 0.90]
  // i = 3: [0.60, 0.67, 0.80, 1.0]
  let points: number[] = [];
  let yValues: number[] = [];
  let opacityValues: number[] = [];
  let scaleValues: number[] = [];

  if (index === 0) {
    points = [0, 0.05, 0.17, 0.30];
    yValues = [0, 0, 0, -180];
    opacityValues = [1, 1, 1, 0];
    scaleValues = [1, 1, 1, 0.82];
  } else if (index === 1) {
    points = [0.10, 0.17, 0.30, 0.42, 0.55, 0.65];
    yValues = [180, 180, 0, 0, -180, -180];
    opacityValues = [0, 0, 1, 1, 0, 0];
    scaleValues = [0.82, 0.82, 1, 1, 0.82, 0.82];
  } else if (index === 2) {
    points = [0.35, 0.42, 0.55, 0.67, 0.80, 0.90];
    yValues = [180, 180, 0, 0, -180, -180];
    opacityValues = [0, 0, 1, 1, 0, 0];
    scaleValues = [0.82, 0.82, 1, 1, 0.82, 0.82];
  } else {
    points = [0.60, 0.67, 0.80, 1.0];
    yValues = [180, 180, 0, 0];
    opacityValues = [0, 0, 1, 1];
    scaleValues = [0.82, 0.82, 1, 1];
  }

  const y = useTransform(scrollYProgress, points, yValues);
  const opacity = useTransform(scrollYProgress, points, opacityValues);
  const scale = useTransform(scrollYProgress, points, scaleValues);

  return (
    <motion.div
      style={{ y, opacity, scale, willChange: "transform" }}
      className="absolute inset-0 flex items-center justify-center pointer-events-auto"
    >
      <Link
        href="/sign-up"
        className="group relative flex flex-col w-[280px] sm:w-[360px] md:w-[440px] aspect-[1/1.414] rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden transition-shadow duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)]"
      >
        <img
          src={tpl.image}
          alt={tpl.label}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none block"
          loading="eager"
          decoding="sync"
        />

        {/* Glassmorphic Overlay */}
        <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <span className="bg-white text-slate-900 font-extrabold text-xs px-5 py-3 rounded-full shadow-lg flex items-center gap-2 transition-transform duration-300 scale-90 group-hover:scale-100">
            <span>Use this template</span>
            <ArrowRight size={15} className="text-rose-600" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function TemplateCarousel({ templates }: { templates: CarouselTemplate[] }) {
  const { isSignedIn } = useAuth();
  const [templatesHref, setTemplatesHref] = useState("/sign-up");
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Track active index based on scroll progress
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Map progress range to active index
    const index = Math.min(3, Math.floor(latest / 0.25));
    setActiveIndex(index);
  });

  useEffect(() => {
    if (isSignedIn) {
      setTemplatesHref("/templates");
    }
  }, [isSignedIn]);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-[#FAF9F5] border-t border-slate-200/50">
      {/* Pinned sticky screen */}
      <section className="sticky top-0 h-screen w-full flex flex-col justify-between items-center py-20 overflow-hidden">
        {/* Visual background ambient gradient orbs */}
        <div className="absolute top-0 right-0 w-[45vw] h-[45vw] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-[1280px] w-full mx-auto px-6 text-center z-10 flex flex-col items-center">
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

          {/* Active Template cross-fading details */}
          <div className="h-16 mt-6 overflow-hidden flex items-center justify-center">
            {shouldReduceMotion ? (
              <div className="text-center">
                <h3 className="font-display text-xl md:text-2xl font-extrabold text-slate-800">
                  {templatesData[activeIndex].label}
                </h3>
                <p className="text-slate-500 mt-0.5 text-xs md:text-sm font-semibold">
                  {templatesData[activeIndex].subtitle}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: EASE_VANGUARD }}
                  className="text-center"
                >
                  <h3
                    className="font-display text-xl md:text-2xl font-extrabold transition-colors duration-300"
                    style={{ color: templatesData[activeIndex].accentColor }}
                  >
                    {templatesData[activeIndex].label}
                  </h3>
                  <p className="text-slate-500 mt-1 text-xs md:text-sm font-semibold">
                    {templatesData[activeIndex].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Center Display Area */}
        <div className="relative w-full flex-1 max-h-[55vh] min-h-[300px] flex items-center justify-center select-none pointer-events-none">
          {shouldReduceMotion ? (
            // Static grid fallback if motion is reduced
            <div className="flex gap-6 max-w-5xl px-6 pointer-events-auto overflow-x-auto pb-4">
              {templatesData.map((tpl) => (
                <Link
                  key={tpl.id}
                  href="/sign-up"
                  className="group flex flex-col w-[200px] shrink-0"
                >
                  <span className="text-center font-bold text-slate-800 text-xs mb-2">{tpl.label}</span>
                  <div className="relative aspect-[1/1.414] rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <img src={tpl.image} alt={tpl.label} className="w-full h-full object-cover" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // Dynamic absolute-stacked layers driven by scroll progress
            templatesData.map((tpl, idx) => (
              <ScrollDrivenTemplateCard
                key={tpl.id}
                tpl={tpl}
                index={idx}
                scrollYProgress={scrollYProgress}
              />
            ))
          )}
        </div>

        {/* Bottom indicators and actions */}
        <div className="max-w-[1280px] w-full mx-auto px-6 flex flex-col items-center gap-6 z-10">
          {/* Scroll progress dots with labels */}
          <div className="flex gap-3 items-center">
            {templatesData.map((tpl, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={tpl.id}
                  onClick={() => {
                    // Programmatically scroll the window to the top position of the active segment
                    if (containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      const scrollTop = window.scrollY + rect.top + (idx * 0.25) * rect.height;
                      window.scrollTo({ top: scrollTop, behavior: "smooth" });
                    }
                  }}
                  className="group relative flex flex-col items-center cursor-pointer bg-transparent border-none p-1 focus:outline-none"
                >
                  <span
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isActive ? "w-8" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                    style={{ backgroundColor: isActive ? tpl.accentColor : undefined }}
                  />
                  <span className="absolute top-5 scale-0 group-hover:scale-100 transition-transform bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap pointer-events-none">
                    {tpl.label}
                  </span>
                </button>
              );
            })}
          </div>

          <Link
            href={templatesHref}
            className="group inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full border border-slate-200 px-8 py-3 text-xs tracking-wider uppercase gap-2 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
          >
            <span>Browse All Templates</span>
            <ArrowRight size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
