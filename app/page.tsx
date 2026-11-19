"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { BrandLogo } from "@/components/BrandLogo";
import {
  Sparkles,
  ArrowRight,
  Check,
  TrendingUp,
  ChevronDown,
  FileText,
  Clock,
  GraduationCap,
  Shuffle,
  Users,
  Target,
  Download,
  Code,
  Volume2,
  VolumeX,
  Play,
  ChevronRight,
} from "lucide-react";

interface RoleComparison {
  title: string;
  category: string;
  beforeScore: number;
  afterScore: number;
  beforeKeywords: string;
  afterKeywords: string;
  beforeBullet: string;
  afterBullet: {
    prefix: string;
    highlights: string[];
    suffix?: string;
  };
  missingKeywords: string[];
  matchedKeywords: string[];
}

const ROLE_COMPARISONS: Record<string, RoleComparison> = {
  data: {
    title: "Senior Data Analyst",
    category: "Analytics & Business Intelligence",
    beforeScore: 62,
    afterScore: 92,
    beforeKeywords: "7 / 24",
    afterKeywords: "22 / 24",
    beforeBullet:
      "Responsible for handling reporting tasks and working with the data team on various dashboards for the business.",
    afterBullet: {
      prefix: "Built 12 Power BI dashboards used by ",
      highlights: [
        "40+ stakeholders",
        "cutting manual reporting time by 63%",
        "surfacing $1.2M in leakage via SQL cohort analysis",
      ],
      suffix: ".",
    },
    missingKeywords: ["Power BI", "SQL Cohort Analysis", "Stakeholder Comms", "Data Governance"],
    matchedKeywords: ["Power BI", "SQL", "Cohort Analysis", "Dashboards", "Reporting Automation"],
  },
  pm: {
    title: "Product Manager",
    category: "Product Management & Growth",
    beforeScore: 59,
    afterScore: 94,
    beforeKeywords: "6 / 22",
    afterKeywords: "21 / 22",
    beforeBullet:
      "Managed product backlog and worked with engineering team to deliver sprint tasks on time.",
    afterBullet: {
      prefix: "Spearheaded end-to-end launch of ",
      highlights: [
        "self-serve onboarding funnel",
        "lifting user activation by 28%",
        "reducing 30-day customer churn by 4.2%",
        "140,000 monthly active users",
      ],
      suffix: ", prioritizing engineering backlog through continuous discovery and customer telemetry.",
    },
    missingKeywords: ["Onboarding Funnel", "Activation Rate", "Churn Reduction", "Discovery", "User Telemetry"],
    matchedKeywords: ["Onboarding Funnel", "Activation Rate", "Product Discovery", "Churn Reduction", "Telemetry", "Sprint Prioritization"],
  },
  fresher: {
    title: "Fresher · IT",
    category: "Junior Software Engineer",
    beforeScore: 54,
    afterScore: 91,
    beforeKeywords: "5 / 20",
    afterKeywords: "19 / 20",
    beforeBullet:
      "Worked on final year college project in React and Java. Did coding, debugging, and bug fixes.",
    afterBullet: {
      prefix: "Engineered full-stack responsive web application using ",
      highlights: [
        "React, TypeScript & Spring Boot",
        "architecting REST APIs",
        "processed 10,000+ daily mock transactions",
        "sub-120ms response times",
      ],
      suffix: ", implementing JWT authentication and containerizing microservices via Docker.",
    },
    missingKeywords: ["TypeScript", "Spring Boot", "REST APIs", "JWT Auth", "Docker", "Latency"],
    matchedKeywords: ["React", "TypeScript", "Spring Boot", "REST APIs", "Docker", "Microservices", "JWT"],
  },
};

