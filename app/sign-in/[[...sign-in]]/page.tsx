"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "dashboard-theme";

export default function SignInPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydrate theme from localStorage (matches DashboardThemeProvider)
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark") {
        setIsDark(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

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

  if (!mounted) {
    // Prevent flash of wrong theme
    return null;
  }

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden bg-[var(--color-surface-soft)] ${isDark ? "dark" : ""}`}
    >
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
        <SignIn
          path="/sign-in"
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
