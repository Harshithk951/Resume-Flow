"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import {
  scrollRevealUp,
  scrollRevealScale,
  staggerContainer,
  staggerContainerSlow,
  EASE_VANGUARD,
} from "@/lib/animations";
import {
  Sparkles,
  ShieldCheck,
  FileText,
  Award,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from "lucide-react";

// ─── Comparison Data ─────────────────────────────────────
interface ComparisonRow {
  feature: string;
  description: string;
  values: [string, string, string, string];
  /**
   * Which index (0-3) is the clear winner — shows a sparkle indicator.
   * -1 = no single winner.
   */
  winnerIndex: number;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Free Tier",
    description: "Start without a credit card",
    values: ["5 compiles/day", "Limited Free", "Paywalled", "Basic Free"],
    winnerIndex: 0,
  },
  {
    feature: "ATS Optimization",
    description: "Parse & score against job descriptions",
    values: ["AI-Powered", "Basic", "None", "None"],
    winnerIndex: 0,
  },
  {
    feature: "Client-Side Privacy",
    description: "Data never leaves your device",
    values: ["WASM Compiler", "Server-Based", "Server-Based", "Server-Based"],
    winnerIndex: 0,
  },
  {
    feature: "LaTeX Templates",
    description: "Typeset-quality output",
    values: ["4 Premium", "None", "None", "Basic PDF"],
    winnerIndex: 0,
  },
  {
    feature: "Live Research",
    description: "Real-time company intel",
    values: ["Real-Time", "Real-Time", "None", "None"],
    winnerIndex: 0,
  },
  {
    feature: "AI Assistant",
    description: "Chat-based resume coaching",
    values: ["Unlimited*", "Limited", "None", "None"],
    winnerIndex: 0,
  },
  {
    feature: "Skill Analysis",
    description: "AI-driven gap detection",
    values: ["AI-Driven", "None", "None", "None"],
    winnerIndex: 0,
  },
  {
    feature: "Zero-Trust PDF",
    description: "Compile without servers",
    values: ["WASM in Browser", "Server-Side", "Server-Side", "Server-Side"],
    winnerIndex: 0,
  },
];

const COLUMN_HEADERS = ["ResumeFlow", "Teal", "Zety", "Canva"] as const;
const COLUMN_ABBREVS = ["RF", "TL", "ZY", "CV"] as const;

// ─── Stat Cards Data ──────────────────────────────────────
interface StatCard {
  value: number;
  suffix: string;
  prefix?: string;
  decimals?: number;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const STAT_CARDS: StatCard[] = [
  {
    value: 150,
    suffix: "+",
    label: "Resumes Compiled Daily",
    description: "Job seekers trust us daily",
    icon: <FileText className="w-5 h-5" />,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    value: 4.8,
    suffix: "/5",
    prefix: "",
    decimals: 1,
    label: "User Rating",
    description: "Across all platforms",
    icon: <Award className="w-5 h-5" />,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    value: 100,
    suffix: "%",
    label: "ATS Compatible",
    description: "Zero formatting rejections",
    icon: <ShieldCheck className="w-5 h-5" />,
    gradient: "from-emerald-500 to-green-600",
  },
];

// ─── Sub-components ───────────────────────────────────────

function CheckIcon({ animated = false }: { animated?: boolean }) {
  return (
    <span className="relative inline-flex items-center justify-center w-5 h-5">
      <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
      {animated && (
        <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
      )}
    </span>
  );
}

function CrossIcon() {
  return <XCircle className="w-5 h-5 text-red-300" strokeWidth={2} />;
}

function DashIcon() {
  return <MinusCircle className="w-5 h-5 text-slate-300" strokeWidth={2} />;
}

function SparkleIndicator() {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="inline-flex ml-1.5"
      title="Best in class"
    >
      <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
    </motion.span>
  );
}

function getCellContent(value: string): React.ReactNode {
  const lower = value.toLowerCase();
  if (lower.startsWith("ai") || lower.startsWith("wasm") || lower.startsWith("real") || lower.startsWith("unlimited") || lower.startsWith("5 compile")) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <CheckIcon animated />
        <span>{value}</span>
      </span>
    );
  }
  if (lower.startsWith("none") || lower.startsWith("basic")) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <DashIcon />
        <span className="text-slate-400">{value}</span>
      </span>
    );
  }
  if (lower.startsWith("paywall") || lower.startsWith("server")) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <CrossIcon />
        <span className="text-slate-400">{value}</span>
      </span>
    );
  }
  return <span>{value}</span>;
}

// ─── Main Component ───────────────────────────────────────

