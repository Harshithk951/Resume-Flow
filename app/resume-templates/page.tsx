"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { X } from "lucide-react";

interface TemplateItem {
  id: string;
  name: string;
  description: string;
  slug: string;
  accentColor: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "classic-professional",
    name: "Classic Professional",
    description:
      "The Harvard/McKinsey-style format trusted by recruiters at banks, consulting firms, and Fortune 500 companies.",
    slug: "classic-professional",
    accentColor: "#1e293b",
  },
  {
    id: "modern",
    name: "Modern",
    description:
      "A bold color header and clean sans-serif layout that stands out without sacrificing ATS compatibility.",
    slug: "modern",
    accentColor: "#2563eb",
  },
  {
    id: "minimal",
    name: "Minimal",
    description:
      "Maximum whitespace, zero decoration — built for when the content needs to do all the talking.",
    slug: "minimal",
    accentColor: "#475569",
  },
  {
    id: "two-column",
    name: "Two-Column",
    description:
      "A dark sidebar for skills and education, a main column for experience — fits more on one page without feeling cramped.",
    slug: "two-column",
    accentColor: "#0f172a",
  },
];

/* ─── MINIATURE MOCKUP COMPONENTS ────────────────────────────────────── */

function ClassicThumbnail() {
  return (
    <div className="w-full h-full bg-white p-3 text-[5.5px] leading-tight text-slate-800 flex flex-col shadow-xs border border-slate-200/60 rounded select-none pointer-events-none">
      {/* Header */}
      <div className="text-center pb-1.5 border-b border-slate-800">
        <div className="font-bold text-[7.5px] tracking-wide text-slate-900">Jordan Alvarez</div>
        <div className="text-[4.5px] text-slate-500 mt-0.5">
          San Francisco, CA • jordan@example.com • linkedin.com/in/jordan • github.com/jordan
        </div>
      </div>

      {/* Summary */}
      <div className="mt-1 pb-1 border-b border-slate-300">
        <div className="font-bold text-[5.5px] uppercase tracking-wider text-slate-900">Summary</div>
        <div className="text-[4.5px] text-slate-600 mt-0.5 line-clamp-1">
          Full-stack software engineer with 5+ years experience building distributed cloud systems and real-time APIs.
        </div>
      </div>

      {/* Experience */}
      <div className="mt-1 pb-1 border-b border-slate-300">
        <div className="font-bold text-[5.5px] uppercase tracking-wider text-slate-900">Experience</div>
        <div className="mt-0.5">
          <div className="flex justify-between font-bold text-[5px]">
            <span>Senior Software Engineer — TechCorp</span>
            <span className="text-slate-400 font-normal">2022 – Present</span>
          </div>
          <div className="text-[4.5px] text-slate-600 pl-1.5 mt-0.5 space-y-0.5">
            <div>• Architected high-throughput ingestion pipeline processing 40M+ events/day.</div>
            <div>• Reduced p99 API latency by 42% through distributed caching and query optimization.</div>
          </div>
        </div>
        <div className="mt-1">
          <div className="flex justify-between font-bold text-[5px]">
            <span>Software Engineer — StartupLab</span>
            <span className="text-slate-400 font-normal">2020 – 2022</span>
          </div>
          <div className="text-[4.5px] text-slate-600 pl-1.5 mt-0.5">
            <div>• Engineered core user authentication and role-based permissions serving 150K active users.</div>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="mt-1 pb-1 border-b border-slate-300">
        <div className="font-bold text-[5.5px] uppercase tracking-wider text-slate-900">Education</div>
        <div className="flex justify-between text-[4.5px] mt-0.5">
          <span className="font-semibold">B.S. in Computer Science — University of Washington</span>
          <span className="text-slate-400">2016 – 2020</span>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-1">
        <div className="font-bold text-[5.5px] uppercase tracking-wider text-slate-900">Skills</div>
        <div className="text-[4.5px] text-slate-600 mt-0.5">
          <span className="font-semibold">Languages:</span> TypeScript, Python, Go, SQL • <span className="font-semibold">Frameworks:</span> Next.js, React, Node.js
        </div>
      </div>
    </div>
  );
}

