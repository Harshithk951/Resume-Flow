"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("from") !== "logout") return;

    // After logout, history is often: … → /dashboard → /sign-in.
    // Rewriting the stack so one browser-back lands on the public hero (/).
    window.history.replaceState(null, "", "/");
    window.history.pushState(null, "", "/sign-in");

    const onPopState = () => {
      if (window.location.pathname === "/") {
        router.replace("/");
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [router]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden bg-[#FDFDFD]"
    >
      {/* Lavender mesh gradient background — same as hero section */}
      <div className="absolute inset-0 mesh-gradient-hero pointer-events-none" style={{ '--color-surface-soft': '#fbfbf9' } as React.CSSProperties} />

      <style>{`[data-clerk-dev-mode-notice]{display:none!important}`}</style>
      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-rose-600 z-10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="relative z-10">
        <SignIn
          path="/sign-in"
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
