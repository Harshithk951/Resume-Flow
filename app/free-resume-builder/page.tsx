import Link from "next/link";
import type { Metadata } from "next";
import { BrandLogo } from "@/components/BrandLogo";
import {
  ArrowRight,
  Check,
  Sparkles,
  Shield,
  Zap,
  FileText,
  GraduationCap,
  Star,
  X,
} from "lucide-react";

const SITE_URL = "https://resumeflow.harshithkumar.in";

export const metadata: Metadata = {
  title: "Free Resume Builder — AI Resume Creator & Generator | ResumeFlow",
  description:
    "Build a professional resume for free with ResumeFlow's free AI resume builder and creator. ATS-optimized templates, no credit card needed, client-side PDF compilation, and real-time job tailoring. Try our free resume generator today.",
  keywords: [
    "free resume builder",
    "free resume creator",
    "resume creator free",
    "AI resume builder free",
    "free resume generator",
    "resume builder no credit card",
    "free ATS resume builder",
    "free CV builder",
    "build resume online free",
    "best free resume builder",
    "free professional resume builder",
    "AI CV generator free",
  ],
  openGraph: {
    title: "Free Resume Builder — AI Resume Creator & Generator | ResumeFlow",
    description:
      "Build a professional resume for free with ResumeFlow's free AI resume builder. ATS-optimized templates, zero-trust privacy, and real-time job tailoring — no credit card required.",
    url: `${SITE_URL}/free-resume-builder`,
    siteName: "ResumeFlow",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
        alt: "ResumeFlow - Free AI Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Resume Builder — AI Resume Creator & Generator",
    description:
      "Build a professional resume for free with ResumeFlow's AI resume builder. ATS-optimized templates, zero-trust PDF compilation, no credit card needed.",
    images: [`${SITE_URL}/logo.png`],
  },
  alternates: {
    canonical: `${SITE_URL}/free-resume-builder`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ─── JSON-LD Structured Data ────────
const faqSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/free-resume-builder#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is ResumeFlow really free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, ResumeFlow offers a generous free tier with 10,000 credits (enough for 20 tailored resumes) — no credit card required. You can build, tailor, and download resumes without paying anything.",
          },
        },
        {
          "@type": "Question",
          name: "How does the free AI resume builder work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upload your existing resume or fill in your details manually. Our AI analyzes your profile against target job descriptions, rewrites experience bullets using the Google XYZ formula, and compiles a polished PDF — all in under 30 seconds.",
          },
        },
        {
          "@type": "Question",
          name: "Are the resume templates ATS-compatible?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. All ResumeFlow templates are designed to pass Applicant Tracking Systems. Our ATS-Strict template uses standard fonts, single-column layout, proper heading hierarchy, and no graphics — ensuring 95%+ parsing accuracy.",
          },
        },
        {
          "@type": "Question",
          name: "Is my data private when using the free resume creator?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Absolutely. ResumeFlow uses client-side WASM compilation — your resume data never leaves your browser. Personal information is masked before any AI processing, and we never store your full resume on our servers.",
          },
        },
        {
          "@type": "Question",
          name: "Can I create multiple resumes for different jobs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Free tier users get 5 resume compilations per day, with the ability to tailor each version to a specific job description. Pro and Campus plans offer unlimited tailoring.",
          },
        },
        {
          "@type": "Question",
          name: "What makes ResumeFlow different from other free resume builders?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Unlike Zety or ResumeGenius which hide downloads behind paywalls, ResumeFlow is genuinely free with no credit card. We offer AI-powered job-specific tailoring, live company research, LaTeX templates for perfect formatting, and zero-trust client-side compilation for complete privacy.",
          },
        },
      ],
    },
    {
      "@type": "Product",
      "@id": `${SITE_URL}/free-resume-builder#product`,
      name: "ResumeFlow Free Resume Builder",
      description:
        "AI-powered free resume builder with ATS-optimized templates, real-time tailoring, and zero-trust PDF compilation.",
      brand: {
        "@type": "Brand",
        name: "ResumeFlow",
      },
      offers: [
        {
          "@type": "Offer",
          name: "Free Tier",
          price: "0",
          priceCurrency: "USD",
          description:
            "10,000 credits, 5 resumes/day, all templates, AI tailoring",
        },
        {
          "@type": "Offer",
          name: "Pro Plan",
          price: "19",
          priceCurrency: "USD",
          priceValidUntil: "2027-12-31",
          description: "Unlimited resumes, priority AI, advanced features",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "150",
        bestRating: "5",
      },
    },
  ],
};