function ModernThumbnail() {
  return (
    <div className="w-full h-full bg-white flex flex-col shadow-xs border border-slate-200/60 rounded overflow-hidden select-none pointer-events-none">
      {/* Bold Colored Top Banner */}
      <div className="bg-[#2563EB] text-white p-2.5">
        <div className="font-bold text-[8px] tracking-wide">Jordan Alvarez</div>
        <div className="text-[5px] text-blue-100 font-medium mt-0.5">Senior Software Engineer</div>
        <div className="text-[4px] text-blue-200 mt-0.5">
          San Francisco, CA • jordan@example.com • linkedin.com/in/jordan
        </div>
      </div>

      {/* Body */}
      <div className="p-2.5 text-[5.5px] leading-tight text-slate-800 flex-1 flex flex-col justify-between">
        <div>
          <div className="font-bold text-[6px] uppercase tracking-wider text-[#2563EB] border-b border-blue-200 pb-0.5">
            Professional Experience
          </div>
          <div className="mt-1">
            <div className="flex justify-between font-bold text-[5px]">
              <span>Senior Software Engineer — TechCorp</span>
              <span className="text-slate-400 font-normal">2022 – Present</span>
            </div>
            <div className="text-[4.5px] text-slate-600 pl-1.5 mt-0.5 space-y-0.5">
              <div>• Scaled distributed ingestion cluster handling 40M daily mutations.</div>
              <div>• Reduced server footprint by 35% with optimized async workers.</div>
            </div>
          </div>
          <div className="mt-1">
            <div className="flex justify-between font-bold text-[5px]">
              <span>Software Engineer — StartupLab</span>
              <span className="text-slate-400 font-normal">2020 – 2022</span>
            </div>
            <div className="text-[4.5px] text-slate-600 pl-1.5 mt-0.5">
              <div>• Built microservices and payment workflows with Stripe & Webhooks.</div>
            </div>
          </div>
        </div>

        <div className="mt-1">
          <div className="font-bold text-[6px] uppercase tracking-wider text-[#2563EB] border-b border-blue-200 pb-0.5">
            Education & Skills
          </div>
          <div className="flex justify-between text-[4.5px] mt-0.5">
            <span className="font-semibold">B.S. Computer Science — Univ. of Washington</span>
            <span className="text-slate-400">2016 – 2020</span>
          </div>
          <div className="text-[4.5px] text-slate-600 mt-0.5">
            TypeScript, React, Python, PostgreSQL, AWS, Docker, GraphQL
          </div>
        </div>
      </div>
    </div>
  );
}

function MinimalThumbnail() {
  return (
    <div className="w-full h-full bg-white p-3 text-[5.5px] leading-relaxed text-slate-700 flex flex-col justify-between shadow-xs border border-slate-200/60 rounded select-none pointer-events-none">
      {/* Header */}
      <div>
        <div className="font-bold text-[8px] tracking-tight text-slate-900">Jordan Alvarez</div>
        <div className="text-[4.5px] text-slate-400 mt-0.5">
          jordan@example.com · +1 (415) 555-0192 · San Francisco, CA
        </div>
      </div>

      {/* Experience */}
      <div>
        <div className="text-[5px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
          Experience
        </div>
        <div>
          <div className="flex justify-between font-semibold text-[5.5px] text-slate-900">
            <span>TechCorp — Senior Software Engineer</span>
            <span className="text-slate-400 font-normal">2022 — Present</span>
          </div>
          <div className="text-[4.5px] text-slate-500 mt-0.5 space-y-0.5">
            <div>Led transition of legacy monololith to event-driven serverless architecture.</div>
            <div>Built automated CI/CD pipeline cutting deployment release time from 45m to 4m.</div>
          </div>
        </div>
        <div className="mt-1">
          <div className="flex justify-between font-semibold text-[5.5px] text-slate-900">
            <span>StartupLab — Software Engineer</span>
            <span className="text-slate-400 font-normal">2020 — 2022</span>
          </div>
          <div className="text-[4.5px] text-slate-500 mt-0.5">
            <div>Created responsive real-time dashboards with Next.js and Tailwind CSS.</div>
          </div>
        </div>
      </div>

      {/* Education & Skills */}
      <div>
        <div className="text-[5px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
          Education & Expertise
        </div>
        <div className="text-[4.5px] text-slate-600">
          <span className="text-slate-900 font-medium">B.S. Computer Science</span>, Univ. of Washington · 2020
        </div>
        <div className="text-[4.5px] text-slate-500 mt-0.5">
          TypeScript · React · Next.js · Go · PostgreSQL · Redis · Docker · Tailwind
        </div>
      </div>
    </div>
  );
}

