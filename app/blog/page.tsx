import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCalloutBanner from "@/components/BlogCalloutBanner";
import { GUIDES_DATA } from "@/lib/blogData";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Career & Resume Guides | ResumeFlow Resources",
  description:
    "5 guides on ATS screening, resume structure, cover letters and the Indian job market. No fluff, no filler — every claim has a number behind it.",
  alternates: {
    canonical: "https://resumeflow.harshithkumar.in/blog",
  },
  openGraph: {
    title: "Writing that actually helps | ResumeFlow Resources",
    description:
      "5 guides on ATS screening, resume structure, cover letters and the Indian job market. No fluff, no filler — every claim has a number behind it.",
    url: "https://resumeflow.harshithkumar.in/blog",
    siteName: "ResumeFlow",
    type: "website",
  },
};

export default function BlogHubPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-purple-500 selection:text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 w-full overflow-hidden">
        {/* ─── HERO HEADER ────────────────────────────────────────── */}
        <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-16 border-b border-slate-100 bg-white">
          {/* Ambient background blur */}
          <div
            aria-hidden="true"
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-200/20 blur-[120px] rounded-full pointer-events-none"
          />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Title */}
            <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-5">
              Writing that actually helps
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-normal [text-wrap:pretty]">
              5 guides on ATS screening, resume structure, cover letters and the Indian job market. No fluff, no filler — every claim has a number behind it.
            </p>
          </div>
        </section>

        {/* ─── GUIDES GRID ────────────────────────────────────────── */}
        <section className="py-12 sm:py-16 bg-[#FDFDFD]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {GUIDES_DATA.map((guide) => {
                const tagColorClasses =
                  guide.tag === "ATS"
                    ? "bg-purple-50 text-[#5B50E6] border-purple-200/60"
                    : guide.tag === "India"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                    : "bg-blue-50 text-blue-700 border-blue-200/60";

                return (
                  <Link
                    key={guide.slug}
                    href={`/blog/${guide.slug}`}
                    className="group bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all duration-200 flex flex-col justify-between hover:-translate-y-1"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        {/* Semantic Tag Badge */}
                        <span
                          className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${tagColorClasses}`}
                        >
                          {guide.tag}
                        </span>

                        {/* Date & Read Time */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {guide.date} · {guide.readTime}
                          </span>
                        </div>
                      </div>

                      {/* Guide Title */}
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#5B50E6] transition-colors leading-snug mb-3">
                        {guide.title}
                      </h2>

                      {/* Guide Snippet */}
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-6">
                        {guide.snippet}
                      </p>
                    </div>

                    {/* Bottom Card Link */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold text-[#5B50E6]">
                      <span>Read guide</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── BOTTOM CALLOUT BANNER ──────────────────────────────── */}
        <BlogCalloutBanner />
      </main>

      <Footer />
    </div>
  );
}
