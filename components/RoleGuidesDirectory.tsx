"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Compass } from "lucide-react";
import { GROUPED_ROLES, ROLE_LETTERS, ALL_ROLES_RAW } from "@/lib/roleGuides";

interface RoleGuidesDirectoryProps {
  /** If provided, highlights or acknowledges the currently viewed role slug */
  currentSlug?: string;
  className?: string;
}

export function RoleGuidesDirectory({
  currentSlug,
  className = "",
}: RoleGuidesDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return ALL_ROLES_RAW;
    const q = searchQuery.toLowerCase();
    return ALL_ROLES_RAW.filter(
      (r) => r.title.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <section
      id="role-guides-directory"
      className={`border-t border-slate-200/80 bg-gradient-to-b from-slate-50/60 to-white py-16 sm:py-24 ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200/60 text-cyan-700 text-xs font-semibold mb-4">
            <Compass className="w-3.5 h-3.5" />
            <span>Role guides</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
            Resume guides for 203 job roles
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Every guide covers the ATS keywords recruiters filter for in that role, the skills worth
            listing, the mistakes that get resumes rejected, and the companies hiring. Pick yours,
            then optimize your actual resume against a real job posting.
          </p>
        </div>

        {/* Real-time Role Search Bar */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across 203 job roles (e.g. Data Scientist, Account Executive)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick-Jump Alphabet Pills */}
        {!isSearching && (
          <div className="mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Quick jump by letter
            </div>
            <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              {ROLE_LETTERS.map((letter) => (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-slate-700 hover:text-cyan-600 hover:bg-cyan-50 active:scale-95 transition-all"
                  title={`Jump to letter ${letter}`}
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Display */}
        {isSearching ? (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Found {filteredRoles.length} matching {filteredRoles.length === 1 ? "role" : "roles"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredRoles.map((role) => {
                const isCurrent = role.slug === currentSlug;
                return (
                  <Link
                    key={role.slug}
                    href={`/resume-optimizer/${role.slug}`}
                    className={`group p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${
                      isCurrent
                        ? "bg-cyan-50/80 border-cyan-300 text-cyan-900 font-bold shadow-sm"
                        : "bg-white border-slate-200/70 hover:border-cyan-400 hover:bg-slate-50/80 text-slate-800"
                    }`}
                  >
                    <span className="truncate group-hover:text-cyan-600 transition-colors">
                      {role.title} resume
                    </span>
                    {isCurrent && (
                      <span className="shrink-0 text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-cyan-200 text-cyan-900 rounded">
                        Current
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          /* Alphabetical Directory Grid */
          <div className="space-y-12">
            {ROLE_LETTERS.map((letter) => {
              const rolesInLetter = GROUPED_ROLES[letter] || [];
              if (rolesInLetter.length === 0) return null;

              return (
                <div
                  key={letter}
                  id={`letter-${letter}`}
                  className="scroll-mt-24 rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <span className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-sm">
                      {letter}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {letter === "." ? "Specialty & Symbols" : `Letter ${letter}`}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {rolesInLetter.length} job {rolesInLetter.length === 1 ? "role" : "roles"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
                    {rolesInLetter.map((role) => {
                      const isCurrent = role.slug === currentSlug;
                      return (
                        <Link
                          key={role.slug}
                          href={`/resume-optimizer/${role.slug}`}
                          className={`group text-xs sm:text-sm py-1.5 transition-colors flex items-center gap-1.5 truncate ${
                            isCurrent
                              ? "font-bold text-cyan-700 underline decoration-cyan-400 underline-offset-4"
                              : "text-slate-600 hover:text-cyan-600"
                          }`}
                        >
                          <span className="truncate">{role.title} resume</span>
                          {isCurrent && (
                            <span className="shrink-0 text-[9px] uppercase font-bold text-cyan-600">
                              (this)
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Optimization Callout */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="block text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              Free ATS Tailoring Engine
            </span>
            <h4 className="text-xl sm:text-2xl font-bold">
              Ready to optimize your resume for your target role?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Paste your target job description and your current resume. Our AI aligns your keywords,
              sharpens bullet metrics, and exports a recruiter-ready ATS Strict PDF.
            </p>
          </div>
          <Link
            href="/optimize"
            className="shrink-0 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-cyan-400/20"
          >
            Optimize My Resume Now
          </Link>
        </div>
      </div>
    </section>
  );
}

export default RoleGuidesDirectory;