const LANDING_FAQS = [
  {
    question: "Will the AI make up experience or lie on my resume?",
    answer:
      "Never. ResumeFlow only pulls from details present in your original resume. It sharpens passive phrasing, integrates keywords from the target job description that legitimately match your domain, and highlights measurable impact without ever inventing false credentials, degrees, or employers.",
  },
  {
    question: "How does the 2-optimization free tier work?",
    answer:
      "Every new user receives 2 free full-length resume improvements with zero expiration date. No credit card is required. You can paste your resume and target job description, review all before-and-after bullet rewrites, and download the finished ATS-compliant PDF completely free.",
  },
  {
    question: "What is the difference between PDF and Word (.docx) downloads?",
    answer:
      "Free users can download standard ATS-optimized PDFs indefinitely. Pro and Power members can also download fully editable Word (.docx) documents, allowing custom formatting, personalized local touches, or further revisions before submitting to employers.",
  },
  {
    question: "Do you store or sell my resume data?",
    answer:
      "No. We never sell your personal contact info, resume text, or employment history to third parties or recruiters. Your data is strictly encrypted in transit (SSL 256-bit) and stored solely to power your private account history and Saved Resumes library.",
  },
  {
    question: "Can I use ResumeFlow if I have no corporate work experience?",
    answer:
      "Yes! Our system has tailored rubrics for students, fresh graduates, and career changers. It extracts high-value keywords from your college projects, coursework, open-source contributions, and technical certifications so you can pass ATS screens even without corporate tenure.",
  },
];

/**
 * HeroVideoPlayer — Replaces the static right mockup box with the authentic
 * ProductAD video player, including auto-looping, poster preview, tap for sound hint,
 * and audio controls.
 */
function HeroVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showTapHint, setShowTapHint] = useState(true);

  useEffect(() => {
    if (!showTapHint || !isMuted) return;
    const timer = setTimeout(() => setShowTapHint(false), 9000);
    return () => clearTimeout(timer);
  }, [showTapHint, isMuted]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    if (!nextMuted) {
      video.volume = 1;
      void video.play();
    }
    setIsMuted(nextMuted);
    setShowTapHint(false);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      className="relative w-full aspect-[16/9] sm:aspect-[16/10] rounded-[20px] overflow-hidden border border-[#EDEAF7] bg-[#F4F2FA] group transition-all"
      style={{
        boxShadow: "0 40px 80px -50px rgba(20,20,43,.5), 0 20px 40px -25px rgba(20,20,43,.25)",
      }}
    >
      <video
        ref={videoRef}
        src="/ProductAD.mov"
        poster="/hero-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Play/Pause overlay indicator when paused */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-opacity"
        >
          <div className="w-14 h-14 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
            <Play className="w-6 h-6 ml-0.5 fill-current text-slate-900" />
          </div>
        </div>
      )}

      {/* Floating Audio Controls in bottom right */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        {showTapHint && isMuted && (
          <div className="pointer-events-none flex items-center">
            <span className="whitespace-nowrap rounded-full border border-white/40 bg-slate-900/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md animate-pulse">
              Tap for sound
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={toggleSound}
          title={isMuted ? "Tap for sound" : "Mute audio"}
          aria-label={isMuted ? "Tap for sound" : "Mute audio"}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3F3D56]/85 hover:bg-[#3F3D56] text-white shadow-md backdrop-blur-sm transition-all hover:scale-105 focus:outline-none cursor-pointer"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<keyof typeof ROLE_COMPARISONS>("data");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const activeRole = ROLE_COMPARISONS[selectedRole];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-purple-500 selection:text-white flex flex-col justify-between">
      {/* ─── 1. PUBLIC NAVBAR ──────────────────────────────────────── */}
      <Navbar />

      <main className="flex-1 w-full overflow-hidden">
        {/* ─── 2. HERO SECTION ──────────────────────────────────────── */}
        <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-slate-100 overflow-hidden bg-white">
          {/* Subtle purple radial glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-200/30 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Headline, Subtitle, CTAs, Trust Badges */}
              <div className="lg:col-span-7 text-left">
                <h1 className="font-sans text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                  Your resume, <br />
                  <span className="text-[#5B50E6]">
                    ready for the role.
                  </span>
                </h1>

                <p className="text-[#555267] text-[18px] leading-[1.6] max-w-[430px] [text-wrap:pretty] mt-[22px] mb-8 font-normal">
                  Match your resume to the job you&rsquo;re applying for. Review the changes and download a PDF for free. Paid plans also include Word downloads.
                </p>

                {/* 2 CTAs */}
                <div className="flex flex-wrap items-center gap-3 mb-7">
                  <Link
                    href="/optimize"
                    className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-[#5B50E6] hover:bg-[#4E44D6] text-white font-semibold text-base shadow-sm shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Optimize my resume</span>
                  </Link>

                  <a
                    href="#example-rewrite"
                    className="inline-flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200/90 transition-all shadow-2xs hover:border-slate-300"
                  >
                    <span>See what changes</span>
                    <span className="text-slate-400">→</span>
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="pt-2 space-y-2">
                  <p className="text-sm text-[#555267] font-medium italic">
                    &ldquo;Your resume should speak the exact language of the job you want.&rdquo;
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" /> No card required
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" /> We never sell your data
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" /> 2 free optimizations to start
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Video Player */}
              <div className="lg:col-span-5 relative">
                <HeroVideoPlayer />
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. 4 STAT METRIC BOXES ───────────────────────────────── */}
        <section className="py-12 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">
              Real-time optimization benchmarks across top applicant tracking systems
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    94%
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Average ATS match rate
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    3.4x
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    More interview callbacks
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    27 sec
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Average optimize time
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    PDF
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Free downloads on every plan
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. BEFORE & AFTER REWRITE COMPARISON WITH ROLE TABS ──── */}
        <section id="example-rewrite" className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[#FAF9FE] border border-purple-100/70 p-6 sm:p-10 lg:p-12 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                    EXAMPLE REWRITE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    What actually changes in your resume
                  </h2>
                </div>

                {/* Role selector pills matching HireRaft exactly */}
                <div className="inline-flex items-center gap-1.5 p-1 bg-white rounded-full border border-slate-200/80 shadow-2xs self-start md:self-auto">
                  {[
                    { id: "data", label: "Senior Data Analyst" },
                    { id: "pm", label: "Product Manager" },
                    { id: "fresher", label: "Fresher · IT" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedRole(tab.id as keyof typeof ROLE_COMPARISONS)}
                      className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        selectedRole === tab.id
                          ? "bg-[#1E293B] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Side-by-side comparison matching HireRaft Screenshot exactly */}
              <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
                {/* BEFORE CARD (Left 5 cols) */}
                <div className="lg:col-span-5 rounded-2xl p-6 sm:p-7 bg-white border border-slate-100 shadow-2xs flex flex-col justify-between min-h-[310px]">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        BEFORE
                      </span>
                      <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#FEE2E2]/60 text-[#EF4444]">
                        {activeRole.beforeScore}% match
                      </span>
                    </div>

                    <div className="border-l-2 border-rose-300 pl-4 py-1.5 my-4 text-slate-600 text-sm leading-relaxed">
                      &ldquo;{activeRole.beforeBullet}&rdquo;
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Keywords present</span>
                      <span className="font-semibold text-slate-800">{activeRole.beforeKeywords}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Quantified bullets</span>
                      <span className="font-semibold text-slate-800">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Skills matched</span>
                      <span className="font-semibold text-slate-800">4 / 11</span>
                    </div>
                  </div>
                </div>

                {/* CENTER ARROW (1 col) */}
                <div className="lg:col-span-1 flex justify-center">
                  <div className="w-9 h-9 rounded-full bg-[#5B50E6] text-white flex items-center justify-center shadow-md">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* AFTER CARD (Right 5 cols) - Clean white with green line and bold metrics, matching HireRaft */}
                <div className="lg:col-span-5 rounded-2xl p-6 sm:p-7 bg-white border border-slate-100 shadow-2xs flex flex-col justify-between min-h-[310px]">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        AFTER RESUMEFLOW
                      </span>
                      <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#16A34A]">
                        {activeRole.afterScore}% match +30
                      </span>
                    </div>

                    <div className="border-l-2 border-emerald-500 pl-4 py-1.5 my-4 text-slate-700 text-sm leading-relaxed">
                      &ldquo;{activeRole.afterBullet.prefix}
                      {activeRole.afterBullet.highlights.map((hl, i) => (
                        <span key={i}>
                          <strong className="font-bold text-slate-900">
                            {hl}
                          </strong>
                          {i < activeRole.afterBullet.highlights.length - 1 ? ", " : ""}
                        </span>
                      ))}
                      {activeRole.afterBullet.suffix}&rdquo;
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Keywords present</span>
                      <span className="font-semibold text-emerald-600">{activeRole.afterKeywords}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Quantified bullets</span>
                      <span className="font-semibold text-emerald-600">9</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Skills matched</span>
                      <span className="font-semibold text-emerald-600">10 / 11</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. HOW IT WORKS: 4 NUMBERED STEPS ────────────────────── */}
        <section id="how-it-works" className="py-20 sm:py-24 border-b border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                How ResumeFlow works
              </h2>
              <p className="text-slate-500 text-sm sm:text-base">
                Four steps. One paste, one prompt, one download.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  num: "1",
                  title: "Add your resume",
                  desc: "Paste the text, upload a PDF, or reuse one you saved earlier.",
                  badgeBg: "bg-[#F3ECFE] text-[#7C3AED]",
                  imageSrc: "/images/how-it-works/step1.png",
                  alt: "Add your resume illustration",
                },
                {
                  num: "2",
                  title: "Add the job",
                  desc: "Paste the description or drop a posting URL — we fetch it live.",
                  badgeBg: "bg-[#E6F8EF] text-[#059669]",
                  imageSrc: "/images/how-it-works/step2.png",
                  alt: "Add the job illustration",
                },
                {
                  num: "3",
                  title: "Review the changes",
                  desc: "Keywords matched, bullets rewritten, format kept ATS-safe.",
                  badgeBg: "bg-[#FEF3C7] text-[#D97706]",
                  imageSrc: "/images/how-it-works/step3.png",
                  alt: "Review the changes illustration",
                },
                {
                  num: "4",
                  title: "Download & apply",
                  desc: "Download a PDF for free, or Word with a paid plan — then log it in the tracker.",
                  badgeBg: "bg-[#FEE2E2] text-[#E11D48]",
                  imageSrc: "/images/how-it-works/step4.png",
                  alt: "Download and apply illustration",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl p-6 sm:p-7 bg-white border border-slate-100 shadow-sm shadow-slate-200/50 hover:shadow-md transition-all flex flex-col justify-between min-h-[330px]"
                >
                  <div>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-5 ${item.badgeBg}`}>
                      {item.num}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{item.desc}</p>
                  </div>
                  <div className="flex items-center justify-center mt-auto pt-4 pb-1">
                    <Image
                      src={item.imageSrc}
                      alt={item.alt}
                      width={280}
                      height={280}
                      unoptimized
                      className="w-28 h-28 sm:w-32 sm:h-32 object-contain transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 6. TAILOR, EDIT AND DOWNLOAD SECTION WITH MOCKUP ─────── */}
        <section id="features" className="py-20 sm:py-28 border-b border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Feature points matching HireRaft exactly */}
              <div className="lg:col-span-5">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                  Tailor, edit and download
                </h2>
                <p className="text-slate-500 text-sm sm:text-base mb-8 max-w-md leading-relaxed">
                  Match the job&apos;s requirements, improve your wording and keep a separate resume for each application.
                </p>

                <div className="space-y-3.5">
                  {[
                    {
                      title: "Resume tailoring",
                      desc: "Tailored to the exact job you're applying for.",
                      icon: FileText,
                      iconBg: "bg-[#F5F3FF] text-[#7C3AED]",
                    },
                    {
                      title: "ATS score checker",
                      desc: "See how well your resume passes ATS filters.",
                      icon: Target,
                      iconBg: "bg-[#ECFDF5] text-[#059669]",
                    },
                    {
                      title: "Keyword tracker",
                      desc: "Know which terms you're missing — and if an edit drops one.",
                      icon: Sparkles,
                      iconBg: "bg-[#FFF1F2] text-[#E11D48]",
                    },
                    {
                      title: "Bullet rewrites & skill roadmap",
                      desc: "Before/after examples, plus what to learn next.",
                      icon: TrendingUp,
                      iconBg: "bg-[#FFFBEB] text-[#D97706]",
                    },
                    {
                      title: "Templates & exports",
                      desc: "Free PDF downloads. Word (.docx) included with paid plans.",
                      icon: Download,
                      iconBg: "bg-[#EFF6FF] text-[#2563EB]",
                    },
                  ].map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors group cursor-default"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${feat.iconBg}`}>
                          <feat.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                            {feat.title}
                          </h4>
                          <p className="text-xs text-slate-500 leading-normal">{feat.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: High-Fidelity App Dashboard Mockup matching HireRaft Screenshot */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row">
                  {/* Left Mini Sidebar Preview */}
                  <div className="w-full md:w-44 bg-slate-50/60 border-b md:border-b-0 md:border-r border-slate-100 p-4 flex flex-col justify-between shrink-0">
                    <div>
                      <div className="flex items-center gap-2 mb-5 px-1">
                        <BrandLogo size="sm" showText={true} />
                      </div>

                      <nav className="space-y-1">
                        <div className="px-3 py-1.5 rounded-lg bg-[#F5F3FF] text-[#5B50E6] font-semibold text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5B50E6]" />
                          <span>Optimizer</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg text-slate-500 text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span>ATS checker</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg text-slate-500 text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span>Saved resumes</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg text-slate-500 text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span>Job tracker</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg text-slate-500 text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span>Templates</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg text-slate-500 text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span>Billing</span>
                        </div>
                      </nav>
                    </div>

                    <div className="mt-8 p-3 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        FREE PLAN
                      </span>
                      <span className="text-xs font-bold text-slate-800 block mb-1.5">
                        1 of 2 left
                      </span>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#5B50E6] rounded-full w-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Right Main Mockup View */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between bg-white">
                    {/* Header of main view */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">Good afternoon, Ananya</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Let&apos;s make your next opportunity yours.</p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-bold text-xs flex items-center justify-center">
                        A
                      </div>
                    </div>

                    {/* Middle 2 Cards (Gauge & Skills) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
                      {/* ATS Gauge Card */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          YOUR ATS SCORE
                        </span>
                        <div className="relative inline-flex items-center justify-center my-1">
                          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              className="stroke-slate-100"
                              strokeWidth="8"
                              fill="transparent"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              className="stroke-emerald-500"
                              strokeWidth="8"
                              strokeDasharray={2 * Math.PI * 40}
                              strokeDashoffset={2 * Math.PI * 40 * (1 - 0.92)}
                              strokeLinecap="round"
                              fill="transparent"
                            />
                          </svg>
                          <div className="absolute text-center">
                            <div className="text-2xl font-extrabold text-slate-900 leading-none">92%</div>
                            <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">Excellent</div>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-emerald-600 mt-1">↑ 30 points</div>
                      </div>

                      {/* Top Matched Skills Card */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                          TOP MATCHED SKILLS
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#ECFDF5] text-[#059669]">
                            Data analysis
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#ECFDF5] text-[#059669]">
                            SQL
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#ECFDF5] text-[#059669]">
                            Python
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#ECFDF5] text-[#059669]">
                            Power BI
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#FFFBEB] text-[#D97706] w-full mt-1 block">
                            Stakeholder comms — missing
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Resume Card */}
                    <div className="rounded-xl p-3 border border-slate-100 bg-white shadow-2xs flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#FEE2E2] flex items-center justify-center text-[#EF4444]">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">Data_Analyst_Resume.pdf</h5>
                          <p className="text-[10px] text-slate-400">Optimized 2 min ago · edited by you</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-600">92%</div>
                        <div className="text-[9px] text-slate-400 uppercase">ATS score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. AUDIENCE SEGMENTATION: 5 PASTEL TINTED CARDS ──────── */}
        <section className="py-20 sm:py-24 border-b border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                Built for whoever you are right now
              </h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
                Tailored resume optimization for every stage — from first-years and career switchers to engineering leads and placement cells.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Card 1: Students & freshers */}
              <div className="p-6 rounded-2xl bg-[#F5F4FF] border border-indigo-100 flex flex-col justify-between hover:shadow-sm transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Students & freshers</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    No experience? We surface what counts.
                  </p>
                </div>
              </div>

              {/* Card 2: IT professionals */}
              <div className="p-6 rounded-2xl bg-[#ECFDF5] border border-emerald-100 flex flex-col justify-between hover:shadow-sm transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">IT professionals</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Stack keywords that survive the filter.
                  </p>
                </div>
              </div>

              {/* Card 3: Management */}
              <div className="p-6 rounded-2xl bg-[#FEFCE8] border border-amber-100 flex flex-col justify-between hover:shadow-sm transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Management</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Scope, headcount, P&L — quantified.
                  </p>
                </div>
              </div>

              {/* Card 4: Career changers */}
              <div className="p-6 rounded-2xl bg-[#FFF1F2] border border-rose-100 flex flex-col justify-between hover:shadow-sm transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                    <Shuffle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Career changers</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Translate old wins into new language.
                  </p>
                </div>
              </div>

              {/* Card 5: Placement cells */}
              <div className="p-6 rounded-2xl bg-[#F0F9FF] border border-sky-100 flex flex-col justify-between hover:shadow-sm transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Placement cells</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    One shared balance, whole cohort covered.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 8. LANDING PAGE FAQ ACCORDION ("Common questions") ──── */}
        <section className="py-20 sm:py-24 border-b border-slate-100 bg-white" id="faq">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                Common questions
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Everything you need to know about our AI engine, privacy, and free tier.
              </p>
            </div>

            <div className="space-y-3">
              {LANDING_FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-2xs transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 text-slate-900 hover:text-purple-700 transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="font-semibold text-base sm:text-lg">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-purple-600 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-purple-700" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 9. BOTTOM CTA CARD ──────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl p-8 sm:p-12 lg:p-14 bg-[#FAF9FE] border border-purple-100/70 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl text-center md:text-left">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                  Have a job in mind?
                </h2>
                <p className="text-slate-500 text-sm sm:text-base mb-6">
                  Start with your resume and the job description. Your first two optimizations are free.
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Link
                    href="/optimize"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-[#5B50E6] hover:bg-[#4E44D6] text-white font-semibold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Optimize my resume
                  </Link>

                  <Link
                    href="/job-check"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200/90 shadow-2xs transition-all hover:border-slate-300"
                  >
                    <span>Check ATS Score</span>
                    <span className="text-slate-400">→</span>
                  </Link>
                </div>
              </div>

              {/* Right Floating Stat Box */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:px-8 sm:py-7 text-center shrink-0 min-w-[210px]">
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  24,500+
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  resumes optimized
                </div>
                <div className="text-xs font-semibold text-emerald-600 mt-2">
                  40+ countries
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 10. COMPANY LOGOS STRIP ────────────────────────────────── */}
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
                Deloitte
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

      {/* ─── 11. 5-COLUMN FOOTER ───────────────────────────────────── */}
      <footer className="bg-[#FAF9FE] border-t border-slate-200/60 pt-16 pb-12 text-slate-600 text-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
            {/* Col 1: Brand */}
            <div className="col-span-2 md:col-span-1">
              <BrandLogo href="/" className="gap-2.5 mb-4 text-slate-900 dark:text-white" />
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
                  <Link href="/resume-optimizer/data-analyst" className="hover:text-purple-600 transition-colors">
                    Data analyst
                  </Link>
                </li>
                <li>
                  <Link href="/resume-optimizer/software-engineer" className="hover:text-purple-600 transition-colors">
                    Software engineer
                  </Link>
                </li>
                <li>
                  <Link href="/resume-optimizer/product-manager" className="hover:text-purple-600 transition-colors">
                    Product manager
                  </Link>
                </li>
                <li>
                  <Link href="/resume-optimizer/marketing-manager" className="hover:text-purple-600 transition-colors">
                    Marketing manager
                  </Link>
                </li>
                <li>
                  <Link href="/resume-optimizer" className="hover:text-purple-600 transition-colors font-semibold text-slate-700">
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