function TwoColumnThumbnail() {
  return (
    <div className="w-full h-full bg-white flex shadow-xs border border-slate-200/60 rounded overflow-hidden select-none pointer-events-none">
      {/* Dark Sidebar */}
      <div className="w-[36%] bg-[#0F172A] text-white p-2 flex flex-col justify-between text-[4.5px] leading-tight">
        <div>
          <div className="font-bold text-[7px] text-white leading-tight">Jordan Alvarez</div>
          <div className="text-[4px] text-slate-400 mt-0.5">Full Stack Engineer</div>

          <div className="mt-2 text-[4px] text-slate-300 space-y-0.5">
            <div>✉ jordan@example.com</div>
            <div>📍 San Francisco, CA</div>
            <div>🔗 linkedin/in/jordan</div>
          </div>

          <div className="mt-2 pt-1 border-t border-slate-700/80">
            <div className="font-bold text-[5px] text-slate-200 uppercase tracking-wider mb-0.5">Skills</div>
            <div className="text-[4px] text-slate-400 space-y-0.5">
              <div>• TypeScript</div>
              <div>• React / Next.js</div>
              <div>• Node.js / Go</div>
              <div>• PostgreSQL</div>
              <div>• AWS & Docker</div>
            </div>
          </div>
        </div>

        <div className="pt-1 border-t border-slate-700/80">
          <div className="font-bold text-[5px] text-slate-200 uppercase tracking-wider mb-0.5">Education</div>
          <div className="text-[4px] text-slate-300 font-semibold">B.S. Computer Science</div>
          <div className="text-[3.5px] text-slate-400">Univ. of Washington · 2020</div>
        </div>
      </div>

      {/* Main Right Column */}
      <div className="w-[64%] p-2 text-[5px] leading-tight text-slate-800 flex flex-col justify-between">
        <div>
          <div className="font-bold text-[5.5px] text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">
            Executive Summary
          </div>
          <div className="text-[4.5px] text-slate-600 mt-0.5">
            Results-driven engineer specialized in scalable cloud microservices, developer productivity, and reliable distributed systems.
          </div>
        </div>

        <div className="mt-1">
          <div className="font-bold text-[5.5px] text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">
            Experience
          </div>
          <div className="mt-0.5">
            <div className="font-bold text-[5px] text-slate-900">Senior Software Engineer</div>
            <div className="text-[4px] text-slate-500">TechCorp · 2022 – Present</div>
            <div className="text-[4px] text-slate-600 mt-0.5 space-y-0.5">
              <div>• Led team of 6 engineers delivering multi-region message broker.</div>
              <div>• Reduced cloud infrastructure spend by 28% through autoscaling.</div>
            </div>
          </div>
          <div className="mt-1">
            <div className="font-bold text-[5px] text-slate-900">Software Engineer</div>
            <div className="text-[4px] text-slate-500">StartupLab · 2020 – 2022</div>
            <div className="text-[4px] text-slate-600 mt-0.5">
              <div>• Designed RESTful APIs and real-time WebSocket client notifications.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── FULL PREVIEW COMPONENT FOR MODAL ───────────────────────────────── */

function FullTemplatePreview({ templateId }: { templateId: string }) {
  if (templateId === "modern") {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden text-slate-800 max-w-2xl mx-auto">
        <div className="bg-[#2563EB] text-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Jordan Alvarez</h2>
          <p className="text-sm text-blue-100 font-medium mt-1">Senior Full-Stack Software Engineer</p>
          <div className="flex flex-wrap gap-4 text-xs text-blue-200 mt-3">
            <span>📍 San Francisco, CA</span>
            <span>✉ jordan.alvarez@example.com</span>
            <span>📞 +1 (415) 555-0192</span>
            <span>🔗 linkedin.com/in/jordan-alvarez</span>
          </div>
        </div>
        <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2563EB] border-b-2 border-blue-200 pb-1">
              Professional Summary
            </h3>
            <p className="mt-2 text-slate-600 leading-relaxed">
              Full-Stack Software Engineer with 5+ years of experience designing and scaling high-throughput distributed systems. Demonstrated expertise in React, Next.js, Go, and PostgreSQL. Track record of improving system uptime to 99.99% and reducing cloud spend by 30%.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2563EB] border-b-2 border-blue-200 pb-1">
              Work Experience
            </h3>
            <div className="mt-3 space-y-4">
              <div>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span className="text-sm">Senior Software Engineer — TechCorp Inc.</span>
                  <span className="text-xs text-slate-500 font-normal">2022 – Present</span>
                </div>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-600">
                  <li>Architected real-time ingestion pipeline handling 40M+ events per day with zero data loss.</li>
                  <li>Spearheaded transition from monolith to containerized microservices on AWS EKS, slashing deployment cycle time by 65%.</li>
                  <li>Mentored 5 junior engineers and instituted code review standards across the organization.</li>
                </ul>
              </div>
              <div>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span className="text-sm">Software Engineer — StartupLab</span>
                  <span className="text-xs text-slate-500 font-normal">2020 – 2022</span>
                </div>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-600">
                  <li>Built core payment workflows using Stripe Connect, processing $12M in gross volume in year one.</li>
                  <li>Optimized PostgreSQL queries and database indices to reduce average API response latency by 45%.</li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2563EB] border-b-2 border-blue-200 pb-1">
              Education & Certifications
            </h3>
            <div className="mt-2 flex justify-between text-slate-700">
              <span className="font-semibold">B.S. in Computer Science — University of Washington</span>
              <span className="text-slate-500">2016 – 2020</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2563EB] border-b-2 border-blue-200 pb-1">
              Technical Skills
            </h3>
            <p className="mt-2 text-slate-600">
              <strong className="text-slate-800">Languages:</strong> TypeScript, JavaScript, Python, Go, SQL<br />
              <strong className="text-slate-800">Frameworks & Libraries:</strong> React, Next.js, Node.js, Express, Tailwind CSS<br />
              <strong className="text-slate-800">Cloud & Tools:</strong> AWS, Docker, Kubernetes, PostgreSQL, Redis, Git, CI/CD
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "two-column") {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden flex flex-col md:flex-row max-w-2xl mx-auto">
        {/* Dark Left Sidebar */}
        <div className="w-full md:w-1/3 bg-[#0F172A] text-white p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Jordan Alvarez</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Software Engineer</p>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Contact</p>
            <p>✉ jordan@example.com</p>
            <p>📍 San Francisco, CA</p>
            <p>📞 +1 (415) 555-0192</p>
            <p>🔗 linkedin.com/in/jordan</p>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Skills</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["TypeScript", "React", "Next.js", "Node.js", "Python", "Go", "PostgreSQL", "Docker", "AWS"].map((s) => (
                <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-1 text-xs text-slate-300">
            <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Education</p>
            <p className="font-semibold text-white">B.S. Computer Science</p>
            <p className="text-slate-400 text-[11px]">Univ. of Washington · 2020</p>
          </div>
        </div>

        {/* Right Main Column */}
        <div className="w-full md:w-2/3 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-800">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              Profile Summary
            </h3>
            <p className="mt-2 text-slate-600 leading-relaxed text-xs sm:text-sm">
              Engineering leader with 5+ years of experience delivering robust web platforms and cloud-native backend services.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              Experience
            </h3>
            <div className="mt-3 space-y-4">
              <div>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>Senior Software Engineer</span>
                  <span className="text-xs text-slate-500 font-normal">2022 – Present</span>
                </div>
                <p className="text-xs text-purple-700 font-medium">TechCorp Inc. · San Francisco, CA</p>
                <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-600 text-xs">
                  <li>Orchestrated event-driven microservices processing 40M+ messages daily.</li>
                  <li>Cut p99 response times from 340ms to 48ms via multi-tier caching.</li>
                </ul>
              </div>
              <div>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>Software Engineer</span>
                  <span className="text-xs text-slate-500 font-normal">2020 – 2022</span>
                </div>
                <p className="text-xs text-purple-700 font-medium">StartupLab · Seattle, WA</p>
                <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-600 text-xs">
                  <li>Created responsive web apps with Next.js, Redux, and Tailwind CSS.</li>
                  <li>Spearheaded automated testing increasing code coverage to 92%.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "minimal") {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8 sm:p-12 text-slate-800 max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Jordan Alvarez</h2>
          <p className="text-xs text-slate-400 mt-1">
            jordan.alvarez@example.com · +1 (415) 555-0192 · San Francisco, CA · linkedin.com/in/jordan
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Experience
          </h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-900">
                <span>TechCorp — Senior Software Engineer</span>
                <span className="text-xs text-slate-400 font-normal">2022 — Present</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Led the platform core architecture. Built distributed message pipeline handling 40M+ events daily. Mentored junior engineers and revamped code review workflows.
              </p>
            </div>
            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-900">
                <span>StartupLab — Software Engineer</span>
                <span className="text-xs text-slate-400 font-normal">2020 — 2022</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Built real-time billing integrations and frontend dashboards. Improved query latency by 45% using database tuning and Redis caches.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Education
          </h3>
          <div className="flex justify-between text-xs text-slate-700">
            <span className="font-medium text-slate-900">University of Washington</span>
            <span className="text-slate-400">2016 — 2020</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">B.S. in Computer Science</p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Skills
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            TypeScript · React · Next.js · Node.js · Python · Go · PostgreSQL · Redis · Docker · AWS · Tailwind CSS
          </p>
        </div>
      </div>
    );
  }

  // Default: Classic Professional (Harvard/McKinsey)
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8 sm:p-12 text-slate-900 max-w-2xl mx-auto space-y-6">
      <div className="text-center pb-3 border-b-2 border-slate-900">
        <h2 className="text-2xl font-bold tracking-wide uppercase">Jordan Alvarez</h2>
        <p className="text-xs text-slate-600 mt-1">
          San Francisco, CA • (415) 555-0192 • jordan@example.com • linkedin.com/in/jordan
        </p>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
          Summary
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed">
          Accomplished software engineer with 5+ years of experience in distributed cloud infrastructure, microservices, and modern web application development. Proven record of delivering resilient products at scale.
        </p>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
          Professional Experience
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between font-bold text-xs">
              <span>TECHCORP INC. — San Francisco, CA</span>
              <span className="font-normal text-slate-600">2022 – Present</span>
            </div>
            <p className="text-xs italic text-slate-700">Senior Software Engineer</p>
            <ul className="list-disc pl-5 mt-1 text-xs text-slate-700 space-y-1">
              <li>Architected high-throughput ingestion pipeline processing 40M+ daily events with 99.99% reliability.</li>
              <li>Reduced API p99 latency by 42% through distributed Redis caching and database indexing.</li>
              <li>Guided team through SOC 2 Type II compliance audit and implemented strict data isolation.</li>
            </ul>
          </div>
          <div>
            <div className="flex justify-between font-bold text-xs">
              <span>STARTUPLAB — Seattle, WA</span>
              <span className="font-normal text-slate-600">2020 – 2022</span>
            </div>
            <p className="text-xs italic text-slate-700">Software Engineer</p>
            <ul className="list-disc pl-5 mt-1 text-xs text-slate-700 space-y-1">
              <li>Built core user authentication and role-based permissions serving 150K active users.</li>
              <li>Engineered interactive analytical dashboards using React and Next.js.</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
          Education
        </h3>
        <div className="flex justify-between text-xs">
          <span className="font-bold">UNIVERSITY OF WASHINGTON — Seattle, WA</span>
          <span className="text-slate-600">Graduated 2020</span>
        </div>
        <p className="text-xs text-slate-700">Bachelor of Science in Computer Science</p>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
          Skills
        </h3>
        <p className="text-xs text-slate-700">
          <strong>Languages:</strong> TypeScript, JavaScript, Python, Go, SQL<br />
          <strong>Technologies:</strong> React, Next.js, Node.js, Express, Docker, AWS, PostgreSQL, Redis, Git
        </p>
      </div>
    </div>
  );
}

