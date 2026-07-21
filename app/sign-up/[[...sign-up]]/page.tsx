"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useEffect, useState, useRef } from "react";
import { InteractiveCharacters } from "@/components/auth/InteractiveCharacters";

export default function SignUpPage() {
  const formRef = useRef<HTMLDivElement>(null);

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [hasError, setHasError] = useState(false);

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
  }, []);

  // Observer to track Password Focus, Password Visibility (Unmask), and Error Alert States
  useEffect(() => {
    if (!formRef.current) return;

    const checkState = () => {
      if (!formRef.current) return;
      const allInputs = Array.from(formRef.current.querySelectorAll("input"));

      // Check if password input is currently focused
      const activeElement = document.activeElement;
      const pwdIsFocused =
        activeElement !== null &&
        activeElement.tagName === "INPUT" &&
        ((activeElement as HTMLInputElement).name === "password" ||
          (activeElement as HTMLInputElement).type === "password" ||
          (activeElement as HTMLInputElement).getAttribute("autocomplete") === "new-password");
      setIsPasswordFocused(pwdIsFocused);

      // Check if password text is currently unmasked/visible (type === "text" on password field)
      const pwdUnmasked = allInputs.some(
        (input) =>
          (input.name === "password" || input.getAttribute("autocomplete") === "new-password") &&
          input.type === "text"
      );
      setIsPasswordVisible(pwdUnmasked);

      // Check if validation error is present
      const errorEl = formRef.current.querySelector(".cl-formFieldErrorText");
      setHasError(Boolean(errorEl && errorEl.textContent?.trim()));
    };

    const formEl = formRef.current;
    formEl.addEventListener("focusin", checkState);
    formEl.addEventListener("focusout", checkState);
    formEl.addEventListener("input", checkState);
    formEl.addEventListener("click", checkState);

    const observer = new MutationObserver(checkState);
    observer.observe(formEl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["type", "class"],
    });

    return () => {
      formEl.removeEventListener("focusin", checkState);
      formEl.removeEventListener("focusout", checkState);
      formEl.removeEventListener("input", checkState);
      formEl.removeEventListener("click", checkState);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-[var(--color-surface-soft)]">
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

      {/* Main Split Card Container (WeStud layout - fixed light card) */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-[32px] border-2 border-slate-200/80 shadow-[0_24px_64px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col md:flex-row my-auto">
        {/* Left Column: Interactive Animated Characters */}
        <div className="w-full md:w-1/2 flex items-stretch">
          <InteractiveCharacters
            isPasswordFocused={isPasswordFocused}
            isPasswordVisible={isPasswordVisible}
            hasError={hasError}
          />
        </div>

        {/* Right Column: Auth Form */}
        <div ref={formRef} className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
          <SignUp
            path="/sign-up"
            appearance={{
              elements: {
                rootBox: "w-full mx-auto",
                card: "shadow-none border-none bg-transparent w-full p-0",
                cardBox: "shadow-none border-none bg-transparent w-full p-0",
                headerTitle: "text-[24px] font-bold text-[#1c1c1e]",
                headerSubtitle: "text-[15px] text-slate-500",
                formButtonPrimary:
                  "bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white rounded-full h-[46px] text-[15px] font-bold shadow-sm transition-all active:scale-[0.99]",
                formFieldInput:
                  "bg-slate-50/80 rounded-[16px] border-2 border-slate-200 focus:border-[#1c1c1e] focus:ring-2 focus:ring-slate-900/10 h-[46px] text-slate-900 placeholder:text-slate-400 font-medium shadow-sm transition-all",
                footerActionLink: "text-[#1c1c1e] font-bold hover:underline",
                socialButtonsBlockButton:
                  "bg-[#f4f4f5] rounded-full border border-slate-200 text-slate-900 hover:bg-slate-200 transition-all font-semibold h-[46px]",
                socialButtonsBlockButtonText: "text-[#1c1c1e] font-semibold text-sm",
                formFieldLabel: "text-slate-800 font-semibold text-sm mb-1.5",
                dividerLine: "bg-slate-200 h-[1px]",
                dividerText: "text-slate-400 font-semibold text-xs uppercase tracking-wider",
                identityPreviewEditButton: "text-[#1c1c1e] font-semibold",
                formHeaderTitle: "text-[#1c1c1e]",
                formHeaderSubtitle: "text-slate-500",
                formFieldRow: "bg-transparent",
                formField: "bg-transparent",
                footer: "bg-transparent border-t border-slate-200 mt-4 pt-4",
                footerAction: "bg-transparent",
                socialButtons: "bg-transparent",
                alternativeMethods: "bg-transparent text-[#1c1c1e]",
                alternativeMethodsBlockButton:
                  "bg-[#f4f4f5] text-[#1c1c1e] border border-slate-200 hover:bg-slate-200 rounded-full h-[46px]",
                formFieldError: "bg-transparent",
                formFieldErrorText: "text-[#e60023] font-medium",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
