"use client";

import React, { useState } from "react";
import { useQuery, useAction, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft,
  FileText,
  Download,
  Loader2,
  Code,
  FileCode,
  AlertCircle,

} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { normalizeStructuredContent } from "@/lib/pdf/types";
import { ThemeProvider } from "@/components/ThemeProvider";

interface PageProps {
  params: Promise<{ id: string }>;
}

function jsonToMarkdown(data: any): string {
  const basics = data.personalInfo ?? {};
  const education = data.education ?? [];
  const experience = data.experience ?? [];
  const projects = data.projects ?? [];
  const skills = data.skills ?? {};
  const certifications = data.certifications ?? [];
  const achievements = data.achievements ?? [];

  let md = `# ${basics.name || "Resume"}\n\n`;
  if (basics.email || basics.phone || basics.portfolio || basics.linkedin || basics.github) {
    const contacts = [
      basics.email ? `Email: ${basics.email}` : "",
      basics.phone ? `Phone: ${basics.phone}` : "",
      basics.portfolio ? `Portfolio: ${basics.portfolio}` : "",
      basics.linkedin ? `LinkedIn: ${basics.linkedin}` : "",
      basics.github ? `GitHub: ${basics.github}` : "",
    ].filter(Boolean);
    md += contacts.join(" | ") + "\n\n";
  }

  if (data.summary) {
    md += `## Professional Summary\n\n${data.summary}\n\n`;
  }

  if (education.length > 0) {
    md += `## Education\n\n`;
    education.forEach((edu: any) => {
      md += `### ${edu.institution}\n`;
      md += `**Degree:** ${edu.degree}  \n`;
      if (edu.gpa) md += `**CGPA:** ${edu.gpa}  \n`;
      md += `**Year:** ${edu.year}\n\n`;
    });
  }

  if (experience.length > 0) {
    md += `## Experience\n\n`;
    experience.forEach((exp: any) => {
      md += `### ${exp.company} — ${exp.role}\n`;
      md += `**Duration:** ${exp.duration}\n\n`;
      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach((b: string) => {
          md += `- ${b}\n`;
        });
        md += `\n`;
      }
    });
  }

  if (projects.length > 0) {
    md += `## Projects\n\n`;
    projects.forEach((proj: any) => {
      md += `### ${proj.name}\n`;
      if (proj.technologies) md += `**Technologies:** ${proj.technologies.join(", ")}  \n`;
      if (proj.link) md += `**Link:** [Project Link](${proj.link})  \n`;
      md += `\n`;
      if (proj.bullets && proj.bullets.length > 0) {
        proj.bullets.forEach((b: string) => {
          md += `- ${b}\n`;
        });
        md += `\n`;
      }
    });
  }

  if (skills.languages || skills.frameworks || skills.tools || skills.databases || skills.soft) {
    md += `## Technical Skills\n\n`;
    if (skills.languages && skills.languages.length > 0) md += `- **Languages:** ${skills.languages.join(", ")}\n`;
    if (skills.frameworks && skills.frameworks.length > 0) md += `- **Frameworks & Libraries:** ${skills.frameworks.join(", ")}\n`;
    if (skills.tools && skills.tools.length > 0) md += `- **Tools:** ${skills.tools.join(", ")}\n`;
    if (skills.databases && skills.databases.length > 0) md += `- **Databases:** ${skills.databases.join(", ")}\n`;
    if (skills.soft && skills.soft.length > 0) md += `- **Core Concepts:** ${skills.soft.join(", ")}\n`;
    md += `\n`;
  }

  if (certifications.length > 0) {
    md += `## Certifications\n\n`;
    certifications.forEach((cert: any) => {
      md += `- **${cert.name}** — ${cert.issuer} ${cert.year ? `(${cert.year})` : ""}\n`;
    });
    md += `\n`;
  }

  if (achievements.length > 0) {
    md += `## Achievements\n\n`;
    achievements.forEach((ach: any) => {
      md += `- ${ach.description} ${ach.year ? `(${ach.year})` : ""}\n`;
    });
    md += `\n`;
  }

  return md.trim();
}

