import React from "react";
import Navbar from "@/components/Navbar";
import { StaticPageWrapper } from "@/components/StaticPageWrapper";
import { Info } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ResumeFlow — AI Resume Builder & Career Platform",
  description: "Learn about ResumeFlow — the AI-powered resume builder trusted by tech candidates. Client-side WASM compilation, ATS optimization, and zero-trust privacy.",
  alternates: { canonical: "https://resumeflow.harshithkumar.in/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-rose-500 selection:text-white flex flex-col justify-between">
      <Navbar />
      <main className="py-12 md:py-20 max-w-4xl mx-auto px-6 w-full flex-1">
        <StaticPageWrapper
          category="Company"
          title="About ResumeFlow"
          subtitle="Automating placement preparation and empowering tech candidates globally."
        >
          <div className="flex gap-4 items-center mb-6">
            <Info className="w-8 h-8 text-rose-600" />
            <div className="h-px bg-[var(--color-secondary-bg)]/60 flex-1" />
          </div>
          <div className="space-y-8 text-slate-300">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">Our Mission</h2>
              <p className="text-sm leading-relaxed text-slate-400">
                ResumeFlow was built on the core belief that applying for jobs shouldn't feel like a lottery.
                In a world dominated by automated tracking systems and algorithmic filtering, candidates deserve tools that level the playing field.
              </p>
            </section>
          </div>
        </StaticPageWrapper>
      </main>
      <footer className="py-8 border-t border-slate-800 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} ResumeFlow. All rights reserved.
      </footer>
    </div>
  );
}
