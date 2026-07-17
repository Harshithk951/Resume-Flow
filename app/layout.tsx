import type { Metadata } from "next";
import "./globals.css";
import { ConvexClerkProvider } from "@/components/providers/ConvexClerkProvider";
import { HydrationProtectionGuard } from "@/components/HydrationProtectionGuard";
import { jakartaSans, displayFont } from "./fonts";
import TermsFeedConsent from "@/components/TermsFeedConsent";
import { Analytics } from "@vercel/analytics/next";

const SITE_URL = "https://resumeflow.harshithkumar.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ResumeFlow - AI Resume Builder & ATS Optimizer",
    template: "%s | ResumeFlow",
  },
  description:
    "Build once, tailor instantly. AI-powered resume engineering platform with real-time ATS optimization, live company research, and zero-trust PDF compilation.",
  keywords: [
    "resume builder",
    "ATS optimization",
    "AI resume",
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
    title: "ResumeFlow - AI Resume Builder & ATS Optimizer",
    description:
      "Build once, tailor instantly. AI-powered resume engineering with real-time ATS optimization and live company research.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "ResumeFlow Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeFlow - AI Resume Builder & ATS Optimizer",
    description:
      "Build once, tailor instantly. AI-powered resume engineering with real-time ATS optimization.",
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

// JSON-LD Structured Data for rich search results
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "ResumeFlow",
      description:
        "AI-powered resume engineering platform with real-time ATS optimization.",
      publisher: {
        "@type": "Organization",
        name: "ResumeFlow",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.png`,
        },
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
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${jakartaSans.variable} ${displayFont.variable}`} data-scroll-behavior="smooth">
      <body className={`min-h-screen antialiased ${jakartaSans.className}`}>
        {/* ─── JSON-LD Structured Data ──────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* ─── Google AdSense Verification ──────── */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7941579236760268"
          crossOrigin="anonymous"
        />

        {/* ─── TermsFeed Cookie Consent (Client Component) ──────── */}
        <TermsFeedConsent />

        <ConvexClerkProvider>
          <HydrationProtectionGuard>
              {children}
          </HydrationProtectionGuard>
        </ConvexClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}