export default function ExportPage({ params }: PageProps) {
  const { id } = React.use(params);
  const jobId = id as Id<"jobs">;

  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  const job = useQuery(api.jobs.getJob, isAuthenticated ? { jobId } : "skip");
  const resume = useQuery(api.jobs.getTailoredResume, isAuthenticated ? { jobId } : "skip");
  const pdfUrl = useQuery(
    api.resumes.getPdfUrl,
    isAuthenticated && resume?.pdfStorageId ? { jobId } : "skip"
  );
  const docxUrl = useQuery(
    api.resumes.getDocxUrl,
    isAuthenticated && resume?.docxStorageId ? { jobId } : "skip"
  );

  const generateDocxAction = useAction(api.docx.generateDocx);

  const [docxGenerating, setDocxGenerating] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  if (authLoading || (isAuthenticated && job === undefined)) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-[50vh] w-full flex flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold text-slate-700">Job not found</p>
        <Link href="/dashboard" className="text-xs font-bold text-rose-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const structuredContent = resume?.structuredContent
    ? normalizeStructuredContent(resume.structuredContent)
    : null;

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      triggerDownload(pdfUrl, `${job.companyName}-tailored-resume.pdf`);
    } else {
      setExportError("PDF is not compiled yet. Please click Re-compile on the workspace page first.");
    }
  };

  const handleDownloadDocx = async () => {
    if (docxUrl) {
      triggerDownload(docxUrl, `${job.companyName}-resume.docx`);
      return;
    }

    setDocxGenerating(true);
    setExportError(null);
    try {
      const url = await generateDocxAction({ jobId });
      if (url) {
        triggerDownload(url, `${job.companyName}-resume.docx`);
      } else {
        throw new Error("Failed to retrieve generated Word document download URL.");
      }
    } catch (err: any) {
      console.error(err);
      setExportError(err.message || "Failed to generate Word document template.");
    } finally {
      setDocxGenerating(false);
    }
  };

  const handleDownloadJson = () => {
    if (!structuredContent) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(structuredContent, null, 2)
    )}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `${job.companyName}-resume-payload.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownloadMarkdown = () => {
    if (!structuredContent) return;
    const mdText = jsonToMarkdown(structuredContent);
    const mdString = `data:text/markdown;charset=utf-8,${encodeURIComponent(mdText)}`;
    const link = document.createElement("a");
    link.setAttribute("href", mdString);
    link.setAttribute("download", `${job.companyName}-resume.md`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <ThemeProvider forcedTheme="light" attribute="class">
    <div className="max-w-[1000px] mx-auto py-8">
      {/* Back button */}
      <Link
        href={`/company/${jobId}`}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors mb-8 inline-flex"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Workspace</span>
      </Link>

      {/* Hero Header */}
      <div className="mb-10">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-widest block mb-1">
          Exporter Hub
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Export your tailored resume
        </h1>
        <p className="type-body-sm text-slate-500 mt-2">
          Tailored specifically for <span className="font-bold text-slate-700">{job.jobTitle}</span> at <span className="font-bold text-slate-700">{job.companyName}</span>.
        </p>
      </div>

      {exportError && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-50 text-rose-700 text-sm border border-red-100 mb-8 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{exportError}</span>
        </div>
      )}

      {/* Exporter Grid (Awwwards Bento style layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: LaTeX PDF */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="type-heading-lg">LaTeX Compiled PDF</h3>
              <p className="type-caption-sm text-slate-500 mt-1 leading-relaxed">
                The gold standard for ATS filters. Single-page, strict visual contract layout compiled using full pdflatex parameters.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={!pdfUrl}
            className="btn-primary w-full mt-8 flex items-center justify-center gap-2 disabled:opacity-55"
          >
            {pdfUrl ? (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            ) : (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Compiling PDF...</span>
              </>
            )}
          </button>
        </motion.div>

        {/* CARD 2: MS Word DOCX */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="type-heading-lg">MS Word (DOCX)</h3>
              <p className="type-caption-sm text-slate-500 mt-1 leading-relaxed">
                Fully editable resume template. Replaces variables inside our university-verified base template.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadDocx}
            disabled={docxGenerating}
            className="btn-secondary w-full mt-8 flex items-center justify-center gap-2 h-12"
          >
            {docxGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                <span>Generating Document...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{docxUrl ? "Download DOCX" : "Generate & Download DOCX"}</span>
              </>
            )}
          </button>
        </motion.div>

        {/* CARD 3: JSON Resume */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <h3 className="type-heading-lg">JSON Resume Payload</h3>
              <p className="type-caption-sm text-slate-500 mt-1 leading-relaxed">
                Raw structured content conforming to the JSON Resume Schema. Great for developer portfolios or programmatic use.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadJson}
            disabled={!structuredContent}
            className="btn-secondary w-full mt-8 flex items-center justify-center gap-2 h-12"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON</span>
          </button>
        </motion.div>

        {/* CARD 4: Markdown Layout */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="type-heading-lg">Markdown Format</h3>
              <p className="type-caption-sm text-slate-500 mt-1 leading-relaxed">
                Clean text representation using Markdown syntax. Easily copyable into outreach emails or online bio sections.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadMarkdown}
            disabled={!structuredContent}
            className="btn-secondary w-full mt-8 flex items-center justify-center gap-2 h-12"
          >
            <Download className="w-4 h-4" />
            <span>Download Markdown</span>
          </button>
        </motion.div>
      </div>
    </div>
    </ThemeProvider>
  );
}
