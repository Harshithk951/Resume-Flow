import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RoleGuidesDirectory } from "@/components/RoleGuidesDirectory";
import {
  getRoleBySlug,
  ALL_ROLES_RAW,
} from "@/lib/roleGuides";
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Building2,
  FileCheck2,
  Layers,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return ALL_ROLES_RAW.map((r) => ({
    slug: r.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const role = getRoleBySlug(slug);

  if (!role) {
    return {
      title: "Role Guide Not Found | ResumeFlow",
      description: "The requested resume role guide could not be found.",
    };
  }

  const title = `${role.title} Resume Guide: ATS Keywords, Skills & Examples (2026) | ResumeFlow`;
  const description = `Authoritative 2026 ATS resume guide for ${role.title}s. Discover recruiter-tested keywords, essential skills, fatal bullet mistakes, and top hiring employers.`;
  const canonicalUrl = `https://resumeflow.harshithkumar.in/resume-optimizer/${role.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "ResumeFlow",
      type: "article",
    },
  };
}

export default async function RoleGuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const role = getRoleBySlug(slug);

  if (!role) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-cyan-100 selection:text-cyan-950">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-slate-200/60 bg-slate-50/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs font-medium text-slate-500 overflow-x-auto">
            <Link href="/" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link
              href="/resume-optimizer"
              className="hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              Resume Guides
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-semibold truncate">
              {role.title} Resume Guide
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-10 pb-14 sm:pt-16 sm:pb-20 border-b border-slate-200/60 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>{role.category} · 2026 Guide</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950 leading-tight">
              {role.title} Resume Guide:{" "}
              <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
                ATS Keywords, Skills & Examples
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Recruiters screening for <strong>{role.title}</strong> positions receive hundreds of
              applicants per opening. This guide details the essential ATS keywords, required
              technical proficiencies, critical resume mistakes that trigger automated rejection,
              and companies currently hiring.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="text-xs text-slate-500 font-medium">Recruiter Scan Time</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">~6 Seconds</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="text-xs text-slate-500 font-medium">Target ATS Match</div>
                <div className="text-lg font-black text-emerald-600 mt-0.5">85% - 95%</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="text-xs text-slate-500 font-medium">Recommended Layout</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">ATS Strict (1 Col)</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="text-xs text-slate-500 font-medium">Top Industry</div>
                <div className="text-lg font-black text-cyan-700 mt-0.5 truncate">
                  {role.category.split("&")[0].trim()}
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/optimize"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-md"
              >
                <span>Optimize Your {role.title} Resume</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/job-check"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
              >
                Check Free ATS Match Score
              </Link>
            </div>
          </div>
        </section>

        {/* Core Content Body */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
          {/* 1. ATS Keywords */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 font-bold text-sm flex items-center justify-center">
                1
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Core ATS Keywords Recruiters Filter For in a {role.title}
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Applicant Tracking Systems (such as Greenhouse, Lever, Workday, and Taleo) scan for
              exact keywords specified in job requisitions. Below are the highest-weight keyword
              categories you should embed contextually across your experience and summary sections:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-cyan-600" />
                  <span>Hard Skills & Competencies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.atsKeywords.coreHardSkills.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Tools & Technologies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.atsKeywords.toolsAndTech.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Methodologies & Frameworks</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.atsKeywords.methodologies.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                  <span>High-Impact Soft Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.atsKeywords.softSkills.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 2. Skills Worth Listing */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 font-bold text-sm flex items-center justify-center">
                2
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Essential Skills Worth Listing on a {role.title} Resume
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Avoid listing generic catch-all buzzwords. Group your skills into structured,
              scannable sections so hiring managers can verify your domain depth in under 5 seconds:
            </p>

            <div className="space-y-4">
              {role.skillsWorthListing.map((group) => (
                <div
                  key={group.category}
                  className="p-5 rounded-xl border border-slate-200/80 bg-white shadow-xs"
                >
                  <h3 className="text-sm font-bold text-slate-900 mb-3">{group.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Mistakes That Get Resumes Rejected */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 font-bold text-sm flex items-center justify-center">
                3
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Mistakes That Get {role.title} Resumes Rejected
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Over 75% of qualified applicants never receive an interview due to structural and
              content mistakes in their resume. Here are the 4 most frequent issues detected by ATS
              parsers:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {role.criticalMistakes.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-rose-100 bg-rose-50/30 space-y-3"
                >
                  <div className="flex items-start gap-2 text-rose-700 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{item.mistake}</span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Impact: </strong>
                    {item.impact}
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-rose-200/60 text-xs text-slate-700">
                    <strong className="text-emerald-700 font-bold">Fix: </strong>
                    {item.fix}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Proven Bullet Point Formula */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 font-bold text-sm flex items-center justify-center">
                4
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                How to Write Quantified Bullet Points (Google XYZ Formula)
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Replace passive job duties with Google&apos;s proven formula:{" "}
              <strong>&ldquo;Accomplished [X], as measured by [Y], by doing [Z].&rdquo;</strong>
            </p>

            <div className="space-y-4">
              {role.sampleBulletPoints.map((sample, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Example: {sample.roleContext}
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-rose-100/40 border border-rose-200/60 text-xs text-rose-900">
                      <span className="font-bold text-rose-700">Weak (Passive): </span>
                      {sample.weak}
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-100/40 border border-emerald-200/60 text-xs text-emerald-950 font-medium">
                      <span className="font-bold text-emerald-700">Strong (Quantified): </span>
                      {sample.strong}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 italic">{sample.metricsExplained}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Top Hiring Companies */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 font-bold text-sm flex items-center justify-center">
                5
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Top Companies Hiring For {role.title}s
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Companies actively recruiting for {role.title} positions ranging from Tier-1 tech
              enterprises to market leaders:
            </p>

            <div className="flex flex-wrap gap-2.5">
              {role.companiesHiring.map((company) => (
                <div
                  key={company}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-800 shadow-xs"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 6. The 203 Roles Directory Section (Added on EVERY role page as requested) */}
        <RoleGuidesDirectory currentSlug={slug} />
      </main>

      <Footer />
    </div>
  );
}
