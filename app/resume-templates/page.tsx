"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { X, Download, ArrowRight, Eye, CheckCircle2 } from "lucide-react";

interface TemplateItem {
  id: string;
  name: string;
  description: string;
  slug: string;
  accentColor: string;
  pdfUrl: string;
  previewImage: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "classic-professional",
    name: "Classic Professional",
    description:
      "The Harvard/McKinsey-style format trusted by recruiters at banks, consulting firms, and Fortune 500 companies.",
    slug: "classic-professional",
    accentColor: "#0f172a",
    pdfUrl: "/templates/classic-professional-resume-template.pdf",
    previewImage: "/images/templates/classic-professional.png",
  },
  {
    id: "modern",
    name: "Modern",
    description:
      "A bold color header and clean sans-serif layout that stands out without sacrificing ATS compatibility.",
    slug: "modern",
    accentColor: "#2563eb",
    pdfUrl: "/templates/modern-resume-template.pdf",
    previewImage: "/images/templates/modern.png",
  },
  {
    id: "minimal",
    name: "Minimal",
    description:
      "Maximum whitespace, zero decoration — built for when the content needs to do all the talking.",
    slug: "minimal",
    accentColor: "#475569",
    pdfUrl: "/templates/minimal-resume-template.pdf",
    previewImage: "/images/templates/minimal.png",
  },
  {
    id: "two-column",
    name: "Two-Column",
    description:
      "A dark sidebar for skills and education, a main column for experience — fits more on one page without feeling cramped.",
    slug: "two-column",
    accentColor: "#0f172a",
    pdfUrl: "/templates/two-column-resume-template.pdf",
    previewImage: "/images/templates/two-column.png",
  },
];

/* ─── FULL PREVIEW COMPONENT FOR MODAL ───────────────────────────────── */

