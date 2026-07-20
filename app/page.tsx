"use client";

import { useState, memo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// app/page.tsx
//
// Premium Landing Page for ResumeFlow — Immersive Awwwards-Tier Edition
// Features: 3D hero scene, scroll-driven reveals, spring-physics animations,
// premium typography, double-bezel cards, and cinematic micro-interactions.

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { BrandLogo } from "@/components/BrandLogo";
import TemplateCarousel from "@/components/TemplateCarousel";
import { BentoGrid } from "@/components/grids/BentoGrid";
import { FeatureGrid } from "@/components/grids/FeatureGrid";
import { PricingSection, type Tier } from "@/components/blocks/pricing-section";
import { WhyResumeFlow } from "@/components/WhyResumeFlow";
import { carouselTemplates } from "@/lib/latex/carouselTemplates";
import { useAuth } from "@clerk/nextjs";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  scrollRevealUp,
  scrollRevealScale,
  staggerContainer,
  staggerContainerSlow,
  wordReveal,
  magneticHover,
  accordionContent,
  iconRotate,
  EASE_VANGUARD,
} from "@/lib/animations";
import {
  ArrowRight,
  Sparkles,
  Check,
  Volume2,
  Plus,
} from "lucide-react";

// Lazy-load 3D scene — desktop only, zero SSR cost
const Hero3DScene = dynamic(() => import("@/components/Hero3DScene"), {
  ssr: false,
  loading: () => null,
});

