"use client";

import { useState, memo, useEffect, useRef } from "react";

// app/page.tsx
//
// Premium Landing Page for ResumeFlow — Clean Bento Red Edition
// Features a high-fidelity Bento-Box layout, Rose/Red gradients, Framer Motion entrance & hover states,
// and realistic, clean CSS-based UI mockups including:
// 1. Staggered entrance animations.
// 2. ATS Score circle ring transitions stroke colors (Red -> Yellow -> Green) in real-time.
// 3. Before/After text block with strikethrough & green success optimization widget.

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { BrandLogo } from "@/components/BrandLogo";
import TemplateCarousel from "@/components/TemplateCarousel";
import { PricingSection } from "@/components/PricingSection";
import { carouselTemplates } from "@/lib/latex/carouselTemplates";
import { getTemplatesHref } from "@/lib/templates/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion, useInView } from "framer-motion";
import {
  Target,
  Globe,
  FileText,
  Zap,
  Shield,
  BarChart3,
  Briefcase,
  ArrowRight,
  Sparkles,
  ScanSearch,
  Brain,
  Check,
  CheckCircle2,
  Volume2,
} from "lucide-react";

// Entrance Animation Variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const ATS_RING_CIRCUMFERENCE = 251.2;
const ATS_RING_TARGET_OFFSET = 5.02;

