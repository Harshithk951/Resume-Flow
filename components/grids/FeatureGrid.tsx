"use client";

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

export function FeatureGrid() {
  return (
    <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 tracking-[-0.02em]">
            Built different. Built to win.
          </h2>
          <p className="text-slate-500 mt-4 text-lg">
            Engineered to streamline corporate hiring drives and personal portfolio adjustments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {features.map((feature, index) => {
            const displayIndex = `${String(index + 1).padStart(2, "0")}`;
            return (
              <div key={feature.tag} className="w-full flex">
                <AnimatedFeatureCard
                  index={displayIndex}
                  tag={feature.tag}
                  title={feature.title}
                  icon={feature.icon}
                  color={feature.color}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