const comparisonData = [
  { feature: "Genuinely Free (no paywall)", resumeflow: true, teal: true, zety: false, canva: true, resumeGenius: false },
  { feature: "AI-Powered Tailoring", resumeflow: true, teal: true, zety: false, canva: false, resumeGenius: false },
  { feature: "ATS-Optimized Templates", resumeflow: true, teal: true, zety: false, canva: false, resumeGenius: false },
  { feature: "Client-Side Privacy (WASM)", resumeflow: true, teal: false, zety: false, canva: false, resumeGenius: false },
  { feature: "LaTeX Professional Templates", resumeflow: true, teal: false, zety: false, canva: false, resumeGenius: false },
  { feature: "Live Company Research", resumeflow: true, teal: true, zety: false, canva: false, resumeGenius: false },
  { feature: "No Credit Card Required", resumeflow: true, teal: true, zety: false, canva: true, resumeGenius: false },
  { feature: "PDF Download Free", resumeflow: true, teal: false, zety: false, canva: true, resumeGenius: false },
];

const features = [
  {
    icon: <Sparkles className="w-6 h-6 text-rose-600" />,
    title: "AI Resume Generator",
    desc: "Paste a job description and our AI rewrites your experience to match perfectly — using the Google XYZ formula.",
  },
  {
    icon: <Shield className="w-6 h-6 text-emerald-600" />,
    title: "Zero-Trust Privacy",
    desc: "Client-side WASM compilation means your resume data never leaves your browser. No servers, no storage, no risk.",
  },
  {
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    title: "4 Premium Templates",
    desc: "ATS-Strict, Startup Accent, Finance Classic, and Tech Modern — all optimized for applicant tracking systems.",
  },
  {
    icon: <Zap className="w-6 h-6 text-amber-600" />,
    title: "30-Second Compilation",
    desc: "Generate a perfectly formatted PDF resume in under 30 seconds. No waiting, no rendering queues.",
  },
  {
    icon: <GraduationCap className="w-6 h-6 text-purple-600" />,
    title: "Skill Gap Analysis",
    desc: "Our AI identifies missing keywords and skills from the job description and suggests improvements.",
  },
  {
    icon: <Star className="w-6 h-6 text-rose-600" />,
    title: "Live Company Research",
    desc: "Automatically researches the target company's tech stack, culture, and values to align your resume.",
  },
];

