"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center overflow-hidden relative bg-[#FDFDFD]"
    >
      {/* Lavender mesh gradient background — same as hero section */}
      <div className="absolute inset-0 mesh-gradient-hero pointer-events-none" style={{ '--color-surface-soft': '#fbfbf9' } as React.CSSProperties} />

      <style>{`[data-clerk-dev-mode-notice]{display:none!important}`}</style>
      <div className="relative z-10">
        <SignUp
          path="/sign-up"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border-none",
              cardBox:
                "bg-white rounded-[32px] p-8 shadow-[0_4px_16px_rgba(0,0,0,0.1)]",
              headerTitle: "text-[22px] font-semibold text-[#000000]",
              headerSubtitle: "text-[16px] text-[#33332e]",
              formButtonPrimary:
                "bg-[#e60023] hover:bg-[#cc001f] rounded-[16px] h-[40px] text-[14px] font-bold",
              formFieldInput:
                "rounded-[16px] border-[#91918c] focus:border-[#000000] focus:ring-[#435ee5] h-[44px]",
              footerActionLink: "text-[#211922] font-semibold",
              socialButtonsBlockButton: "rounded-[16px] border-[#dadad3]",
            },
          }}
        />
      </div>
    </div>
  );
}
