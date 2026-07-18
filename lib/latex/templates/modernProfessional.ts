// lib/latex/templates/modernProfessional.ts
//
// Modern Professional LaTeX Template
// Features a clean sans-serif layout with slate grey headers and modern geometric styling.
// Uses native, zero-dependency LaTeX macros for maximum compatibility with BasicTeX.

function ensureUrl(url: string | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export default function modernProfessionalTemplate(data: any): string {
  const { personalInfo, education, experience, projects, skills, certifications, achievements } = data;

  const escape = (str: string) => str; // Escaping happens in jsonToLatex utility

  // Personal Info Block
  const headerLinks = [
    personalInfo.email ? `\\href{mailto:${escape(personalInfo.email)}}{${escape(personalInfo.email)}}` : null,
    personalInfo.phone ? escape(personalInfo.phone) : null,
    personalInfo.linkedin ? `\\href{${ensureUrl(escape(personalInfo.linkedin))}}{LinkedIn}` : null,
    personalInfo.github ? `\\href{${ensureUrl(escape(personalInfo.github))}}{GitHub}` : null,
    personalInfo.portfolio ? `\\href{${ensureUrl(escape(personalInfo.portfolio))}}{Portfolio}` : null,
  ].filter(Boolean).join(" ~$\\cdot$~ ");

  // Education Block
  const educationSection = education && education.length > 0
    ? `
\\resumesection{EDUCATION}
\\resumeSubHeadingListStart
  ${education.map((edu: any) => `
    \\resumeSubheading
      {${escape(edu.institution)}}{${escape(edu.year)}}
      {${escape(edu.degree)}}{${edu.gpa ? `GPA: ${escape(edu.gpa)}` : ""}}
      ${edu.relevantCourses && edu.relevantCourses.length > 0 ? `\\resumeItem{Relevant Courses: ${escape(edu.relevantCourses.join(", "))}}` : ""}
  `).join("")}
\\resumeSubHeadingListEnd
` : "";

  // Experience Block
  const experienceSection = experience && experience.length > 0
    ? `
\\resumesection{PROFESSIONAL EXPERIENCE}
\\resumeSubHeadingListStart
  ${experience.map((exp: any) => `
    \\resumeSubheading
      {${escape(exp.company)}}{${escape(exp.duration)}}
      {${escape(exp.role)}}{${escape(exp.technologies.join(", "))}}
      \\resumeItemListStart
        ${exp.bullets.map((b: string) => `\\resumeItem{${escape(b)}}`).join("\n        ")}
      \\resumeItemListEnd
  `).join("")}
\\resumeSubHeadingListEnd
` : "";

  // Projects Block
  const projectsSection = projects && projects.length > 0
    ? `
\\resumesection{PROJECTS}
\\resumeSubHeadingListStart
  ${projects.map((proj: any) => `
    \\resumeProjectHeading
      {\\textbf{${escape(proj.name)}} ${proj.link ? `$\\cdot$ \\href{${ensureUrl(escape(proj.link))}}{\\footnotesize Link}` : ""}}{${escape(proj.technologies.join(", "))}}
      \\resumeItemListStart
        ${proj.bullets.map((b: string) => `\\resumeItem{${escape(b)}}`).join("\n        ")}
      \\resumeItemListEnd
  `).join("")}
\\resumeSubHeadingListEnd
` : "";

  // Skills Block
  const skillsSection = skills && (
    (skills.languages && skills.languages.length > 0) ||
    (skills.frameworks && skills.frameworks.length > 0) ||
    (skills.tools && skills.tools.length > 0) ||
    (skills.databases && skills.databases.length > 0)
  ) ? `
\\resumesection{TECHNICAL SKILLS}
{\\small
  \\begin{list}{}{
    \\setlength{\\leftmargin}{0.15in}
    \\setlength{\\labelwidth}{0pt}
    \\setlength{\\labelsep}{0pt}
    \\setlength{\\itemsep}{2pt}
    \\setlength{\\topsep}{0pt}
  }
    ${skills.languages && skills.languages.length > 0 ? `\\item \\textbf{Languages}: ${escape(skills.languages.join(", "))}` : ""}
    ${skills.frameworks && skills.frameworks.length > 0 ? `\\item \\textbf{Frameworks}: ${escape(skills.frameworks.join(", "))}` : ""}
    ${skills.tools && skills.tools.length > 0 ? `\\item \\textbf{Tools/Utilities}: ${escape(skills.tools.join(", "))}` : ""}
    ${skills.databases && skills.databases.length > 0 ? `\\item \\textbf{Databases}: ${escape(skills.databases.join(", "))}` : ""}
    ${skills.soft && skills.soft.length > 0 ? `\\item \\textbf{Soft Skills}: ${escape(skills.soft.join(", "))}` : ""}
  \\end{list}
}
` : "";

  // Certifications Block
  const certificationsSection = certifications && certifications.length > 0
    ? `
\\resumesection{CERTIFICATIONS}
\\resumeSubHeadingListStart
  ${certifications.map((cert: any) => `
    \\resumeProjectHeading
      {\\textbf{${escape(cert.name)}} $\\cdot$ \\footnotesize ${escape(cert.issuer)}}{${escape(cert.year)}}
  `).join("")}
\\resumeSubHeadingListEnd
` : "";

  // Achievements Block
  const achievementsSection = achievements && achievements.length > 0
    ? `
\\resumesection{HONORS \\& ACHIEVEMENTS}
{\\small
  \\begin{list}{}{
    \\setlength{\\leftmargin}{0.15in}
    \\setlength{\\itemsep}{2pt}
    \\setlength{\\topsep}{0pt}
  }
    ${achievements.map((ach: any) => `\\item \\textbf{${escape(ach.year || "")}}{: ${escape(ach.description)}}`).join("\n    ")}
  \\end{list}
}
` : "";

  return `\\documentclass[letterpaper,10pt]{article}

\\usepackage[margin=0.5in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{xcolor}
\\input{glyphtounicode}

% Use Sans-Serif Font Family
\\renewcommand{\\familydefault}{\\sfdefault}

\\pagestyle{empty}
\\urlstyle{same}

\\raggedbottom
\\raggedright

% Define colors
\\definecolor{slateGrey}{HTML}{334155}
\\definecolor{darkBlack}{HTML}{0F172A}

% Ensure machine readability
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumesection}[1]{\\vspace{8pt}\\textbf{\\large\\color{slateGrey}\\uppercase{#1}}\\vspace{2pt}{\\color{slateGrey}\\hrule height 0.8pt}\\vspace{4pt}}

\\newenvironment{tightlist}{
  \\begin{list}{$\\cdot$}{
    \\setlength{\\topsep}{0pt}
    \\setlength{\\itemsep}{0pt}
    \\setlength{\\parsep}{0pt}
    \\setlength{\\parskip}{0pt}
    \\setlength{\\leftmargin}{1.2em}
  }
}{
  \\end{list}
}

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{\\color{darkBlack}#1} & \\small\\color{slateGrey}#2 \\\\
      \\textit{\\small\\color{slateGrey}#3} & \\textit{\\small\\color{slateGrey}#4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small\\color{darkBlack}#1 & \\small\\color{slateGrey}#2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{
  \\begin{list}{}{
    \\setlength{\\leftmargin}{0.15in}
    \\setlength{\\topsep}{0pt}
    \\setlength{\\itemsep}{6pt}
  }
}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{list}}

\\newcommand{\\resumeItemListStart}{\\begin{tightlist}}
\\newcommand{\\resumeItemListEnd}{\\end{tightlist}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%


\\begin{document}

%----------HEADING----------
\\begin{center}
    {\\Huge \\bfseries \\color{darkBlack} ${escape(personalInfo.name)}} \\\\ \\vspace{10pt}
    \\small \\color{slateGrey} ${headerLinks}
\\end{center}

${educationSection}
${experienceSection}
${projectsSection}
${skillsSection}
${certificationsSection}
${achievementsSection}

\\end{document}
`;
}
