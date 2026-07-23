"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Loader2, ArrowRight, LayoutTemplate, FileText, CheckCircle, ShieldCheck } from "lucide-react";
import TemplateBrowser from "@/components/templates/TemplateBrowser";

export default function TemplatesPage() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  // Authenticated view — single locked master template preview & editor
  if (isSignedIn) {
    return (
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-white min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        }
      >
        <TemplateBrowser />
      </Suspense>
    );
  }

  // Public preview — showcase master template with sign-up CTA
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/30 to-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100/40 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 text-rose-700 text-xs font-bold uppercase tracking-wider mb-6 border border-rose-200/50">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>Single Source of Truth — ATS Strict Template</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-4">
            Master{" "}
            <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              ATS-Strict
            </span>{" "}
            Resume Engine
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Engineered for 100% ATS text-parser readability. Single-column, linear structure, zero text-runon bugs, and LaTeX compiled for top tier engineering placements.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold shadow-lg shadow-rose-500/20 hover:from-rose-700 hover:to-rose-600 transition-all active:scale-[0.98]"
            >
              <FileText className="w-4 h-4" />
              <span>Try Free — Build Your Resume</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-700 font-bold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Master Template Showcase */}
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20">
        <div className="rounded-2xl border border-rose-200/70 bg-white p-8 shadow-xl">
          <div className="h-48 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 mb-6 flex flex-col items-center justify-center text-white border border-slate-700 p-6 text-center">
            <LayoutTemplate className="w-12 h-12 text-rose-400 mb-3" />
            <h2 className="text-xl font-extrabold tracking-tight">ATS-Strict Master Skeleton</h2>
            <p className="text-xs text-slate-300 max-w-md mt-1">
              Guaranteed single-column layout, fixed category headers, and double-escape-safe compilation.
            </p>
          </div>

          <h3 className="text-xl font-extrabold text-gray-900 mb-2">
            Why One Master Template Instead of Multiple Layouts?
          </h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Real ATS software (Greenhouse, Lever, Workday) extracts text using linear parsers. Multi-column templates, progress bars, and icons introduce silent parsing errors. ResumeFlow uses one bulletproof single-column LaTeX template engineered to guarantee 100% keyword and formatting fidelity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {[
              "Single-column linear structure (No multi-column parsing errors)",
              "Fixed Technical Skills categorization & non-breaking spaces",
              "Automatic omission of empty sections",
              "Single-pass LaTeX character escaping for zero compile failures",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold shadow-md hover:from-rose-700 hover:to-rose-600 transition-all"
          >
            <span>Start Building With ATS Strict Master</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