// Entrance Animation Variants (using centralized library)
const containerVariants = staggerContainer;
const itemVariants = wordReveal;

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const templatesHref = mounted && isSignedIn ? "/templates" : "/sign-up";
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const isHeroInView = useInView(heroRef, { amount: 0.1 });

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
    <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] via-[#FAF1F8] to-[#FFFFFF] text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-950 overflow-x-hidden relative noise-overlay">
      {/* Mesh gradient depth orbs */}
      <div className="absolute top-0 left-0 right-0 h-[80vh] mesh-gradient-hero pointer-events-none -z-10"></div>

      {/* ─── Premium Navigation ─── */}
      <Navbar />

      {/* ─── Hero Section ─── */}
      <section className="pt-28 pb-24 px-6 max-w-[1280px] mx-auto text-center relative" ref={heroRef}>
        {/* 3D Scene — desktop only, behind text */}
        <div className="hidden lg:block">
          <Hero3DScene inView={isHeroInView} />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center relative z-10"
        >
          {/* Animated Shimmer Eyebrow Pill */}
          <motion.div
            variants={itemVariants}
            className="eyebrow-pill shimmer-pill mb-8"
          >
            <Sparkles size={12} />
            <span>AI-Powered Career Intelligence</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display text-5xl md:text-7xl lg:text-[80px] font-extrabold tracking-[-0.03em] max-w-[920px] leading-[1.02] mb-7 text-slate-900"
          >
            BEAT THE ATS<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-600 to-red-500">
              GET THE JOB
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-slate-500 text-lg md:text-xl max-w-[600px] leading-relaxed mb-12"
          >
            Build once. Tailor instantly. Every resume, precision-engineered
            for the role you want — powered by AI with live company research.
          </motion.p>

          <motion.p variants={itemVariants} className="text-slate-400 text-sm max-w-[600px] leading-relaxed mb-8">
            <Link href="/resources/handbook" className="text-rose-600 hover:text-rose-700 underline underline-offset-2 transition-colors">
              Resume handbook
            </Link>
            {' '}·{' '}
            <Link href="/free-resume-builder" className="text-rose-600 hover:text-rose-700 underline underline-offset-2 transition-colors">
              Free resume builder
            </Link>
            {' '}·{' '}
            <Link href="/resources/ats-best-practices" className="text-rose-600 hover:text-rose-700 underline underline-offset-2 transition-colors">
              ATS optimization
            </Link>
            {' '}·{' '}
            <Link href="/info/blog" className="text-rose-600 hover:text-rose-700 underline underline-offset-2 transition-colors">
              Career blog
            </Link>
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <motion.div
              variants={magneticHover}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href={mounted && isSignedIn ? "/dashboard" : "/sign-up"}
                className="group inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-full shadow-[0_8px_30px_rgba(225,29,72,0.3)] transition-all px-8 h-14 text-base gap-3"
              >
                {mounted && isSignedIn ? "Go to Dashboard" : "Get started — it's free"}
                <span className="icon-island icon-island-light">
                  <ArrowRight size={14} />
                </span>
              </Link>
            </motion.div>
            <motion.div
              variants={magneticHover}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href={templatesHref}
                className="group inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full border border-slate-200 px-8 h-14 text-base transition-colors gap-2"
              >
                Browse Templates
                <span className="icon-island">
                  <ArrowRight size={14} />
                </span>
              </Link>
            </motion.div>
            {mounted && !isSignedIn && (
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full border border-slate-200 px-8 h-14 text-base transition-colors sm:hidden"
              >
                I already have an account
              </Link>
            )}
          </motion.div>

          {/* Premium Hero Video Embed */}
          <motion.div
            initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.4, duration: 1, ease: EASE_VANGUARD }}
            className="w-full max-w-5xl mx-auto mt-20 lg:mt-28 relative aspect-video"
          >
            {/* Backlit glow effect */}
            <div className="bg-rose-500/15 blur-[120px] absolute inset-4 rounded-[2rem] -z-10 pointer-events-none"></div>
            
            {/* Sleek outer wrapper frame */}
            <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/20 bg-slate-950 shadow-[0_20px_60px_-20px_rgba(225,29,72,0.25)]">
              <HeroVideo />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ─── Why ResumeFlow — Premium Redesign ─── */}
      <WhyResumeFlow />

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ─── Bento Grid Section: 21st.dev-Inspired ─── */}
      <BentoGrid />

      <div className="section-divider" />

      {/* ─── Feature Grid Section: 21st.dev Animated Cards ─── */}
      <FeatureGrid />

      <div className="section-divider" />

      {/* ─── Templates Showcase — Infinite Carousel ─── */}
      <TemplateCarousel templates={carouselTemplates} />

      <div className="section-divider" />

      <PricingSection
        title="Simple Pricing"
        subtitle="Start free for placement season. Upgrade when you need unlimited tailoring, premium templates, and priority AI-Powered Assistant access."
        frequencies={["monthly", "yearly"]}
        allFeatures={[
          "Unlimited resume tailoring",
          "Unlimited AI Assistant messages",
          "All 4 premium LaTeX templates",
          "Live company research",
          "Priority ATS audit queue",
          "Skill gap questionnaire",
          "Client-side PDF compilation",
          "Shared placement dashboards",
          "Bulk job Kanban tracker",
          "Dedicated onboarding support",
          "Custom branding & export",
        ]}
        tiers={
          [
            {
              id: "starter",
              name: "Starter",
              price: { monthly: 0, yearly: 0 },
              description: "Ideal for students exploring placement prep. No credit card required.",
              availableFeatures: [
                "Skill gap questionnaire",
                "Client-side PDF compilation",
              ],
              cta: "Start for Free",
              href: mounted && isSignedIn ? "/dashboard" : "/sign-up",
            },
            {
              id: "pro",
              name: "Pro",
              price: { monthly: 19, yearly: 15 },
              description: "For active job seekers running multiple company drives. 30-day trial on yearly billing.",
              availableFeatures: [
                "Unlimited resume tailoring",
                "Unlimited AI Assistant messages",
                "All 4 premium LaTeX templates",
                "Live company research",
                "Priority ATS audit queue",
                "Skill gap questionnaire",
                "Client-side PDF compilation",
              ],
              cta: mounted && isSignedIn ? "Upgrade in Dashboard" : "Get Started",
              href: "/dashboard",
              popular: true,
            },
            {
              id: "campus",
              name: "Campus",
              price: { monthly: 79, yearly: 65 },
              description: "For placement cells and training partners managing cohorts at scale.",
              availableFeatures: [
                "Unlimited resume tailoring",
                "Unlimited AI Assistant messages",
                "All 4 premium LaTeX templates",
                "Live company research",
                "Priority ATS audit queue",
                "Skill gap questionnaire",
                "Client-side PDF compilation",
                "Shared placement dashboards",
                "Bulk job Kanban tracker",
                "Dedicated onboarding support",
                "Custom branding & export",
              ],
              cta: "Coming Soon",
              href: "#",
              comingSoon: true,
            },
            {
              id: "enterprise",
              name: "Enterprise",
              price: { monthly: "Custom", yearly: "Custom" },
              description: "For multiple teams across your organization.",
              availableFeatures: [
                "Unlimited resume tailoring",
                "Unlimited AI Assistant messages",
                "All 4 premium LaTeX templates",
                "Live company research",
                "Priority ATS audit queue",
                "Skill gap questionnaire",
                "Client-side PDF compilation",
                "Shared placement dashboards",
                "Bulk job Kanban tracker",
                "Dedicated onboarding support",
                "Custom branding & export",
              ],
              cta: "Coming Soon",
              href: "#",
              highlighted: true,
              comingSoon: true,
            },
          ] satisfies Tier[]
        }
      />

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ─── FAQ Section ─── */}
      <section id="faq" style={{ paddingTop: 'var(--spacing-section)', paddingBottom: 'var(--spacing-section)' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div
            variants={staggerContainerSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <motion.div variants={scrollRevealUp} className="mb-4">
              <span className="eyebrow-pill"><Check size={10} /> FAQ</span>
            </motion.div>
            <motion.h2 variants={scrollRevealUp} className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 tracking-[-0.02em]">
              Questions? Answered.
            </motion.h2>
          </motion.div>

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
                a: "To prevent API budget abuse, free tier accounts are restricted to 5 resume compiles and 20 AI assistant messages per 24 hours. Pro and Campus users enjoy unlimited access. The daily limits reset automatically at midnight relative to your timezone.",
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
                  className="bg-white border border-slate-300/50 rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md"
                  style={{ transitionTimingFunction: 'var(--ease-vanguard)' }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left font-semibold text-slate-900 hover:bg-slate-50/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <motion.span
                      animate={isOpen ? "expanded" : "collapsed"}
                      variants={iconRotate}
                      className="text-slate-400 text-lg font-bold shrink-0 ml-4"
                    >
                      <Plus size={18} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="faq-content"
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={accordionContent}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 text-sm text-slate-500 leading-relaxed border-t border-slate-200">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA Strip (Animated Gradient) ─── */}
      <section className="animated-gradient-cta py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]"></div>
        <motion.div
          variants={staggerContainerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative z-10"
        >
          <motion.div variants={scrollRevealUp}>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-[-0.02em]">
              Your next career move starts here.
            </h2>
            <p className="text-rose-100/80 mt-3 max-w-xl text-lg">
              Create your Master Profile today, tailor your resume for any role instantly, and land your dream offer.
            </p>
          </motion.div>
          <motion.div variants={scrollRevealScale} className="shrink-0">
            <motion.div
              variants={magneticHover}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href={mounted && isSignedIn ? "/dashboard" : "/sign-up"}
                className="group inline-flex items-center justify-center bg-white hover:bg-slate-50 text-rose-700 font-bold rounded-full shadow-xl transition-all px-8 h-14 text-base gap-3"
              >
                {mounted && isSignedIn ? "Go to Dashboard" : "Sign up — it's free"}
                <span className="icon-island">
                  <ArrowRight size={14} />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Footer (Stagger Reveal) ─── */}
      <footer className="bg-white border-t border-slate-200 py-16 px-6">
        <motion.div
          variants={staggerContainerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-[1280px] mx-auto"
        >
          <motion.div variants={scrollRevealUp} className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 lg:col-span-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">How to Use ResumeFlow</p>
              <div className="flex flex-col gap-3">
                {[
                  {
                    step: "01",
                    icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                    ),
                    title: "Sign up free",
                    desc: "Create your account — no credit card needed",
                    href: "/sign-up",
                  },
                  {
                    step: "02",
                    icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    ),
                    title: "Build your profile",
                    desc: "Fill in your experience, skills, and education",
                    href: "/resume/builder",
                  },
                  {
                    step: "03",
                    icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                    ),
                    title: "AI tailors it",
                    desc: "Paste a job description — AI rewrites for that role",
                    href: "/free-resume-builder",
                  },
                  {
                    step: "04",
                    icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    ),
                    title: "Export & apply",
                    desc: "Download ATS-optimized PDF — ready to submit",
                    href: "/resources/handbook",
                  },
                ].map((item) => (
                  <Link
                    key={item.step}
                    href={item.href}
                    className="group/step flex items-start gap-3 p-2.5 rounded-xl transition-all hover:bg-slate-50 border border-transparent hover:border-slate-200"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-50 text-rose-700 text-[10px] font-extrabold shrink-0 border border-rose-100 group-hover/step:bg-rose-100 group-hover/step:border-rose-200 transition-colors">
                      {item.step}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-700 group-hover/step:text-rose-700 transition-colors">
                          {item.title}
                        </span>
                        <ArrowRight size={10} className="text-slate-300 group-hover/step:text-rose-500 group-hover/step:translate-x-0.5 transition-all shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
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
                  <a href="#" id="open_preferences_center" className="hover:text-slate-900 transition-colors">
                    Cookie settings
                  </a>
                </li>
                <li>
                  <Link href="/sitemap.xml" className="hover:text-slate-900 transition-colors">
                    Sitemap
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>
          <motion.div variants={scrollRevealUp} className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-200 text-xs text-slate-400 gap-4">
            <BrandLogo size="sm" className="gap-2.5" />
            <span>© 2026 ResumeFlow. All rights reserved.</span>
          </motion.div>
        </motion.div>
      </footer>
    </div>
  );
}
