"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ChevronDown } from "lucide-react";
import { getTemplatesHref } from "@/lib/templates/navigation";
import { BrandLogo } from "@/components/BrandLogo";

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const templatesHref = getTemplatesHref(isSignedIn);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTemplatesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-45 bg-white/70 backdrop-blur-md border-b border-slate-100/85">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <BrandLogo href="/" className="gap-3.5" />

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors cursor-pointer bg-transparent border-none"
          >
            Features
          </button>
          <button
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors cursor-pointer bg-transparent border-none"
          >
            How it Works
          </button>
          <button
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors cursor-pointer bg-transparent border-none"
          >
            Pricing
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setTemplatesOpen((open) => !open)}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors cursor-pointer bg-transparent border-none"
            >
              Templates
              <ChevronDown
                size={14}
                className={`transition-transform ${templatesOpen ? "rotate-180" : ""}`}
              />
            </button>
            {templatesOpen && (
              <div className="absolute left-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
                <Link
                  href={templatesHref}
                  onClick={() => setTemplatesOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  Browse Templates
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setTemplatesOpen(false);
                    document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 bg-transparent border-none cursor-pointer"
                >
                  View showcase
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors cursor-pointer bg-transparent border-none"
          >
            FAQ
          </button>
        </div>

        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-full font-semibold shadow-[0_8px_30px_rgba(225,29,72,0.25)] transition-all px-6 py-2 text-sm"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-full font-semibold shadow-[0_8px_30px_rgba(225,29,72,0.25)] transition-all px-6 py-2 text-sm"
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
