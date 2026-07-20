"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";


export default function Navbar() {
  const { isSignedIn } = useAuth();
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "mx-4 mt-3 rounded-2xl glass-panel shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
          : "bg-white/70 backdrop-blur-md border-b border-slate-900/10"
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
    >
      <div className={`max-w-[1280px] mx-auto px-6 flex items-center justify-between transition-all duration-500 ${
        scrolled ? "h-14" : "h-16"
      }`}>
        <BrandLogo href="/" className="gap-3.5" />

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm font-medium text-[var(--color-mute)] hover:text-rose-600 transition-colors duration-300 cursor-pointer bg-transparent border-none"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            Features
          </button>
          <button
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm font-medium text-[var(--color-mute)] hover:text-rose-600 transition-colors duration-300 cursor-pointer bg-transparent border-none"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            How it Works
          </button>
          <button
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm font-medium text-[var(--color-mute)] hover:text-rose-600 transition-colors duration-300 cursor-pointer bg-transparent border-none"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            Pricing
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setTemplatesOpen((open) => !open)}
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-mute)] hover:text-rose-600 transition-colors duration-300 cursor-pointer bg-transparent border-none"
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
              <div className="absolute left-0 top-full mt-2 w-52 rounded-xl border border-[var(--color-hairline)]/60 bg-white/95 backdrop-blur-lg py-1.5 shadow-lg">
                <Link
                  href={templatesHref}
                  onClick={() => setTemplatesOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-[var(--color-charcoal)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-ink)] transition-colors"
                >
                  Browse Templates
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setTemplatesOpen(false);
                    document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm font-medium text-[var(--color-charcoal)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-ink)] bg-transparent border-none cursor-pointer transition-colors"
                >
                  View showcase
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm font-medium text-[var(--color-mute)] hover:text-rose-600 transition-colors duration-300 cursor-pointer bg-transparent border-none"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            FAQ
          </button>
        </div>

        <div className="flex items-center gap-2">

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
                className="text-[var(--color-mute)] hover:text-[var(--color-ink)] text-sm font-semibold transition-colors duration-300"
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
    </nav>
  );
}

