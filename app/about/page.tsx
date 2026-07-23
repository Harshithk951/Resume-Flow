import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StaticPageWrapper } from "@/components/StaticPageWrapper";
import { Info, ShieldCheck, Zap, Code, Award, Lock, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About ResumeFlow — AI Resume Engineering & Placement Acceleration Platform",
  description: "Learn about ResumeFlow — the placement-grade AI resume tailoring platform built for software engineers, tech candidates, and job seekers. Discover our client-side WASM LaTeX compiler, zero-trust privacy, and ATS optimization algorithms.",
  alternates: { canonical: "https://resumeflow.harshithkumar.in/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-rose-500 selection:text-white flex flex-col justify-between">
      <Navbar />
      <main className="py-12 md:py-20 max-w-4xl mx-auto px-6 w-full flex-1 space-y-12">
        <StaticPageWrapper
          category="Company & Mission"
          title="About ResumeFlow"
          subtitle="Engineered to level the playing field for candidates in an automated hiring ecosystem."
        >
          <div className="flex gap-4 items-center mb-8">
            <Info className="w-8 h-8 text-rose-500 shrink-0" />
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          <div className="space-y-10 text-slate-300 text-sm leading-relaxed">
            {/* ─── Executive Summary & Mission ─── */}
            <section className="space-y-4">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Our Mission</h2>
              <p>
                ResumeFlow was founded on a simple yet transformative observation: modern recruitment is heavily automated, but job seekers are often left relying on manual, outdated formatting tools. Over 98% of Fortune 500 companies use Applicant Tracking Systems (ATS) such as Greenhouse, Lever, Workday, and Taleo to automatically filter resumes before a human recruiter ever sees them.
              </p>
              <p>
                Our mission is to empower tech candidates, software engineers, and university graduates with placement-grade resume tailoring tools. By combining artificial intelligence with strict LaTeX compilation and privacy-first engineering, ResumeFlow ensures your real skills, project achievements, and professional metrics shine through automated screening algorithms.
              </p>
            </section>

            {/* ─── Our Story & Problem We Solve ─── */}
            <section className="space-y-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                The Problem We Solve
              </h2>
              <p>
                Generic resume builders generate pretty HTML/CSS visual templates that look attractive to the eye but fail miserably inside ATS parsers. Traditional builders use complex tables, multi-column CSS grid layouts, floating text boxes, and icons that cause ATS screeners to scramble content, misread experience dates, or drop candidate technical skills altogether.
              </p>
              <p>
                ResumeFlow takes a fundamentally different approach. We compile resumes into single-column, standard vector PDF documents using battle-tested LaTeX typography engines. Every line, header, and bullet point is placed with sub-pixel mathematical precision, guaranteeing 100% parsing accuracy across every major ATS vendor.
              </p>
            </section>

            {/* ─── Core Engineering Principles ─── */}
            <section className="space-y-6">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Core Technical Principles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                    <ShieldCheck className="w-5 h-5" />
                    Factual Integrity & Anti-Hallucination
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Our AI models analyze your master profile and target job descriptions to re-frame and highlight your genuine experience. We enforce strict anti-hallucination guardrails — ResumeFlow never invents false job titles, fake degrees, or unearned certifications.
                  </p>
                </div>

                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                    <Lock className="w-5 h-5" />
                    Zero-Trust Privacy & WASM Architecture
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your personal contact details and resume history belong exclusively to you. ResumeFlow uses client-side PII masking and WebAssembly (WASM) compilers to render PDFs locally whenever possible, keeping sensitive candidate data secure.
                  </p>
                </div>

                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                    <Code className="w-5 h-5" />
                    Google XYZ Formula Optimization
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Every bullet point generated by ResumeFlow adheres strictly to Google&apos;s recommended formula: <em>&quot;Accomplished [X] as measured by [Y], by doing [Z]&quot;</em>. This ensures your resume communicates quantified business impact to hiring managers.
                  </p>
                </div>

                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                    <Award className="w-5 h-5" />
                    Recruiter-Approved Design Guidelines
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Our document preambles follow formatting standards tested with senior technical recruiters at top tech firms (Google, Amazon, Microsoft, Meta), using clean fonts like Times New Roman, Computer Modern, and Helvetica.
                  </p>
                </div>
              </div>
            </section>

            {/* ─── Technology Stack ─── */}
            <section className="space-y-4">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Our Platform Architecture</h2>
              <p>
                ResumeFlow is built on top of modern high-performance web infrastructure designed for sub-second reactivity and extreme reliability:
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Next.js App Router:</strong> Server-side rendering, optimized bundle delivery, and strict CSP security headers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Convex Real-Time Database:</strong> Reactive live queries and state synchronization across sessions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>LaTeX Compilation Engine:</strong> Multi-layer fallback chain combining client-side WebAssembly, server pdflatex, and React-PDF vector compilation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>TailwindCSS Design System:</strong> Customized dark mode and glassmorphism user interfaces for fluid interaction.</span>
                </li>
              </ul>
            </section>

            {/* ─── Contact & Support CTA ─── */}
            <section className="p-6 bg-gradient-to-r from-rose-950/40 to-slate-900 rounded-2xl border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-white">Have questions or feedback?</h3>
                <p className="text-xs text-slate-400 mt-1">Our engineering team is always eager to help candidates succeed in their job search.</p>
              </div>
              <Link
                href="/info/contact"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all shrink-0"
              >
                Contact Us
              </Link>
            </section>
          </div>
        </StaticPageWrapper>
      </main>
      <Footer />
    </div>
  );
}
