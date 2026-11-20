import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export interface FooterProps {
  showCompanyLogos?: boolean;
  className?: string;
}

export default function Footer({ showCompanyLogos = true, className = "" }: FooterProps) {
  return (
    <footer className={`bg-white border-t border-slate-100 text-slate-600 ${className}`}>
      {/* ─── 1. COMPANY LOGOS STRIP ─────────────────────────────────── */}
      {showCompanyLogos && (
        <section className="pt-8 pb-8 border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs text-slate-400 font-medium mb-6">
              Our users optimize resumes for roles at
            </p>
            <div className="flex items-center justify-center gap-5 sm:gap-7 md:gap-9 lg:gap-11 flex-nowrap overflow-x-auto no-scrollbar opacity-60 grayscale hover:opacity-85 transition-opacity px-2">
              <span className="text-sm sm:text-base md:text-lg font-bold tracking-tight font-sans text-slate-500 whitespace-nowrap">
                amazon
              </span>
              <span className="text-sm sm:text-base md:text-lg font-black tracking-wider font-mono text-slate-500 whitespace-nowrap">
                SAP
              </span>
              <span className="text-sm sm:text-base md:text-lg font-bold tracking-widest uppercase font-serif text-slate-500 whitespace-nowrap">
                ORACLE
              </span>
              <span className="text-sm sm:text-base md:text-lg font-semibold tracking-tight text-slate-500 whitespace-nowrap">
                Deloitte.
              </span>
              <span className="text-sm sm:text-base md:text-lg font-semibold tracking-tight lowercase text-slate-500 whitespace-nowrap">
                salesforce
              </span>
              <span className="text-sm sm:text-base md:text-lg font-medium tracking-normal text-slate-500 whitespace-nowrap">
                Infosys
              </span>
              <span className="text-sm sm:text-base md:text-lg font-medium tracking-tight text-slate-500 whitespace-nowrap">
                Microsoft
              </span>
              <span className="text-sm sm:text-base md:text-lg font-bold tracking-normal text-slate-500 whitespace-nowrap">
                Google
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ─── 2. MAIN 5-COLUMN FOOTER ───────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Col 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <BrandLogo href="/" size="sm" className="gap-2.5 mb-3 text-slate-900" />
            <p className="text-xs text-slate-500 leading-relaxed max-w-[220px]">
              AI resume optimization for people who&rsquo;d rather be interviewing than reformatting.
            </p>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
              PRODUCT
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <Link href="/optimize" className="hover:text-slate-900 transition-colors">
                  Optimizer
                </Link>
              </li>
              <li>
                <Link href="/ats-resume-checker" className="hover:text-slate-900 transition-colors">
                  ATS checker
                </Link>
              </li>
              <li>
                <Link href="/free-resume-builder" className="hover:text-slate-900 transition-colors">
                  Resume builder
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-slate-900 transition-colors">
                  Job tracker
                </Link>
              </li>
              <li>
                <Link href="/resume-templates" className="hover:text-slate-900 transition-colors">
                  Templates
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: By Role */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
              BY ROLE
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <Link href="/resume-optimizer/data-analyst" className="hover:text-slate-900 transition-colors">
                  Data analyst
                </Link>
              </li>
              <li>
                <Link href="/resume-optimizer/software-engineer" className="hover:text-slate-900 transition-colors">
                  Software engineer
                </Link>
              </li>
              <li>
                <Link href="/resume-optimizer/product-manager" className="hover:text-slate-900 transition-colors">
                  Product manager
                </Link>
              </li>
              <li>
                <Link href="/resume-optimizer/marketing-manager" className="hover:text-slate-900 transition-colors">
                  Marketing manager
                </Link>
              </li>
              <li>
                <Link href="/resume-optimizer" className="hover:text-slate-900 transition-colors font-bold text-slate-900">
                  All 200+ roles
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: For Teams */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
              FOR TEAMS
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <Link href="/pricing" className="hover:text-slate-900 transition-colors">
                  Placement cells
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-slate-900 transition-colors">
                  Shared billing
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-slate-900 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-slate-900 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/free-resume-builder" className="hover:text-slate-900 transition-colors">
                  Resume builder India
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
              TRUST
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <Link href="/legal/privacy" className="hover:text-slate-900 transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-slate-900 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/legal/refund" className="hover:text-slate-900 transition-colors">
                  Refund policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-slate-900 transition-colors">
                  Shipping &amp; delivery
                </Link>
              </li>
              <li>
                <Link href="/info/contact" className="hover:text-slate-900 transition-colors">
                  Contact support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── 3. BOTTOM COPYRIGHT ───────────────────────────────────── */}
        <div className="pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} ResumeFlow. Made for people who deserve the call back.
        </div>
      </div>
    </footer>
  );
}
