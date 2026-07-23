"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import Footer from "@/components/Footer";

interface StaticPageWrapperProps {
  title: string;
  subtitle?: string;
  category?: string;
  children: React.ReactNode;
}

export function StaticPageWrapper({
  title,
  subtitle,
  category = "Resource",
  children,
}: StaticPageWrapperProps) {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[var(--color-ink)] font-sans selection:bg-rose-100 selection:text-rose-950 overflow-x-hidden relative flex flex-col justify-between">
      {/* Premium background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/[0.02] rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-500/[0.01] rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Simplified Navbar */}
      <nav
        className="sticky top-0 z-45 bg-white/70 backdrop-blur-md border-b border-[var(--color-hairline-soft)]/85 transform-gpu"
        style={{
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
        }}
      >
        <div className="max-w-[1000px] mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo href="/" className="gap-3.5" />
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-[var(--color-ash)] hover:text-rose-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Home</span>
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[900px] mx-auto px-6 py-12 md:py-16">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ash)] hover:text-rose-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100/60 rounded-full px-3.5 py-1 mb-4">
              <Sparkles size={12} className="text-rose-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                {category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[var(--color-ash)] text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="h-px bg-[var(--color-secondary-bg)]/60 w-full" />

          <div className="text-[var(--color-charcoal)] leading-relaxed text-sm md:text-base space-y-6 animate-fade-in">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
