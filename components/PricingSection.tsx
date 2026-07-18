"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { useRef } from "react";
import { useAuth } from "@clerk/nextjs";

type BillingCycle = "monthly" | "yearly";

interface PlanFeature {
  text: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  cta: string;
  href: string;
  highlighted?: boolean;
  features: PlanFeature[];
}

const PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description:
      "Ideal for students exploring placement prep. No credit card required.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Start for Free",
    href: "/sign-up",
    features: [
      { text: "10,000 credits · 20 tailored resumes total" },
      { text: "50 AI-Powered Assistant messages daily" },
      { text: "ATS Strict template access" },
      { text: "Skill gap questionnaire" },
      { text: "Client-side PDF compilation" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description:
      "For active job seekers running multiple company drives. 30-day trial on yearly billing.",
    monthlyPrice: 19,
    yearlyPrice: 15,
    cta: "Get Started",
    href: "/sign-up",
    highlighted: true,
    features: [
      { text: "Unlimited resume tailoring" },
      { text: "Unlimited AI-Powered Assistant messages" },
      { text: "All 4 premium LaTeX templates" },
      { text: "Live company research (Tavily)" },
      { text: "Priority compile queue & ATS audit" },
    ],
  },
  {
    id: "campus",
    name: "Campus",
    description:
      "For placement cells and training partners managing cohorts at scale.",
    monthlyPrice: 79,
    yearlyPrice: 65,
    cta: "Contact Sales",
    href: "/sign-up",
    features: [
      { text: "Everything in Pro" },
      { text: "Shared placement dashboards" },
      { text: "Bulk job ingestion & Kanban" },
      { text: "Dedicated onboarding support" },
      { text: "Custom branding & export" },
    ],
  },
];

function formatPrice(amount: number) {
  return amount === 0 ? "$0" : `$${amount}`;
}

export function PricingSection() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="py-24 px-6 bg-white border-t border-slate-200/40"
    >
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Simple pricing plans
          </h2>
          <p className="text-slate-600 mt-3 text-base leading-relaxed">
            Start free for placement season. Upgrade when you need unlimited
            tailoring, premium templates, and priority AI-Powered Assistant access.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          className="flex justify-center mb-14"
        >
          <div
            role="tablist"
            aria-label="Billing cycle"
            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100/80 p-1 shadow-inner"
          >
            {(["monthly", "yearly"] as const).map((cycle) => {
              const active = billing === cycle;
              return (
                <button
                  key={cycle}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setBilling(cycle)}
                  className={`relative rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 min-w-[108px] ${
                    active
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {cycle === "monthly" ? "Monthly" : "Yearly"}
                  {cycle === "yearly" && (
                    <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                      −20%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PLANS.map((plan, index) => {
            const price =
              billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const ctaHref = mounted && isSignedIn && plan.id !== "campus"
              ? "/dashboard"
              : plan.href;
            const ctaLabel =
              mounted && isSignedIn && plan.id === "starter"
                ? "Go to Dashboard"
                : mounted && isSignedIn && plan.id === "pro"
                  ? "Upgrade in Dashboard"
                  : plan.cta;

            return (
              <motion.article
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.15 + index * 0.08,
                  ease: "easeOut",
                }}
                className={`relative flex flex-col rounded-[2rem] border bg-white p-8 md:p-10 shadow-[0_20px_40px_-20px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_24px_48px_-20px_rgba(15,23,42,0.12)] ${
                  plan.highlighted
                    ? "border-rose-600 ring-1 ring-rose-600/20 lg:scale-[1.02] z-10"
                    : "border-slate-200/80"
                }`}
              >
                {plan.highlighted ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md shadow-rose-600/25">
                    Most Popular
                  </div>
                ) : null}

                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900">
                    {plan.name}
                  </h3>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-5xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                      {formatPrice(price)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {plan.monthlyPrice === 0
                      ? "Free forever"
                      : billing === "monthly"
                        ? "Per month"
                        : "Per month, billed yearly"}
                  </p>
                  <p className="mt-5 text-sm leading-relaxed text-slate-600">
                    {plan.description}
                  </p>
                </div>

                <Link
                  href={ctaHref}
                  className={`mb-10 inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${
                    plan.highlighted
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700"
                      : "border border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {ctaLabel}
                </Link>

                <div className="mt-auto border-t border-slate-200/80 pt-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">
                    Features
                  </p>
                  <ul className="space-y-3.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.text}
                        className="flex items-start gap-3 text-sm text-slate-700"
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            plan.highlighted
                              ? "bg-rose-50 text-rose-600"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="leading-snug">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
          All plans include zero-trust client-side PDF compilation and encrypted
          profile storage. Paid tiers are illustrative — billing integration
          ships in a future release.
        </p>
      </div>
    </section>
  );
}
