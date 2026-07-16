"use client";

import { useState, useEffect } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Tier {
  id: string;
  name: string;
  price: { monthly: number | string; yearly: number | string };
  description: string;
  availableFeatures: string[];
  cta: string;
  href?: string;
  popular?: boolean;
  highlighted?: boolean;
  comingSoon?: boolean;
}

interface PricingSectionProps {
  title?: string;
  subtitle?: string;
  frequencies: string[];
  tiers: Tier[];
  allFeatures: string[];
}

// ─── Tier Color Maps ──────────────────────────────────────
const tierAccents: Record<string, {
  border: string;
  ring: string;
  badge: string;
  badgeText: string;
  checkBg: string;
  checkText: string;
  ctaBg: string;
  ctaHover: string;
  shadow: string;
}> = {
  starter: {
    border: "border-slate-200/80",
    ring: "",
    badge: "",
    badgeText: "",
    checkBg: "bg-slate-100",
    checkText: "text-slate-600",
    ctaBg: "border border-slate-300 bg-white",
    ctaHover: "hover:border-slate-400 hover:bg-slate-50",
    shadow: "shadow-sm hover:shadow-md",
  },
  pro: {
    border: "border-rose-600",
    ring: "ring-1 ring-rose-600/20",
    badge: "bg-rose-600",
    badgeText: "text-white",
    checkBg: "bg-rose-50",
    checkText: "text-rose-600",
    ctaBg: "bg-rose-600",
    ctaHover: "hover:bg-rose-700",
    shadow: "shadow-lg shadow-rose-500/10",
  },
  campus: {
    border: "border-blue-400",
    ring: "ring-1 ring-blue-400/20",
    badge: "bg-blue-600",
    badgeText: "text-white",
    checkBg: "bg-blue-50",
    checkText: "text-blue-600",
    ctaBg: "border border-blue-300 bg-white",
    ctaHover: "hover:border-blue-400 hover:bg-blue-50",
    shadow: "shadow-sm hover:shadow-md hover:shadow-blue-500/5",
  },
  enterprise: {
    border: "border-amber-400",
    ring: "ring-1 ring-amber-400/20",
    badge: "bg-amber-600",
    badgeText: "text-white",
    checkBg: "bg-amber-50",
    checkText: "text-amber-600",
    ctaBg: "border border-amber-300 bg-white",
    ctaHover: "hover:border-amber-400 hover:bg-amber-50",
    shadow: "shadow-md",
  },
};

// ─── Animated Number with Slow Spring Physics ─────────────
function AnimatedNumber({ value, prefix = "$" }: { value: number | string; prefix?: string }) {
  const motionValue = useMotionValue(typeof value === "number" ? value : 0);
  const springValue = useSpring(motionValue, {
    stiffness: 60,
    damping: 15,
    mass: 1.2,
  });
  const displayValue = useTransform(springValue, (v) => Math.round(v));
  const [rendered, setRendered] = useState(displayValue.get());

  useEffect(() => {
    if (typeof value === "string") {
      setRendered(0);
      return;
    }
    motionValue.set(value);
    const unsubscribe = displayValue.on("change", (v) => setRendered(v));
    return () => unsubscribe();
  }, [value, motionValue, displayValue]);

  if (typeof value === "string") {
    return <>{value}</>;
  }

  return (
    <>{prefix}{rendered}</>
  );
}

