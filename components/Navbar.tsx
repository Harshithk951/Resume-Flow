"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ChevronDown, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";


export default function Navbar() {
  const { isSignedIn } = useAuth();
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const templatesHref = mounted && isSignedIn ? "/templates" : "/sign-up";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTemplatesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-md border-b border-slate-200/80 dark:border-slate-800/80"
          : "bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/50"
      }`}
      style={{
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <BrandLogo href="/" className="gap-3.5" />

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-300 cursor-pointer bg-transparent border-none"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            Features
          </button>
          <button
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-300 cursor-pointer bg-transparent border-none"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            How it Works
          </button>
          <button
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-300 cursor-pointer bg-transparent border-none"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            Pricing
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setTemplatesOpen((open) => !open)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-300 cursor-pointer bg-transparent border-none"
              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            >
              Templates
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${templatesOpen ? "rotate-180" : ""}`}
                style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
              />
            </button>
            {templatesOpen && (
              <div className="absolute left-0 top-full mt-2 w-52 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg py-1.5 shadow-xl">
                <Link
                  href={templatesHref}
                  onClick={() => setTemplatesOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Browse Templates
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setTemplatesOpen(false);
                    document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white bg-transparent border-none cursor-pointer transition-colors"
                >
                  View showcase
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-300 cursor-pointer bg-transparent border-none"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            FAQ
          </button>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 -mr-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>

        <div className="flex items-center gap-4">
          {mounted && isSignedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-full font-semibold shadow-[0_8px_30px_rgba(225,29,72,0.25)] transition-all duration-300 px-6 py-2 text-sm active:scale-[0.97]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-colors duration-300"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-full font-semibold shadow-[0_8px_30px_rgba(225,29,72,0.25)] transition-all duration-300 px-6 py-2 text-sm active:scale-[0.97]"
                style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
              >
                Sign up
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
                { id: "features", label: "Features" },
                { id: "how-it-works", label: "How it Works" },
                { id: "pricing", label: "Pricing" },
                { id: "templates", label: "Templates", hasDropdown: true },
                { id: "faq", label: "FAQ" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (item.id === "templates") {
                      const href = mounted && isSignedIn ? "/templates" : "/sign-up";
                      window.location.href = href;
                    } else {
                      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition-colors border border-transparent hover:border-slate-200"
                >
                  {item.label}
                  {item.id === "templates" && (
                    <span className="ml-1.5 text-xs text-slate-400">→</span>
                  )}
                </button>
              ))}
            </nav>

            {/* Auth actions */}
            <div className="px-4 py-6 border-t border-slate-200 space-y-3">
              {mounted && isSignedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-full font-semibold shadow-lg shadow-rose-500/25 transition-all duration-300 px-6 py-3 text-sm w-full"
                >
                  Go to Dashboard
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