export default function FreeResumeBuilderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] via-[#FAF1F8] to-[#FFFFFF] text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-950 overflow-x-hidden">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ─── Simplified Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-900/10">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo href="/" className="gap-3.5" />
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-full font-semibold shadow-[0_8px_30px_rgba(225,29,72,0.25)] transition-all px-6 py-2 text-sm"
          >
            Sign up free
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-16 md:pt-24 pb-12 md:pb-16 px-6 max-w-[1280px] mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-100/60 px-4 py-1.5 mb-6">
          <Sparkles size={12} className="text-rose-600" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
            100% Free — No Credit Card
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-6xl lg:text-[72px] font-extrabold tracking-[-0.03em] max-w-[900px] mx-auto leading-[1.05] mb-6 text-slate-900">
          Free Resume Builder —{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-600 to-red-500">
            AI-Powered & Free
          </span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-[650px] mx-auto leading-relaxed mb-10">
          Build a professional, ATS-optimized resume for free with our AI resume
          creator. No credit card, no paywall, no hidden fees. Tailor your
          resume for any job in under 30 seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="group inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-full shadow-[0_8px_30px_rgba(225,29,72,0.3)] transition-all px-10 h-14 text-base gap-3"
          >
            Build My Free Resume
            <span className="icon-island icon-island-light">
              <ArrowRight size={14} />
            </span>
          </Link>
          <Link
            href="/templates"
            className="group inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full border border-slate-200 px-8 h-14 text-base transition-colors gap-2"
          >
            Browse Templates Free
            <span className="icon-island">
              <ArrowRight size={14} />
            </span>
          </Link>
        </div>
        <p className="text-slate-400 text-sm mt-4">
          ✓ 10,000 free credits included &middot; ✓ No credit card &middot; ✓
          ATS-optimized
        </p>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="py-20 px-6 max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 tracking-[-0.02em] mb-4">
            Why Choose Our Free Resume Creator?
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Unlike other free resume builders that hide features behind
            paywalls, ResumeFlow gives you everything you need — completely
            free.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200/60 rounded-2xl p-6 hover:border-rose-200/60 hover:shadow-lg transition-all duration-300 card-bloom"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="py-20 px-6 bg-[#FAF1F8]/30">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 tracking-[-0.02em] mb-4">
              ResumeFlow vs Other Free Resume Builders
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              See how the best free resume generator compares to the
              competition.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left px-6 py-4 font-bold text-slate-700">
                    Feature
                  </th>
                  <th className="text-center px-4 py-4 font-bold text-rose-600">
                    <div>ResumeFlow</div>
                    <div className="text-[10px] font-normal text-slate-400 mt-0.5">Our Tool</div>
                  </th>
                  <th className="text-center px-4 py-4 font-bold text-slate-600">
                    Teal
                  </th>
                  <th className="text-center px-4 py-4 font-bold text-slate-600">
                    Zety
                  </th>
                  <th className="text-center px-4 py-4 font-bold text-slate-600">
                    Canva
                  </th>
                  <th className="text-center px-4 py-4 font-bold text-slate-600">
                    ResumeGenius
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-slate-100 text-slate-600 ${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {row.feature}
                    </td>
                    <td className="text-center px-4 py-4">
                      {row.resumeflow ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="text-center px-4 py-4">
                      {row.teal ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="text-center px-4 py-4">
                      {row.zety ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="text-center px-4 py-4">
                      {row.canva ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="text-center px-4 py-4">
                      {row.resumeGenius ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── STATS BANNER ─── */}
      <section className="py-16 px-6 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-8">
            <div className="text-4xl font-extrabold text-slate-900 mb-2">
              150+
            </div>
            <div className="text-sm text-slate-500">
              Resumes compiled daily by job seekers
            </div>
          </div>
          <div className="bg-white border border-slate-200/60 rounded-2xl p-8">
            <div className="text-4xl font-extrabold text-slate-900 mb-2">
              4.8/5
            </div>
            <div className="text-sm text-slate-500">
              Average rating from users
            </div>
          </div>
          <div className="bg-white border border-slate-200/60 rounded-2xl p-8">
            <div className="text-4xl font-extrabold text-slate-900 mb-2">
              100%
            </div>
            <div className="text-sm text-slate-500">
              ATS-compatible templates guaranteed
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 px-6 max-w-[800px] mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 tracking-[-0.02em] mb-4">
            Free Resume Builder — FAQ
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Everything you need to know about our free resume creator.
          </p>
        </div>
        <div className="space-y-4">
          {[
            {
              q: "Is ResumeFlow really free?",
              a: "Yes, ResumeFlow offers a generous free tier with 10,000 credits (enough for 20 tailored resumes) — no credit card required. You can build, tailor, and download resumes without paying anything.",
            },
            {
              q: "How does the free AI resume builder work?",
              a: "Upload your existing resume or fill in your details manually. Our AI analyzes your profile against target job descriptions, rewrites experience bullets using the Google XYZ formula, and compiles a polished PDF — all in under 30 seconds.",
            },
            {
              q: "Are the resume templates ATS-compatible?",
              a: "Yes. All ResumeFlow templates are designed to pass Applicant Tracking Systems. Our ATS-Strict template uses standard fonts, single-column layout, proper heading hierarchy, and no graphics — ensuring 95%+ parsing accuracy.",
            },
            {
              q: "Is my data private when using the free resume creator?",
              a: "Absolutely. ResumeFlow uses client-side WASM compilation — your resume data never leaves your browser. Personal information is masked before any AI processing, and we never store your full resume on our servers.",
            },
            {
              q: "Can I create multiple resumes for different jobs?",
              a: "Yes. Free tier users get 5 resume compilations per day, with the ability to tailor each version to a specific job description. Pro and Campus plans offer unlimited tailoring.",
            },
            {
              q: "What makes ResumeFlow different from other free resume builders?",
              a: "Unlike Zety or ResumeGenius which hide downloads behind paywalls, ResumeFlow is genuinely free with no credit card. We offer AI-powered job-specific tailoring, live company research, LaTeX templates for perfect formatting, and zero-trust client-side compilation for complete privacy.",
            },
          ].map((faq, i) => (
            <details
              key={i}
              className="group bg-white border border-slate-200/60 rounded-xl overflow-hidden transition-all hover:border-slate-300/60"
            >
              <summary className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 text-sm font-semibold text-slate-900 cursor-pointer hover:bg-slate-50/50 transition-colors [&::-webkit-details-marker]:hidden">
                <span>{faq.q}</span>
                <span className="text-slate-400 text-lg font-bold shrink-0 ml-4 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <div className="px-6 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="animated-gradient-cta py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-[-0.02em]">
              Build Your Free Resume Now.
            </h2>
            <p className="text-rose-100/80 mt-3 max-w-xl text-lg">
              No credit card. No paywall. Just a powerful AI resume builder
              that actually works.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="group inline-flex items-center justify-center bg-white hover:bg-slate-50 text-rose-700 font-bold rounded-full shadow-xl transition-all px-10 h-14 text-base gap-3 shrink-0"
          >
            Create Free Resume
            <span className="icon-island">
              <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <BrandLogo size="sm" className="gap-2.5 opacity-60" />
          <div className="flex items-center gap-4">
            <Link href="/legal/privacy" className="hover:text-slate-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:text-slate-600 transition-colors">
              Terms of Service
            </Link>
            <span>&copy; 2026 ResumeFlow. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
