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
              card: "shadow-none border-none bg-white",
              cardBox:
                "bg-white rounded-[32px] p-8 shadow-[0_4px_16px_rgba(0,0,0,0.1)]",
              headerTitle: "text-[22px] font-semibold text-[#000000]",
              headerSubtitle: "text-[16px] text-[#33332e]",
              formButtonPrimary:
                "bg-[#e60023] hover:bg-[#cc001f] rounded-[16px] h-[40px] text-[14px] font-bold text-white",
              formFieldInput:
                "bg-white rounded-[16px] border-[#91918c] focus:border-[#000000] focus:ring-[#435ee5] h-[44px] text-[#000000]",
              footerActionLink: "text-[#211922] font-semibold",
              socialButtonsBlockButton:
                "bg-white rounded-[16px] border-[#dadad3] text-[#000000]",
              socialButtonsBlockButtonText: "text-[#000000]",
              formFieldLabel: "text-[#211922]",
              dividerLine: "bg-[#dadad3]",
              dividerText: "text-[#91918c]",
              identityPreviewEditButton: "text-[#e60023]",
              formHeaderTitle: "text-[#000000]",
              formHeaderSubtitle: "text-[#33332e]",
              formFieldRow: "bg-white",
              formField: "bg-white",
              footer: "bg-white",
              footerAction: "bg-white",
              socialButtons: "bg-white",
              alternativeMethods: "bg-white text-[#000000]",
              alternativeMethodsBlockButton:
                "bg-white text-[#000000] border-[#dadad3]",
              formFieldError: "bg-white",
              formFieldErrorText: "text-[#e60023]",
            },
          }}
        />
      </div>
    </div>
  );
}
