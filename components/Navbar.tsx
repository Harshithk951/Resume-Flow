"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-colors duration-300 transform-gpu ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-900/10"
          : "bg-white/80 backdrop-blur-md border-b border-slate-900/10"
      }`}
      style={{
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <BrandLogo href="/" className="gap-3.5" />

        <div className="hidden md:flex items-center gap-7">
          <Link
            href="/#features"
            className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors duration-200"
          >
            Features
          </Link>
          <Link
            href="/resume-templates"
            className={`text-sm transition-colors duration-200 ${
              pathname === "/resume-templates"
                ? "font-bold text-[#5B50E6]"
                : "font-medium text-slate-600 hover:text-purple-600"
            }`}
          >
            Templates
          </Link>
          <Link
            href="/ats-resume-checker"
            className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors duration-200"
          >
            ATS Checker
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors duration-200"
          >
            Resources
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors duration-200"
          >
            Pricing
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 -mr-1 rounded-lg hover:bg-slate-100/80 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        <div className="flex items-center gap-2 min-w-[150px] justify-end">
          {!mounted ? (
            <div className="h-9 w-32 bg-slate-100 rounded-full animate-pulse" />
          ) : isSignedIn ? (
            <Link
              href="/optimize"
              className="inline-flex items-center justify-center bg-[#5B50E6] hover:bg-[#4E44D6] text-white rounded-xl font-semibold shadow-md transition-all duration-200 px-5 py-2 text-sm active:scale-[0.97]"
            >
              Open optimizer →
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors duration-200 px-2"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center bg-[#5B50E6] hover:bg-[#4E44D6] text-white rounded-xl font-semibold shadow-md transition-all duration-200 px-5 py-2 text-sm active:scale-[0.97]"
              >
                Get Started Free →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ─── MOBILE NAV DRAWER ───────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div
            ref={mobileMenuRef}
            className="fixed right-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <BrandLogo href="/" size="sm" showText={true} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {[
                { id: "features", label: "Features", href: "/#features" },
                { id: "templates", label: "Templates", href: "/resume-templates" },
                { id: "ats-checker", label: "ATS Checker", href: "/ats-resume-checker" },
                { id: "resources", label: "Resources", href: "/blog" },
                { id: "pricing", label: "Pricing", href: "/pricing" },
              ].map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-sm transition-colors border border-transparent hover:border-slate-200 ${
                    pathname === item.href
                      ? "font-bold text-[#5B50E6] bg-purple-50/50"
                      : "font-semibold text-slate-700 hover:bg-slate-50 hover:text-purple-600"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {/* Legal & Contact quick links */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Support
                </p>
                <Link
                  href="/legal/privacy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-rose-600 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/info/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-rose-600 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </nav>

            {/* Auth actions */}
            <div className="px-4 py-6 border-t border-slate-200 space-y-3">
              {mounted && isSignedIn ? (
                <Link
                  href="/optimize"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-full font-semibold shadow-lg shadow-rose-500/25 transition-all duration-300 px-6 py-3 text-sm w-full"
                >
                  Go to Optimizer →
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full px-6 py-3 rounded-full border-2 border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-full font-semibold shadow-lg shadow-rose-500/25 transition-all duration-300 px-6 py-3 text-sm"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

