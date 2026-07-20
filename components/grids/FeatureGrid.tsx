"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { AnimatedFeatureCard } from "./FeatureCard";
import {
  Target,
  Globe,
  FileText,
  Zap,
  Brain,
  Shield,
  BarChart3,
  Briefcase,
} from "lucide-react";

const features = [
  {
    icon: <Target className="w-7 h-7" />,
    title: "Deep heuristics checks for keyword, format, and section completeness against live job specs.",
    tag: "ATS Scoring",
    color: "rose" as const,
  },
  {
    icon: <Globe className="w-7 h-7" />,
    title: "Ingests live engineering culture, tech stack, and values from the target company.",
    tag: "Web Research",
    color: "blue" as const,
  },
  {
    icon: <FileText className="w-7 h-7" />,
    title: "Instantly toggle between ATS-Strict, Modern Pro, or Executive layouts.",
    tag: "Smart Selectors",
    color: "purple" as const,
  },
  {
    icon: <Zap className="w-7 h-7" />,
    title: "Generates aligned resume profiles and instant compiles in under 30 seconds.",
    tag: "Fast Generation",
    color: "amber" as const,
  },
  {
    icon: <Brain className="w-7 h-7" />,
    title: "Experience bullets parsed and rewritten contextually against each job requirement.",
    tag: "AI Optimizer",
    color: "rose" as const,
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: "All personal details masked prior to external LLM calls. Zero-trust by design.",
    tag: "Privacy Isolation",
    color: "emerald" as const,
  },
  {
    icon: <BarChart3 className="w-7 h-7" />,
    title: "Highlights missing skills with context-aware gap analysis and suggestions.",
    tag: "Skill Gaps",
    color: "blue" as const,
  },
  {
    icon: <Briefcase className="w-7 h-7" />,
    title: "Real-time reactive pipeline dashboard for managing multiple job applications.",
    tag: "Kanban Tracker",
    color: "purple" as const,
  },
];

interface ScrollDrivenCardProps {
  feature: typeof features[0];
  index: number;
  scrollYProgress: any;
}

function ScrollDrivenCard({ feature, index, scrollYProgress }: ScrollDrivenCardProps) {
  // Odd cards (0, 2, 4, 6) slide Left to Right, Even cards (1, 3, 5, 7) slide Right to Left
  const isOdd = index % 2 === 0;
  const startX = isOdd ? -140 : 140;
  const endX = isOdd ? 140 : -140;

  // Transform horizontal translation (x) continuously along the scroll progress path
  const x = useTransform(scrollYProgress, [0, 1], [startX, endX]);
  const opacity = useTransform(scrollYProgress, [0.05, 0.45], [0, 1]);
  const scale = useTransform(scrollYProgress, [0.05, 0.45], [0.92, 1]);

  return (
    <motion.div
      style={{ x, opacity, scale, willChange: "transform" }}
      className="w-full flex"
    >
      <AnimatedFeatureCard
        index={`${String(index + 1).padStart(2, "0")}`}
        tag={feature.tag}
        title={feature.title}
        icon={feature.icon}
        color={feature.color}
      />
    </motion.div>
  );
}

export function FeatureGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll tracking container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Header scroll transitions
  const headerY = useTransform(scrollYProgress, [0, 0.35], [50, -20]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const headerScale = useTransform(scrollYProgress, [0, 0.35], [0.95, 1]);

  return (
    <section ref={containerRef} id="how-it-works" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto">
        {shouldReduceMotion ? (
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-rose-600 border border-rose-100 mb-4">
              <Zap size={10} /> Advanced Platform
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 tracking-[-0.02em]">
              Built different. Built to win.
            </h2>
            <p className="text-slate-500 mt-4 text-lg">
              Engineered to streamline corporate hiring drives and personal portfolio adjustments.
            </p>
          </div>
        ) : (
          <motion.div
            style={{ y: headerY, opacity: headerOpacity, scale: headerScale, willChange: "transform" }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-rose-600 border border-rose-100 mb-4">
              <Zap size={10} /> Advanced Platform
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 tracking-[-0.02em]">
              Built different. Built to win.
            </h2>
            <p className="text-slate-500 mt-4 text-lg">
              Engineered to streamline corporate hiring drives and personal portfolio adjustments.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {features.map((feature, index) => {
            const displayIndex = `${String(index + 1).padStart(2, "0")}`;
            return shouldReduceMotion ? (
              <motion.div
                key={feature.tag}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: [0.32, 0.72, 0, 1] }}
                className="w-full flex"
              >
                <AnimatedFeatureCard
                  index={displayIndex}
                  tag={feature.tag}
                  title={feature.title}
                  icon={feature.icon}
                  color={feature.color}
                />
              </motion.div>
            ) : (
              <ScrollDrivenCard
                key={feature.tag}
                feature={feature}
                index={index}
                scrollYProgress={scrollYProgress}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
