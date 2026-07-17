"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ScanSearch,
  Brain,
  Globe,
  Shield,
  Lock,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { EASE_VANGUARD, staggerContainerSlow, scrollRevealUp } from "@/lib/animations";

// ─── ATS Score Gauge ───────────────────────────────────────
const ATS_RING_CIRCUMFERENCE = 251.2;
const ATS_RING_TARGET_OFFSET = 5.02;

function AtsScoreGauge() {
  const gaugeRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gaugeRef, { once: true, amount: 0.45 });
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let rafId: number;
    const start = performance.now();
    const duration = 2000;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setScore(Math.round(progress * 98));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isInView]);

  return (
    <div ref={gaugeRef} className="flex items-center justify-center w-full h-full">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <div
          className={`absolute inset-0 bg-rose-500/10 rounded-full blur-xl transition-opacity duration-500 ${
            isInView ? "animate-pulse opacity-100" : "opacity-0"
          }`}
        />
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Outer track ring */}
          <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
          

          {/* Animated progress ring */}
          <motion.circle
            cx="50" cy="50" r="40" strokeWidth="7" fill="transparent"
            strokeDasharray={ATS_RING_CIRCUMFERENCE}
            style={{ transformOrigin: "50px 50px", rotate: "-90deg" }}
            initial={{ strokeDashoffset: ATS_RING_CIRCUMFERENCE, stroke: "#EF4444" }}
            animate={
              isInView
                ? { strokeDashoffset: ATS_RING_TARGET_OFFSET, stroke: ["#EF4444", "#EAB308", "#22C55E"] }
                : { strokeDashoffset: ATS_RING_CIRCUMFERENCE, stroke: "#EF4444" }
            }
            transition={{ duration: 2.0, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          {/* Continuously animated 98 score */}
          <motion.span
            className="text-3xl font-black text-slate-800 leading-none tabular-nums"
            animate={{
              scale: [1, 1.06, 1],
              transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            {score}%
          </motion.span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">
            ATS Score
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Before/After Tailoring Mockup ────────────────────────
function TailoringMockup() {
  return (
    <div className="w-full max-w-[240px] bg-white rounded-xl shadow-sm border border-slate-200 p-3 space-y-2">
      <div className="space-y-0.5">
        <span className="text-[7px] font-bold uppercase tracking-wider text-slate-400">Before</span>
        <div className="bg-slate-50 border border-slate-100 rounded-md p-2 text-[9px] text-slate-400">
          <motion.p
            initial={{ textDecorationLine: "none" }}
            whileInView={{ textDecorationLine: "line-through" }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="leading-snug"
          >
            Responsible for building web apps and fixing bugs.
          </motion.p>
        </div>
      </div>
      <div className="flex justify-center text-rose-500 text-[8px] leading-none">
        <span className="animate-bounce">↓</span>
      </div>
      <div className="space-y-0.5">
        <span className="text-[7px] font-bold uppercase tracking-wider text-green-700">After</span>
        <div className="bg-green-50 border border-green-200 rounded-md p-2 text-[9px] text-green-700 shadow-sm">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="flex gap-1.5 items-start"
          >
            <CheckCircle2 size={10} className="text-green-600 shrink-0 mt-0.5" />
            <p className="leading-snug text-green-700">
              <span className="font-semibold">Architected and deployed</span> dynamic web applications using React, reducing page load by 24%.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Company Research Panel ───────────────────────────────
function CompanyPanel() {
  return (
    <div className="w-full max-w-[200px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between h-40">
      <div className="space-y-2">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <span className="text-[7px] font-black uppercase text-slate-400">Culture Agent</span>
          <span className="text-[7px] font-black text-rose-600">Google Inc.</span>
        </div>
        <div className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Tech Stack</div>
        <div className="flex flex-wrap gap-1">
          {["React", "AWS", "Python"].map((tech) => (
            <span key={tech} className="text-[7px] font-bold bg-white text-rose-600 px-1.5 py-0.5 rounded border border-slate-200">
              {tech}
            </span>
          ))}
        </div>
      </div>
      <div className="text-[7px] text-slate-700 font-semibold bg-rose-50/30 p-1.5 rounded border border-rose-100">
        💡 Prefers: &ldquo;Impact and scale metrics&rdquo;
      </div>
    </div>
  );
}

// ─── WASM Terminal Mockup ─────────────────────────────────
function WasmTerminal() {
  return (
    <div className="w-full max-w-[260px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 font-mono text-[8px] text-slate-600 space-y-1.5">
      <div className="text-green-600 font-bold flex items-center gap-1.5 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
        [Compiler Worker Init]
      </div>
      <div>$ loading busytex-compiler.wasm... ok</div>
      <div>$ running client-side compilation...</div>
      <div className="text-rose-600">$ compiling resume.tex → document.pdf [100%]</div>
      <div className="text-green-600">$ resolve (PDF Blob created successfully)</div>
    </div>
  );
}

// ─── Privacy Shield Animation ─────────────────────────────
function PrivacyShield() {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const t = setTimeout(() => setActive(true), 600);
    return () => clearTimeout(t);
  }, [isInView]);

  return (
    <div ref={ref} className="flex items-center justify-center gap-3">
      {["Name", "Email", "Phone"].map((item, i) => (
        <motion.div
          key={item}
          className="flex flex-col items-center gap-1.5"
          initial={{ opacity: 0.4, scale: 0.9 }}
          animate={active ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3 + i * 0.2, duration: 0.5 }}
        >
          <div className={`w-16 h-10 rounded-lg flex items-center justify-center text-[8px] font-bold transition-all duration-500 ${
            active ? "bg-green-50 border border-green-200 text-green-700" : "bg-slate-100 border border-slate-200 text-slate-400"
          }`}>
            {active ? "••••••" : item}
          </div>
          <Lock className={`w-3 h-3 transition-opacity duration-500 ${active ? "text-green-500 opacity-100" : "text-slate-300 opacity-0"}`} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Template Selector Mockup ─────────────────────────────
function TemplateSelector() {
  const templates = ["ATS Strict", "Modern Pro", "Executive"];
  return (
    <div className="flex items-center justify-center gap-2">
      {templates.map((t, i) => (
        <motion.div
          key={t}
          className={`px-3 py-2 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
            i === 0
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-500"
          }`}
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          {t}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Bento Grid Section ────────────────────────────────────
export function BentoGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="features" className="py-24 px-6 bg-gradient-to-b from-white/80 to-[#FAF1F8]/40" ref={sectionRef}>
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          variants={staggerContainerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.div variants={scrollRevealUp} className="mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-rose-600 border border-rose-100">
              <ScanSearch size={10} /> Core Capabilities
            </span>
          </motion.div>
          <motion.h2 variants={scrollRevealUp} className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 tracking-[-0.02em]">
            Precision tools for career engineers
          </motion.h2>
          <motion.p variants={scrollRevealUp} className="text-slate-500 mt-4 text-lg">
            From real-time requirements analysis to instant zero-trust PDF builds.
          </motion.p>
        </motion.div>

        {/* 21st.dev-inspired Bento Grid — 6-column light theme */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[180px] md:auto-rows-[200px]">
          
          {/* 1. ATS Score - Tall (2x2) */}
          <motion.div
            className="md:col-span-2 md:row-span-2 bg-white border-2 border-slate-900/20 rounded-2xl p-6 flex flex-col hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 cursor-pointer overflow-hidden group outline outline-1 outline-slate-900/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(225, 29, 72, 0.12)", transition: { type: "spring", stiffness: 250, damping: 18, mass: 0.8 } }}
          >
            {/* Blooming Gradient Overlay */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0, scale: 0.6 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.6 }}
              style={{
                background: `radial-gradient(circle at 50% 40%, rgba(225, 29, 72, 0.08) 0%, transparent 70%)`,
              }}
            />
            <div className="flex-1 flex items-center justify-center relative z-10">
              <AtsScoreGauge />
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-700 transition-colors">Instant ATS Verification</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">Real-time keyword scoring and formatting analysis.</p>
            </div>
          </motion.div>

          {/* 2. AI Tailoring - Standard (2x1) */}
          <motion.div
            className="md:col-span-2 bg-white border-2 border-slate-900/20 rounded-2xl p-5 flex flex-col hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 cursor-pointer overflow-hidden group outline outline-1 outline-slate-900/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(225, 29, 72, 0.12)", transition: { type: "spring", stiffness: 250, damping: 18, mass: 0.8 } }}
          >
            {/* Blooming Gradient Overlay */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0, scale: 0.6 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.6 }}
              style={{
                background: `radial-gradient(circle at 50% 40%, rgba(225, 29, 72, 0.08) 0%, transparent 70%)`,
              }}
            />
            <div className="flex-1 flex items-center justify-center relative z-10">
              <TailoringMockup />
            </div>
            <div className="mt-2">
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-700 transition-colors">AI-Powered Tailoring</h3>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">Contextual rewrites for every job description.</p>
            </div>
          </motion.div>

          {/* 3. Live Research - Tall (2x2) */}
          <motion.div
            className="md:col-span-2 md:row-span-2 bg-white border-2 border-slate-900/20 rounded-2xl p-6 flex flex-col hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 cursor-pointer overflow-hidden group outline outline-1 outline-slate-900/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(225, 29, 72, 0.12)", transition: { type: "spring", stiffness: 250, damping: 18, mass: 0.8 } }}
          >
            {/* Blooming Gradient Overlay */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0, scale: 0.6 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.6 }}
              style={{
                background: `radial-gradient(circle at 50% 40%, rgba(225, 29, 72, 0.08) 0%, transparent 70%)`,
              }}
            />
            <div className="flex-1 flex items-center justify-center relative z-10">
              <CompanyPanel />
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 group-hover:text-rose-700 transition-colors">
                <Globe className="w-3.5 h-3.5" /> Live Company Research
              </h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">Real-time culture and stack insights.</p>
            </div>
          </motion.div>

          {/* 4. WASM Compilation - Standard (2x1) */}
          <motion.div
            className="md:col-span-2 bg-white border-2 border-slate-900/20 rounded-2xl p-5 flex flex-col hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 cursor-pointer overflow-hidden group outline outline-1 outline-slate-900/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(225, 29, 72, 0.12)", transition: { type: "spring", stiffness: 250, damping: 18, mass: 0.8 } }}
          >
            {/* Blooming Gradient Overlay */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0, scale: 0.6 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.6 }}
              style={{
                background: `radial-gradient(circle at 50% 40%, rgba(225, 29, 72, 0.08) 0%, transparent 70%)`,
              }}
            />
            <div className="flex-1 flex items-center justify-center relative z-10">
              <WasmTerminal />
            </div>
            <div className="mt-2">
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-700 transition-colors">Zero-Trust Compilation</h3>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">Browser-local compilation, no third-party servers.</p>
            </div>
          </motion.div>

          {/* 5. Privacy Isolation - Wide (3x1) */}
          <motion.div
            className="md:col-span-3 bg-white border-2 border-slate-900/20 rounded-2xl p-5 flex flex-col hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 cursor-pointer overflow-hidden group outline outline-1 outline-slate-900/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(225, 29, 72, 0.12)", transition: { type: "spring", stiffness: 250, damping: 18, mass: 0.8 } }}
          >
            {/* Blooming Gradient Overlay */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0, scale: 0.6 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.6 }}
              style={{
                background: `radial-gradient(circle at 50% 40%, rgba(225, 29, 72, 0.08) 0%, transparent 70%)`,
              }}
            />
            <div className="flex-1 flex items-center justify-center relative z-10">
              <PrivacyShield />
            </div>
            <div className="mt-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 group-hover:text-rose-700 transition-colors">
                <Shield className="w-3.5 h-3.5" /> Privacy Isolation
              </h3>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">PII masked before any external LLM calls.</p>
            </div>
          </motion.div>

          {/* 6. Smart Selectors - Wide (3x1) */}
          <motion.div
            className="md:col-span-3 bg-white border-2 border-slate-900/20 rounded-2xl p-5 flex flex-col hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 cursor-pointer overflow-hidden group outline outline-1 outline-slate-900/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(225, 29, 72, 0.12)", transition: { type: "spring", stiffness: 250, damping: 18, mass: 0.8 } }}
          >
            {/* Blooming Gradient Overlay */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0, scale: 0.6 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.6 }}
              style={{
                background: `radial-gradient(circle at 50% 40%, rgba(225, 29, 72, 0.08) 0%, transparent 70%)`,
              }}
            />
            <div className="flex-1 flex items-center justify-center relative z-10">
              <TemplateSelector />
            </div>
            <div className="mt-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 group-hover:text-rose-700 transition-colors">
                <FileText className="w-3.5 h-3.5" /> Smart Template Selectors
              </h3>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">ATS-Strict, Modern Pro, or Executive layouts.</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
