"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    // Ensure document.documentElement syncs with dark mode setting or system preference
    try {
      const storedTheme = localStorage.getItem("dashboard-theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (storedTheme === "dark" || (!storedTheme && systemPrefersDark)) {
        document.documentElement.classList.add("dark");
      } else if (storedTheme === "light") {
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // Ignore localStorage availability issues
    }

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
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden bg-[var(--color-surface-soft)]">
      {/* Lavender mesh gradient background — same as hero section */}
      <div className="absolute inset-0 mesh-gradient-hero pointer-events-none" />

      <style>{`[data-clerk-dev-mode-notice]{display:none!important}`}</style>
      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ash)] transition-colors hover:text-rose-600 dark:hover:text-rose-400 z-10"
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
              card: "shadow-none border-none bg-transparent",
              cardBox:
                "bg-white dark:bg-[#181e2a] rounded-[32px] p-8 shadow-[0_16px_48px_rgba(0,0,0,0.3)] border-2 border-slate-200 dark:border-[#38445d]",
              headerTitle: "text-[22px] font-semibold text-slate-900 dark:text-[#f0f6fc]",
              headerSubtitle: "text-[16px] text-slate-600 dark:text-[#8b949e]",
              formButtonPrimary:
                "bg-[#e60023] hover:bg-[#cc001f] dark:bg-[#ff3040] dark:hover:bg-[#e60023] rounded-[16px] h-[44px] text-[14px] font-bold text-white shadow-md transition-all active:scale-[0.99]",
              formFieldInput:
                "bg-slate-50/70 dark:bg-[#111622] rounded-[16px] border-2 border-slate-300 dark:border-[#3d4b68] focus:border-[#e60023] dark:focus:border-[#ff3040] focus:ring-2 focus:ring-rose-500/20 h-[44px] text-slate-900 dark:text-[#f0f6fc] placeholder:text-slate-400 dark:placeholder:text-[#8b949e] font-medium shadow-sm transition-all",
              footerActionLink: "text-[#e60023] dark:text-[#ff3040] font-bold hover:underline",
              socialButtonsBlockButton:
                "bg-white dark:bg-[#111622] rounded-[16px] border-2 border-slate-300 dark:border-[#3d4b68] text-slate-900 dark:text-[#f0f6fc] hover:bg-slate-100 dark:hover:bg-[#1f283d] hover:border-slate-400 dark:hover:border-[#526388] shadow-sm transition-all font-semibold",
              socialButtonsBlockButtonText: "text-slate-900 dark:text-[#f0f6fc] font-semibold text-sm",
              formFieldLabel: "text-slate-800 dark:text-[#e6edf3] font-semibold text-sm mb-1.5",
              dividerLine: "bg-slate-300 dark:bg-[#38445d] h-[1px]",
              dividerText: "text-slate-500 dark:text-[#8b949e] font-semibold text-xs uppercase tracking-wider",
              identityPreviewEditButton: "text-[#e60023] dark:text-[#ff3040] font-semibold",
              formHeaderTitle: "text-slate-900 dark:text-[#f0f6fc]",
              formHeaderSubtitle: "text-slate-600 dark:text-[#8b949e]",
              formFieldRow: "bg-transparent",
              formField: "bg-transparent",
              footer: "bg-transparent border-t-2 border-slate-200 dark:border-[#2b3548] mt-4 pt-4",
              footerAction: "bg-transparent",
              socialButtons: "bg-transparent",
              alternativeMethods: "bg-transparent text-slate-900 dark:text-[#f0f6fc]",
              alternativeMethodsBlockButton:
                "bg-white dark:bg-[#111622] text-slate-900 dark:text-[#f0f6fc] border-2 border-slate-300 dark:border-[#3d4b68] hover:bg-slate-100 dark:hover:bg-[#1f283d]",
              formFieldError: "bg-transparent",
              formFieldErrorText: "text-[#e60023] dark:text-[#ff3040] font-medium",
            },
          }}
        />
      </div>
    </div>
  );
}
