import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, AlertTriangle, Shield, Search, Zap } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const SITE_URL = "https://resumeflow.harshithkumar.in";

export const metadata: Metadata = {
  title: "How to Beat ATS Bots: Complete 2026 Guide to ATS-Resistant Resumes | ResumeFlow",
  description:
    "Learn how to beat Applicant Tracking Systems in 2026. Complete guide with ATS-compatible templates, keyword optimization, formatting rules, and proven strategies that pass 95% of ATS parsers.",
  keywords: [
    "beat ATS bots",
    "ATS resume guide",
    "ATS resistant resume",
    "how to beat applicant tracking system",
    "ATS optimization guide",
    "pass ATS resume",
    "resume parsing tips",
    "ATS friendly resume format",
    "ATS keywords resume",
    "resume for ATS 2026",
  ],
  openGraph: {
    title: "How to Beat ATS Bots: Complete 2026 Guide to ATS-Resistant Resumes",
    description:
      "Learn how to beat Applicant Tracking Systems in 2026. Complete guide with ATS-compatible templates, keyword optimization, formatting rules, and proven strategies.",
    url: `${SITE_URL}/info/blog/how-to-beat-ats-bots-2026`,
    siteName: "ResumeFlow",
    type: "article",
    publishedTime: "2026-07-20T00:00:00Z",
    authors: ["ResumeFlow Team"],
    images: [{ url: `${SITE_URL}/logo.png`, width: 512, height: 512, alt: "ATS Resume Guide 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Beat ATS Bots: Complete 2026 Guide",
    description:
      "Learn how to beat Applicant Tracking Systems in 2026. Complete guide with ATS-compatible templates, keyword optimization, and formatting rules.",
    images: [`${SITE_URL}/logo.png`],
  },
  alternates: { canonical: `${SITE_URL}/info/blog/how-to-beat-ats-bots-2026` },
  robots: { index: true, follow: true },
};

const guideSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      "@id": `${SITE_URL}/info/blog/how-to-beat-ats-bots-2026#howto`,
      name: "How to Beat ATS Bots: Complete 2026 Guide",
      description:
        "A step-by-step guide to creating ATS-resistant resumes that pass Applicant Tracking Systems with 95%+ parsing accuracy.",
      totalTime: "PT30M",
      estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
      tool: [
        { "@type": "HowToTool", name: "ResumeFlow Free Resume Builder" },
        { "@type": "HowToTool", name: "ATS-compatible resume template" },
        { "@type": "HowToTool", name: "Job description for keyword analysis" },
      ],
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Choose an ATS-Compatible Template",
          text: "Use a single-column, no-graphics template with standard fonts. Avoid tables, columns, charts, or images. ResumeFlow's ATS-Strict template is pre-optimized for parsing.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Extract Keywords from the Job Description",
          text: "Copy the job description and identify required skills, tools, and qualifications. Mirror these exact terms in your resume — ATS engines score based on keyword density matching.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Use Standard Section Headings",
          text: "Label sections as 'Experience', 'Education', 'Skills', and 'Projects'. Avoid creative headings like 'Where I've Worked' or 'My Toolbox' — parsers may not recognize them.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Format Dates and Numbers Consistently",
          text: "Use consistent date formats (e.g., 'May 2024 - Aug 2024'). Use standard abbreviations for months. Always align numbers to the right or use consistent spacing.",
        },
        {
          "@type": "HowToStep",
          position: 5,
          name: "Export as PDF (Not DOCX or Image)",
          text: "Export to standard PDF with selectable text — never scanned images. Ensure the PDF is not password-protected. Test parsing by copying text from the PDF to verify extractability.",
        },
        {
          "@type": "HowToStep",
          position: 6,
          name: "Run an ATS Parse Test Before Submitting",
          text: "Upload your resume to an ATS simulator or use ResumeFlow's ATS audit to check parsing accuracy. Fix any section that extracts incorrectly before submitting to employers.",
        },
      ],
      supply: [
        { "@type": "HowToSupply", name: "Your current resume" },
        { "@type": "HowToSupply", name: "Target job description" },
        { "@type": "HowToSupply", name: "ATS-compatible template" },
      ],
    },
    {
      "@type": "Article",
      "@id": `${SITE_URL}/info/blog/how-to-beat-ats-bots-2026#article`,
      headline: "How to Beat ATS Bots: Complete 2026 Guide to ATS-Resistant Resumes",
      description:
        "Learn how to beat Applicant Tracking Systems in 2026. Complete guide with ATS-compatible templates, keyword optimization, formatting rules, and proven strategies.",
      datePublished: "2026-07-20",
      dateModified: "2026-07-20",
      author: { "@type": "Organization", name: "ResumeFlow", url: SITE_URL },
      publisher: { "@type": "Organization", name: "ResumeFlow", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
      image: `${SITE_URL}/logo.png`,
      mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/info/blog/how-to-beat-ats-bots-2026` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/info/blog/how-to-beat-ats-bots-2026#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/info/blog` },
        { "@type": "ListItem", position: 3, name: "How to Beat ATS Bots 2026", item: `${SITE_URL}/info/blog/how-to-beat-ats-bots-2026` },
      ],
    },
  ],
};

