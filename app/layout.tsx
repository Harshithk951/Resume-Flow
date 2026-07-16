import type { Metadata } from "next";
import "./globals.css";
import { ConvexClerkProvider } from "@/components/providers/ConvexClerkProvider";
import { HydrationProtectionGuard } from "@/components/HydrationProtectionGuard";
import { jakartaSans, displayFont } from "./fonts";


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
        <ConvexClerkProvider>
          <HydrationProtectionGuard>
              {children}
          </HydrationProtectionGuard>
        </ConvexClerkProvider>
      </body>
    </html>
  );
}
