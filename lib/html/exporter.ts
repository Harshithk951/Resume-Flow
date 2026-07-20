// lib/html/exporter.ts
import { SpacingContractMap } from "../latex/layoutAdapter";
import { StructuredResumeContent } from "../pdf/types";

function escapeHtml(str: string | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getLinkedinUsername(url: string | undefined): string {
  if (!url) return "";
  return url.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//i, "").replace(/\/$/, "");
}

function getGithubUsername(url: string | undefined): string {
  if (!url) return "";
  return url.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "").replace(/\/$/, "");
}


export function exportToHtml(
  data: StructuredResumeContent,
  templateId: string,
  preset: "compact" | "executive" = "compact"
): string {
  const layout = SpacingContractMap[preset] || SpacingContractMap.compact;
  const personalInfo = data.personalInfo ?? {};
  const education = data.education ?? [];
  const experience = data.experience ?? [];
  const projects = data.projects ?? [];
  const skills = data.skills ?? { languages: [], frameworks: [], tools: [], databases: [], soft: [] };
  const certifications = data.certifications ?? [];
  const achievements = data.achievements ?? [];

  // Define template-specific variables/styles
  let bodyClass = "bg-white text-slate-900 antialiased p-8 mx-auto my-0 max-w-[800px] min-h-[1123px] shadow-[0_0_20px_rgba(0,0,0,0.05)]";
  let headingStyleClass = layout.headingClass;
  const LINK_COLOR = "#3b82f6";

  if (templateId === "ats_strict") {
    bodyClass = "bg-white text-black antialiased p-8 mx-auto my-0 max-w-[800px] min-h-[1123px]";
    headingStyleClass = "text-sm font-bold uppercase tracking-wider border-b border-black pb-0.5 mt-4 mb-2";
  } else if (templateId === "modern_professional") {
    bodyClass = "bg-white text-slate-800 antialiased p-10 mx-auto my-0 max-w-[800px] min-h-[1123px] border-t-8 border-rose-600 shadow-[0_0_25px_rgba(0,0,0,0.08)]";
    headingStyleClass = "text-md font-bold text-rose-600 uppercase tracking-wide border-b-2 border-rose-600 pb-1 mt-5 mb-2.5";
  } else if (templateId === "modern_executive") {
    bodyClass = "bg-white text-slate-900 antialiased p-10 mx-auto my-0 max-w-[800px] min-h-[1123px] font-serif shadow-[0_0_25px_rgba(0,0,0,0.08)]";
    headingStyleClass = "text-lg font-semibold text-slate-900 border-b border-slate-300 pb-1.5 mt-6 mb-3";
  } else if (templateId === "tech_innovator") {
    bodyClass = "bg-white text-slate-800 antialiased p-10 mx-auto my-0 max-w-[800px] min-h-[1123px] shadow-[0_0_25px_rgba(0,0,0,0.08)]";
    headingStyleClass = "text-md font-extrabold text-indigo-600 uppercase tracking-widest border-b-2 border-indigo-600/35 pb-1.5 mt-5 mb-3";
  }

  // Header render helpers
  const headline =
    (data.summary && data.summary.trim().slice(0, 80)) ||
    experience[0]?.role ||
    "";

  const renderHeader = () => {
    if (templateId === "ats_strict") {
      return `
        <div class="text-center mb-4">
          <h1 class="text-2xl font-bold uppercase tracking-tight">${escapeHtml(personalInfo.name)}</h1>
          <div class="text-xs mt-1 space-x-1.5 text-slate-700">
            ${personalInfo.email ? `<a href="mailto:${personalInfo.email}" class="underline">${escapeHtml(personalInfo.email)}</a> |` : ""}
            ${personalInfo.phone ? `<span>${escapeHtml(personalInfo.phone)}</span> |` : ""}
            ${personalInfo.linkedin ? `<a href="${personalInfo.linkedin}" class="underline">linkedin.com/in/${escapeHtml(getLinkedinUsername(personalInfo.linkedin))}</a> |` : ""}
            ${personalInfo.github ? `<a href="${personalInfo.github}" class="underline">github.com/${escapeHtml(getGithubUsername(personalInfo.github))}</a>` : ""}
          </div>
        </div>
      `;
    }

    if (templateId === "modern_professional") {
      return `
        <div class="flex justify-between items-start border-b border-slate-300 pb-6 mb-6">
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight text-slate-950">${escapeHtml(personalInfo.name)}</h1>
            ${headline ? `<p class="text-sm font-semibold text-rose-600 mt-1 uppercase tracking-wider">${escapeHtml(headline)}</p>` : ""}
          </div>
          <div class="text-right text-xs space-y-1 text-slate-500">
            ${personalInfo.email ? `<div><a href="mailto:${personalInfo.email}" class="link">${escapeHtml(personalInfo.email)}</a></div>` : ""}
            ${personalInfo.phone ? `<div>${escapeHtml(personalInfo.phone)}</div>` : ""}
            <div class="space-x-2 mt-1.5">
              ${personalInfo.linkedin ? `<a href="${personalInfo.linkedin}" class="link">LinkedIn</a>` : ""}
              ${personalInfo.github ? `<a href="${personalInfo.github}" class="link">GitHub</a>` : ""}
              ${personalInfo.portfolio ? `<a href="${personalInfo.portfolio}" class="link">Portfolio</a>` : ""}
            </div>
          </div>
        </div>
      `;
    }

    if (templateId === "modern_executive") {
      return `
        <div class="text-center border-b border-slate-300 pb-6 mb-6">
          <h1 class="text-3xl font-light tracking-wide text-slate-950 font-serif">${escapeHtml(personalInfo.name)}</h1>
          <div class="flex justify-center gap-4 text-xs mt-3 text-slate-600 font-sans tracking-wide">
            ${personalInfo.email ? `<a href="mailto:${personalInfo.email}" class="hover:underline">${escapeHtml(personalInfo.email)}</a>` : ""}
            ${personalInfo.phone ? `<span>${escapeHtml(personalInfo.phone)}</span>` : ""}
            ${personalInfo.linkedin ? `<a href="${personalInfo.linkedin}" class="link">LinkedIn</a>` : ""}
            ${personalInfo.github ? `<a href="${personalInfo.github}" class="link">GitHub</a>` : ""}
          </div>
        </div>
      `;
    }

    // tech_innovator
    return `
      <div class="flex justify-between items-center border-b-2 border-slate-300 pb-6 mb-6">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900">${escapeHtml(personalInfo.name)}</h1>
          ${headline ? `<p class="text-xs font-mono text-indigo-600 mt-1 uppercase tracking-wider">${escapeHtml(headline)}</p>` : ""}
        </div>
        <div class="text-right text-xs font-mono space-y-1 text-slate-500">
          ${personalInfo.email ? `<div>${escapeHtml(personalInfo.email)}</div>` : ""}
          ${personalInfo.phone ? `<div>${escapeHtml(personalInfo.phone)}</div>` : ""}
          <div class="space-x-2 mt-1.5">
            ${personalInfo.linkedin ? `<a href="${personalInfo.linkedin}" class="link">LinkedIn</a>` : ""}
            ${personalInfo.github ? `<a href="${personalInfo.github}" class="link">GitHub</a>` : ""}
            ${personalInfo.portfolio ? `<a href="${personalInfo.portfolio}" class="link">Portfolio</a>` : ""}
          </div>
        </div>
      </div>
    `;
  };

  const renderSummary = () => {
    if (!data.summary) return "";
    return `
      <div class="${layout.sectionSpacing}">
        <h2 class="${headingStyleClass}">Professional Summary</h2>
        <p class="text-xs leading-relaxed text-slate-700">${escapeHtml(data.summary)}</p>
      </div>
    `;
  };

  const renderEducation = () => {
    if (education.length === 0) return "";
    return `
      <div class="${layout.sectionSpacing}">
        <h2 class="${headingStyleClass}">Education</h2>
        <div class="space-y-3">
          ${education
            .map(
              (edu) => `
            <div>
              <div class="flex justify-between items-baseline text-xs">
                <span class="font-bold text-slate-900">${escapeHtml(edu.institution)}</span>
                <span class="text-slate-500 whitespace-nowrap ml-4">${escapeHtml(edu.year)}</span>
              </div>
              <div class="flex justify-between items-baseline text-xs mt-0.5">
                <span class="text-slate-500 italic">${escapeHtml(edu.degree)}</span>
                ${edu.gpa ? `<span class="font-semibold text-slate-900 whitespace-nowrap ml-4">CGPA: ${escapeHtml(edu.gpa)}</span>` : ""}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  };

  const renderExperience = () => {
    if (experience.length === 0) return "";
    return `
      <div class="${layout.sectionSpacing}">
        <h2 class="${headingStyleClass}">Experience</h2>
        <div class="space-y-4">
          ${experience
            .map(
              (exp) => `
            <div>
              <div class="flex justify-between items-baseline text-xs mb-1">
                <div>
                  <span class="font-bold text-slate-900">${escapeHtml(exp.company)}</span>
                  <span class="text-slate-500 italic ml-1">${escapeHtml(exp.role)}</span>
                </div>
                <span class="text-slate-500 whitespace-nowrap ml-4">${escapeHtml(exp.duration)}</span>
              </div>
              <ul class="list-disc list-inside space-y-0.5 text-slate-600 text-xs pl-2">
                ${(exp.bullets ?? [])
                  .map((b: string) => `<li class="leading-relaxed"><span class="relative -left-1">${escapeHtml(b)}</span></li>`)
                  .join("")}
              </ul>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  };

  const renderProjects = () => {
    if (projects.length === 0) return "";
    return `
      <div class="${layout.sectionSpacing}">
        <h2 class="${headingStyleClass}">Projects</h2>
        <div class="space-y-4">
          ${projects
            .map(
              (proj) => `
            <div>
              <div class="flex justify-between items-baseline text-xs mb-1">
                <div>
                  <span class="font-bold text-slate-900">${escapeHtml(proj.name)}</span>
                  ${proj.technologies ? `<span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded ml-2 font-mono">${escapeHtml(proj.technologies.join(", "))}</span>` : ""}
                </div>
                ${proj.link ? `<a href="${proj.link}" class="text-[10px] link">${templateId === "tech_innovator" ? "GitHub / Demo" : "Link"}</a>` : ""}
              </div>
              <ul class="list-disc list-inside space-y-0.5 text-slate-600 text-xs pl-2">
                ${(proj.bullets ?? [])
                  .map((b: string) => `<li class="leading-relaxed"><span class="relative -left-1">${escapeHtml(b)}</span></li>`)
                  .join("")}
              </ul>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  };

  const renderSkills = () => {
    if (templateId === "tech_innovator") {
      return `
        <div class="${layout.sectionSpacing}">
          <h2 class="${headingStyleClass}">Skills</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span class="font-semibold text-slate-900 block mb-1">Languages & Frameworks</span>
              <div class="flex flex-wrap gap-1">
                ${[...(skills.languages ?? []), ...(skills.frameworks ?? [])]
                  .map((s) => `<span class="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-medium font-mono">${escapeHtml(s)}</span>`)
                  .join("")}
              </div>
            </div>
            <div>
              <span class="font-semibold text-slate-900 block mb-1">Tools & Databases</span>
              <div class="flex flex-wrap gap-1">
                ${[...(skills.tools ?? []), ...(skills.databases ?? [])]
                  .map((s) => `<span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium font-mono">${escapeHtml(s)}</span>`)
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="${layout.sectionSpacing}">
        <h2 class="${headingStyleClass}">Technical Skills</h2>
        <div class="space-y-1 text-xs">
          ${skills.languages?.length ? `<div><span class="font-bold text-slate-900">Languages:</span> <span class="text-slate-700">${escapeHtml(skills.languages.join(", "))}</span></div>` : ""}
          ${skills.frameworks?.length ? `<div><span class="font-bold text-slate-900">Frameworks & Libraries:</span> <span class="text-slate-700">${escapeHtml(skills.frameworks.join(", "))}</span></div>` : ""}
          ${skills.tools?.length ? `<div><span class="font-bold text-slate-900">Tools & Cloud:</span> <span class="text-slate-700">${escapeHtml(skills.tools.join(", "))}</span></div>` : ""}
          ${skills.databases?.length ? `<div><span class="font-bold text-slate-900">Databases:</span> <span class="text-slate-700">${escapeHtml(skills.databases.join(", "))}</span></div>` : ""}
          ${skills.soft?.length ? `<div><span class="font-bold text-slate-900">Core Concepts:</span> <span class="text-slate-700">${escapeHtml(skills.soft.join(", "))}</span></div>` : ""}
        </div>
      </div>
    `;
  };

  const renderCertifications = () => {
    if (certifications.length === 0) return "";
    return `
      <div class="${layout.sectionSpacing}">
        <h2 class="${headingStyleClass}">Certifications</h2>
        <ul class="list-disc list-inside space-y-1 text-slate-600 text-xs pl-2">
          ${certifications
            .map(
              (cert) => `
            <li class="leading-relaxed">
              <span class="relative -left-1"><span class="font-bold text-slate-800">${escapeHtml(cert.name)}</span> — ${escapeHtml(cert.issuer)} ${cert.year ? `(${escapeHtml(cert.year)})` : ""}</span>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    `;
  };

  const renderAchievements = () => {
    if (achievements.length === 0) return "";
    return `
      <div class="${layout.sectionSpacing}">
        <h2 class="${headingStyleClass}">Achievements</h2>
        <ul class="list-disc list-inside space-y-1 text-slate-600 text-xs pl-2">
          ${achievements
            .map(
              (ach) => `
            <li class="leading-relaxed">
              <span class="relative -left-1">${escapeHtml(ach.description)} ${ach.year ? `(${escapeHtml(ach.year)})` : ""}</span>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    `;
  };

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Resume Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Inter', sans-serif;
            font-size: ${layout.fontSize};
            line-height: ${layout.bodyLineSpacing};
          }
          .font-serif {
            font-family: 'Playfair Display', Georgia, serif;
          }
          .font-mono {
            font-family: 'JetBrains Mono', monospace;
          }
          a {
            color: inherit;
            text-decoration: none;
          }
          a.link {
            color: ${LINK_COLOR} !important;
          }
          a.link:hover {
            text-decoration: underline;
          }
          li::marker {
            color: #1e293b;
            font-size: 0.8em;
          }
        </style>
      </head>
      <body class="bg-slate-100 py-8 px-4">
        <div class="${bodyClass}">
          ${renderHeader()}
          ${renderSummary()}
          ${renderEducation()}
          ${renderSkills()}
          ${renderExperience()}
          ${renderProjects()}
          ${renderCertifications()}
          ${renderAchievements()}
        </div>
      </body>
    </html>
  `;

  return html.trim();
}