function AtsScoreGauge() {
  const gaugeRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gaugeRef, { once: true, amount: 0.45 });
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const start = performance.now();
    const duration = 2000;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setScore(Math.round(progress * 98));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [isInView]);

  return (
    <div
      ref={gaugeRef}
      className="mt-8 bg-gradient-to-tr from-slate-50 to-rose-50/20 rounded-2xl p-6 border border-slate-100 flex justify-center items-center h-[220px] relative"
    >
      <div className="relative w-36 h-36 flex items-center justify-center">
        <div
          className={`absolute inset-0 bg-rose-500/5 rounded-full blur-xl transition-opacity duration-500 ${
            isInView ? "animate-pulse opacity-100" : "opacity-0"
          }`}
        />
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            strokeWidth="7"
            fill="transparent"
            strokeDasharray={ATS_RING_CIRCUMFERENCE}
            initial={{
              strokeDashoffset: ATS_RING_CIRCUMFERENCE,
              stroke: "#EF4444",
            }}
            animate={
              isInView
                ? {
                    strokeDashoffset: ATS_RING_TARGET_OFFSET,
                    stroke: ["#EF4444", "#EAB308", "#22C55E"],
                  }
                : {
                    strokeDashoffset: ATS_RING_CIRCUMFERENCE,
                    stroke: "#EF4444",
                  }
            }
            transition={{ duration: 2.0, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center px-2">
          <span className="text-3xl font-black text-slate-800 leading-none tabular-nums">
            {score}%
          </span>
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            ATS Compatible
          </span>
        </div>
      </div>
    </div>
  );
}

const HeroVideo = memo(function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTapHint, setShowTapHint] = useState(true);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!showTapHint || !isMuted) return;
    const timer = setTimeout(() => setShowTapHint(false), 8000);
    return () => clearTimeout(timer);
  }, [showTapHint, isMuted]);

  const setSound = (muted: boolean) => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    if (!muted) {
      video.volume = 1;
      void video.play();
    }
    setIsMuted(muted);
    setIsMenuOpen(false);
    setShowTapHint(false);
  };

  const openMenu = () => {
    setShowTapHint(false);
    setIsMenuOpen((open) => !open);
  };

  return (
    <div className="relative w-full h-full group">
      <video
        ref={videoRef}
        src="/hero-demo.mp4"
        poster="/hero-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        className="w-full h-full object-cover pointer-events-none transform-gpu will-change-transform [transform:translateZ(0)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
      />

      <div ref={menuRef} className="group/audio absolute bottom-4 right-4 z-10">
        {showTapHint && isMuted && !isMenuOpen && (
          <div className="pointer-events-none absolute bottom-1 right-12 flex items-center">
            <span className="whitespace-nowrap rounded-full border border-white/40 bg-slate-900/85 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md animate-pulse">
              Tap for sound
            </span>
            <span className="ml-[-1px] h-2 w-2 rotate-45 border-r border-t border-white/40 bg-slate-900/85" />
          </div>
        )}

        <button
          type="button"
          onClick={openMenu}
          title={isMuted ? "Tap for sound" : "Sound settings"}
          aria-label={isMuted ? "Tap for sound — open audio options" : "Sound settings"}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          className={`relative flex h-10 w-10 items-center justify-center rounded-full border text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 ${
            isMuted
              ? "border-white/50 bg-slate-900/70 hover:bg-slate-900/90 ring-2 ring-white/25 ring-offset-1 ring-offset-transparent animate-[pulse_2.5s_ease-in-out_infinite]"
              : "border-rose-300/60 bg-slate-900/80 hover:bg-slate-900/90"
          }`}
        >
          <Volume2 className="h-4 w-4" />
          {isMuted && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900/80" />
          )}
        </button>

        <span className="pointer-events-none absolute bottom-12 right-0 whitespace-nowrap rounded-lg border border-white/30 bg-slate-900/90 px-2.5 py-1 text-[10px] font-semibold text-white opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-200 group-hover/audio:opacity-100 group-focus-within/audio:opacity-100">
          {isMuted ? "Tap for sound" : "Sound settings"}
        </span>

        {isMenuOpen && (
          <div
            role="menu"
            className="absolute bottom-12 right-0 min-w-[132px] overflow-hidden rounded-xl border border-white/40 bg-slate-900/90 py-1 shadow-xl backdrop-blur-md"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => setSound(false)}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-white/10 ${
                !isMuted ? "text-rose-400" : "text-white"
              }`}
            >
              <Volume2 className="h-3.5 w-3.5" />
              Sound On
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => setSound(true)}
              className={`flex w-full items-center px-3 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-white/10 ${
                isMuted ? "text-rose-400" : "text-white"
              }`}
            >
              Sound Off
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const templatesHref = getTemplatesHref(isSignedIn);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      
      // Force scroll to top on load/reload
      window.scrollTo(0, 0);
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);

      // Clear hash parameters from URL history on initial page load/reload
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-950 overflow-x-hidden relative">
      {/* Faint premium blurred radial depth orbs in the background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/[0.03] rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-500/[0.02] rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* ─── Premium Navigation ─── */}
      <Navbar />

      {/* ─── Hero Section ─── */}
      <section className="pt-24 pb-20 px-6 max-w-[1280px] mx-auto text-center relative">
        <motion.div
          variants={containerVariants}
          initial={false}
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Accent Pill badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-full px-4 py-1.5 mb-6 shadow-sm"
          >
            <Sparkles size={14} className="text-rose-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Automated Resume Engineering
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-[920px] leading-[1.05] mb-6 text-slate-900"
          >
            One Profile. Every Resume.{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-600">
              Zero Effort.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-slate-600 text-lg md:text-xl max-w-[620px] leading-relaxed mb-10"
          >
            Upload your master profile once. Paste any job description. Receive a perfectly
            tailored, ATS-optimized resume in under 30 seconds — powered by AI with live company research.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Link
                href={isSignedIn ? "/dashboard" : "/sign-up"}
                className="group inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-full shadow-[0_8px_30px_rgba(225,29,72,0.3)] transition-all px-8 h-12 text-base gap-2"
              >
                {isSignedIn ? "Go to Dashboard" : "Get started — it's free"}
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Link
                href={templatesHref}
                className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full border border-slate-200 px-8 h-12 text-base transition-colors gap-2"
              >
                Browse Templates
                <ArrowRight size={16} />
              </Link>
            </motion.div>
            {!isSignedIn && (
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full border border-slate-200 px-8 h-12 text-base transition-colors sm:hidden"
              >
                I already have an account
              </Link>
            )}
          </motion.div>

          {/* Premium Hero Video Embed */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring" as const }}
            className="w-full max-w-5xl mx-auto mt-16 lg:mt-24 relative aspect-video"
          >
            {/* Backlit glow effect */}
            <div className="bg-rose-500/20 blur-[100px] absolute inset-4 rounded-[2rem] -z-10 pointer-events-none"></div>
            
            {/* Sleek outer wrapper frame */}
            <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/40 bg-white/40 backdrop-blur-2xl shadow-[0_20px_50px_-20px_rgba(225,29,72,0.25)]">
              <HeroVideo />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Bento Grid Section: Staggered Bento Cards ─── */}
      <section id="features" className="py-16 bg-slate-50 border-y border-slate-200/40">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              A premium suite for placement prep
            </h2>
            <p className="text-slate-600 mt-2">
              From real-time requirements analysis to instant zero-trust PDF builds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Bento Card 1: ATS Score (Left Column - 6 Columns) */}
            <motion.div
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
              className="md:col-span-6 bg-white rounded-[2rem] border border-slate-200/50 p-8 md:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-between group transition-all h-[520px]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-6 group-hover:bg-rose-100 transition-colors">
                  <ScanSearch size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Instant ATS Verification</h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                  Know how your tailored file stacks up against applicant tracking filters. Score keywords, formatting,
                  and completeness metrics instantly.
                </p>
              </div>

              <AtsScoreGauge />
            </motion.div>

            {/* Bento Card 2: Instant Tailoring (Right Column - 6 Columns) */}
            <motion.div
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
              className="md:col-span-6 bg-white rounded-[2rem] border border-slate-200/50 p-8 md:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-between group transition-all h-[520px]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-6 group-hover:bg-rose-100 transition-colors">
                  <Brain size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">AI-Powered Resume Tailoring</h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                  Copy any job description. Our engine reads the specifications, matches core skills,
                  and intelligently rewrites experience bullet points to show your alignment in real-time.
                </p>
              </div>

              {/* High-Fidelity Tailwind CSS Mockup: Before / After AI Strikethrough Animation with Green Success */}
              <div className="mt-8 bg-gradient-to-br from-slate-50 to-rose-50/20 rounded-2xl p-4 border border-slate-100 flex justify-center items-center h-[220px] overflow-y-auto">
                <div className="w-full max-w-[280px] bg-white rounded-xl shadow-md border border-slate-150 p-3.5 space-y-2.5">
                  {/* Before State */}
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Before (Generic)</span>
                    <div className="bg-slate-50 border border-slate-100 rounded-md p-2 text-[10px] text-slate-400">
                      <motion.p
                        initial={{ textDecorationLine: "none" }}
                        whileInView={{ textDecorationLine: "line-through" }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="leading-snug"
                      >
                        Responsible for building web apps and fixing bugs.
                      </motion.p>
                    </div>
                  </div>

                  {/* Down Arrow */}
                  <div className="flex justify-center text-rose-500 text-[10px] leading-none">
                    <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      ↓
                    </motion.div>
                  </div>

                  {/* After State — Green Success Theme */}
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-green-700">After (Tailored)</span>
                    <div className="bg-green-50 border border-green-200 rounded-md p-2 text-[10px] text-green-700 shadow-sm relative overflow-hidden">
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 1.4, duration: 0.6 }}
                        className="flex gap-1.5 items-start"
                      >
                        <CheckCircle2 size={12} className="text-green-600 shrink-0 mt-0.5" />
                        <p className="leading-snug text-green-700">
                          <span className="font-semibold text-green-700">Architected and deployed</span> dynamic web applications using React, <span className="font-semibold text-green-700">reducing page load latency by 24%</span>.
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 3: Live Company Research (Left Column - 5 Columns) */}
            <motion.div
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
              className="md:col-span-5 bg-white rounded-[2rem] border border-slate-200/50 p-8 md:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-between group transition-all h-[520px]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-6 group-hover:bg-rose-100 transition-colors">
                  <Globe size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Live Company Research</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Our research agent searches the live internet to extract company culture, tech stack, and values, aligning
                  every bullet statement.
                </p>
              </div>

              {/* High-Fidelity Tailwind CSS Mockup: Company Info Panel (Clean off-white look) */}
              <div className="mt-8 bg-gradient-to-br from-slate-50 to-rose-50/20 rounded-2xl p-6 border border-slate-100/80 flex justify-center overflow-hidden h-[220px] relative">
                <div className="w-full max-w-[210px] bg-slate-50 text-slate-800 rounded-xl shadow-md p-4 border border-slate-200 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-[8px] font-black uppercase text-slate-400">Culture Agent</span>
                      <span className="text-[8px] font-black text-rose-600">Google Inc.</span>
                    </div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Tech Stack</div>
                    <div className="flex flex-wrap gap-1">
                      {["React", "AWS", "Python"].map((tech) => (
                        <span key={tech} className="text-[8px] font-bold bg-white text-rose-600 px-1.5 py-0.5 rounded border border-slate-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-[8px] text-slate-700 font-semibold bg-rose-50/30 p-1.5 rounded border border-rose-100">
                    💡 Prefers: "Impact and scale metrics"
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 4: Zero-Trust WASM (Right Column - 7 Columns) */}
            <motion.div
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
              className="md:col-span-7 bg-white rounded-[2rem] border border-slate-200/50 p-8 md:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-between group transition-all h-[520px]"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-6 group-hover:bg-rose-100 transition-colors">
                  <Shield size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Zero-Trust Client Compilation</h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-lg">
                  Security-first compiler. All LaTeX compilation compiles entirely in your browser using local WebAssembly.
                  Your private details never hit any third-party PDF generators.
                </p>
              </div>

              {/* High-Fidelity Tailwind CSS Mockup: WASM Web Worker (Clean terminal look) */}
              <div className="mt-8 bg-gradient-to-tr from-slate-50 to-rose-50/20 rounded-2xl p-6 border border-slate-100/80 flex justify-center overflow-hidden h-[220px] relative">
                <div className="w-full max-w-[280px] bg-slate-50 rounded-xl shadow-md p-4 border border-slate-200 text-left font-mono text-[9px] text-slate-600 space-y-1.5 leading-relaxed">
                  <div className="text-green-600 font-bold flex items-center gap-1.5 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                    [WASM Worker Init]
                  </div>
                  <div>$ loading busytex-compiler.wasm... ok</div>
                  <div>$ running client-side compilation...</div>
                  <div className="text-rose-600">$ compiling resume.tex -{">"} document.pdf [100%]</div>
                  <div className="text-green-600">$ resolve (PDF Blob created successfully)</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Grid Feature Highlights Section ─── */}
      <section id="how-it-works" className="py-20 px-6 max-w-[1280px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Advanced features for placement drives
          </h2>
          <p className="text-slate-600 mt-2">
            Engineered to streamline corporate hiring drives and personal portfolio adjustments.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: <Target className="text-rose-500" />,
              title: "ATS Scoring Check",
              desc: "Deep heuristics checks for keyword, formats, and sections.",
            },
            {
              icon: <Globe className="text-rose-500" />,
              title: "Web Research Agent",
              desc: "Ingests live engineering culture information directly.",
            },
            {
              icon: <FileText className="text-rose-500" />,
              title: "Smart Selectors",
              desc: "Instantly toggle layout options (ATS-Strict or Sans-Serif).",
            },
            {
              icon: <Zap className="text-rose-500" />,
              title: "Fast Generation",
              desc: "Generates aligned resume profiles in under 30 seconds.",
            },
            {
              icon: <Brain className="text-rose-500" />,
              title: "AI Optimizer",
              desc: "Experience bullets parsed and rewritten contextually.",
            },
            {
              icon: <Shield className="text-rose-500" />,
              title: "Privacy Isolation",
              desc: "All personal details are masked prior to external LLM calls.",
            },
            {
              icon: <BarChart3 className="text-rose-500" />,
              title: "Skill Gaps Form",
              desc: "Highlights missing targets with context-aware responses.",
            },
            {
              icon: <Briefcase className="text-rose-500" />,
              title: "Kanban Board Tracker",
              desc: "Real-time, reactive stepper status dashboard pipelines.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -4 }}
              className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="mb-4">{item.icon}</div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Templates Showcase — Infinite Carousel ─── */}
      <TemplateCarousel templates={carouselTemplates} />

      <PricingSection />

      {/* ─── FAQ Section ─── */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200/40">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 mt-2">
              Everything you need to know about the ResumeFlow pipeline.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "How does the AI tailoring pipeline work?",
                a: "Once you paste a target job description, our system launches background actions that query live search APIs for the target company. We then analyze skill gaps between your master profile and the job description, and use optimized model templates to rewrite experience points while maintaining absolute factual accuracy.",
              },
              {
                q: "Is my personal data masked before sending to AI endpoints?",
                a: "Yes. ResumeFlow incorporates local data masking protocols. We substitute names, phone numbers, email addresses, and physical locations with secure placeholders before sending payloads to external language models, then seamlessly re-inject the masked data on your local device during the PDF compilation stage.",
              },
              {
                q: "Does the resume compilation process use a cloud-based server?",
                a: "No. For absolute security, ResumeFlow runs a client-side LaTeX compiler. Your tailored JSON configuration compiles inside your browser using a high-performance WebAssembly Web Worker, ensuring that your raw data remains entirely private and never leaves your browser.",
              },
              {
                q: "What are the daily quota restrictions?",
                a: "To prevent API budget abuse, free tier accounts are restricted to 5 resume compiles and 50 chatbot prep messages per 24 hours. The daily limits reset automatically at midnight relative to your timezone.",
              },
              {
                q: "Are the templates compatible with common automated parsing filters?",
                a: "Our default ATS-Strict template has been meticulously designed and audited against major applicant tracking systems. It compiles with exact standard margins, zero complex layout vectors, and simple headers, yielding perfect parsing accuracy.",
              },
            ].map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left font-semibold text-slate-900 hover:bg-slate-50/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-400 text-lg transition-transform duration-200 font-bold shrink-0 ml-4">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA Strip (Premium Red/Rose theme) ─── */}
      <section className="bg-gradient-to-r from-red-600 to-rose-700 py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)]"></div>
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Ready to win placement drives?
            </h2>
            <p className="text-rose-100 mt-2 max-w-xl">
              Create your Master Profile today, tailor your resume for any role instantly, and land your dream offer.
            </p>
          </div>
          <motion.div whileTap={{ scale: 0.95 }} className="shrink-0">
            <Link
              href={isSignedIn ? "/dashboard" : "/sign-up"}
              className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-rose-700 font-bold rounded-full shadow-xl transition-all px-8 h-12 text-base gap-2"
            >
              {isSignedIn ? "Go to Dashboard" : "Sign up — it's free"}
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-white border-t border-slate-100 py-12 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Product</p>
              <ul className="space-y-2 text-sm text-slate-600 flex flex-col items-start">
                <li>
                  <button
                    onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                    className="hover:text-slate-900 transition-colors bg-transparent border-none p-0 cursor-pointer"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}
                    className="hover:text-slate-900 transition-colors bg-transparent border-none p-0 cursor-pointer"
                  >
                    Templates
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                    className="hover:text-slate-900 transition-colors bg-transparent border-none p-0 cursor-pointer"
                  >
                    ATS Auditor
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                    className="hover:text-slate-900 transition-colors bg-transparent border-none p-0 cursor-pointer"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })}
                    className="hover:text-slate-900 transition-colors bg-transparent border-none p-0 cursor-pointer"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Resources</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/resources/handbook" className="hover:text-slate-900 transition-colors">
                    Resume Handbook
                  </Link>
                </li>
                <li>
                  <Link href="/resources/interview-prep" className="hover:text-slate-900 transition-colors">
                    Interview Prep
                  </Link>
                </li>
                <li>
                  <Link href="/resources/ats-best-practices" className="hover:text-slate-900 transition-colors">
                    ATS Best Practices
                  </Link>
                </li>
                <li>
                  <Link href="/resources/api-docs" className="hover:text-slate-900 transition-colors">
                    API Docs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Company</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/info/about" className="hover:text-slate-900 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/info/blog" className="hover:text-slate-900 transition-colors">
                    AI Blog
                  </Link>
                </li>
                <li>
                  <Link href="/info/contact" className="hover:text-slate-900 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/info/careers" className="hover:text-slate-900 transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/legal/privacy" className="hover:text-slate-900 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="hover:text-slate-900 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/legal/cookies" className="hover:text-slate-900 transition-colors">
                    Cookie settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-100 text-xs text-slate-400 gap-4">
            <BrandLogo size="sm" className="gap-2.5" />
            <span>© 2026 ResumeFlow. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