const quickTips = [
  { label: "Use standard fonts", detail: "Times-Roman, Helvetica, Arial, or Georgia" },
  { label: "Single-column layout", detail: "Avoid sidebars, tables, or multi-column grids" },
  { label: "No graphics or icons", detail: "Skill bars, charts, and images break parsers" },
  { label: "Standard section headings", detail: "Experience, Education, Skills, Projects" },
  { label: ".docx or .pdf (text)", detail: "Never scanned images or password-protected files" },
  { label: "Use .docx for maximum ATS", detail: "Some older ATS parse PDFs poorly; DOCX is safest" },
  { label: "Keyword density matters", detail: "Mirror terms from the job description naturally" },
  { label: "Avoid header/footer content", detail: "Critical info in headers/footers is often missed" },
];

const dosAndDonts = [
  { do: "Use industry-standard job titles (e.g., 'Software Engineer')", dont: "Use creative titles ('Code Ninja', 'Rockstar Developer')" },
  { do: "List skills as comma-separated keywords in a Skills section", dont: "Scatter skills inline within paragraphs only" },
  { do: "Use past tense for past roles, present tense for current", dont: "Mix tenses inconsistently across sections" },
  { do: "Include months and years for each position", dont: "List only years — ATS may reject incomplete dates" },
  { do: "Use .docx format for maximum ATS compatibility", dont: "Submit .png, .jpg, or scanned PDFs" },
  { do: "Keep to 1-2 pages maximum", dont: "Exceed 2 pages (most ATS truncate at page 2)" },
  { do: "Include a dedicated Skills section near the top", dont: "Bury keywords only in experience bullet points" },
  { do: "Use ResumeFlow's ATS-Strict template", dont: "Use multi-column Canva or Photoshop templates" },
];

