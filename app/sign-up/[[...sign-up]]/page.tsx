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
              card: "shadow-none border-none bg-transparent",
              cardBox:
                "bg-white dark:bg-[#1c2333] rounded-[32px] p-8 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-[var(--color-hairline)] dark:border-[#2d3548]",
              headerTitle: "text-[22px] font-semibold text-[var(--color-ink)] dark:text-[#f0f6fc]",
              headerSubtitle: "text-[16px] text-[var(--color-mute)] dark:text-[#8b949e]",
              formButtonPrimary:
                "bg-[#e60023] hover:bg-[#cc001f] dark:bg-[#ff3040] dark:hover:bg-[#e60023] rounded-[16px] h-[40px] text-[14px] font-bold text-white shadow-none transition-colors",
              formFieldInput:
                "bg-white dark:bg-[#252d3f] rounded-[16px] border-[#91918c] dark:border-[#2d3548] focus:border-[var(--color-ink)] dark:focus:border-[#f0f6fc] focus:ring-[#435ee5] h-[44px] text-[var(--color-ink)] dark:text-[#f0f6fc] placeholder:text-[var(--color-ash)] dark:placeholder:text-[#8b949e]",
              footerActionLink: "text-[var(--color-ink-soft)] dark:text-[#f0f6fc] font-semibold hover:underline",
              socialButtonsBlockButton:
                "bg-white dark:bg-[#252d3f] rounded-[16px] border-[#dadad3] dark:border-[#2d3548] text-[var(--color-ink)] dark:text-[#f0f6fc] hover:bg-[var(--color-surface-card)] dark:hover:bg-[#2f3a50] transition-colors",
              socialButtonsBlockButtonText: "text-[var(--color-ink)] dark:text-[#f0f6fc] font-medium",
              formFieldLabel: "text-[var(--color-ink-soft)] dark:text-[#c9d1d9]",
              dividerLine: "bg-[#dadad3] dark:bg-[#2d3548]",
              dividerText: "text-[#91918c] dark:text-[#8b949e]",
              identityPreviewEditButton: "text-[#e60023] dark:text-[#ff3040]",
              formHeaderTitle: "text-[var(--color-ink)] dark:text-[#f0f6fc]",
              formHeaderSubtitle: "text-[var(--color-mute)] dark:text-[#8b949e]",
              formFieldRow: "bg-transparent",
              formField: "bg-transparent",
              footer: "bg-transparent border-t border-[var(--color-hairline)] dark:border-[#2d3548]",
              footerAction: "bg-transparent",
              socialButtons: "bg-transparent",
              alternativeMethods: "bg-transparent text-[var(--color-ink)] dark:text-[#f0f6fc]",
              alternativeMethodsBlockButton:
                "bg-white dark:bg-[#252d3f] text-[var(--color-ink)] dark:text-[#f0f6fc] border-[#dadad3] dark:border-[#2d3548]",
              formFieldError: "bg-transparent",
              formFieldErrorText: "text-[#e60023] dark:text-[#ff3040]",
            },
          }}
        />
      </div>
    </div>
  );
}
