"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center overflow-hidden relative"
    >
      {/* Lavender mesh gradient background — same as hero section */}
      <div className="absolute inset-0 mesh-gradient-hero pointer-events-none" />

      <style>{`[data-clerk-dev-mode-notice]{display:none!important}`}</style>
      <div className="relative z-10">
        <SignUp path="/sign-up" />
      </div>
    </div>
  );
}
