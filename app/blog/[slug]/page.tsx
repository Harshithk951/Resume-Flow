import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Calendar,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  XCircle,
  BookOpen,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCalloutBanner from "@/components/BlogCalloutBanner";
import { getGuideBySlug, getAllGuideSlugs } from "@/lib/blogData";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "Guide Not Found | ResumeFlow",
      description: "The requested career guide could not be found.",
    };
  }

  const url = `https://resumeflow.harshithkumar.in/blog/${guide.slug}`;

  return {
    title: `${guide.title} | ResumeFlow`,
    description: guide.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: guide.title,
      description: guide.metaDescription,
      url,
      siteName: "ResumeFlow",
      type: "article",
      publishedTime: guide.date,
      authors: [guide.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.metaDescription,
    },
  };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const tagColorClasses =
    guide.tag === "ATS"
      ? "bg-purple-50 text-[#5B50E6] border-purple-200/60"
      : guide.tag === "India"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
      : "bg-blue-50 text-blue-700 border-blue-200/60";

  // Schema.org Article & FAQPage JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    author: {
      "@type": "Person",
      name: guide.author.name,
      jobTitle: guide.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "ResumeFlow",
      url: "https://resumeflow.harshithkumar.in",
    },
    datePublished: guide.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://resumeflow.harshithkumar.in/blog/${guide.slug}`,
    },
  };

  const faqJsonLd =
    guide.content.faqs && guide.content.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.content.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-purple-500 selection:text-white flex flex-col justify-between">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Navbar />

      <main className="flex-1 w-full">
        {/* ─── BREADCRUMBS & TOP NAV ────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 mb-8"
          >
            <Link
              href="/"
              className="hover:text-[#5B50E6] transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link
              href="/blog"
              className="hover:text-[#5B50E6] transition-colors"
            >
              Resources
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-medium truncate max-w-[180px] sm:max-w-none">
              {guide.title}
            </span>
          </nav>
        </div>

        {/* ─── ARTICLE HEADER ───────────────────────────────────── */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <header className="mb-10 sm:mb-12 border-b border-slate-100 pb-8 sm:pb-10">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {/* Tag Badge */}
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${tagColorClasses}`}
              >
                {guide.tag}
              </span>

              {/* Publication Date */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{guide.date}</span>
              </div>

              {/* Dot Separator */}
              <span className="text-slate-300">•</span>

              {/* Read Time */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{guide.readTime}</span>
              </div>
            </div>

            {/* Article Title */}
            <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18] mb-6">
              {guide.title}
            </h1>

            {/* Author Byline */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5B50E6] to-purple-400 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                HK
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {guide.author.name}
                </p>
                <p className="text-xs text-slate-500">
                  {guide.author.role}
                </p>
              </div>
            </div>
          </header>

          {/* ─── SNIPPET LEAD CALLOUT ───────────────────────────── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#FAF9FE] via-white to-[#F6F3FF] border-l-4 border-[#5B50E6] border-y border-r border-purple-100/70 p-6 sm:p-8 rounded-r-2xl mb-12 shadow-2xs">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-[#5B50E6] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-[#5B50E6] uppercase tracking-wider mb-2">
                  Key Takeaway Summary
                </h3>
                <p className="text-slate-800 text-base sm:text-lg leading-relaxed font-normal">
                  {guide.snippet}
                </p>
              </div>
            </div>
          </div>

          {/* ─── INTRO ─────────────────────────────────────────── */}
          <div className="text-slate-700 text-base sm:text-lg leading-[1.8] mb-10 font-normal">
            <p>{guide.content.intro}</p>
          </div>

          {/* ─── KEY TAKEAWAYS ─────────────────────────────────── */}
          {guide.content.takeaways && guide.content.takeaways.length > 0 && (
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-6 sm:p-8 mb-12 shadow-2xs">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#5B50E6]" />
                <span>Executive Summary & Rules</span>
              </h2>
              <ul className="space-y-3">
                {guide.content.takeaways.map((takeaway, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-slate-700 text-sm sm:text-base leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-[#5B50E6] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ─── MAIN SECTIONS ─────────────────────────────────── */}
          <div className="space-y-12 sm:space-y-14">
            {guide.content.sections.map((section, sIdx) => (
              <section key={sIdx} className="scroll-mt-20">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-5 border-b border-slate-100 pb-3">
                  {section.heading}
                </h2>

                {/* Paragraphs */}
                <div className="space-y-4 mb-6">
                  {section.body.map((p, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-slate-700 text-base sm:text-[17px] leading-[1.8]"
                    >
                      {p}
                    </p>
                  ))}
                </div>

                {/* Bullet Points */}
                {section.bulletPoints && section.bulletPoints.length > 0 && (
                  <ul className="space-y-3 mb-8 pl-2 sm:pl-4">
                    {section.bulletPoints.map((bullet, bIdx) => (
                      <li
                        key={bIdx}
                        className="flex items-start gap-3 text-slate-700 text-sm sm:text-base leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5B50E6] shrink-0 mt-2.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tables */}
                {section.table && (
                  <div className="overflow-x-auto my-8 border border-slate-200 rounded-xl shadow-2xs bg-white">
                    <table className="w-full text-left border-collapse text-sm sm:text-base">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          {section.table.headers.map((header, hIdx) => (
                            <th
                              key={hIdx}
                              className="py-3.5 px-4 font-bold text-slate-900 uppercase tracking-wider text-xs"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {section.table.rows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="hover:bg-purple-50/30 transition-colors"
                          >
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`py-3.5 px-4 leading-relaxed ${
                                  cIdx === 0
                                    ? "font-semibold text-slate-900"
                                    : "text-slate-600 text-xs sm:text-sm"
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Examples (Before / After XYZ formula) */}
                {section.examples && section.examples.length > 0 && (
                  <div className="space-y-6 my-8">
                    {section.examples.map((example, eIdx) => (
                      <div
                        key={eIdx}
                        className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-2xs"
                      >
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                          {example.label}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Weak / Before */}
                          <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Weak (Before)</span>
                            </div>
                            <p className="text-slate-800 text-xs sm:text-sm leading-relaxed">
                              &ldquo;{example.weak}&rdquo;
                            </p>
                          </div>

                          {/* Strong / After */}
                          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Strong (After Google XYZ)</span>
                            </div>
                            <p className="text-slate-900 font-medium text-xs sm:text-sm leading-relaxed">
                              &ldquo;{example.strong}&rdquo;
                            </p>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                          <span className="font-semibold text-slate-700 not-italic">
                            Why this works:{" "}
                          </span>
                          {example.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* ─── FAQS SECTION ──────────────────────────────────── */}
          {guide.content.faqs && guide.content.faqs.length > 0 && (
            <section className="mt-14 sm:mt-16 pt-10 border-t border-slate-200">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-6 flex items-center gap-2.5">
                <HelpCircle className="w-6 h-6 text-[#5B50E6]" />
                <span>Frequently Asked Questions</span>
              </h2>

              <div className="space-y-4">
                {guide.content.faqs.map((faq, fIdx) => (
                  <div
                    key={fIdx}
                    className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 sm:p-6"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ─── BACK TO GUIDES ────────────────────────────────── */}
          <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#5B50E6] hover:text-[#4E44D6] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all guides</span>
            </Link>
          </div>
        </article>

        {/* ─── BOTTOM CALLOUT BANNER ────────────────────────────── */}
        <BlogCalloutBanner />
      </main>

      <Footer />
    </div>
  );
}
