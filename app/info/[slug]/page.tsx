"use client";

import React, { useState } from "react";
import { notFound, useParams } from "next/navigation";
import { StaticPageWrapper } from "@/components/StaticPageWrapper";
import { Info, HelpCircle, Mail, Briefcase, CheckCircle2, Loader2 } from "lucide-react";

interface ContentBlock {
  title: string;
  subtitle: string;
  category: string;
  icon: React.ReactNode;
  body: React.ReactNode;
}

const infoContent: Record<string, ContentBlock> = {
  "about": {
    category: "Company",
    title: "About ResumeFlow",
    subtitle: "Automating placement preparation and empowering tech candidates globally.",
    icon: <Info className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-800">Our Mission</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            ResumeFlow was built on the core belief that applying for jobs shouldn't feel like a lottery.
            In a world dominated by automated tracking systems and algorithmic filtering, candidates deserve tools that level the playing field.
            We automate the repetitive, tedious tasks of resume writing and optimization, allowing you to focus on what matters: interview preparation and coding.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-800">Our Core Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
              <h3 className="font-bold text-rose-700 mb-1.5">Factual Integrity</h3>
              <p className="text-slate-500">We optimize experience presentation and highlight key skills, but never hallucinate or invent qualifications.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
              <h3 className="font-bold text-rose-700 mb-1.5">Absolute Privacy</h3>
              <p className="text-slate-500">By employing local masking and WASM-based compilers, we ensure your personal details are fully protected.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
              <h3 className="font-bold text-rose-700 mb-1.5">Recruiter Alignment</h3>
              <p className="text-slate-500">Our layouts are compiled to comply strictly with the design patterns preferred by top-tier engineering recruiters.</p>
            </div>
          </div>
        </section>
      </div>
    ),
  },
  "blog": {
    category: "Company Insights",
    title: "AI Placement Blog",
    subtitle: "Expert articles on tech recruitment trends, resume writing, and hiring processes.",
    icon: <HelpCircle className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8">
        {[
          {
            title: "Landing FAANG Offers in 2026: The New Tech Landscape",
            date: "June 15, 2026",
            snippet: "The recruitment landscape is evolving rapidly. Discover how companies are using AI filtering, and what you can do to stand out.",
          },
          {
            title: "The Google XYZ Formula Explained: Case Studies and Examples",
            date: "May 28, 2026",
            snippet: "A breakdown of metrics-driven bullet points that grab recruiters' attention and increase interview callbacks.",
          },
          {
            title: "Zero-Trust Web Compilation: Why Client-Side WASM is the Future",
            date: "April 10, 2026",
            snippet: "Behind the scenes of our compiler pipeline. How we compile complex LaTeX documents in V8 client engines without database overhead.",
          },
        ].map((article, idx) => (
          <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/50 space-y-2 hover:border-rose-300 transition-colors cursor-pointer">
            <span className="text-[10px] font-bold text-rose-600">{article.date}</span>
            <h3 className="text-base font-bold text-slate-800">{article.title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{article.snippet}</p>
          </div>
        ))}
      </div>
    ),
  },
  "contact": {
    category: "Company",
    title: "Get in Touch",
    subtitle: "Have questions or need assistance? Reach out to our support or partnership teams.",
    icon: <Mail className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">Support & Feedback</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              If you have any questions about resume tailoring, quota limitations, or billing, our support team is available 24/7.
            </p>
            <p className="text-rose-600 text-sm font-semibold">support@resumeflow.ai</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">Enterprise Drives</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Interested in onboarding ResumeFlow for university placements or corporate hiring drives? Reach out to our team.
            </p>
            <p className="text-rose-600 text-sm font-semibold">partnerships@resumeflow.ai</p>
          </section>
        </div>

        <ContactForm />
      </div>
    ),
  },
  "careers": {
    category: "Company",
    title: "Work with Us",
    subtitle: "Join our team and help build the future of technical career acceleration.",
    icon: <Briefcase className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-800">Why Join ResumeFlow?</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            We are a highly focused team of software engineers and designers building tools that impact millions of candidates.
            We value clean architecture, low-latency UI performance, and state-of-the-art AI orchestration.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Open Roles</h2>
          {[
            {
              title: "Senior AI Engineer (NIM & Agent Orchestration)",
              type: "Remote / Full-time",
              desc: "Lead the design of context-aware search pipelines, LLM fine-tuning, and agent routing configurations.",
            },
            {
              title: "Lead Frontend Engineer (Next.js & WASM Compiler)",
              type: "Remote / Full-time",
              desc: "Own client-side compilers, low-latency document rendering engines, and premium bento UI development.",
            },
          ].map((role, idx) => (
            <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-rose-300 transition-colors">
              <div>
                <h3 className="text-sm font-bold text-slate-800">{role.title}</h3>
                <span className="text-[10px] text-slate-400 font-bold">{role.type}</span>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-xl">{role.desc}</p>
              </div>
              <button className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-lg transition-colors shrink-0">
                Apply Now
              </button>
            </div>
          ))}
        </section>
      </div>
    ),
  },
};

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex items-center gap-3 text-green-700 text-sm max-w-md mx-auto">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
        <span>Thank you for your message! Our team will respond within 24 hours.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200/40 space-y-4 max-w-md mx-auto">
      <h3 className="font-bold text-sm text-slate-800 mb-2">Send us a direct message</h3>
      <div className="grid grid-cols-2 gap-3">
        <input required type="text" placeholder="Name" className="bg-white border border-slate-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500" />
        <input required type="email" placeholder="Email" className="bg-white border border-slate-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500" />
      </div>
      <textarea required placeholder="Your message..." rows={4} className="w-full bg-white border border-slate-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500" />
      <button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        Send Message
      </button>
    </form>
  );
}

export default function InfoSlugPage() {
  const { slug } = useParams();
  const pageData = infoContent[slug as string];

  if (!pageData) {
    notFound();
  }

  return (
    <StaticPageWrapper
      category={pageData.category}
      title={pageData.title}
      subtitle={pageData.subtitle}
    >
      <div className="flex gap-4 items-center mb-6">
        {pageData.icon}
        <div className="h-px bg-slate-200/60 flex-1" />
      </div>
      {pageData.body}
    </StaticPageWrapper>
  );
}
