"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { InteractiveCharacters } from "@/components/auth/InteractiveCharacters";

export default function SignInPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasError, setHasError] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Observer to track Email Focus, Password Focus, Password Visibility, and Error Alert States
  useEffect(() => {
    if (!formRef.current) return;

    const checkState = () => {
      if (!formRef.current) return;
      const allInputs = Array.from(formRef.current.querySelectorAll("input"));
      const activeElement = document.activeElement;

      // Check if email input is currently focused
      const emailInput = formRef.current.querySelector(
        'input[type="email"], input[name="identifier"], input[name="email"]'
      );
      const emailIsFocused = activeElement !== null && activeElement === emailInput;
      setIsEmailFocused(emailIsFocused);

      // Check if password input is currently focused
      const passInput = formRef.current.querySelector(
        'input[type="password"], input[name="password"]'
      );
      const pwdIsFocused = activeElement !== null && activeElement === passInput;
      setIsPasswordFocused(pwdIsFocused);

      // Check if password text is currently unmasked/visible (type === "text" on password field)
      const pwdUnmasked = allInputs.some(
        (input) =>
          (input.name === "password" || input.getAttribute("autocomplete") === "current-password") &&
          input.type === "text"
      );
      setIsPasswordVisible(pwdUnmasked);

      // Check if validation error is present
      const errorEl = formRef.current.querySelector(".cl-formFieldErrorText, .cl-formFieldError");
      setHasError(Boolean(errorEl && errorEl.textContent?.trim()));
    };

    const handleInput = () => {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 800);
      checkState();
    };

    const formEl = formRef.current;
    formEl.addEventListener("focusin", checkState);
    formEl.addEventListener("focusout", checkState);
    formEl.addEventListener("input", handleInput);
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
      formEl.removeEventListener("input", handleInput);
      formEl.removeEventListener("click", checkState);
      observer.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[var(--color-surface-soft)] flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background Subtle Gradient Grid (Restored Dotted Background) */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

      {/* Target CSS Overrides to Force Clean WeStud Image 2 Layout */}
      <style>{`
        .cl-card, .cl-main, .cl-signUp-start, .cl-signIn-start, .cl-cardBox, .cl-formFieldRow, .cl-formField, .cl-header, .cl-footer, .cl-rootBox, .cl-pageScrollBox {
          background-color: transparent !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        .cl-formFieldInput {
          background-color: transparent !important;
          color: #0f172a !important;
          border: none !important;
          border-bottom: 2px solid #cbd5e1 !important;
          border-radius: 0px !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
          box-shadow: none !important;
          transition: border-color 0.2s ease;
        }
        .cl-formFieldInput:focus {
          border-bottom-color: #0f172a !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .cl-headerTitle, .cl-formHeaderTitle {
          color: #1c1c1e !important;
          text-align: center !important;
          font-size: 26px !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em !important;
        }
        .cl-headerSubtitle, .cl-formHeaderSubtitle {
          color: #64748b !important;
          text-align: center !important;
          font-size: 14px !important;
          margin-top: 4px !important;
        }
        .cl-header, .cl-formHeader {
          text-align: center !important;
          margin-bottom: 24px !important;
        }
        .cl-formButtonPrimary {
          background-color: #1c1c1e !important;
          color: #ffffff !important;
          border-radius: 9999px !important;
          height: 48px !important;
          font-weight: 700 !important;
          font-size: 15px !important;
          margin-top: 16px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
        }
        .cl-socialButtonsBlockButton {
          background-color: #f4f4f5 !important;
          border: 1px solid #e4e4e7 !important;
          color: #1c1c1e !important;
          border-radius: 9999px !important;
          height: 48px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          margin-top: 12px !important;
        }
        .cl-footer, .cl-footerAction, .cl-footerActionTextContainer {
          background: transparent !important;
          border: none !important;
          margin-top: 12px !important;
          padding-top: 0px !important;
          margin-bottom: 0px !important;
          padding-bottom: 0px !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          text-align: center !important;
          width: 100% !important;
        }
        .cl-footerActionText {
          color: #64748b !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .cl-footerActionLink {
          color: #1c1c1e !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          margin-left: 4px !important;
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
          text-decoration: none !important;
        }
        .cl-footerActionLink:hover {
          text-decoration: underline !important;
        }
        .cl-dividerLine {
          background-color: #e2e8f0 !important;
        }
        .cl-dividerText {
          color: #94a3b8 !important;
          font-weight: 600 !important;
          font-size: 11px !important;
        }
        .cl-formFieldLabel {
          color: #334155 !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          margin-bottom: 2px !important;
        }
        [data-clerk-dev-mode-notice] {
          display: none !important;
        }
      `}</style>

      {/* Top Left Navigation Link */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      {/* Main Split Card Container (WeStud layout - Image 2 Parity) */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-[32px] border border-slate-200 shadow-[0_24px_64px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row my-auto">
        {/* Left Column: Interactive Animated Characters */}
        <div className="w-full md:w-1/2 flex items-stretch">
          <InteractiveCharacters
            isEmailFocused={isEmailFocused}
            isPasswordFocused={isPasswordFocused}
            isPasswordVisible={isPasswordVisible}
            isTyping={isTyping}
            hasError={hasError}
          />
        </div>

        {/* Right Column: Auth Form */}
        <div ref={formRef} className="w-full md:w-1/2 p-8 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
          <SignIn
            path="/sign-in"
            appearance={{
              elements: {
                rootBox: "w-full mx-auto",
                card: "shadow-none border-none bg-transparent w-full p-0",
                cardBox: "shadow-none border-none bg-transparent w-full p-0",
                headerTitle: "text-[26px] font-extrabold text-[#1c1c1e] text-center tracking-tight",
                headerSubtitle: "text-[14px] text-slate-500 text-center mt-1",
                formButtonPrimary:
                  "bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white rounded-full h-12 text-[15px] font-bold shadow-md transition-all active:scale-[0.99] mt-4",
                formFieldInput:
                  "bg-transparent rounded-none border-0 border-b-2 border-slate-300 focus:border-slate-900 h-11 text-slate-900 placeholder:text-slate-400 font-medium px-0 transition-all",
                footerActionLink: "text-[#1c1c1e] font-bold hover:underline",
                socialButtonsBlockButton:
                  "bg-[#f4f4f5] rounded-full border border-slate-200 text-slate-900 hover:bg-slate-200 transition-all font-semibold h-12 mt-3",
                socialButtonsBlockButtonText: "text-[#1c1c1e] font-semibold text-sm",
                formFieldLabel: "text-slate-800 font-semibold text-sm mb-1",
                dividerLine: "bg-slate-200 h-[1px]",
                dividerText: "text-slate-400 font-semibold text-xs uppercase tracking-wider",
                identityPreviewEditButton: "text-[#1c1c1e] font-semibold",
                formHeaderTitle: "text-[#1c1c1e] text-center",
                formHeaderSubtitle: "text-slate-500 text-center",
                formFieldRow: "bg-transparent",
                formField: "bg-transparent",
                footer: "bg-transparent border-none mt-6 justify-center text-center",
                footerAction: "bg-transparent justify-center text-center",
                socialButtons: "bg-transparent",
                alternativeMethods: "bg-transparent text-[#1c1c1e]",
                alternativeMethodsBlockButton:
                  "bg-[#f4f4f5] text-[#1c1c1e] border border-slate-200 hover:bg-slate-200 rounded-full h-12",
                formFieldError: "bg-transparent",
                formFieldErrorText: "text-[#e60023] font-medium text-xs mt-1",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