export default function HowToBeatAtsBots2026() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-950 overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideSchema) }} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-900/10">
        <div className="max-w-[900px] mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo href="/" className="gap-3.5" />
          <Link href="/" className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors">Back to Home</Link>
        </div>
      </nav>

      <main className="max-w-[750px] mx-auto px-6 py-12 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <Link href="/" className="hover:text-rose-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/info/blog" className="hover:text-rose-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">How to Beat ATS Bots 2026</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100/60 rounded-full px-3.5 py-1 mb-4">
            <Search size={10} className="text-rose-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">ATS Guide · July 2026</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            How to Beat ATS Bots:{" "}
            <span className="text-rose-600">Complete 2026 Guide</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Published July 20, 2026 · By ResumeFlow Team · Estimated read: 12 min
          </p>
        </div>

        {/* Intro */}
        <section className="text-sm md:text-base leading-relaxed space-y-4 mb-10">
          <p className="text-base md:text-lg text-slate-600 leading-relaxed">
            <strong>95% of Fortune 500 companies use Applicant Tracking Systems (ATS)</strong> to filter
            resumes before they reach human eyes. If your resume isn't ATS-optimized, it may never be seen
            by a recruiter — regardless of your qualifications.
          </p>
          <p className="text-slate-600">
            In this complete 2026 guide, you'll learn exactly how ATS software works, what formatting
            rules guarantee 95%+ parsing accuracy, how to optimize keywords for specific job descriptions,
            and the common mistakes that get 75% of applicants rejected before a human even opens their file.
          </p>
          <p className="text-slate-600">
            <strong>Quick answer:</strong> Use a single-column layout with standard fonts, mirror keywords
            from the job description, export as a text-based PDF or DOCX, and test your resume with an ATS
            simulator before submitting. For the easiest path, use{" "}
            <Link href="/free-resume-builder" className="text-rose-600 hover:text-rose-700 underline font-semibold">
              ResumeFlow's free ATS-optimized resume builder
            </Link>{" "}
            which handles all of this automatically.
          </p>
        </section>

        {/* Quick Reference Table */}
        <section className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-rose-600" />
            Quick Reference: ATS Checklist
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-white border border-slate-200/60 rounded-xl p-3">
                <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-sm font-bold text-slate-900">{tip.label}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{tip.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section className="mb-12 space-y-10">
          <h2 className="text-2xl font-bold text-slate-900">Step-by-Step ATS Optimization Guide</h2>

          {[
            {
              num: "01",
              title: "Choose an ATS-Compatible Template",
              body: "The #1 reason resumes fail ATS parsing is complex layouts. Multi-column designs, tables, graphics, charts, and images all confuse parsers. Your template must be single-column with no visual elements.\n\nUse standard fonts like Times-Roman, Helvetica, Arial, or Georgia. Avoid decorative fonts. Set 0.5-1 inch margins. The ResumeFlow ATS-Strict template is pre-built to these specifications and guarantees 95%+ parsing accuracy.",
              cta: { href: "/free-resume-builder", label: "Get the ATS-Strict template free" },
            },
            {
              num: "02",
              title: "Extract Keywords from the Job Description",
              body: "ATS engines score resumes based on keyword density matching against the job description. Copy the job posting and identify:\n\n• Required technical skills (e.g., React, Python, AWS)\n• Required soft skills (e.g., leadership, communication)\n• Industry-specific terminology\n• Certifications or degrees mentioned\n\nMirror these exact terms naturally in your Skills, Experience, and Education sections. Don't just list them — incorporate them into bullet points describing your achievements.",
            },
            {
              num: "03",
              title: "Use Standard Section Headings",
              body: "ATS parsers look for specific section headers. If you use creative headings like 'Where I've Worked' or 'My Toolbox', the parser might not recognize them. Stick to these proven headings:\n\n• Summary / Professional Summary\n• Experience / Work Experience\n• Education\n• Skills / Technical Skills\n• Projects\n• Certifications (optional)\n• Achievements (optional)\n\nConsistency matters — use the same heading style throughout.",
            },
            {
              num: "04",
              title: "Format Dates and Quantities Consistently",
              body: "Date formats are a common ATS parsing failure point. Use a consistent format for every date entry:\n\n• Correct: 'May 2024 - Aug 2024'\n• Correct: '05/2024 - 08/2024'\n• Avoid: 'May '24 - August 2024' (mixed formats)\n\nSimilarly, format numbers consistently. Use digits for all numbers (e.g., '5 years' not 'five years'). Spell out months consistently — don't mix 'May' with 'September' abbreviated as 'Sept'.",
            },
            {
              num: "05",
              title: "Export as PDF or DOCX",
              body: "ATS software needs extractable text. Follow these rules:\n\n• Export as standard PDF (with selectable text, not scanned)\n• For maximum compatibility, use .docx format — some older ATS parse DOCX more reliably than PDF\n• Never submit password-protected files\n• Never submit .png, .jpg, or scanned images\n• Test by copying text from your exported file — if you can select and copy all text, the ATS can too\n\nResumeFlow's free resume builder compiles clean, extractable PDFs guaranteed.",
              cta: { href: "/free-resume-builder", label: "Build an ATS-safe PDF resume" },
            },
            {
              num: "06",
              title: "Run an ATS Parse Test Before Submitting",
              body: "Before sending your resume to any employer, test it with an ATS simulator. Upload your resume and check:\n\n• Does your name and contact info extract correctly?\n• Are all section headings recognized?\n• Do dates and numbers parse correctly?\n• Can the ATS extract bullet points from each role?\n• Are skills correctly identified from the Skills section?\n\nFix any extraction issues before submitting. ResumeFlow includes an ATS audit feature that checks your resume's parsing accuracy automatically.",
              cta: { href: "/free-resume-builder", label: "Test your resume with ATS audit" },
            },
          ].map((step) => (
            <article key={step.num} className="scroll-mt-20">
              <div className="flex items-start gap-4 mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 text-rose-700 font-extrabold text-sm shrink-0 border border-rose-100">
                  {step.num}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
              </div>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-3 ml-14">
                {step.body}
              </div>
              {step.cta && (
                <div className="ml-14">
                  <Link
                    href={step.cta.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                  >
                    {step.cta.label} <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </article>
          ))}
        </section>

        {/* Do's and Don'ts */}
        <section className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden mb-12">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-600" />
              ATS Do's and Don'ts
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {dosAndDonts.map((item, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 text-sm">
                <div className="flex items-start gap-2">
                  <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-slate-700">{item.do}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">✕</span>
                  <span className="text-slate-500">{item.dont}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why ATS Matters */}
        <section className="bg-gradient-to-br from-rose-50/30 to-white border border-rose-100/60 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Why ATS Optimization Matters in 2026</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-3">
            <p>Applicant Tracking Systems have evolved significantly. Modern ATS platforms use AI and machine learning to rank candidates based on keyword relevance, not just parse text. Here's what that means for your resume:</p>
            <ul className="space-y-2">
              <li className="flex gap-2"><span className="text-rose-600 font-bold">•</span> <strong>75% of applicants</strong> are rejected by ATS before a human sees their resume</li>
              <li className="flex gap-2"><span className="text-rose-600 font-bold">•</span> <strong>Keyword-optimized resumes</strong> get 3x more callbacks than non-optimized ones</li>
              <li className="flex gap-2"><span className="text-rose-600 font-bold">•</span> AI-powered ATS now score resumes on a 0-100 scale, not just pass/fail</li>
              <li className="flex gap-2"><span className="text-rose-600 font-bold">•</span> <strong>Formatting errors alone</strong> cause 40% of ATS rejections</li>
              <li className="flex gap-2"><span className="text-rose-600 font-bold">•</span> Most ATS can't parse text in headers, footers, tables, or columns</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">ATS FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "What is an ATS and how does it work?", a: "An Applicant Tracking System (ATS) is software used by employers to manage job applications. It parses resume files into structured data (name, experience, skills, education), then scores candidates based on keyword matches against the job description. 95% of Fortune 500 companies use ATS software." },
              { q: "Do ATS systems reject PDFs?", a: "No, most modern ATS can parse standard PDFs — as long as the PDF contains selectable text (not scanned images). However, some older ATS parse .docx files more reliably. When in doubt, use .docx format. Avoid password-protected PDFs at all costs." },
              { q: "Can I use Canva templates for ATS?", a: "Canva templates are generally NOT ATS-compatible. They often use multi-column layouts, embedded fonts, and graphic elements that confuse parsers. Use an ATS-specific template like ResumeFlow's ATS-Strict template instead." },
              { q: "How many keywords should I include?", a: "Aim for 10-15 relevant keywords from the job description, distributed naturally throughout your resume. Don't keyword-stuff — ATS can detect unnatural keyword density and some penalize for it. Include keywords in your Skills section AND within experience bullet points." },
              { q: "Does ResumeFlow guarantee ATS compatibility?", a: "Yes. ResumeFlow's ATS-Strict template is designed and tested to achieve 95%+ parsing accuracy across major ATS platforms including Greenhouse, Lever, Workday, and Taleo. Our free resume builder includes automatic ATS optimization." },
            ].map((faq, i) => (
              <details key={i} className="group bg-white border border-slate-200/60 rounded-xl overflow-hidden transition-all hover:border-slate-300/60">
                <summary className="flex items-center justify-between px-6 py-4 text-sm font-semibold text-slate-900 cursor-pointer hover:bg-slate-50/50 transition-colors [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <span className="text-slate-400 text-lg font-bold shrink-0 ml-4 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-rose-50/50 to-white border border-rose-100/60 rounded-2xl p-6 md:p-8 my-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield size={24} className="text-rose-600" />
            <h2 className="text-2xl font-bold text-slate-900">Build Your ATS-Resistant Resume Free</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto mb-6">
            ResumeFlow's free AI resume builder creates ATS-optimized resumes automatically. 
            No credit card, no paywall, no hidden fees. Start in 30 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/free-resume-builder"
              className="inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-full px-8 py-3.5 shadow-md transition-all"
            >
              Build Your ATS Resume Free <ArrowRight size={14} />
            </Link>
            <Link
              href="/resources/ats-best-practices"
              className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-full px-8 py-3.5 border border-slate-200 transition-all"
            >
              More ATS Best Practices
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-8 px-6">
        <div className="max-w-[900px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <BrandLogo size="sm" className="gap-2.5 opacity-60" />
          <Link href="/info/blog" className="hover:text-slate-600 transition-colors">More Articles</Link>
          <span>&copy; 2026 ResumeFlow. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