export function PricingSection({
  title = "Simple Pricing",
  subtitle = "Choose the best plan for your needs",
  frequencies,
  tiers,
  allFeatures,
}: PricingSectionProps) {
  const [activeFrequency, setActiveFrequency] = useState(frequencies[0] || "monthly");

  return (
    <section id="pricing" className="relative py-24 px-6 overflow-hidden">
      {/* Grid Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:35px_35px] opacity-40 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="max-w-[1280px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-rose-600 border border-rose-100 mb-4">
              Pricing
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-slate-600 mt-3 text-base leading-relaxed">
              {subtitle}
            </p>
          </motion.div>
        </div>

        {/* Frequency Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100/80 p-1 shadow-inner">
            {frequencies.map((freq) => {
              const active = activeFrequency === freq;
              return (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setActiveFrequency(freq)}
                  className={cn(
                    "relative rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 min-w-[100px] capitalize",
                    active
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {freq}
                  {freq === "yearly" && (
                    <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                      −20%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((tier, index) => {
            const price = tier.price[activeFrequency as keyof typeof tier.price];
            const isPopular = tier.popular;
            const isHighlighted = tier.highlighted;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)", transition: { type: "spring", stiffness: 250, damping: 18, mass: 0.8 } }}
                className={cn(
                    "relative flex flex-col rounded-2xl border-2 bg-white p-6",
                    tierAccents[tier.id]?.border || "border-slate-200/80",
                    tierAccents[tier.id]?.ring || "",
                    tierAccents[tier.id]?.shadow || "shadow-sm",
                    isPopular && "scale-[1.02] z-10",
                    isHighlighted && !isPopular && "bg-gradient-to-b from-amber-50/30 to-white",
                    tier.comingSoon && "opacity-85",
                    "cursor-default"
                  )}
                >
                  {/* Blooming Gradient Overlay — expands from center on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    initial={{ opacity: 0, scale: 0.6 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.6 }}
                    style={{
                      background: `radial-gradient(circle at 50% 40%, ${
                        tier.id === "starter" ? "rgba(148, 163, 184, 0.12)" :
                        tier.id === "pro" ? "rgba(225, 29, 72, 0.12)" :
                        tier.id === "campus" ? "rgba(59, 130, 246, 0.12)" :
                        "rgba(245, 158, 11, 0.12)"
                      } 0%, transparent 70%)`,
                    }}
                  />

                  {/* Coming Soon Overlay Badge */}
                  {tier.comingSoon && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-50">
                      <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Coming Soon
                      </div>
                    </div>
                  )}

                  {(isPopular || isHighlighted) && !tier.comingSoon && (
                    <div className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md",
                      tierAccents[tier.id]?.badge || "bg-slate-800"
                    )}>
                      {isPopular ? "Most Popular" : isHighlighted ? "Enterprise" : ""}
                    </div>
                  )}

                  <div className="mb-6 pt-3">
                    <h3 className={cn(
                      "text-base font-bold",
                      tier.id === "pro" ? "text-rose-700" : tier.id === "campus" ? "text-blue-700" : tier.id === "enterprise" ? "text-amber-700" : "text-slate-900"
                    )}>{tier.name}</h3>
                    <div className="mt-4 flex items-end gap-1">
                      <motion.span
                        key={`price-${tier.id}`}
                        className="text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums"
                        initial={{ opacity: 0.6, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 80, damping: 14, mass: 1 }}
                      >
                        <AnimatedNumber value={price} />
                      </motion.span>
                      {typeof price === "number" && (
                        <motion.span
                          key={`unit-${tier.id}`}
                          className="text-sm font-medium text-slate-500 mb-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.3 }}
                        >
                          /mo
                        </motion.span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  {tier.comingSoon ? (
                    <div
                      className={cn(
                        "mb-6 inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold transition-all",
                        "border border-dashed border-slate-300 bg-slate-50 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                        {tier.cta}
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={tier.href || "#"}
                      className={cn(
                        "mb-6 inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold transition-all active:scale-[0.98]",
                        tierAccents[tier.id]?.ctaBg || "border border-slate-300 bg-white",
                        tierAccents[tier.id]?.ctaHover || "hover:border-slate-400 hover:bg-slate-50",
                        isPopular ? "text-white shadow-md" : "text-slate-900"
                      )}
                    >
                      {tier.cta}
                    </Link>
                  )}

                  <div className="mt-auto border-t border-slate-200/80 pt-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3.5">
                      Features
                    </p>
                    <ul className="space-y-2.5">
                      {allFeatures.map((feature) => {
                        const isAvailable = tier.availableFeatures.includes(feature);
                        return (
                          <li key={feature} className="flex items-start gap-2.5 text-sm">
                            {isAvailable ? (
                              <span
                                className={cn(
                                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                                  tierAccents[tier.id]?.checkBg || "bg-slate-100",
                                  tierAccents[tier.id]?.checkText || "text-slate-600"
                                )}
                              >
                                <Check className="h-2.5 w-2.5" strokeWidth={3} />
                              </span>
                            ) : (
                              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                                <X className="h-2.5 w-2.5" strokeWidth={2.5} />
                              </span>
                            )}
                            <span className={cn(
                              "leading-snug text-xs",
                              isAvailable ? "text-slate-700" : "text-slate-400"
                            )}>
                              {feature}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
