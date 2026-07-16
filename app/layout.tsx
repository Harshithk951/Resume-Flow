import type { Metadata } from "next";
import "./globals.css";
import { ConvexClerkProvider } from "@/components/providers/ConvexClerkProvider";
import { HydrationProtectionGuard } from "@/components/HydrationProtectionGuard";
import { jakartaSans, displayFont } from "./fonts";
import Script from "next/script";


export const metadata: Metadata = {
  title: "ResumeFlow - High-Velocity AI Career Engine",
  description:
    "Secure, real-time automated resume engineering platform.",
  keywords: [
    "resume builder",
    "ATS optimization",
    "placement drive",
    "AI resume",
    "job application",
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${jakartaSans.variable} ${displayFont.variable}`} data-scroll-behavior="smooth">
      <body className={`min-h-screen antialiased ${jakartaSans.className}`}>
        {/* ─── TermsFeed Cookie Consent ──────────────────────────── */}
        <Script
          src="https://www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js"
          strategy="afterInteractive"
          type="text/javascript"
          charSet="UTF-8"
          onLoad={() => {
            (window as any).cookieconsent?.run({
              notice_banner_type: "simple",
              consent_type: "express",
              palette: "light",
              language: "en",
              page_load_consent_levels: ["strictly-necessary"],
              notice_banner_reject_button_hide: false,
              preferences_center_close_button_hide: false,
              page_refresh_confirmation_buttons: false,
              website_name: "Resume Flow",
              website_privacy_policy_url: "https://resume-flow-bay.vercel.app/legal/privacy",
            });
          }}
        />
        <noscript>
          Free cookie consent management tool by{" "}
          <a href="https://www.termsfeed.com/">TermsFeed Generator</a>
        </noscript>

        <ConvexClerkProvider>
          <HydrationProtectionGuard>
              {children}
          </HydrationProtectionGuard>
        </ConvexClerkProvider>
      </body>
    </html>
  );
}
