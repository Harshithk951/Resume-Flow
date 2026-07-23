import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-16 px-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* How to Use */}
          <div className="md:col-span-2 lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">
              How to Use ResumeFlow
            </p>
            <div className="flex flex-col gap-3">
              {[
                {
                  step: "01",
                  title: "Sign up free",
                  desc: "Create your account — no credit card needed",
                  href: "/sign-up",
                },
                {
                  step: "02",
                  title: "Build your profile",
                  desc: "Fill in your experience, skills, and education",
                  href: "/resume/builder",
                },
                {
                  step: "03",
                  title: "AI tailors it",
                  desc: "Paste a job description — AI rewrites for that role",
                  href: "/free-resume-builder",
                },
                {
                  step: "04",
                  title: "Export & apply",
                  desc: "Download ATS-optimized PDF — ready to submit",
                  href: "/resources/handbook",
                },
              ].map((item) => (
                <Link
                  key={item.step}
                  href={item.href}
                  className="group/step flex items-start gap-3 p-2.5 rounded-xl transition-all hover:bg-slate-50 border border-transparent hover:border-slate-200"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-50 text-rose-700 text-[10px] font-extrabold shrink-0 border border-rose-100 group-hover/step:bg-rose-100 group-hover/step:border-rose-200 transition-colors">
                    {item.step}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-700 group-hover/step:text-rose-700 transition-colors">
                        {item.title}
                      </span>
                      <ArrowRight size={10} className="text-slate-300 group-hover/step:text-rose-500 group-hover/step:translate-x-0.5 transition-all shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Resources
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/resources/handbook" className="hover:text-slate-900 transition-colors">
                  Resume Handbook
                </Link>
              </li>
              <li>
                <Link href="/resources/interview-prep" className="hover:text-slate-900 transition-colors">
                  Interview Prep
                </Link>
              </li>
              <li>
                <Link href="/resources/ats-best-practices" className="hover:text-slate-900 transition-colors">
                  ATS Best Practices
                </Link>
              </li>
              <li>
                <Link href="/resources/api-docs" className="hover:text-slate-900 transition-colors">
                  API Docs
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Company
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/info/about" className="hover:text-slate-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-slate-900 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-slate-900 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/info/blog" className="hover:text-slate-900 transition-colors">
                  AI Blog
                </Link>
              </li>
              <li>
                <Link href="/info/contact" className="hover:text-slate-900 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/info/careers" className="hover:text-slate-900 transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Legal
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/legal/privacy" className="hover:text-slate-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-slate-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-slate-900 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/contact" className="hover:text-slate-900 transition-colors">
                  Legal Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-200 text-xs text-slate-400 gap-4">
          <BrandLogo size="sm" className="gap-2.5" />
          <span>© {new Date().getFullYear()} ResumeFlow. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