/* ─── MAIN RESUME TEMPLATES PAGE ─────────────────────────────────────── */

export default function ResumeTemplatesPage() {
  const [selectedPreview, setSelectedPreview] = useState<TemplateItem | null>(null);

  const handleDownload = (template: TemplateItem) => {
    // Generates a clean styled HTML document and triggers print/save as PDF dialog directly in the browser
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download this resume template.");
      return;
    }

    const templateMarkup = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${template.name} - Free Resume Template | ResumeFlow</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @page { size: letter; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; margin: 0; padding: 20px; font-size: 10pt; }
            h1 { font-size: 18pt; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
            h2 { font-size: 11pt; text-transform: uppercase; border-bottom: 1px solid #1e293b; padding-bottom: 2px; margin: 16px 0 6px 0; letter-spacing: 0.5px; }
            .subtitle { font-size: 8.5pt; color: #64748b; margin-bottom: 12px; }
            .entry-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 9.5pt; margin-top: 8px; }
            .entry-subheader { display: flex; justify-content: space-between; font-style: italic; font-size: 9pt; color: #475569; margin-bottom: 4px; }
            ul { margin: 4px 0 10px 0; padding-left: 18px; }
            li { margin-bottom: 3px; font-size: 9pt; color: #334155; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px;">
            <h1>Jordan Alvarez</h1>
            <div class="subtitle">San Francisco, CA • (415) 555-0192 • jordan.alvarez@example.com • linkedin.com/in/jordan</div>
          </div>

          <h2>Summary</h2>
          <p style="margin: 4px 0 8px 0; font-size: 9pt;">
            Accomplished Software Engineer with 5+ years of experience designing and scaling distributed systems, microservices, and modern web applications. Proven record of delivering resilient products with 99.99% uptime.
          </p>

          <h2>Experience</h2>
          <div class="entry-header">
            <span>TECHCORP INC. — San Francisco, CA</span>
            <span>2022 – Present</span>
          </div>
          <div class="entry-subheader">
            <span>Senior Software Engineer</span>
          </div>
          <ul>
            <li>Architected high-throughput ingestion pipeline processing 40M+ daily events with 99.99% reliability.</li>
            <li>Reduced API p99 latency by 42% through distributed Redis caching and database query optimization.</li>
            <li>Mentored 5 engineers and established architectural review processes across the organization.</li>
          </ul>

          <div class="entry-header">
            <span>STARTUPLAB — Seattle, WA</span>
            <span>2020 – 2022</span>
          </div>
          <div class="entry-subheader">
            <span>Software Engineer</span>
          </div>
          <ul>
            <li>Built core user authentication, billing workflows, and role-based permissions serving 150K active users.</li>
            <li>Engineered interactive analytical dashboards using Next.js, React, and Tailwind CSS.</li>
          </ul>

          <h2>Education</h2>
          <div class="entry-header">
            <span>UNIVERSITY OF WASHINGTON — Seattle, WA</span>
            <span>Graduated 2020</span>
          </div>
          <div class="entry-subheader">
            <span>Bachelor of Science in Computer Science</span>
          </div>

          <h2>Skills</h2>
          <p style="margin: 4px 0; font-size: 9pt;">
            <strong>Languages:</strong> TypeScript, JavaScript, Python, Go, SQL<br/>
            <strong>Technologies:</strong> React, Next.js, Node.js, Express, Docker, AWS, PostgreSQL, Redis, Git
          </p>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(templateMarkup);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-[#5B50E6]/10 selection:text-[#5B50E6]">
      {/* ─── GLOBAL TOP NAVIGATION ────────────────────────────── */}
      <Navbar />

      {/* ─── HERO SECTION ─────────────────────────────────────── */}
      <main className="flex-1">
        <div className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20">
          {/* Subtle Right Blob from Screenshot */}
          <div
            className="absolute top-0 right-0 w-[420px] h-[340px] bg-[#F4F1FD] rounded-full blur-3xl opacity-75 pointer-events-none -mr-20 -mt-10"
            aria-hidden="true"
          />

          <div className="max-w-[1280px] mx-auto px-6 relative z-10">
            {/* Tagline */}
            <p className="text-xs font-bold tracking-wider uppercase text-[#5B50E6] mb-3">
              FREE TEMPLATES
            </p>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Free resume templates <br className="hidden sm:inline" />
              <span className="text-[#5B50E6]">— ATS-safe, no sign-up</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Four layouts, each built to parse cleanly. Download one blank as a PDF — no account, no email — or paste your own content and let ResumeFlow optimize it into one of these styles in about 27 seconds.
            </p>

            {/* ─── TEMPLATES 4-CARD ROW ───────────────────────── */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TEMPLATES.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Miniature Preview Container */}
                  <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 aspect-[1/1.28] flex items-center justify-center overflow-hidden relative group">
                    {item.id === "classic-professional" && <ClassicThumbnail />}
                    {item.id === "modern" && <ModernThumbnail />}
                    {item.id === "minimal" && <MinimalThumbnail />}
                    {item.id === "two-column" && <TwoColumnThumbnail />}
                  </div>

                  {/* Information */}
                  <div className="pt-4 pb-2 px-1 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed flex-1">
                      {item.description}
                    </p>
                  </div>

                  {/* Actions matching screenshot */}
                  <div className="flex flex-col gap-2 pt-2 px-1">
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-medium text-xs transition-all shadow-xs cursor-pointer active:scale-[0.99] text-center"
                    >
                      Download Free Template
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPreview(item)}
                      className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-medium text-xs transition-all shadow-2xs cursor-pointer text-center active:scale-[0.99]"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ─── CALLOUT BANNER: STEP ONE OF TWO ────────────── */}
            <div className="mt-16 bg-[#f7f5ff] rounded-2xl border border-purple-100/90 p-6 sm:p-8 md:p-10 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  A blank template is step one of two
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  A good layout gets you read. The right keywords get you past the filter. Paste your content and a real posting — ResumeFlow names what is missing before you send it. Free to start, no card.
                </p>
              </div>
              <div className="shrink-0">
                <Link
                  href="/optimize"
                  className="inline-flex items-center justify-center py-2.5 px-6 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-medium text-xs sm:text-sm transition-all shadow-md active:scale-[0.99] whitespace-nowrap cursor-pointer"
                >
                  Fill it against a job →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── PREVIEW MODAL ────────────────────────────────────── */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedPreview.name}</h3>
                <p className="text-xs text-slate-500">{selectedPreview.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Scrollable Preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/60">
              <FullTemplatePreview templateId={selectedPreview.id} />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                100% ATS-Compliant · Single or Multi-Column Compatible
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleDownload(selectedPreview)}
                  className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs transition-all shadow-2xs cursor-pointer"
                >
                  Download Free Template
                </button>
                <Link
                  href="/optimize"
                  className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-medium text-xs transition-all shadow-xs text-center"
                >
                  Fill it against a job →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── GLOBAL FOOTER ────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
