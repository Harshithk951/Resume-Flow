import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RoleGuidesDirectory } from "@/components/RoleGuidesDirectory";
import { Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resume Guides for 203 Job Roles — ATS Keywords & Examples (2026) | ResumeFlow",
  description:
    "Comprehensive resume guides for 203 job roles. Learn the exact ATS keywords recruiters filter for, critical skills to list, common resume mistakes to avoid, and top hiring companies.",
  alternates: {
    canonical: "https://resumeflow.harshithkumar.in/resume-optimizer",
  },
  openGraph: {
    title: "Resume Guides for 203 Job Roles | ResumeFlow",
    description:
      "Explore recruiter-tested ATS keywords, top skills, and resume examples for 203 professional job roles.",
    url: "https://resumeflow.harshithkumar.in/resume-optimizer",
    siteName: "ResumeFlow",
    type: "website",
  },
};

export default function ResumeOptimizerHubPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-cyan-100 selection:text-cyan-950">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/60 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100/70 border border-cyan-200 text-cyan-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>2026 Job Role Playbook</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-tight">
              Resume guides for{" "}
              <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
                203 job roles
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
              Every guide covers the ATS keywords recruiters filter for in that role, the skills
              worth listing, the mistakes that get resumes rejected, and the companies hiring. Pick
              yours, then optimize your actual resume against a real job posting.
            </p>

            {/* Quick Benefits Row */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Recruiter-tested ATS keywords</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-500" />
                <span>Google XYZ quantified bullets</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Instant AI resume tailoring</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/optimize"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg"
              >
                Tailor Your Resume Now
              </Link>
            </div>
          </div>
        </section>

        {/* The 203 Roles Navigation Directory */}
        <RoleGuidesDirectory />
      </main>

      <Footer />
    </div>
  );
}
