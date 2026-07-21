"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Sparkles, ArrowRight, LayoutTemplate, FileText, Zap, CheckCircle } from "lucide-react";
import TemplateBrowser from "@/components/templates/TemplateBrowser";

const publicTemplates = [
  {
    name: "ATS Strict",
    description: "Maximizes ATS compatibility with clean, parseable formatting. Ideal for corporate and government applications.",
    features: ["Standard sections", "Keyword-optimized layout", "Single-column design"],
    gradient: "from-slate-100 to-slate-200",
  },
  {
    name: "Modern Professional",
    description: "Contemporary design with a refined sidebar layout. Balances visual appeal with ATS readability.",
    features: ["Two-column layout", "Skill icons", "Progress bars"],
    gradient: "from-blue-50 to-indigo-100",
  },
  {
    name: "Tech Innovator",
    description: "Stand out with a modern, tech-forward design. Includes project highlights and achievement metrics.",
    features: ["Project spotlight", "Metrics integration", "Dark header accent"],
    gradient: "from-rose-50 to-pink-100",
  },
  {
    name: "Modern Executive",
    description: "Leadership-focused template with executive summary and board-ready formatting.",
    features: ["Executive summary", "Board-ready layout", "Achievement timeline"],
    gradient: "from-amber-50 to-orange-100",
  },
];

export default function TemplatesPage() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  // Authenticated view — full template browser
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

  // Public preview — showcase templates with sign-up CTA
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/30 to-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100/40 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 text-rose-700 text-xs font-bold uppercase tracking-wider mb-6 border border-rose-200/50">
            <Sparkles className="w-3.5 h-3.5" />
            <span>4 Professional Templates</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Perfect Resume
            </span>{" "}
            Template
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            ATS-optimized, LaTeX-compiled, and tailored to your industry. Pick a template and let AI do the rest.
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

      {/* Template Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publicTemplates.map((template) => (
            <div
              key={template.name}
              className="group relative rounded-2xl border border-gray-200/70 bg-white p-6 hover:shadow-lg hover:border-rose-200/50 transition-all duration-300"
            >
              {/* Preview illustration */}
              <div className={`h-40 rounded-xl bg-gradient-to-br ${template.gradient} mb-5 flex items-center justify-center border border-gray-100/50`}>
                <LayoutTemplate className="w-12 h-12 text-gray-400/60 group-hover:text-rose-400/60 transition-colors" />
              </div>

              <h3 className="text-lg font-extrabold text-gray-900 mb-1.5">
                {template.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                {template.description}
              </p>

              <ul className="space-y-1.5 mb-5">
                {template.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors group/link"
              >
                <span>Use this template</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Feature comparison */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Why ResumeFlow Templates?</h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            Every template is engineered for ATS parsing, then perfected for human readers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Zap, label: "LaTeX Compiled", desc: "Pixel-perfect PDF output with proper typography" },
              { icon: FileText, label: "ATS Optimized", desc: "Heuristic scoring + keyword alignment" },
              { icon: Sparkles, label: "AI Tailored", desc: "Content rewritten per job description" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-gray-50/80 border border-gray-100 p-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{item.label}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to Build Your Resume?
          </h2>
          <p className="text-rose-100/80 mb-8 max-w-lg mx-auto">
            Sign up free — no credit card required. Get 5 tailored resumes per day.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-rose-600 font-extrabold shadow-xl hover:bg-white/90 transition-all active:scale-[0.98]"
          >
            <FileText className="w-4 h-4" />
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
