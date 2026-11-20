"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

interface PowerUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMPARISON_ROWS = [
  { feature: "Improvements", free: "2 total", proPower: "20 / 80 a month" },
  { feature: "ATS score & analysis", free: true, proPower: true },
  { feature: "Live preview", free: true, proPower: true },
  { feature: "PDF downloads", free: true, proPower: true },
  { feature: "Word (.docx) downloads", free: false, proPower: true },
  { feature: "Cover letters", free: "1 total", proPower: "5 / 15 a month" },
  { feature: "Skill roadmaps", free: "1 total", proPower: "15 / 60 a month" },
  { feature: "Build resumes from scratch", free: "3", proPower: "20 / unlimited" },
  { feature: "AI resume builder", free: false, proPower: true },
  { feature: "Import resume via AI", free: false, proPower: true },
  { feature: "History retention", free: "1 month", proPower: "3 / 6 mo" },
  { feature: "Edit before download", free: false, proPower: "Power / Team" },
  { feature: "Job application tracker", free: true, proPower: true },
];

const PRO_FEATURES = [
  "20 resume improvements/month",
  "Word (.docx) downloads",
  "5 cover letters/month",
  "Skills learning roadmap (15/month)",
  "Build up to 20 resumes from scratch",
  "AI resume builder",
  "Import resume via AI",
  "Optimization history",
  "Priority support",
];

const POWER_FEATURES = [
  "80 resume improvements/month",
  "Word (.docx) downloads",
  "15 cover letters/month",
  "60 skill roadmaps/month",
  "Build unlimited resumes from scratch",
  "AI resume builder",
  "Import resume via AI",
  "Edit resume & cover letter before download",
  "Optimization history (6-month retention)",
  "Priority support",
];

export function PowerUpgradeModal({ isOpen, onClose }: PowerUpgradeModalProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            className="relative w-full max-w-2xl sm:max-w-3xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col z-10"
          >
            {/* Scrollable Container */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#5B50E6]">
                    UPGRADE
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mt-1.5">
                  This feature is part of Power
                </h2>
                <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
                  The Pro pass does not include editing or rescoring. Choose Power below to unlock this feature.
                </p>
              </div>

              {/* Subscriptions & Billing Cycle Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Subscriptions</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Renews automatically until cancelled.</p>
                </div>

                <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setIsAnnual(false)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      !isAnnual
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAnnual(true)}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      isAnnual
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <span>Annual</span>
                    <span className="text-[10px] font-bold text-emerald-600">2 months free</span>
                  </button>
                </div>
              </div>

              {/* Feature Comparison Table */}
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        FEATURE
                      </th>
                      <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center w-28">
                        FREE
                      </th>
                      <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-[#5B50E6] text-center w-36">
                        PRO / POWER
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {COMPARISON_ROWS.map((row) => (
                      <tr key={row.feature} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 text-slate-700 font-medium">{row.feature}</td>
                        <td className="py-2.5 text-center text-slate-500">
                          {typeof row.free === "boolean" ? (
                            row.free ? (
                              <Check className="w-4 h-4 text-slate-400 mx-auto" />
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )
                          ) : (
                            row.free
                          )}
                        </td>
                        <td className="py-2.5 text-center text-slate-900 font-medium">
                          {typeof row.proPower === "boolean" ? (
                            row.proPower ? (
                              <Check className="w-4 h-4 text-[#5B50E6] mx-auto" />
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )
                          ) : row.proPower === "Power / Team" ? (
                            <span className="text-[#5B50E6] font-semibold">{row.proPower}</span>
                          ) : (
                            row.proPower
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Plan Cards Side by Side (PRO and POWER) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                {/* PRO Card */}
                <div className="rounded-2xl border border-slate-200/90 p-5 bg-white flex flex-col justify-between hover:border-slate-300 transition-all shadow-2xs">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#5B50E6] block mb-2">
                      PRO
                    </span>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        {isAnnual ? "₹166" : "₹199"}
                      </span>
                      <span className="text-xs text-slate-400 font-normal">
                        {isAnnual ? "/month (billed yearly)" : "/month"}
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 mb-6">
                      {PRO_FEATURES.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-bold text-xs sm:text-sm text-center cursor-not-allowed shadow-2xs"
                  >
                    Coming Soon
                  </button>
                </div>

                {/* POWER Card */}
                <div className="rounded-2xl border-2 border-[#5B50E6]/30 p-5 bg-white flex flex-col justify-between shadow-xs transition-all relative">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-[#5B50E6]">
                        POWER
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        {isAnnual ? "₹333" : "₹399"}
                      </span>
                      <span className="text-xs text-slate-400 font-normal">
                        {isAnnual ? "/month (billed yearly)" : "/month"}
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 mb-6">
                      {POWER_FEATURES.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#5B50E6] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-bold text-xs sm:text-sm text-center cursor-not-allowed shadow-2xs"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                Prices in Indian rupees · charged by Razorpay{" "}
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="text-[#5B50E6] font-semibold hover:underline ml-1"
                >
                  see the full pricing page
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
