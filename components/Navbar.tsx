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
      className={`sticky top-0 z-50 transition-all duration-200 transform-gpu ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.03)] border-b border-slate-100"
          : "bg-white border-b border-transparent"
      }`}
      style={{
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo + Nav Links together (matching HireRaft's clean left-aligned nav) */}
        <div className="flex items-center gap-8 lg:gap-10">
          <BrandLogo href="/" className="gap-3.5" />

          <div className="hidden md:flex items-center gap-7 lg:gap-8">
            <Link
              href="/#features"
              className="text-[14px] font-medium text-slate-600 hover:text-slate-900 transition-colors duration-150"
            >
              Features
            </Link>
            <Link
              href="/resume-templates"
              className={`text-[14px] transition-colors duration-150 ${
                pathname === "/resume-templates"
                  ? "font-semibold text-[#5B50E6]"
                  : "font-medium text-slate-600 hover:text-slate-900"
              }`}
            >
              Templates
            </Link>
            <Link
              href="/ats-resume-checker"
              className={`text-[14px] transition-colors duration-150 ${
                pathname === "/ats-resume-checker"
                  ? "font-semibold text-[#5B50E6]"
                  : "font-medium text-slate-600 hover:text-slate-900"
              }`}
            >
              ATS Checker
            </Link>
            <Link
              href="/blog"
              className={`text-[14px] transition-colors duration-150 ${
                pathname.startsWith("/blog") || pathname.startsWith("/resources")
                  ? "font-semibold text-[#5B50E6]"
                  : "font-medium text-slate-600 hover:text-slate-900"
              }`}
            >
              Resources
            </Link>
            <Link
              href="/pricing"
              className={`text-[14px] transition-colors duration-150 ${
                pathname === "/pricing"
                  ? "font-semibold text-[#5B50E6]"
                  : "font-medium text-slate-600 hover:text-slate-900"
              }`}
            >
              Pricing
            </Link>
          </div>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 -mr-1 rounded-lg hover:bg-slate-100/80 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        {/* Right CTA Button (matching HireRaft single vibrant purple button with subtle glow) */}
        <div className="hidden md:flex items-center justify-end">
          {!mounted ? (
            <div className="h-10 w-36 bg-slate-100 rounded-xl animate-pulse" />
          ) : isSignedIn ? (
            <Link
              href="/optimize"
              className="inline-flex items-center justify-center bg-[#5B50E6] hover:bg-[#4E44D6] text-white rounded-xl font-semibold shadow-[0_4px_14px_rgba(91,80,230,0.35)] hover:shadow-[0_6px_20px_rgba(91,80,230,0.45)] transition-all duration-200 px-5 py-2.5 text-sm active:scale-[0.98]"
            >
              Open optimizer →
            </Link>
          ) : (
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center bg-[#5B50E6] hover:bg-[#4E44D6] text-white rounded-xl font-semibold shadow-[0_4px_14px_rgba(91,80,230,0.35)] hover:shadow-[0_6px_20px_rgba(91,80,230,0.45)] transition-all duration-200 px-5 py-2.5 text-sm active:scale-[0.98]"
            >
              Get Started Free →
            </Link>
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
                  className="flex items-center justify-center bg-[#5B50E6] hover:bg-[#4E44D6] text-white rounded-xl font-semibold shadow-[0_4px_14px_rgba(91,80,230,0.35)] transition-all duration-200 px-6 py-3 text-sm w-full"
                >
                  Open optimizer →
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full px-6 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full bg-[#5B50E6] hover:bg-[#4E44D6] text-white rounded-xl font-semibold shadow-[0_4px_14px_rgba(91,80,230,0.35)] transition-all duration-200 px-6 py-3 text-sm"
                  >
                    Get Started Free →
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

