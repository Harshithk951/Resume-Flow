import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface BlogCalloutBannerProps {
  ctaHref?: string;
  className?: string;
}

export default function BlogCalloutBanner({
  ctaHref = "/ats-resume-checker",
  className = "",
}: BlogCalloutBannerProps) {
  return (
    <section className={`py-12 sm:py-16 bg-white border-t border-slate-100 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-14 bg-gradient-to-br from-[#FAF9FE] via-white to-[#F6F3FF] border border-purple-100/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Subtle Ambient Background Glow */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-80 h-80 bg-purple-200/25 rounded-full blur-3xl pointer-events-none -z-0"
          />

          <div className="max-w-xl text-center md:text-left relative z-10">
            <span className="block text-xs font-bold text-[#5B50E6] uppercase tracking-wider mb-2.5">
              Take the next step
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Reading is step one of two
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed [text-wrap:pretty]">
              Paste your resume and a real posting — we&apos;ll tell you what&apos;s missing in about 27 seconds. 2 free to start, no card.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 rounded-xl bg-[#5B50E6] hover:bg-[#4E44D6] text-white font-semibold text-sm sm:text-base shadow-sm shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Check my resume</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
