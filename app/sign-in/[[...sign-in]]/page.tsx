"use client";

import { SignIn, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { InteractiveCharacters, ExpressionState } from "@/components/auth/InteractiveCharacters";

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
      router.replace("/dashboard");
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

  // Fallback: Replace Clerk social button mask-image with local SVG & ensure black background fill on icon only
  useEffect(() => {
    const fixGithubIcon = () => {
      const githubIconSpans = document.querySelectorAll<HTMLSpanElement>(
        ".cl-socialButtonsProviderIcon__github, .cl-providerIcon__github, .cl-socialButtonsBlockButton__github .cl-socialButtonsProviderIcon, .cl-socialButtonsBlockButton__github .cl-providerIcon"
      );
      githubIconSpans.forEach((span) => {
        span.style.setProperty("background-color", "#000000", "important");
        span.style.setProperty("mask-image", "url(/github-icon.svg)", "important");
        span.style.setProperty("-webkit-mask-image", "url(/github-icon.svg)", "important");
        span.style.setProperty("mask-size", "contain", "important");
        span.style.setProperty("-webkit-mask-size", "contain", "important");
        span.style.setProperty("mask-repeat", "no-repeat", "important");
        span.style.setProperty("-webkit-mask-repeat", "no-repeat", "important");
        span.style.setProperty("mask-position", "center", "important");
        span.style.setProperty("-webkit-mask-position", "center", "important");
        span.style.setProperty("width", "18px", "important");
        span.style.setProperty("height", "18px", "important");
        span.style.setProperty("display", "inline-block", "important");
      });
    };

    fixGithubIcon();
    const timer = setInterval(fixGithubIcon, 200);
    setTimeout(() => clearInterval(timer), 6000);
    return () => clearInterval(timer);
  }, []);

  // Safe Event Listeners for Interactive Character State Machine (No MutationObserver loops)
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
      <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
          <p className="text-sm font-bold text-slate-700">Signing you in... Redirecting to dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-4 md:p-8">
      {/* Preconnect to Clerk image CDN (Safari needs this for social icons) */}
      <link rel="preconnect" href="https://img.clerk.com" />

      {/* Background Visible Gray Dotted Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-100 pointer-events-none" />

      {/* Target CSS Styling */}
      <style>{`
        .cl-card, .cl-main, .cl-signUp-start, .cl-signIn-start, .cl-cardBox, .cl-formFieldRow, .cl-formField, .cl-header, .cl-footer, .cl-rootBox, .cl-pageScrollBox {
          background-color: transparent !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        .cl-header, .cl-formHeader {
          text-align: center !important;
          margin-bottom: 12px !important;
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
        .cl-socialButtonsRoot,
        .cl-socialButtons,
        .cl-socialButtonsBlockButtonRow {
          margin-top: 0px !important;
          margin-bottom: 0px !important;
          padding-top: 0px !important;
          padding-bottom: 0px !important;
        }
        .cl-formFieldInputContainer {
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
        }
        .cl-formFieldInput {
          background-color: transparent !important;
          color: #0f172a !important;
          border: none !important;
          border-bottom: 2px solid #cbd5e1 !important;
          border-radius: 0px !important;
          padding-left: 0px !important;
          padding-right: 32px !important;
          box-shadow: none !important;
          transition: border-color 0.2s ease;
          width: 100% !important;
        }
        .cl-formFieldInput:focus {
          border-bottom-color: #0f172a !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .cl-formFieldInputShowPasswordButton,
        .cl-formFieldInputShowPasswordIcon,
        button[aria-label*="password"],
        button[aria-label*="Password"],
        button[aria-label*="Show password"],
        button[aria-label*="Hide password"] {
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          color: #64748b !important;
          cursor: pointer !important;
          position: absolute !important;
          right: 8px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          z-index: 10 !important;
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
          width: 100% !important;
          cursor: url('/cursor-arrow.svg'), pointer !important;
        }
        .cl-formButtonPrimary:hover {
          background-color: #000000 !important;
        }
        .cl-socialButtonsBlockButton {
          background-color: #f4f4f5 !important;
          border: 1px solid #e4e4e7 !important;
          color: #1c1c1e !important;
          border-radius: 9999px !important;
          height: 48px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          margin-top: 0px !important;
          margin-bottom: 0px !important;
          width: 100% !important;
          cursor: url('/cursor-arrow.svg'), pointer !important;
        }
        .cl-socialButtonsBlockButton:hover {
          background-color: #e4e4e7 !important;
        }
        .cl-socialButtonsProviderIcon__github,
        .cl-providerIcon__github,
        .cl-socialButtonsBlockButton__github .cl-socialButtonsProviderIcon,
        .cl-socialButtonsBlockButton__github .cl-providerIcon {
          background-color: #000000 !important;
          background-image: none !important;
          mask-image: url('/github-icon.svg') !important;
          -webkit-mask-image: url('/github-icon.svg') !important;
          mask-size: contain !important;
          -webkit-mask-size: contain !important;
          mask-repeat: no-repeat !important;
          -webkit-mask-repeat: no-repeat !important;
          mask-position: center !important;
          -webkit-mask-position: center !important;
          width: 18px !important;
          height: 18px !important;
          display: inline-block !important;
        }

        /* Two-Line Stacked Footer Below Continue Button */
        .cl-footer, .cl-footerAction, .cl-footerActionTextContainer {
          background: transparent !important;
          border: none !important;
          margin-top: 16px !important;
          padding-top: 0px !important;
          margin-bottom: 0px !important;
          padding-bottom: 0px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          text-align: center !important;
          width: 100% !important;
          gap: 4px !important;
        }
        .cl-footerActionText {
          color: #64748b !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          text-align: center !important;
        }
        .cl-footerActionLink {
          color: #1c1c1e !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          margin-left: 0px !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          text-decoration: none !important;
          text-align: center !important;
        }
        .cl-footerActionLink:hover {
          text-decoration: underline !important;
        }
        .cl-dividerRow {
          margin-top: 12px !important;
          margin-bottom: 12px !important;
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

        /* Hide Clerk Dev Mode Notice Badge & Optional Name Fields */
        [data-clerk-dev-mode-notice],
        div[class*="dev-mode-notice"],
        .cl-devModeNotice,
        [data-clerk-notice],
        .cl-footerTextContainer,
        .cl-formField__firstName,
        .cl-formField__lastName,
        .cl-formFieldRow__firstName,
        .cl-formFieldRow__lastName {
          display: none !important;
        }
      `}</style>

      {/* Top Left Navigation Link */}
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        Back to home
      </Link>

      {/* Main Split Card Container */}
      <AnimatePresence>
        <motion.div
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative z-10 w-full max-w-4xl bg-white rounded-[24px] sm:rounded-[32px] border border-slate-200 shadow-[0_24px_64px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row my-auto"
        >
          {/* Left Column: Interactive Animated Characters */}
          <div className="w-full md:w-1/2 flex items-stretch min-h-[200px] sm:min-h-[280px] md:min-h-[480px]">
            <InteractiveCharacters
              expression={expression}
              isEmailFocused={isEmailFocused}
              isPasswordFocused={isPasswordFocused}
              isPasswordVisible={isPasswordVisible}
              hasError={hasError}
            />
          </div>

          {/* Right Column: Native Clerk Auth Form under Path A */}
          <div
            ref={formRef}
            onClick={handleFormClick}
            className="w-full md:w-1/2 p-5 sm:p-8 md:p-12 flex flex-col justify-center bg-white min-h-[400px]"
          >
            <SignIn
              routing="path"
              path="/sign-in"
              forceRedirectUrl="/dashboard"
              fallbackRedirectUrl="/dashboard"
              signUpFallbackRedirectUrl="/dashboard"
              appearance={{
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                  showOptionalFields: false,
                },
                elements: {
                  rootBox: "w-full mx-auto",
                  card: "shadow-none border-none bg-transparent w-full p-0",
                  cardBox: "shadow-none border-none bg-transparent w-full p-0",
                  headerTitle: "text-[26px] font-extrabold text-[#1c1c1e] text-center tracking-tight",
                  headerSubtitle: "text-[14px] text-slate-500 text-center mt-1",
                  formButtonPrimary:
                    "bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white rounded-full h-12 text-[15px] font-bold shadow-md transition-all active:scale-[0.99] mt-4 w-full cursor-[url('/cursor-arrow.svg'),pointer]",
                  formFieldInput:
                    "bg-transparent rounded-none border-0 border-b-2 border-slate-300 focus:border-slate-900 h-11 text-slate-900 placeholder:text-slate-400 font-medium px-0 transition-all pr-8",
                  footerActionLink: "text-[#1c1c1e] font-bold hover:underline block text-center mt-1",
                  footerActionText: "text-slate-500 font-medium text-sm block text-center",
                  socialButtonsBlockButton:
                    "bg-[#f4f4f5] rounded-full border border-slate-200 text-slate-900 hover:bg-slate-200 transition-all font-semibold h-12 w-full cursor-[url('/cursor-arrow.svg'),pointer]",
                  socialButtonsBlockButtonText: "text-[#1c1c1e] font-semibold text-sm",
                  formFieldLabel: "text-slate-800 font-semibold text-sm mb-1",
                  dividerLine: "bg-slate-200 h-[1px]",
                  dividerText: "text-slate-400 font-semibold text-xs uppercase tracking-wider",
                  identityPreviewEditButton: "text-[#1c1c1e] font-semibold",
                  formHeaderTitle: "text-[#1c1c1e] text-center",
                  formHeaderSubtitle: "text-slate-500 text-center",
                  formFieldRow: "bg-transparent",
                  formField: "bg-transparent",
                  footer: "bg-transparent border-none mt-4 justify-center text-center w-full flex flex-col items-center",
                  footerAction: "bg-transparent justify-center text-center w-full flex flex-col items-center gap-1",
                  socialButtons: "bg-transparent w-full",
                  alternativeMethods: "bg-transparent text-[#1c1c1e]",
                  alternativeMethodsBlockButton:
                    "bg-[#f4f4f5] text-[#1c1c1e] border border-slate-200 hover:bg-slate-200 rounded-full h-12 w-full cursor-[url('/cursor-arrow.svg'),pointer]",
                  formFieldError: "bg-transparent",
                  formFieldErrorText: "text-[#f75c2f] font-medium text-xs mt-1",
                  devModeNotice: "hidden",
                  formFieldInputShowPasswordButton: "text-slate-600 hover:text-slate-900 cursor-pointer text-sm font-semibold",
                },
              } as any}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
