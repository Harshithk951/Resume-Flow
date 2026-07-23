// lib/latex/jsonToLatex.ts
//
// Pure Deterministic Multi-Preamble JSON-to-LaTeX Compiler
// Single unified body generation engine with lookup-based styling preambles.

import { escapeLatex } from "./escapeLatex";

export { escapeLatex };

/** Normalize a URL for LaTeX hyperref: ensures protocol exists */
function ensureUrl(url: string | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function cleanUrlDisplay(url: string | undefined): string {
  if (!url) return "";
  return url.trim().replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}



/**
 * Preamble lookup dictionary for styling & typography options
 */
export const PREAMBLES: Record<string, string> = {
  ats_strict: `\\documentclass[11pt,letterpaper]{article}

\\usepackage[T1]{fontenc}
\\usepackage[expansion=false]{microtype}
\\DisableLigatures{encoding = *, family = *}
\\usepackage[left=0.65in,right=0.65in,top=0.55in,bottom=0.55in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}

\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

% ---------- Macros ----------
\\newcommand{\\rname}[1]{{\\centering\\Huge\\bfseries #1\\par}}
\\newcommand{\\rcontact}[1]{{\\centering\\small #1\\par}}

\\newcommand{\\ressection}[1]{%
  \\vspace{9pt}
  {\\bfseries\\large #1}\\[-7pt]
  \\noindent\\rule{\\linewidth}{0.6pt}\\vspace{3pt}
}

\\newcommand{\\resheading}[4]{%
  \\noindent\\textbf{#1} \\hfill \\textbf{#2}\\[1pt]
  \\noindent\\textit{#3} \\hfill \\textit{#4}\\[2pt]
}

\\newenvironment{resitems}{%
  \\begin{itemize}[leftmargin=16pt,itemsep=1pt,topsep=2pt,parsep=0pt,label=\\textbullet]
}{%
  \\end{itemize}
}
\\newcommand{\\resitem}[1]{\\item #1}

\\newcommand{\\skillrow}[2]{\\textbf{#1:}~#2\\[2pt]}
`,

  startup: `\\documentclass[11pt,letterpaper]{article}

\\usepackage[T1]{fontenc}
\\usepackage[left=0.65in,right=0.65in,top=0.55in,bottom=0.55in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{xcolor}
\\usepackage[scaled=0.92]{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}

\\definecolor{accent}{HTML}{4F46E5}

\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

% ---------- Macros ----------
\\newcommand{\\rname}[1]{{\\centering\\Huge\\bfseries\\color{accent} #1\\par}}
\\newcommand{\\rcontact}[1]{{\\centering\\small #1\\par}}

\\newcommand{\\ressection}[1]{%
  \\vspace{9pt}
  {\\bfseries\\large\\color{accent}\\MakeUppercase{#1}}\\[-6pt]
  \\noindent{\\color{accent}\\rule{\\linewidth}{1pt}}\\vspace{3pt}
}

\\newcommand{\\resheading}[4]{%
  \\noindent\\textbf{#1} \\hfill \\textbf{#2}\\[1pt]
  \\noindent\\textit{#3} \\hfill \\textit{#4}\\[2pt]
}

\\newenvironment{resitems}{%
  \\begin{itemize}[leftmargin=16pt,itemsep=1pt,topsep=2pt,parsep=0pt,label=\\textbullet]
}{%
  \\end{itemize}
}
\\newcommand{\\resitem}[1]{\\item #1}

\\newcommand{\\skillrow}[2]{\\textbf{#1:}~#2\\[2pt]}
`,

  finance_tech: `\\documentclass[11pt,letterpaper]{article}

\\usepackage[T1]{fontenc}
\\usepackage[left=0.75in,right=0.75in,top=0.6in,bottom=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{mathpazo}
\\linespread{1.02}
\\usepackage[expansion=false]{microtype}
\\DisableLigatures{encoding = *, family = *}

\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

% ---------- Macros ----------
\\newcommand{\\rname}[1]{{\\centering\\Huge\\bfseries #1\\par}}
\\newcommand{\\rcontact}[1]{{\\centering\\small #1\\par}}

\\newcommand{\\ressection}[1]{%
  \\vspace{9pt}
  {\\bfseries\\normalsize\\textsc{#1}}\\[-6pt]
  \\noindent\\rule{\\linewidth}{0.5pt}\\vspace{3pt}
}

\\newcommand{\\resheading}[4]{%
  \\noindent\\textbf{#1} \\hfill \\textbf{#2}\\[1pt]
  \\noindent\\textit{#3} \\hfill \\textit{#4}\\[2pt]
}

\\newenvironment{resitems}{%
  \\begin{itemize}[leftmargin=16pt,itemsep=1pt,topsep=2pt,parsep=0pt,label=\\textbullet]
}{%
  \\end{itemize}
}
\\newcommand{\\resitem}[1]{\\item #1}

\\newcommand{\\skillrow}[2]{\\textbf{#1:}~#2\\[2pt]}
`,

  tech_modern: `\\documentclass[11pt,letterpaper]{article}

\\usepackage[T1]{fontenc}
\\usepackage[left=0.65in,right=0.65in,top=0.55in,bottom=0.55in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{xcolor}
\\usepackage[scaled=0.95]{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}

\\definecolor{accent}{HTML}{0EA5E9}

\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

% ---------- Macros ----------
\\newcommand{\\rname}[1]{{\\centering\\Huge\\bfseries #1\\par}}
\\newcommand{\\rcontact}[1]{{\\centering\\small #1\\par}}

\\newcommand{\\ressection}[1]{%
  \\vspace{10pt}
  {\\bfseries\\large #1}\\[1pt]
  \\noindent{\\color{accent}\\rule{0.16\\linewidth}{1.4pt}}\\[4pt]
}

\\newcommand{\\resheading}[4]{%
  \\noindent\\textbf{#1} \\hfill \\textbf{#2}\\[1pt]
  \\noindent\\textit{#3} \\hfill \\textit{#4}\\[2pt]
}

\\newenvironment{resitems}{%
  \\begin{itemize}[leftmargin=16pt,itemsep=1pt,topsep=2pt,parsep=0pt,label=\\textbullet]
}{%
  \\end{itemize}
}
\\newcommand{\\resitem}[1]{\\item #1}

\\newcommand{\\skillrow}[2]{\\textbf{#1:}~#2\\[2pt]}
`,
};

/**
 * Compiles structured JSON resume data into LaTeX using the requested preamble lookup.
 */
export function jsonToLatex(resumeJSON: any, templateName: string = "ats_strict"): string {
  if (!resumeJSON) return "";

  const preamble = PREAMBLES[templateName] || PREAMBLES[resolveTemplateId(templateName)] || PREAMBLES.ats_strict;

  const personalInfo = resumeJSON.personalInfo ?? {};
  const education = Array.isArray(resumeJSON.education) ? resumeJSON.education : [];
  const experience = Array.isArray(resumeJSON.experience) ? resumeJSON.experience : [];
  const projects = Array.isArray(resumeJSON.projects) ? resumeJSON.projects : [];
  const skills = resumeJSON.skills ?? {};
  const certifications = Array.isArray(resumeJSON.certifications) ? resumeJSON.certifications : [];

  const parts: string[] = [preamble, "\n\\begin{document}\n"];

  // ── 1. Header (Name + Contact Info) ──
  const fullName = escapeLatex(personalInfo.name || "Candidate Name");
  parts.push(`\\rname{${fullName}}\n`);

  const contactItems: string[] = [];
  if (personalInfo.email) {
    const emailEsc = escapeLatex(personalInfo.email);
    contactItems.push(`\\href{mailto:${personalInfo.email}}{${emailEsc}}`);
  }
  if (personalInfo.phone) {
    contactItems.push(escapeLatex(personalInfo.phone));
  }
  if (personalInfo.linkedin) {
    const url = ensureUrl(personalInfo.linkedin);
    const disp = escapeLatex(cleanUrlDisplay(personalInfo.linkedin));
    contactItems.push(`\\href{${url}}{${disp}}`);
  }
  if (personalInfo.github) {
    const url = ensureUrl(personalInfo.github);
    const disp = escapeLatex(cleanUrlDisplay(personalInfo.github));
    contactItems.push(`\\href{${url}}{${disp}}`);
  }
  if (personalInfo.portfolio) {
    const url = ensureUrl(personalInfo.portfolio);
    const disp = escapeLatex(cleanUrlDisplay(personalInfo.portfolio));
    contactItems.push(`\\href{${url}}{${disp}}`);
  }

  if (contactItems.length > 0) {
    parts.push(`\\rcontact{${contactItems.join(" $\\vert$ ")}}\n`);
  }

  // ── 2. Education Section ──
  if (education.length > 0) {
    parts.push("\\ressection{Education}\n");
    for (const edu of education) {
      const inst = escapeLatex(edu.institution || "");
      const gradDate = escapeLatex(edu.year || edu.gradDate || "");
      let degreeGpa = escapeLatex(edu.degree || "");
      if (edu.gpa) {
        degreeGpa += ` --- CGPA: ${escapeLatex(String(edu.gpa))}`;
      }
      const loc = escapeLatex(edu.location || "");

      parts.push(`\\resheading{${inst}}{${gradDate}}{${degreeGpa}}{${loc}}\n`);
    }
  }

  // ── 3. Technical Skills Section ──
  const formatSkillList = (val: any): string => {
    if (Array.isArray(val)) {
      return val.map((s) => escapeLatex(String(s))).filter(Boolean).join(", ");
    }
    if (typeof val === "string" && val.trim()) {
      return escapeLatex(val);
    }
    return "";
  };

  const languagesStr = formatSkillList(skills.languages);

  const frameworksStr = formatSkillList(
    skills.frameworksAndTools ??
    (skills.frameworks || skills.tools
      ? [...(Array.isArray(skills.frameworks) ? skills.frameworks : []), ...(Array.isArray(skills.tools) ? skills.tools : [])]
      : "")
  );

  const cloudDevOpsStr = formatSkillList(
    skills.cloudAndDevOps ?? skills.databases
  );

  const csFundamentalsStr = formatSkillList(
    skills.csFundamentals ?? skills.soft
  );

  const hasSkills = Boolean(languagesStr || frameworksStr || cloudDevOpsStr || csFundamentalsStr);

  if (hasSkills) {
    parts.push("\\ressection{Technical Skills}\n");
    if (languagesStr) {
      parts.push(`\\skillrow{Languages}{${languagesStr}}\n`);
    }
    if (frameworksStr) {
      parts.push(`\\skillrow{Frameworks \\& Tools}{${frameworksStr}}\n`);
    }
    if (cloudDevOpsStr) {
      parts.push(`\\skillrow{Cloud \\& DevOps}{${cloudDevOpsStr}}\n`);
    }
    if (csFundamentalsStr) {
      parts.push(`\\skillrow{CS Fundamentals}{${csFundamentalsStr}}\n`);
    }
  }

  // ── 4. Experience Section ──
  if (experience.length > 0) {
    parts.push("\\ressection{Experience}\n");
    for (const exp of experience) {
      const role = escapeLatex(exp.role || "");
      const dates = escapeLatex(exp.duration || (exp.start ? `${exp.start} -- ${exp.end || "Present"}` : ""));
      const company = escapeLatex(exp.company || "");
      const loc = escapeLatex(exp.location || "");

      parts.push(`\\resheading{${role}}{${dates}}{${company}}{${loc}}\n`);

      const bullets = Array.isArray(exp.bullets) ? exp.bullets : [];
      if (bullets.length > 0) {
        parts.push("\\begin{resitems}\n");
        for (const bullet of bullets) {
          if (bullet && String(bullet).trim()) {
            parts.push(`\\resitem{${escapeLatex(String(bullet))}}\n`);
          }
        }
        parts.push("\\end{resitems}\n");
      }
    }
  }

  // ── 5. Projects Section ──
  if (projects.length > 0) {
    parts.push("\\ressection{Projects}\n");
    for (const proj of projects) {
      const name = escapeLatex(proj.name || "");
      const date = escapeLatex(proj.date || "");
      const techStack = formatSkillList(proj.technologies || proj.techStack);
      const locOrLink = proj.link ? escapeLatex(cleanUrlDisplay(proj.link)) : "";

      parts.push(`\\resheading{${name}}{${date}}{${techStack}}{${locOrLink}}\n`);

      const bullets = Array.isArray(proj.bullets) ? proj.bullets : [];
      if (bullets.length > 0) {
        parts.push("\\begin{resitems}\n");
        for (const bullet of bullets) {
          if (bullet && String(bullet).trim()) {
            parts.push(`\\resitem{${escapeLatex(String(bullet))}}\n`);
          }
        }
        parts.push("\\end{resitems}\n");
      }
    }
  }

  // ── 6. Certifications Section (Omitted if empty) ──
  if (certifications.length > 0) {
    parts.push("\\ressection{Certifications}\n");
    parts.push("\\begin{resitems}\n");
    for (const cert of certifications) {
      if (typeof cert === "string") {
        parts.push(`\\resitem{${escapeLatex(cert)}}\n`);
      } else if (cert && typeof cert === "object") {
        const certName = escapeLatex(cert.name || "");
        const issuer = cert.issuer ? ` --- ${escapeLatex(cert.issuer)}` : "";
        const year = cert.year ? ` (${escapeLatex(cert.year)})` : "";
        parts.push(`\\resitem{${certName}${issuer}${year}}\n`);
      }
    }
    parts.push("\\end{resitems}\n");
  }

  parts.push("\n\\end{document}\n");
  return parts.join("");
}

function resolveTemplateId(id?: string): string {
  if (!id) return "ats_strict";
  const norm = id.toLowerCase();
  if (norm === "startup" || norm === "modern_professional") return "startup";
  if (norm === "finance_tech" || norm === "modern_executive") return "finance_tech";
  if (norm === "tech_modern" || norm === "tech_innovator") return "tech_modern";
  return id;
}
