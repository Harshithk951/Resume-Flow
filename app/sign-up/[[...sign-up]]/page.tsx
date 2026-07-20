"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden relative bg-[var(--color-surface-soft)]">
      {/* Lavender mesh gradient background — same as hero section */}
      <div className="absolute inset-0 mesh-gradient-hero pointer-events-none" />

      <style>{`[data-clerk-dev-mode-notice]{display:none!important}`}</style>

      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ash)] transition-colors hover:text-rose-600 z-10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="relative z-10">
        <SignUp
          path="/sign-up"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border-none",
              cardBox:
                "bg-[var(--color-canvas)] rounded-[32px] p-8 shadow-[0_4px_16px_rgba(0,0,0,0.1)]",
              headerTitle: "text-[22px] font-semibold text-[var(--color-ink)]",
              headerSubtitle: "text-[16px] text-[var(--color-body)]",
              formButtonPrimary:
                "bg-[var(--color-primary)] hover:bg-[var(--color-primary-pressed)] rounded-[16px] h-[40px] text-[14px] font-bold",
              formFieldInput:
                "rounded-[16px] border-[var(--color-ash)] focus:border-[var(--color-ink)] focus:ring-[var(--color-focus-outer)] h-[44px]",
              footerActionLink: "text-[var(--color-ink-soft)] font-semibold",
              socialButtonsBlockButton: "rounded-[16px] border-[var(--color-hairline)]",
            },
          }}
        />
      </div>
    </div>
  );
}
