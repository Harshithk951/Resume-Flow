"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { BrandLogo } from "@/components/BrandLogo";
import {
  ArrowRight,
  ArrowDown,
  Check,
  Plus,
  Minus,
} from "lucide-react";

export default function AtsResumeCheckerPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0); // First item open by default like HireRaft

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqItems = [
    {
      q: "What is an ATS resume checker?",
      a: "An ATS (Applicant Tracking System) resume checker scans your resume for keywords, structure, and formatting that automated hiring systems look for. Most companies use ATS to filter resumes before a human sees them — 75% of resumes are rejected before reaching a recruiter.",
    },
    {
      q: "How do I check if my resume is ATS friendly?",
      a: "Paste your resume and the specific job description into ResumeFlow. You'll get an ATS score from 0–100, a list of missing keywords, and a rewritten resume that is optimized for that job's ATS system — all in about 27 seconds.",
    },
    {
      q: "Why do companies use ATS systems?",
      a: "Large companies receive hundreds or thousands of applications per job. ATS systems automatically screen resumes by matching them against required keywords, qualifications, and skills from the job description. Resumes that don't match are rejected before a recruiter ever sees them.",
    },
    {
      q: "What ATS score do I need to pass?",
      a: "There is no universal threshold, but most recruiters shortlist resumes scoring above 60–70%. ResumeFlow shows your score before and after optimization. Users typically improve from 30–40 to 75–90 after a single optimization.",
    },
    {
      q: "Is the ATS checker free?",
      a: "Yes. You get 2 free runs to start, and each run includes the full ATS score. No credit card required. PDF downloads are free. Word (.docx) downloads are included with the Pro pass and paid plans.",
    },
    {
      q: "Is the ATS checker different from the resume optimizer?",
      a: "No — it is the same tool. ResumeFlow scores your resume against the job first, then rewrites it to close the gaps. One run gives you the ATS score, the missing keywords and the rewritten resume, and your 2 free monthly runs cover all of it.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-purple-500 selection:text-white flex flex-col justify-between">
      {/* ─── NAVBAR ──────────────────────────────────────────────── */}
      <Navbar />

      <main className="flex-1 w-full overflow-hidden">
        {/* ─── 1. HERO SECTION ──────────────────────────────────────── */}
        <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-20 border-b border-slate-100 overflow-hidden bg-white">
          {/* Ambient blob on the right matching HireRaft */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-[600px] h-[500px] bg-purple-100/40 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left Column: Headline, Copy, Callout, CTAs */}
              <div className="lg:col-span-7 text-left">
                <h1 className="font-sans text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6">
                  Is your resume <br />
                  even being{" "}
                  <span className="text-[#5B50E6]">read?</span>
                </h1>

                <p className="text-slate-600 text-base sm:text-[17px] leading-[1.65] max-w-xl mb-5 font-normal [text-wrap:pretty]">
                  75% of resumes are rejected by ATS before a human ever reads them — not because the candidate is underqualified, but because the resume doesn&apos;t have the right keywords. ResumeFlow checks your resume against the job description and tells you exactly what&apos;s missing.
                </p>

                {/* Lavender Callout Box matching HireRaft */}
                <div className="max-w-xl bg-[#F6F3FF] border border-purple-200/80 rounded-xl p-3.5 sm:p-4 text-xs sm:text-[14px] leading-relaxed text-slate-700 mb-7">
                  <strong className="font-bold text-slate-900">One tool, not two.</strong>{" "}
                  The ATS check is the first step of ResumeFlow&apos;s resume optimizer: you paste your resume and a job, and the same run gives you the score, the missing keywords and a rewritten resume.
                </div>

                {/* 2 CTAs */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Link
                    href="/job-check"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#5B50E6] hover:bg-[#4E44D6] text-white font-semibold text-sm sm:text-base shadow-sm shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Check my score free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href="#checklist"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm sm:text-base border border-slate-200/90 transition-all shadow-2xs hover:border-slate-300"
                  >
                    <span>Read the checklist</span>
                    <ArrowDown className="w-4 h-4 text-slate-400" />
                  </a>
                </div>

                <p className="text-xs text-slate-400 font-normal">
                  Sign in with Google · No credit card · 2 free runs to start, each with the full score
                </p>
              </div>

              {/* Right Column: Hero Funnel Master Illustration */}
              <div className="lg:col-span-5 relative flex items-center justify-center">
                <div className="relative w-full aspect-[4/3] max-w-[500px]">
                  <Image
                    src="/images/hr-ats-lander.png"
                    alt="An applicant tracking system scanning a resume and returning a keyword match score"
                    fill
                    priority
                    unoptimized
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. WHAT HAPPENS BEFORE A RECRUITER SEES YOU ───────────── */}
        <section className="py-16 sm:py-20 border-b border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                What happens before a recruiter sees you
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                Most large employers run an Applicant Tracking System first: software that parses your file, scores it against the posting, and ranks you. Three in four resumes stop there.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Step 1 · parse
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    It reads your file
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Two columns, text in images and tables are where resumes quietly break.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Step 2 · match
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    It counts the posting’s words
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Exact nouns beat clever synonyms. “Stakeholder reporting” is not “reporting for stakeholders”.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Step 3 · rank
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    It sorts you against everyone
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    A recruiter usually opens the top handful. Ranking is the whole game.
                  </p>
                </div>
              </div>

              {/* Where we come in */}
              <div className="p-6 rounded-2xl bg-[#F6F3FF] border border-purple-200/80 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7C3AED] mb-2">
                    Where we come in
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    We fix all three in 27 seconds
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Score, missing keywords, rewritten bullets, ATS-safe export.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. WHAT IS ATS AND WHY DOES IT MATTER? ────────────────── */}
        <section className="py-16 sm:py-20 border-b border-slate-100 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[#FAF9FE] border border-purple-100/70 p-8 sm:p-12 lg:p-14 shadow-xs">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-6">
                What is ATS and why does it matter?
              </h2>

              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                <p>
                  An <strong className="font-semibold text-slate-900">Applicant Tracking System (ATS)</strong> is software that companies use to automatically screen job applications before a recruiter sees them. When you apply online, your resume goes through an ATS that scores it based on how well it matches the job description — specifically by looking for exact keywords, job titles, skills, and qualifications.
                </p>
                <p>
                  If your resume doesn&apos;t include the right keywords — even if you&apos;re perfectly qualified — the ATS filters you out automatically. Studies show that <strong className="font-semibold text-slate-900">over 98% of Fortune 500 companies</strong> use ATS, and the rejection rate for resumes that don&apos;t pass is typically 75% or higher.
                </p>
                <p>
                  The problem is that most people write one generic resume and send it to every job. ATS systems are built to find resumes tailored to the specific role — so a generic resume almost always loses to a tailored one, regardless of qualifications.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. HOW RESUMEFLOW'S ATS CHECKER WORKS ─────────────────── */}
        <section className="py-20 sm:py-24 border-b border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                How ResumeFlow&apos;s ATS checker works
              </h2>
              <p className="text-slate-500 text-sm sm:text-base">
                One run of the optimizer, four steps, about 27 seconds, no card.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  num: "1",
                  badgeBg: "bg-[#F3ECFE] text-[#7C3AED]",
                  title: "Paste your resume + job description",
                  desc: "Upload a PDF or paste your resume text, then paste the job description. ResumeFlow extracts the keywords, required skills, and qualifications the employer is looking for.",
                },
                {
                  num: "2",
                  badgeBg: "bg-[#E6F8EF] text-[#059669]",
                  title: "Get your ATS score instantly",
                  desc: "ResumeFlow shows you a score from 0–100 reflecting how well your current resume matches the job. You’ll see exactly which keywords are missing, which bullets are weak, and what needs to be rewritten.",
                },
                {
                  num: "3",
                  badgeBg: "bg-[#FEF3C7] text-[#D97706]",
                  title: "Get a rewritten, ATS-optimized resume",
                  desc: "ResumeFlow rewrites your resume — injecting the missing keywords naturally, strengthening your bullet points with action verbs and quantified results, and formatting it correctly for ATS parsing.",
                },
                {
                  num: "4",
                  badgeBg: "bg-[#FEE2E2] text-[#E11D48]",
                  title: "Download and apply",
                  desc: "Download your optimized resume as a PDF for free, or as Word (.docx) with a paid plan. See your ATS score jump. Apply with confidence knowing your resume will make it past the filter.",
                },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl p-6 sm:p-7 bg-white border border-slate-100 shadow-sm shadow-slate-200/50 hover:shadow-md transition-all flex flex-col justify-between min-h-[260px]"
                >
                  <div>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-5 ${step.badgeBg}`}
                    >
                      {step.num}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 5. TOP ATS RESUME TIPS FOR 2026 (CHECKLIST) ───────────── */}
        <section id="checklist" className="py-20 sm:py-24 border-b border-slate-100 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[#FAF9FE] border border-purple-100/70 p-8 sm:p-12 shadow-xs">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  Top ATS resume tips for 2026
                </h2>
                <p className="text-slate-500 text-sm sm:text-base">
                  Fix these five tonight — free, no account.
                </p>
              </div>

              {/* Tips Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
                {[
                  {
                    title: "Match keywords exactly from the job description",
                    desc: 'ATS systems often look for exact phrases. If the job says "project management" and your resume says "managing projects," it may not match. Use the exact terms from the job posting.',
                  },
                  {
                    title: "Use standard section headings",
                    desc: '"Work Experience" ranks better than "My Career Journey." ATS parsers are trained on standard headings — stick to Experience, Education, Skills, and Certifications.',
                  },
                  {
                    title: "Avoid tables, columns, and text boxes",
                    desc: "Many ATS systems cannot parse content in tables or text boxes. Use a single-column format to ensure every word is read correctly.",
                  },
                  {
                    title: "Include skills as a dedicated section",
                    desc: "Add a Skills section with your technical and soft skills as a list. This makes it easier for ATS to extract and score your qualifications against the job requirements.",
                  },
                  {
                    title: "Tailor your resume for each application",
                    desc: "A resume that scores 80 for one job might score 30 for another. Always tailor keywords and content to match the specific job description — ResumeFlow makes this take 27 seconds instead of 30 minutes.",
                  },
                ].map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">
                        {tip.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {tip.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Callout Banner */}
              <div className="pt-6 border-t border-purple-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-700 font-medium text-center sm:text-left">
                  Done all five? The last 20 points are keyword-level — that part we automate.
                </p>
                <Link
                  href="/job-check"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#5B50E6] hover:bg-[#4E44D6] text-white font-semibold text-sm shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
                >
                  Score my resume free
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. CHECK YOUR ATS SCORE NOW — IT'S FREE ──────────────── */}
        <section className="py-16 sm:py-20 border-b border-slate-100 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl p-8 sm:p-12 text-center bg-[#F6F3FF] border border-[#E9E3FC] shadow-xs">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Check your ATS score now — it&apos;s free
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mb-6">
                Paste your resume and the job description. Get your score, see what&apos;s missing, and get a rewritten resume in about 27 seconds.
              </p>
              <Link
                href="/job-check"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#5B50E6] hover:bg-[#4E44D6] text-white font-semibold text-sm sm:text-base shadow-sm shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Start free — no card needed</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 7. FREQUENTLY ASKED QUESTIONS ────────────────────────── */}
        <section className="py-20 sm:py-24 border-b border-slate-100 bg-white" id="faq">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-center mb-10">
              Frequently asked questions
            </h2>

            <div className="space-y-3">
              {faqItems.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-2xs transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 text-base sm:text-lg cursor-pointer hover:text-purple-600 transition-colors"
                    >
                      <span className="pr-4">{item.q}</span>
                      <span className="text-purple-600 shrink-0">
                        {isOpen ? (
                          <Minus className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <Plus className="w-5 h-5 stroke-[2.5]" />
                        )}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 8. READY TO PASS THE ATS? BOTTOM CTA ─────────────────── */}
        <section className="py-20 sm:py-24 bg-white text-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Ready to pass the ATS?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mb-6">
              Join ambitious job seekers using ResumeFlow to get past the filter and in front of recruiters.
            </p>
            <Link
              href="/job-check"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#5B50E6] hover:bg-[#4E44D6] text-white font-semibold text-sm sm:text-base shadow-sm shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Check my resume free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-slate-400 mt-3 font-normal">
              2 free runs to start, each with your ATS score · No credit card
            </p>
          </div>
        </section>

        {/* ─── 9. COMPANY LOGOS STRIP ────────────────────────────────── */}
        <section className="pt-12 pb-10 bg-[#FAF9FE] border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs text-slate-400 font-medium mb-6">
              Our users optimize resumes for roles at
            </p>
            <div className="flex items-center justify-center gap-5 sm:gap-7 md:gap-9 lg:gap-11 flex-nowrap overflow-x-auto no-scrollbar opacity-60 grayscale hover:opacity-85 transition-opacity px-2">
              <span className="text-sm sm:text-base md:text-lg font-bold tracking-tight font-sans text-slate-500 whitespace-nowrap">
                amazon
              </span>
              <span className="text-sm sm:text-base md:text-lg font-black tracking-wider font-mono text-slate-500 whitespace-nowrap">
                SAP
              </span>
              <span className="text-sm sm:text-base md:text-lg font-bold tracking-widest uppercase font-serif text-slate-500 whitespace-nowrap">
                ORACLE
              </span>
              <span className="text-sm sm:text-base md:text-lg font-semibold tracking-tight text-slate-500 whitespace-nowrap">
                Deloitte.
              </span>
              <span className="text-sm sm:text-base md:text-lg font-semibold tracking-tight lowercase text-slate-500 whitespace-nowrap">
                salesforce
              </span>
              <span className="text-sm sm:text-base md:text-lg font-medium tracking-normal text-slate-500 whitespace-nowrap">
                Infosys
              </span>
              <span className="text-sm sm:text-base md:text-lg font-medium tracking-tight text-slate-500 whitespace-nowrap">
                Microsoft
              </span>
              <span className="text-sm sm:text-base md:text-lg font-bold tracking-normal text-slate-500 whitespace-nowrap">
                Google
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* ─── 10. 5-COLUMN FOOTER ───────────────────────────────────── */}
      <footer className="bg-[#FAF9FE] border-t border-slate-200/60 pt-16 pb-12 text-slate-600 text-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
            {/* Col 1: Brand */}
            <div className="col-span-2 md:col-span-1">
              <BrandLogo href="/" className="gap-2.5 mb-4" />
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                AI resume optimization for people who&rsquo;d rather be interviewing than reformatting.
              </p>
            </div>

            {/* Col 2: Product */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
                PRODUCT
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li>
                  <Link href="/optimize" className="hover:text-purple-600 transition-colors">
                    Optimizer
                  </Link>
                </li>
                <li>
                  <Link href="/ats-resume-checker" className="hover:text-purple-600 transition-colors">
                    ATS checker
                  </Link>
                </li>
                <li>
                  <Link href="/optimize" className="hover:text-purple-600 transition-colors">
                    Resume builder
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-purple-600 transition-colors">
                    Job tracker
                  </Link>
                </li>
                <li>
                  <Link href="/templates" className="hover:text-purple-600 transition-colors">
                    Templates
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: By Role */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
                BY ROLE
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li>
                  <Link href="/optimize" className="hover:text-purple-600 transition-colors">
                    Data analyst
                  </Link>
                </li>
                <li>
                  <Link href="/optimize" className="hover:text-purple-600 transition-colors">
                    Software engineer
                  </Link>
                </li>
                <li>
                  <Link href="/optimize" className="hover:text-purple-600 transition-colors">
                    Product manager
                  </Link>
                </li>
                <li>
                  <Link href="/optimize" className="hover:text-purple-600 transition-colors">
                    Marketing manager
                  </Link>
                </li>
                <li>
                  <Link href="/optimize" className="hover:text-purple-600 transition-colors">
                    All 200+ roles
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: For Teams */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
                FOR TEAMS
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li>
                  <Link href="/pricing" className="hover:text-purple-600 transition-colors">
                    Placement cells
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-purple-600 transition-colors">
                    Shared billing
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-purple-600 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-purple-600 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/optimize" className="hover:text-purple-600 transition-colors">
                    Resume builder India
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 5: Trust */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
                TRUST
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li>
                  <Link href="/legal/privacy" className="hover:text-purple-600 transition-colors">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="hover:text-purple-600 transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/legal/refund" className="hover:text-purple-600 transition-colors">
                    Refund policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="hover:text-purple-600 transition-colors">
                    Shipping &amp; delivery
                  </Link>
                </li>
                <li>
                  <Link href="/info/contact" className="hover:text-purple-600 transition-colors">
                    Contact support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Centered Bottom Copyright */}
          <div className="pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} ResumeFlow. Made for people who deserve the call back.
          </div>
        </div>
      </footer>
    </div>
  );
}