function FullTemplatePreview({ template }: { template: TemplateItem }) {
  const [activeTab, setActiveTab] = useState<"visual" | "html">("visual");

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto">
      {/* View Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-medium text-slate-600">
        <button
          type="button"
          onClick={() => setActiveTab("visual")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === "visual"
              ? "bg-white text-slate-900 shadow-xs font-semibold"
              : "hover:text-slate-900"
          }`}
        >
          4K Document View
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("html")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === "html"
              ? "bg-white text-slate-900 shadow-xs font-semibold"
              : "hover:text-slate-900"
          }`}
        >
          Selectable Text View
        </button>
      </div>

      {activeTab === "visual" ? (
        <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden w-full max-w-2xl">
          <img
            src={template.previewImage}
            alt={`${template.name} preview`}
            className="w-full h-auto block"
          />
        </div>
      ) : (
        <div className="w-full">
          {template.id === "two-column" && (
            <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col sm:flex-row text-xs max-w-2xl mx-auto">
              {/* Dark Left Sidebar */}
              <div className="w-full sm:w-[36%] bg-[#0B1528] text-white p-6 space-y-5">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Jordan Alvarez</h2>
                  <div className="mt-2 space-y-1 text-slate-300 text-[11px]">
                    <div>jordan.alvarez@email.com</div>
                    <div>(555) 123-4567</div>
                    <div>San Francisco, CA</div>
                    <div>linkedin.com/in/jordanalvarez</div>
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#93c5fd]">
                    EDUCATION
                  </h3>
                  <div className="mt-1.5 text-[11px]">
                    <p className="font-semibold text-slate-100">B.S. Computer Science — University of Washington</p>
                    <p className="text-slate-400 mt-0.5">2015 – 2019</p>
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#93c5fd]">
                    SKILLS
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-slate-300 text-[11px]">
                    <li>• Languages: JavaScript, TypeScript, Python, SQL</li>
                    <li>• Frameworks: React, Next.js, Node.js, Express</li>
                    <li>• Cloud &amp; Tools: AWS, Docker, PostgreSQL, GitHub Actions</li>
                  </ul>
                </div>
              </div>

              {/* Right Main Column */}
              <div className="w-full sm:w-[64%] p-6 space-y-5 text-slate-800">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    SUMMARY
                  </h3>
                  <p className="mt-2 text-slate-700 leading-relaxed text-xs">
                    Product-focused Software Engineer with 5+ years building and scaling web applications used by millions of users. Specializes in React, Node.js, and cloud infrastructure.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    EXPERIENCE
                  </h3>
                  <div className="mt-3 space-y-4">
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        Senior Software Engineer — Northwind Digital
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Jan 2022 – Present</div>
                      <ul className="mt-1.5 space-y-1 text-slate-700 text-[11px] list-disc pl-4">
                        <li>Led migration of monolith checkout service to microservices, reducing p99 latency from 800ms to 210ms</li>
                        <li>Built real-time inventory sync system handling 2M+ events/day across 40 regional warehouses</li>
                        <li>Mentored 4 junior engineers; introduced code review standards that cut production incidents by 35%</li>
                      </ul>
                    </div>

                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        Software Engineer — Brightline Labs
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Jun 2019 – Dec 2021</div>
                      <ul className="mt-1.5 space-y-1 text-slate-700 text-[11px] list-disc pl-4">
                        <li>Shipped customer-facing dashboard used by 15,000+ monthly active users, improving retention by 18%</li>
                        <li>Reduced CI pipeline runtime from 22 minutes to 6 minutes through test parallelization and caching</li>
                        <li>Collaborated with design and product to launch 3 major features on a 6-week release cadence</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {template.id === "minimal" && (
            <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-8 sm:p-10 text-slate-800 max-w-2xl mx-auto space-y-5 text-xs font-sans">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">Jordan Alvarez</h2>
                <p className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-4">
                  <span>jordan.alvarez@email.com</span>
                  <span>(555) 123-4567</span>
                  <span>San Francisco, CA</span>
                  <span>linkedin.com/in/jordanalvarez</span>
                </p>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  SUMMARY
                </h3>
                <p className="text-slate-700 leading-relaxed text-xs">
                  Product-focused Software Engineer with 5+ years building and scaling web applications used by millions of users. Specializes in React, Node.js, and cloud infrastructure.
                </p>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  EXPERIENCE
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      Senior Software Engineer — Northwind Digital
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Jan 2022 – Present</div>
                    <div className="mt-1.5 space-y-1 text-slate-700 text-[11px]">
                      <div>— Led migration of monolith checkout service to microservices, reducing p99 latency from 800ms to 210ms</div>
                      <div>— Built real-time inventory sync system handling 2M+ events/day across 40 regional warehouses</div>
                      <div>— Mentored 4 junior engineers; introduced code review standards that cut production incidents by 35%</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      Software Engineer — Brightline Labs
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Jun 2019 – Dec 2021</div>
                    <div className="mt-1.5 space-y-1 text-slate-700 text-[11px]">
                      <div>— Shipped customer-facing dashboard used by 15,000+ monthly active users, improving retention by 18%</div>
                      <div>— Reduced CI pipeline runtime from 22 minutes to 6 minutes through test parallelization and caching</div>
                      <div>— Collaborated with design and product to launch 3 major features on a 6-week release cadence</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  EDUCATION
                </h3>
                <div className="font-bold text-xs text-slate-900">
                  B.S. Computer Science — University of Washington
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">2015 – 2019</div>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  SKILLS
                </h3>
                <div className="space-y-1 text-slate-700 text-[11px]">
                  <div>— Languages: JavaScript, TypeScript, Python, SQL</div>
                  <div>— Frameworks: React, Next.js, Node.js, Express</div>
                  <div>— Cloud &amp; Tools: AWS, Docker, PostgreSQL, GitHub Actions</div>
                </div>
              </div>
            </div>
          )}

          {template.id === "classic-professional" && (
            <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-8 sm:p-10 text-slate-900 max-w-2xl mx-auto space-y-4 font-serif">
              <div className="text-center pb-2">
                <h2 className="text-2xl font-bold text-slate-950 font-serif">Jordan Alvarez</h2>
                <p className="text-[11px] text-slate-600 mt-1 font-sans">
                  jordan.alvarez@email.com &nbsp;·&nbsp; (555) 123-4567 &nbsp;·&nbsp; San Francisco, CA &nbsp;·&nbsp; linkedin.com/in/jordanalvarez
                </p>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-950 border-b border-slate-900 pb-0.5 mb-2 font-sans">
                  S U M M A R Y
                </h3>
                <p className="text-xs text-slate-800 leading-relaxed font-serif">
                  Product-focused Software Engineer with 5+ years building and scaling web applications used by millions of users. Specializes in React, Node.js, and cloud infrastructure.
                </p>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-950 border-b border-slate-900 pb-0.5 mb-2 font-sans">
                  E X P E R I E N C E
                </h3>
                <div className="space-y-3 font-sans">
                  <div>
                    <div className="font-bold text-xs text-slate-950">
                      Senior Software Engineer — Northwind Digital
                    </div>
                    <div className="text-[11px] text-slate-600">Jan 2022 – Present</div>
                    <ul className="mt-1 space-y-1 text-[11px] text-slate-800 list-disc pl-4 font-serif">
                      <li>Led migration of monolith checkout service to microservices, reducing p99 latency from 800ms to 210ms</li>
                      <li>Built real-time inventory sync system handling 2M+ events/day across 40 regional warehouses</li>
                      <li>Mentored 4 junior engineers; introduced code review standards that cut production incidents by 35%</li>
                    </ul>
                  </div>

                  <div>
                    <div className="font-bold text-xs text-slate-950">
                      Software Engineer — Brightline Labs
                    </div>
                    <div className="text-[11px] text-slate-600">Jun 2019 – Dec 2021</div>
                    <ul className="mt-1 space-y-1 text-[11px] text-slate-800 list-disc pl-4 font-serif">
                      <li>Shipped customer-facing dashboard used by 15,000+ monthly active users, improving retention by 18%</li>
                      <li>Reduced CI pipeline runtime from 22 minutes to 6 minutes through test parallelization and caching</li>
                      <li>Collaborated with design and product to launch 3 major features on a 6-week release cadence</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-950 border-b border-slate-900 pb-0.5 mb-2 font-sans">
                  E D U C A T I O N
                </h3>
                <div className="font-sans">
                  <div className="font-bold text-xs text-slate-950">
                    B.S. Computer Science — University of Washington
                  </div>
                  <div className="text-[11px] text-slate-600">2015 – 2019</div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-950 border-b border-slate-900 pb-0.5 mb-2 font-sans">
                  S K I L L S
                </h3>
                <ul className="space-y-1 text-[11px] text-slate-800 list-disc pl-4 font-serif">
                  <li>Languages: JavaScript, TypeScript, Python, SQL</li>
                  <li>Frameworks: React, Next.js, Node.js, Express</li>
                  <li>Cloud &amp; Tools: AWS, Docker, PostgreSQL, GitHub Actions</li>
                </ul>
              </div>
            </div>
          )}

          {template.id === "modern" && (
            <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden text-slate-800 max-w-2xl mx-auto">
              {/* Bold Blue Top Banner */}
              <div className="bg-[#2563EB] text-white p-6 sm:p-7">
                <h2 className="text-2xl font-bold tracking-tight text-white">Jordan Alvarez</h2>
                <p className="text-[11px] text-blue-100 mt-2 flex flex-wrap gap-x-3">
                  <span>jordan.alvarez@email.com</span>
                  <span>·</span>
                  <span>(555) 123-4567</span>
                  <span>·</span>
                  <span>San Francisco, CA</span>
                  <span>·</span>
                  <span>linkedin.com/in/jordanalvarez</span>
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-5 text-xs">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] flex items-center gap-2">
                    <span>SUMMARY</span>
                  </h3>
                  <div className="w-8 h-0.5 bg-[#2563EB] mt-1 mb-2"></div>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    Product-focused Software Engineer with 5+ years building and scaling web applications used by millions of users. Specializes in React, Node.js, and cloud infrastructure.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] flex items-center gap-2">
                    <span>EXPERIENCE</span>
                  </h3>
                  <div className="w-8 h-0.5 bg-[#2563EB] mt-1 mb-2"></div>
                  <div className="space-y-4">
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        Senior Software Engineer — Northwind Digital
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Jan 2022 – Present</div>
                      <ul className="mt-1.5 space-y-1 text-slate-700 text-[11px]">
                        <li className="flex items-start gap-2">
                          <span className="text-[#2563EB] font-bold">•</span>
                          <span>Led migration of monolith checkout service to microservices, reducing p99 latency from 800ms to 210ms</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#2563EB] font-bold">•</span>
                          <span>Built real-time inventory sync system handling 2M+ events/day across 40 regional warehouses</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#2563EB] font-bold">•</span>
                          <span>Mentored 4 junior engineers; introduced code review standards that cut production incidents by 35%</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        Software Engineer — Brightline Labs
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Jun 2019 – Dec 2021</div>
                      <ul className="mt-1.5 space-y-1 text-slate-700 text-[11px]">
                        <li className="flex items-start gap-2">
                          <span className="text-[#2563EB] font-bold">•</span>
                          <span>Shipped customer-facing dashboard used by 15,000+ monthly active users, improving retention by 18%</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#2563EB] font-bold">•</span>
                          <span>Reduced CI pipeline runtime from 22 minutes to 6 minutes through test parallelization and caching</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#2563EB] font-bold">•</span>
                          <span>Collaborated with design and product to launch 3 major features on a 6-week release cadence</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] flex items-center gap-2">
                    <span>EDUCATION</span>
                  </h3>
                  <div className="w-8 h-0.5 bg-[#2563EB] mt-1 mb-2"></div>
                  <div className="font-bold text-xs text-slate-900">
                    B.S. Computer Science — University of Washington
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">2015 – 2019</div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] flex items-center gap-2">
                    <span>SKILLS</span>
                  </h3>
                  <div className="w-8 h-0.5 bg-[#2563EB] mt-1 mb-2"></div>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563EB] font-bold">•</span>
                      <span>Languages: JavaScript, TypeScript, Python, SQL</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563EB] font-bold">•</span>
                      <span>Frameworks: React, Next.js, Node.js, Express</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563EB] font-bold">•</span>
                      <span>Cloud &amp; Tools: AWS, Docker, PostgreSQL, GitHub Actions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── MAIN RESUME TEMPLATES PAGE ─────────────────────────────────────── */

