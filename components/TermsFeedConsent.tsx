"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

/**
 * TermsFeedConsent — Native Cookie Consent & Google Consent Mode v2 Manager.
 *
 * Provides a clean, self-hosted cookie consent banner that handles Consent Mode v2
 * without relying on external CDN scripts that cause 502 sourcemap errors.
 */
export default function TermsFeedConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const savedConsent = localStorage.getItem("resumeflow_cookie_consent");
      if (savedConsent === "accepted") {
        updateConsent(true);
      } else if (savedConsent === "rejected") {
        updateConsent(false);
      } else {
        setIsVisible(true);
      }
    } catch {
      // Fallback for restricted storage environments
      setIsVisible(true);
    }
  }, []);

  const updateConsent = (analyticsGranted: boolean) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: analyticsGranted ? "granted" : "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }

    window.dispatchEvent(
      new CustomEvent("consent-update", {
        detail: {
          strictlyNecessary: true,
          analytics: analyticsGranted,
          marketing: false,
        },
      })
    );
  };

  const handleAccept = () => {
    try {
      localStorage.setItem("resumeflow_cookie_consent", "accepted");
    } catch {}
    updateConsent(true);
    setIsVisible(false);
  };

  const handleReject = () => {
    try {
      localStorage.setItem("resumeflow_cookie_consent", "rejected");
    } catch {}
    updateConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Cookie className="w-4 h-4" />
            <span>Cookie & Privacy Preferences</span>
          </div>
          <button
            onClick={handleReject}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close cookie banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          We use strictly necessary cookies to keep ResumeFlow secure and optional analytics cookies to improve your experience. Read our{" "}
          <Link href="/legal/privacy" className="text-emerald-400 underline hover:text-emerald-300 font-medium">
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center gap-2 justify-end pt-1">
          <button
            onClick={handleReject}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