export function WhyResumeFlow() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.05 });

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section)" }}
    >
      {/* ─── Background Orbs ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-100/40 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-100/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-50/20 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-[1280px] mx-auto px-6">
        {/* ─── Header ─── */}
        <motion.div
          variants={staggerContainerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <motion.div variants={scrollRevealUp} className="mb-5">
            <span className="eyebrow-pill shimmer-pill">
              <Sparkles size={10} />
              <span>Why ResumeFlow</span>
            </span>
          </motion.div>

          <motion.h2
            variants={scrollRevealUp}
            className="font-display text-3xl md:text-5xl lg:text-[52px] font-extrabold text-slate-900 tracking-[-0.02em] mb-6 leading-[1.1]"
          >
            The Best Free AI Resume Generator
          </motion.h2>

          <motion.p
            variants={scrollRevealUp}
            className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
          >
            Most resume builders compromise on privacy, charge for basic features, or produce ATS-unfriendly PDFs.
            ResumeFlow is different — precision-engineered for both{" "}
            <span className="text-slate-800 font-semibold">human recruiters</span> and{" "}
            <span className="text-slate-800 font-semibold">automated tracking systems</span>.
            And your data{" "}
            <span className="text-rose-600 font-semibold">never leaves your browser</span>.
          </motion.p>
        </motion.div>

        {/* ─── Comparison Table ─── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE_VANGUARD, delay: 0.2 }}
          className="relative mb-16 lg:mb-20"
        >
          {/* Outer glow container */}
          <div className="absolute -inset-1 bg-gradient-to-b from-rose-100/60 via-transparent to-transparent rounded-[2.5rem] blur-xl -z-10" />

          {/* Main card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
            {/* Mobile: card-style comparison */}
            <div className="block lg:hidden divide-y divide-slate-100">
              {COMPARISON_ROWS.map((row, rowIdx) => (
                <motion.div
                  key={row.feature}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: rowIdx * 0.04, ease: EASE_VANGUARD }}
                  className="p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{row.feature}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{row.description}</p>
                    </div>
                    {row.winnerIndex === 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-2.5 h-2.5" />
                        Best
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {row.values.map((val, colIdx) => (
                      <div
                        key={colIdx}
                        className={`flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-lg ${
                          colIdx === 0
                            ? "bg-rose-50/70 ring-1 ring-rose-200/40"
                            : "bg-slate-50/50"
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase text-slate-400 w-5 shrink-0">
                          {COLUMN_ABBREVS[colIdx]}
                        </span>
                        <span className={colIdx === 0 ? "text-rose-700 font-semibold" : "text-slate-500"}>
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop: table-style comparison */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-5 pl-8 w-[220px]">
                      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Feature
                      </span>
                    </th>
                    {COLUMN_HEADERS.map((header, idx) => (
                      <th
                        key={header}
                        className={`p-5 text-center text-sm font-bold ${
                          idx === 0
                            ? "text-rose-600 bg-gradient-to-b from-rose-50/80 to-transparent"
                            : "text-slate-400"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {header}
                          {idx === 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-100">
                              <Sparkles className="w-3 h-3 text-rose-600" />
                            </span>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, rowIdx) => {
                    const isLast = rowIdx === COMPARISON_ROWS.length - 1;
                    return (
                      <motion.tr
                        key={row.feature}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: rowIdx * 0.05, ease: EASE_VANGUARD }}
                        className={`group cursor-default transition-colors ${
                          isLast ? "" : "border-b border-slate-100"
                        } hover:bg-slate-50/80`}
                      >
                        <td className="p-5 pl-8">
                          <div className="flex items-start gap-3">
                            <div>
                              <span className="font-bold text-slate-800 text-sm">
                                {row.feature}
                                {row.winnerIndex === 0 && <SparkleIndicator />}
                              </span>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {row.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        {row.values.map((val, colIdx) => (
                          <td
                            key={colIdx}
                            className={`p-5 text-center text-xs ${
                              colIdx === 0
                                ? "bg-gradient-to-r from-rose-50/40 via-rose-50/20 to-transparent font-semibold text-rose-700"
                                : "text-slate-500"
                            }`}
                          >
                            <div className="inline-flex items-center justify-center gap-1.5">
                              {getCellContent(val)}
                            </div>
                          </td>
                        ))}
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom accent bar */}
            <div className="h-1 bg-gradient-to-r from-rose-100 via-rose-200 to-transparent" />
          </div>

          {/* Footnote */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-[11px] text-slate-400 mt-3 text-center"
          >
            * AI Assistant includes 50 messages daily on the free tier. Comparisons based on publicly available
            information as of July 2026.
          </motion.p>
        </motion.div>

        {/* ─── Stats / Trust Badges ─── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-4xl mx-auto"
        >
          {STAT_CARDS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              variants={scrollRevealScale}
              className="group relative"
            >
              {/* Glow on hover */}
              <div className="absolute -inset-2 bg-gradient-to-br from-white/40 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

              {/* Card */}
              <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-5 lg:p-6 text-center transition-all duration-300 hover:border-slate-300/60 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col items-center justify-center">
                {/* Icon */}
                <div
                  className={`mx-auto mb-4 w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg`}
                >
                  {stat.icon}
                </div>

                {/* Animated Value */}
                <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-display tracking-tight mb-1">
                  {stat.value > 0 || stat.prefix?.includes("Z") ? (
                    <AnimatedCounter
                      to={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.prefix || ""}
                      decimals={stat.decimals ?? 0}
                    />
                  ) : (
                    <>
                      {stat.prefix}
                      {stat.suffix}
                    </>
                  )}
                </p>

                {/* Label */}
                <p className="text-sm font-bold text-slate-700 mb-0.5">{stat.label}</p>
                <p className="text-[11px] text-slate-400">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
