"use client";

import React from "react";
import { notFound, useParams } from "next/navigation";
import { StaticPageWrapper } from "@/components/StaticPageWrapper";
import { ShieldAlert, FileText, Cookie } from "lucide-react";

interface ContentBlock {
  title: string;
  subtitle: string;
  category: string;
  icon: React.ReactNode;
  body: React.ReactNode;
}

const legalContent: Record<string, ContentBlock> = {
  "privacy": {
    category: "Legal & Privacy",
    title: "Privacy Policy",
    subtitle: "How we collect, protect, and process your master profile data.",
    icon: <ShieldAlert className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8 text-xs md:text-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">1. Information We Collect</h2>
          <p className="text-slate-600 leading-relaxed">
            We collect the resume profiles, experience bullets, project descriptions, skills, and details you upload or input directly.
            All contact details (such as names, phone numbers, and email addresses) are masked locally on your device prior to sending text data to external AI models.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">2. Processing of Data</h2>
          <p className="text-slate-600 leading-relaxed">
            We process your experience statements and job descriptions to perform automated ATS keyword tailoring and analysis.
            We use secure APIs hosted by NVIDIA NIM to perform optimization tasks. Your personal data is never shared for advertising or third-party tracking.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">3. Zero-Trust Local Compilation</h2>
          <p className="text-slate-600 leading-relaxed">
            When you export your resume to PDF, the LaTeX compilation is executed entirely in your browser using local WebAssembly.
            This ensures that your final unmasked PDF never touches our database or any external rendering servers, providing absolute document privacy.
          </p>
        </section>
      </div>
    ),
  },
  "terms": {
    category: "Legal Agreements",
    title: "Terms of Service",
    subtitle: "The guidelines and rules governing your use of the ResumeFlow placement suite.",
    icon: <FileText className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8 text-xs md:text-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">1. Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            By creating an account or using ResumeFlow, you agree to comply with and be bound by these Terms of Service.
            If you do not agree to these terms, you may not access our services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">2. Quota Usage & Budget Protection</h2>
          <p className="text-slate-600 leading-relaxed">
            To prevent system abuse and ensure fair distribution of serverless computing resources, usage is subject to daily limits (e.g., 5 resume compiles and 50 chatbot prep queries per day for the preview tier).
            Any attempt to bypass quotas or scrape service APIs will result in immediate account suspension.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">3. Prohibited Content</h2>
          <p className="text-slate-600 leading-relaxed">
            Users may not submit job descriptions or resumes containing offensive material, copyrighted data belonging to others without permission, or programmatic scripts designed to compromise platform performance.
          </p>
        </section>
      </div>
    ),
  },
  "cookies": {
    category: "Legal & Settings",
    title: "Cookie Policy & Settings",
    subtitle: "Manage how local storage and session markers are utilized to enhance your workspace.",
    icon: <Cookie className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8 text-xs md:text-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">1. What are cookies and local storage?</h2>
          <p className="text-slate-600 leading-relaxed">
            We use local session cookies to securely verify your Clerk authentication status during database queries.
            Additionally, browser local storage is utilized to temporarily store user interface layout states (such as maximizing your workspace canvas) and cache preview data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">2. Essential Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            These cookies are strictly necessary to provide you with secure dashboard access, database sync, and placement tools.
            Disabling essential cookies will block you from signing in or tailoring resumes.
          </p>
        </section>
      </div>
    ),
  },
};

export default function LegalSlugPage() {
  const { slug } = useParams();
  const pageData = legalContent[slug as string];

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
