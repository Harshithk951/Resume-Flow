import type { Metadata } from "next";
import "./globals.css";
import { ConvexClerkProvider } from "@/components/providers/ConvexClerkProvider";
import { Analytics } from "@vercel/analytics/next";
import { HydrationProtectionGuard } from "@/components/HydrationProtectionGuard";
import { Toaster } from "@/components/Toaster";
import { jakartaSans, displayFont } from "./fonts";
import TermsFeedConsent from "@/components/TermsFeedConsent";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { WebVitals } from "@/components/WebVitals";

const SITE_URL = "https://resumeflow.harshithkumar.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ResumeFlow - Free AI Resume Builder, Resume Creator & ATS Optimizer",
    template: "%s | ResumeFlow",
  },
  description:
    "Build a professional resume for free with ResumeFlow's AI-powered resume creator and generator. ATS-optimized templates, real-time tailoring, client-side PDF compilation, and zero-trust privacy. Get hired faster — no credit card needed.",
  keywords: [
    "Resume Flow",
    "resume builder",
    "free resume builder",
    "free resume creator",
    "resume creator free",
    "AI resume builder",
    "AI resume",
    "free CV builder",
    "CV maker free",
    "AI CV generator",
    "ATS optimization",
    "resume generator",
    "free resume generator",
    "best free resume builder",
    "build resume online free",
    "free ATS resume builder",
    "resume PDF maker free",
    "job application",
    "resume tailoring",
    "career engine",
    "placement drive",
    "resume templates",
  ],
  authors: [{ name: "ResumeFlow", url: SITE_URL }],
  creator: "ResumeFlow",
  publisher: "ResumeFlow",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "ResumeFlow",
    title: "ResumeFlow - Free AI Resume Builder, Resume Creator & ATS Optimizer",
    description:
      "Build a professional resume for free with ResumeFlow's AI-powered resume creator. ATS-optimized templates, real-time company research, client-side compilation, and zero-trust PDF privacy.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "ResumeFlow - Free AI Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeFlow - Free AI Resume Builder, Resume Creator & ATS Optimizer",
    description:
      "Build a professional resume for free with ResumeFlow's free resume creator and AI resume builder. ATS-optimized templates, zero-trust PDF compilation.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

// ─── JSON-LD Structured Data for rich search results ────────
// Expanded schema graph with Organization, WebSite, SoftwareApplication,
// and FAQPage for maximum SERP real estate.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "ResumeFlow",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
      sameAs: [
        "https://github.com/resumeflow",
        "https://linkedin.com/company/resumeflow",
        "https://twitter.com/resumeflow",
      ],
      description:
        "AI-powered resume engineering platform with real-time ATS optimization and zero-trust PDF compilation.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "ResumeFlow",
      description:
        "Free AI-powered resume builder with ATS optimization, live company research, and client-side WASM compilation.",
      publisher: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: "ResumeFlow",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description:
        "Build once, tailor instantly. AI-powered resume engineering with real-time ATS optimization, live company research, and zero-trust PDF compilation.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free tier with 5 resume compiles per day",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "150",
        bestRating: "5",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "How does the AI tailoring pipeline work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Once you paste a target job description, our system launches background actions that query live search APIs for the target company. We then analyze skill gaps between your master profile and the job description, and use optimized model templates to rewrite experience points while maintaining absolute factual accuracy.",
          },
        },
        {
          "@type": "Question",
          name: "Is my personal data masked before sending to AI endpoints?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. ResumeFlow incorporates local data masking protocols. We substitute names, phone numbers, email addresses, and physical locations with secure placeholders before sending payloads to external language models, then seamlessly re-inject the masked data on your local device during the PDF compilation stage.",
          },
        },
        {
          "@type": "Question",
          name: "Does the resume compilation process use a cloud-based server?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. For absolute security, ResumeFlow runs a client-side LaTeX compiler. Your tailored JSON configuration compiles inside your browser using a high-performance WebAssembly Web Worker, ensuring that your raw data remains entirely private and never leaves your browser.",
          },
        },
        {
          "@type": "Question",
          name: "What are the daily quota restrictions?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Free tier accounts are restricted to 5 resume compiles and 20 AI assistant messages per 24 hours. Pro and Campus users enjoy unlimited access. The daily limits reset automatically at midnight relative to your timezone.",
          },
        },
        {
          "@type": "Question",
          name: "Are the templates compatible with ATS parsing filters?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Our default ATS-Strict template has been meticulously designed and audited against major applicant tracking systems. It compiles with exact standard margins, zero complex layout vectors, and simple headers, yielding perfect parsing accuracy.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`scroll-smooth ${jakartaSans.variable} ${displayFont.variable}`} data-scroll-behavior="smooth">
      <body className={`min-h-screen antialiased ${jakartaSans.className}`}>
        {/* ─── JSON-LD Structured Data ──────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* ─── Google AdSense Verification (lazy: loads after page becomes idle) ──────── */}
        <script
          defer
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7941579236760268"
          crossOrigin="anonymous"
        />

        {/* ─── TermsFeed Cookie Consent (Client Component) ──────── */}
        <TermsFeedConsent />

        {/* ─── GA4 + GTM with Consent Mode v2 (Client Component) ──────── */}
        <AnalyticsScripts />

        {/* ─── Core Web Vitals RUM reporting (Client Component) ──────── */}
        <WebVitals />

        {/* ─── Vercel Analytics ──────── */}
        <Analytics />

        <ConvexClerkProvider>
            <HydrationProtectionGuard>
                {children}
            </HydrationProtectionGuard>
            <Toaster />
        </ConvexClerkProvider>
      </body>
    </html>
  );
}
