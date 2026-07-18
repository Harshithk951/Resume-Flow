// lib/latex/templates/modernExecutive.ts
//
// Modern Executive LaTeX Template
// Vibe: Clean, authoritative, ideal for finance/management/tech exec roles.
// Features a solid dark slate header bar and colored horizontal rules.
// Uses native, zero-dependency LaTeX macros for maximum compatibility with BasicTeX.

function ensureUrl(url: string | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export default function modernExecutiveTemplate(data: any): string {
  const { personalInfo, education, experience, projects, skills, certifications, achievements } = data;

  const escape = (str: string) => str;

  // Personal Info Block (colored text on white background — ATS-safe)
  const headerLinksList = [
    personalInfo.email ? `\\href{mailto:${escape(personalInfo.email)}}{\\color{executiveLine}${escape(personalInfo.email)}}` : null,
    personalInfo.phone ? `\\color{executiveLine}${escape(personalInfo.phone)}` : null,
    personalInfo.linkedin ? `\\href{${ensureUrl(escape(personalInfo.linkedin))}}{\\color{executiveLine}LinkedIn}` : null,
    personalInfo.github ? `\\href{${ensureUrl(escape(personalInfo.github))}}{\\color{executiveLine}GitHub}` : null,
    personalInfo.portfolio ? `\\href{${ensureUrl(escape(personalInfo.portfolio))}}{\\color{executiveLine}Portfolio}` : null,
  ].filter(Boolean);

  const headerLinks = headerLinksList.join(" ~\\color{executiveLine}$\\cdot$~ ");

  // Education Block
  const educationSection = education && education.length > 0
    ? `
\\resumesection{Education}
\\resumeSubHeadingListStart
  ${education.map((edu: any) => `    \\resumeSubheading
      {${escape(edu.institution)}}{${escape(edu.year)}}
      {${escape(edu.degree)}}{${edu.gpa ? `GPA: ${escape(edu.gpa)}` : ""}}
      ${edu.relevantCourses && edu.relevantCourses.length > 0 ? `\\resumeItem{Relevant Courses: ${escape(edu.relevantCourses.join(", "))}}` : ""}
  `).join("")}
\\resumeSubHeadingListEnd
` : "";

  // Experience Block
  const experienceSection = experience && experience.length > 0
    ? `
\\resumesection{Professional Experience}
\\resumeSubHeadingListStart
  ${experience.map((exp: any) => `    \\resumeSubheading
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
\\resumesection{Selected Projects}
\\resumeSubHeadingListStart
  ${projects.map((proj: any) => `    \\resumeProjectHeading
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
\\resumesection{Expertise \\& Technical Skills}
{\\small
  \\begin{list}{}{
    \\setlength{\\leftmargin}{0.15in}
    \\setlength{\\labelwidth}{0pt}
    \\setlength{\\labelsep}{0pt}
    \\setlength{\\itemsep}{2pt}
    \\setlength{\\topsep}{0pt}
  }
    ${skills.languages && skills.languages.length > 0 ? `\\item \\textbf{Programming Languages}: ${escape(skills.languages.join(", "))}` : ""}
    ${skills.frameworks && skills.frameworks.length > 0 ? `\\item \\textbf{Frameworks \\& Libraries}: ${escape(skills.frameworks.join(", "))}` : ""}
    ${skills.tools && skills.tools.length > 0 ? `\\item \\textbf{Tools \\& Platforms}: ${escape(skills.tools.join(", "))}` : ""}
    ${skills.databases && skills.databases.length > 0 ? `\\item \\textbf{Databases}: ${escape(skills.databases.join(", "))}` : ""}
    ${skills.soft && skills.soft.length > 0 ? `\\item \\textbf{Core Competencies}: ${escape(skills.soft.join(", "))}` : ""}
  \\end{list}
}
` : "";

  // Certifications Block
  const certificationsSection = certifications && certifications.length > 0
    ? `
\\resumesection{Certifications}
\\resumeSubHeadingListStart
  ${certifications.map((cert: any) => `    \\resumeProjectHeading
      {\\textbf{${escape(cert.name)}} $\\cdot$ \\footnotesize ${escape(cert.issuer)}}{${escape(cert.year)}}
  `).join("")}
\\resumeSubHeadingListEnd
` : "";

  // Achievements Block
  const achievementsSection = achievements && achievements.length > 0
    ? `
\\resumesection{Awards \\& Leadership}
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

% Set Helvetica-like Sans-Serif font
\\renewcommand{\\familydefault}{\\sfdefault}

\\pagestyle{empty}
\\urlstyle{same}

\\raggedbottom
\\raggedright

% Executive Colors
\\definecolor{executiveDark}{HTML}{0F172A} % Deep slate/navy
\\definecolor{executiveLine}{HTML}{475569} % Slate line accent
\\definecolor{slateLight}{HTML}{E2E8F0} % Light link text color
\\definecolor{darkBlack}{HTML}{1E293B}

\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumesection}[1]{\\vspace{8pt}\\textbf{\\large\\color{executiveDark}\\uppercase{#1}}\\vspace{2pt}{\\color{executiveLine}\\hrule height 1.2pt}\\vspace{4pt}}

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
    {#1 \\vspace{-2.5pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1.5pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{\\color{darkBlack}#1} & \\small\\color{executiveLine}#2 \\\\
      \\textit{\\small\\color{executiveLine}#3} & \\textit{\\small\\color{executiveLine}#4} \\\\
    \\end{tabular*}\\vspace{-6pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small\\textbf{\\color{darkBlack}#1} & \\small\\color{executiveLine}#2 \\\\
    \\end{tabular*}\\vspace{-6pt}
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

%----------HEADER (ATS-Safe: colored text only, no background box)----------
\\begin{center}
  {\\Huge \\bfseries \\color{executiveDark} ${escape(personalInfo.name)}} \\\\ \\vspace{10pt}
  {\\small \\color{executiveLine} ${headerLinks}}
\\end{center}
\\vspace{-6pt}

${educationSection}
${experienceSection}
${projectsSection}
${skillsSection}
${certificationsSection}
${achievementsSection}

\\end{document}
`;
}
