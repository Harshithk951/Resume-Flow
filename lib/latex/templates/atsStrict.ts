// lib/latex/templates/atsStrict.ts
//
// High-Fidelity ATS-Strict LaTeX Template based on Overleaf's Jake's Resume Layout.
// Every LaTeX command is double-escaped (\\) in TypeScript; row breaks use \\\\.

function escapeLatex(str: string | undefined): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde ")
    .replace(/\^/g, "\\textasciicircum ")
    .replace(/'/g, "\\textquotesingle{}");
}

/** Normalize a URL: if it already has a protocol, use as-is; otherwise prepend https:// */
function ensureUrl(url: string | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function getLinkedinUsername(url: string | undefined): string {
  if (!url) return "";
  return url.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//i, "").replace(/\/$/, "");
}

function getGithubUsername(url: string | undefined): string {
  if (!url) return "";
  return url.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "").replace(/\/$/, "");
}

function cleanUrl(url: string | undefined): string {
  if (!url) return "";
  return url.replace(/https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export function generateAtsStrictTemplate(data: any): string {
  const education = data.education ?? [];
  const experience = data.experience ?? [];
  const projects = data.projects ?? [];
  const skills = data.skills ?? {};
  const certifications = data.certifications ?? [];
  const achievements = data.achievements ?? [];
  const personalInfo = data.personalInfo ?? { name: "" };

  const headerParts = [
    personalInfo.phone ? escapeLatex(personalInfo.phone) : null,
    personalInfo.email ? `\\href{mailto:${personalInfo.email}}{\\underline{${escapeLatex(personalInfo.email)}}}` : null,
    personalInfo.linkedin ? `\\href{${ensureUrl(personalInfo.linkedin)}}{\\underline{linkedin.com/in/${escapeLatex(getLinkedinUsername(personalInfo.linkedin))}}}` : null,
    personalInfo.github ? `\\href{${ensureUrl(personalInfo.github)}}{\\underline{github.com/${escapeLatex(getGithubUsername(personalInfo.github))}}}` : null,
    personalInfo.portfolio ? `\\href{${ensureUrl(personalInfo.portfolio)}}{\\underline{${escapeLatex(cleanUrl(personalInfo.portfolio))}}}` : null,
  ].filter((p): p is string => !!p && p.trim().length > 0);
  const headerLinks = headerParts.join(" $|$ ");

  return `
\\documentclass[letterpaper,10pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage[margin=0.4in, top=0.3in, bottom=0.3in, footskip=4pt]{geometry}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-5pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-4pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[label=$\\bullet$, leftmargin=0.15in, itemsep=0pt]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-3pt}}

\\begin{document}

\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(personalInfo.name)}} \\\\ \\vspace{10pt}
    \\small ${headerLinks}
\\end{center}

\\section{Professional Summary}
\\vspace{2pt}
\\small{
${escapeLatex(data.summary)}
}

\\section{Education}
  \\resumeSubHeadingListStart
    ${education
      .map(
        (edu: any) => `
    \\resumeSubheading
      {${escapeLatex(edu.institution)}}{${escapeLatex(edu.location || "Dehradun, India")}}
      {${escapeLatex(edu.degree)} $|$ \\textbf{CGPA: ${escapeLatex(edu.gpa)}}}{${escapeLatex(edu.year)}}
    `
      )
      .join("\n")}
  \\resumeSubHeadingListEnd

\\section{Technical Skills}
\\vspace{-2pt}
\\begin{itemize}[leftmargin=0.15in, label={}, itemsep=1pt]
\\small{
  \\item \\textbf{Languages:} ${escapeLatex(skills.languages?.join(", "))}
  \\item \\textbf{CS Fundamentals:} ${escapeLatex(skills.soft?.join(", ") || "Data Structures \\& Algorithms, Object-Oriented Programming, DBMS, OS")}
  \\item \\textbf{AI/ML \\& GenAI:} ${escapeLatex(skills.databases?.join(", ") || "LLMs, Prompt Engineering, Automation Pipelines")}
  \\item \\textbf{Tech Stack:} ${escapeLatex(skills.frameworks?.join(", "))}
  \\item \\textbf{Cloud \\& DevOps:} ${escapeLatex(skills.tools?.join(", "))}
}
\\end{itemize}

\\section{Experience}
  \\resumeSubHeadingListStart
    ${experience
      .map((exp: any) => {
        const bullets = (exp.bullets ?? []).slice(0, 3);
        return `
    \\resumeSubheading
      {${escapeLatex(exp.company)}}{${escapeLatex(exp.location || "Remote")}}
      {${escapeLatex(exp.role)}}{${escapeLatex(exp.duration)}}
      \\resumeItemListStart
        ${bullets
          .map(
            (bullet: string) => `
        \\resumeItem{${escapeLatex(bullet)}}
        `
          )
          .join("\n")}
      \\resumeItemListEnd
    `;
      })
      .join("\n")}
  \\resumeSubHeadingListEnd

\\section{Projects}
  \\resumeSubHeadingListStart
    ${projects
      .map((proj: any) => {
        const bullets = (proj.bullets ?? []).slice(0, 3);
        const link = proj.github || proj.link || "";
        return `
    \\resumeProjectHeading
      {\\textbf{${escapeLatex(proj.name)}} $|$ \\emph{${escapeLatex(proj.technologies?.join(", "))}} $|$ \\href{${ensureUrl(link)}}{\\underline{GitHub}}}{}
      \\resumeItemListStart
        ${bullets
          .map(
            (bullet: string) => `
        \\resumeItem{${escapeLatex(bullet)}}
        `
          )
          .join("\n")}
      \\resumeItemListEnd
    `;
      })
      .join("\n")}
  \\resumeSubHeadingListEnd

\\section{Certifications}
\\vspace{-2pt}
  \\resumeItemListStart
    ${certifications
      .map(
        (cert: any) => `
    \\resumeItem{\\textbf{${escapeLatex(cert.name)}} --- ${escapeLatex(cert.issuer)} ${cert.year ? `(${escapeLatex(cert.year)})` : ""}}
    `
      )
      .join("\n")}
  \\resumeItemListEnd

\\section{Achievements}
\\vspace{-2pt}
  \\resumeItemListStart
    ${achievements
      .map(
        (ach: any) => `
    \\resumeItem{${escapeLatex(ach.description)}}
    `
      )
      .join("\n")}
  \\resumeItemListEnd

\\end{document}
  `;
}

export default generateAtsStrictTemplate;
