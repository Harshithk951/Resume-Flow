"use client";

import { SignIn, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { InteractiveCharacters, ExpressionState } from "@/components/auth/InteractiveCharacters";
import { BrandLogo } from "@/components/BrandLogo";

export default function SignInPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const { isLoaded, isSignedIn } = useAuth();

  const [expression, setExpression] = useState<ExpressionState>("neutral");
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/optimize");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    // Force light theme on auth route mount
    document.documentElement.classList.remove("dark");

    const params = new URLSearchParams(window.location.search);
    if (params.get("from") !== "logout") return;

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

  // Safe Event Listeners for Interactive Character State Machine
  useEffect(() => {
    if (!formRef.current) return;

    const checkState = () => {
      if (!formRef.current) return;
      const allInputs = Array.from(formRef.current.querySelectorAll("input"));
      const activeElement = document.activeElement;

      // Email Focus
      const emailInput = formRef.current.querySelector(
        'input[type="email"], input[name="identifier"], input[name="email"]'
      );
      const emailIsFocused = activeElement !== null && activeElement === emailInput;
      setIsEmailFocused(emailIsFocused);

      // Password Focus
      const passInput = formRef.current.querySelector(
        'input[type="password"], input[name="password"]'
      ) as HTMLInputElement | null;
      const pwdIsFocused = activeElement !== null && activeElement === passInput;
      setIsPasswordFocused(pwdIsFocused);

      // Password Visibility
      const pwdUnmasked = allInputs.some(
        (input) =>
          (input.name === "password" || input.getAttribute("autocomplete") === "current-password") &&
          input.type === "text"
      );
      setIsPasswordVisible(pwdUnmasked);

      // Validation Error
      const errorEl = formRef.current.querySelector(".cl-formFieldErrorText, .cl-formFieldError");
      const errPresent = Boolean(errorEl && errorEl.textContent?.trim());
      setHasError(errPresent);

      // Derived Expression Priority: shocked > shy > watching > neutral
      const pwdValue = passInput?.value || "";
      if (errPresent || (pwdUnmasked && pwdValue.length > 0)) {
        setExpression("shocked");
      } else if (pwdIsFocused) {
        setExpression("shy");
      } else if (emailIsFocused) {
        setExpression("watching");
      } else {
        setExpression("neutral");
      }
    };

    const formEl = formRef.current;
    formEl.addEventListener("focusin", checkState);
    formEl.addEventListener("focusout", checkState);
    formEl.addEventListener("input", checkState);

    return () => {
      formEl.removeEventListener("focusin", checkState);
      formEl.removeEventListener("focusout", checkState);
      formEl.removeEventListener("input", checkState);
    };
  }, []);

  if (isLoaded && isSignedIn) {
    return (
      <div className="min-h-screen w-full bg-[#FAF7FD] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#6d28d9]" />
          <p className="text-sm font-bold text-slate-700">Signing you in... Redirecting to Optimizer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-white text-slate-900 flex flex-col lg:flex-row overflow-x-hidden selection:bg-purple-100 selection:text-purple-900">
      {/* Target CSS Styling to precisely match the reference auth card */}
      <style>{`
        .cl-card, .cl-main, .cl-signUp-start, .cl-signIn-start, .cl-cardBox, .cl-formFieldRow, .cl-formField, .cl-rootBox, .cl-pageScrollBox {
          background-color: transparent !important;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
        }

        /* Hide Clerk internal header since we render our own Welcome back header above the card */
        .cl-header, .cl-formHeader {
          display: none !important;
        }

        /* Social Button (Continue with Google) */
        .cl-socialButtonsRoot,
        .cl-socialButtons,
        .cl-socialButtonsBlockButtonRow {
          margin-top: 0px !important;
          margin-bottom: 0px !important;
          padding: 0px !important;
          width: 100% !important;
        }
        .cl-socialButtonsBlockButton {
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          color: #1e293b !important;
          border-radius: 12px !important;
          height: 46px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03) !important;
          transition: all 0.2s ease !important;
          width: 100% !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 10px !important;
        }
        .cl-socialButtonsBlockButton:hover {
          background-color: #f8fafc !important;
          border-color: #cbd5e1 !important;
        }
        .cl-socialButtonsBlockButtonText {
          color: #1e293b !important;
          font-weight: 600 !important;
          font-size: 14px !important;
        }

        /* Divider "or" */
        .cl-dividerRow {
          margin-top: 20px !important;
          margin-bottom: 20px !important;
        }
        .cl-dividerLine {
          background-color: #f1f5f9 !important;
          height: 1px !important;
        }
        .cl-dividerText {
          color: #94a3b8 !important;
          font-weight: 400 !important;
          font-size: 12px !important;
          text-transform: lowercase !important;
          padding-left: 12px !important;
          padding-right: 12px !important;
        }

        /* Form Labels & Inputs */
        .cl-formFieldLabel {
          color: #1e293b !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          margin-bottom: 6px !important;
          display: block !important;
          text-align: left !important;
        }
        .cl-formFieldInputContainer {
          position: relative !important;
          width: 100% !important;
        }
        .cl-formFieldInput {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          height: 44px !important;
          padding-left: 14px !important;
          padding-right: 36px !important;
          font-size: 14px !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02) !important;
          transition: all 0.2s ease !important;
          width: 100% !important;
        }
        .cl-formFieldInput::placeholder {
          color: #94a3b8 !important;
        }
        .cl-formFieldInput:focus {
          border-color: #7c3aed !important;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12) !important;
          outline: none !important;
        }

        /* Primary Submit Button ("Email me a sign-in code" / Soft lavender matching reference) */
        .cl-formButtonPrimary {
          background-color: #e4ddf6 !important;
          color: #5b21b6 !important;
          border-radius: 12px !important;
          height: 46px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          margin-top: 16px !important;
          border: 1px solid transparent !important;
          box-shadow: none !important;
          width: 100% !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        .cl-formButtonPrimary:hover {
          background-color: #dbd1f4 !important;
          color: #4c1d95 !important;
        }
        .cl-formButtonPrimary:active {
          transform: scale(0.99) !important;
        }

        /* Show/Hide Password Toggle */
        .cl-formFieldInputShowPasswordButton,
        .cl-formFieldInputShowPasswordIcon {
          color: #64748b !important;
          position: absolute !important;
          right: 12px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          z-index: 10 !important;
        }

        /* Footer Link */
        .cl-footer, .cl-footerAction {
          background: transparent !important;
          border: none !important;
          margin-top: 14px !important;
          padding: 0px !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 4px !important;
        }
        .cl-footerActionText {
          color: #64748b !important;
          font-size: 13px !important;
          font-weight: 500 !important;
        }
        .cl-footerActionLink {
          color: #6d28d9 !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          text-decoration: none !important;
        }
        .cl-footerActionLink:hover {
          text-decoration: underline !important;
        }

        /* Hide Clerk Dev Mode Notice Badge */
        [data-clerk-dev-mode-notice],
        div[class*="dev-mode-notice"],
        .cl-devModeNotice,
        [data-clerk-notice],
        .cl-footerTextContainer {
          display: none !important;
        }

        /* Form error styling */
        .cl-formFieldErrorText {
          color: #e11d48 !important;
          font-size: 12px !important;
          margin-top: 4px !important;
          font-weight: 500 !important;
        }
      `}</style>

      {/* ─── LEFT COLUMN: Brand, Character Mascot, Value Props & Guarantee ─── */}
      <div className="relative w-full lg:w-1/2 bg-[#F3EFFE] border-b lg:border-b-0 lg:border-r border-[#E9E2F8] px-8 sm:px-14 lg:px-16 xl:px-20 py-10 lg:py-12 flex flex-col justify-between min-h-screen overflow-hidden">
        {/* Crisp Top-Left White Bubble - exactly matching HireRaft screenshot */}
        <div className="absolute -top-28 -left-28 w-[560px] h-[560px] rounded-full bg-white pointer-events-none z-0" />

        {/* Crisp Bottom-Right Soft Pinkish-Lavender Bubble */}
        <div className="absolute -bottom-28 -right-16 w-[440px] h-[440px] rounded-full bg-[#FAF2FB] pointer-events-none z-0" />

        {/* Top: Logo (Sits crisp inside the top-left white bubble) */}
        <div className="relative z-10">
          <BrandLogo href="/" size="sm" showText={true} />
        </div>

        {/* Center: Interactive Characters + Value Prop */}
        <div className="relative z-10 my-auto py-8 lg:py-10 max-w-lg">
          {/* Animated Characters Mascot positioned in the exact same location as the reference illustration */}
          <div className="w-[280px] h-[190px] mb-8">
            <InteractiveCharacters
              expression={expression}
              isEmailFocused={isEmailFocused}
              isPasswordFocused={isPasswordFocused}
              isPasswordVisible={isPasswordVisible}
              hasError={hasError}
              className="w-full h-full bg-transparent"
              svgClassName="w-full h-auto overflow-visible"
            />
          </div>

          {/* Heading with Purple "27 seconds" Accent */}
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-900 leading-[1.18] tracking-tight">
            One tap , then <span className="text-[#6D28D9]">27</span>
            <br />
            <span className="text-[#6D28D9]">seconds</span> to your score
          </h1>

          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            No password to invent or forget. 2 free resume optimizations to start, no card.
          </p>

          {/* Value Propositions with Emerald Checkmarks */}
          <ul className="mt-7 space-y-3.5">
            <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>ATS keyword matching for any job</span>
            </li>
            <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Stronger bullet points with real impact</span>
            </li>
            <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Before &amp; after score — see the improvement</span>
            </li>
            <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Free PDF downloads; Word with paid plans</span>
            </li>
          </ul>
        </div>

        {/* Bottom Left Privacy Note */}
        <div className="relative z-10 pt-4">
          <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
            Your data is never sold. Resume content is used only to generate your output.
          </p>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: Welcome Back Header, Auth Card, Badges & Links ─── */}
      <div className="relative z-10 w-full lg:w-1/2 bg-white flex flex-col items-center justify-center px-4 sm:px-8 lg:px-12 py-12 lg:py-16 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-[420px] flex flex-col items-center"
        >
          {/* Welcome back Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-[34px] font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Sign in to start improving your resume.
            </p>
          </div>

          {/* White Floating Auth Card */}
          <div
            ref={formRef}
            className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.04)] p-6 sm:p-8"
          >
            <SignIn
              routing="path"
              path="/sign-in"
              forceRedirectUrl="/optimize"
              fallbackRedirectUrl="/optimize"
              signUpFallbackRedirectUrl="/optimize"
              appearance={{
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                  showOptionalFields: false,
                },
                elements: {
                  formFieldLabel__identifier: {
                    display: "none",
                  },
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any}
            />

            {/* Subtext inside the card below the action button */}
            <p className="text-center text-xs text-slate-400 mt-4 font-normal">
              free · no card needed
            </p>
          </div>

          {/* Trust points below card */}
          <div className="mt-6 space-y-2 text-xs text-slate-600 font-medium w-full px-1">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>We never sell your data or post anything</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Delete everything from Account, any time</span>
            </div>
          </div>

          {/* Terms & Privacy Note */}
          <p className="mt-4 text-[11px] text-slate-400 leading-relaxed text-left w-full px-1">
            By signing in you agree to our{" "}
            <Link href="/legal/terms" className="underline hover:text-slate-600 transition-colors">
              Terms
            </Link>{" "}
            &amp;{" "}
            <Link href="/legal/privacy" className="underline hover:text-slate-600 transition-colors">
              Privacy Policy
            </Link>
            . Anonymized resume data may be used to improve ResumeFlow&apos;s AI. You can opt out in Data Preferences.
          </p>

          {/* Back to Home Link */}
          <div className="mt-6 text-center w-full">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