export default function ResumeTemplatesPage() {
  const [selectedPreview, setSelectedPreview] = useState<TemplateItem | null>(null);

  const handleDownload = (template: TemplateItem) => {
    // Downloads the genuine, crisp ATS-compliant PDF directly
    const link = document.createElement("a");
    link.href = template.pdfUrl;
    link.download = `${template.slug}-resume-template.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-[#5B50E6]/10 selection:text-[#5B50E6]">
      {/* ─── GLOBAL TOP NAVIGATION ────────────────────────────── */}
      <Navbar />

      {/* ─── HERO SECTION ─────────────────────────────────────── */}
      <main className="flex-1">
        <div className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20">
          {/* Subtle Right Ambient Blob */}
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
                  className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Miniature 4K Template Preview */}
                  <div
                    onClick={() => setSelectedPreview(item)}
                    className="bg-slate-50/80 rounded-xl p-2 border border-slate-100 aspect-[1/1.38] flex items-center justify-center overflow-hidden relative cursor-pointer group-hover:border-purple-200 transition-colors"
                  >
                    <div className="relative w-full h-full rounded shadow-xs overflow-hidden border border-slate-200/70 bg-white">
                      <img
                        src={item.previewImage}
                        alt={`${item.name} Resume Template`}
                        className="w-full h-full object-cover object-top select-none pointer-events-none group-hover:scale-[1.03] transition-transform duration-300"
                        loading="eager"
                      />
                    </div>

                    {/* Hover Overlay with Preview Icon */}
                    <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="bg-white/95 text-slate-900 text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-xs">
                        <Eye className="w-3.5 h-3.5 text-[#5B50E6]" />
                        <span>Preview</span>
                      </span>
                    </div>
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

                  {/* Actions matching exact design */}
                  <div className="flex flex-col gap-2 pt-2 px-1">
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-medium text-xs transition-all shadow-xs cursor-pointer active:scale-[0.99] text-center flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Free Template</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPreview(item)}
                      className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-medium text-xs transition-all shadow-2xs cursor-pointer text-center active:scale-[0.99] flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ─── CALLOUT BANNER: STEP ONE OF TWO ────────────── */}
            <div className="mt-16 bg-[#f7f5ff] rounded-2xl border border-purple-100/90 p-6 sm:p-8 md:p-10 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-[#5B50E6] font-bold text-xs uppercase tracking-wider mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ATS Optimization Ready</span>
                </div>
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
                  className="inline-flex items-center justify-center py-2.5 px-6 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-medium text-xs sm:text-sm transition-all shadow-md active:scale-[0.99] whitespace-nowrap cursor-pointer gap-1.5"
                >
                  <span>Fill it against a job</span>
                  <ArrowRight className="w-4 h-4" />
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
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Scrollable Preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/70">
              <FullTemplatePreview template={selectedPreview} />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                100% ATS-Compliant · Tested with Greenhouse, Lever, Workday &amp; Taleo
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleDownload(selectedPreview)}
                  className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download Free PDF</span>
                </button>
                <Link
                  href="/optimize"
                  className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-medium text-xs transition-all shadow-xs text-center flex items-center justify-center gap-1.5"
                >
                  <span>Fill it against a job</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
