import { describe, it, expect } from "vitest";
import { GUIDES_DATA, getGuideBySlug, getAllGuideSlugs } from "@/lib/blogData";
import sitemap from "@/app/sitemap";

describe("lib/blogData - Guides & Career Articles", () => {
  it("contains exactly 5 guides", () => {
    expect(GUIDES_DATA).toHaveLength(5);
  });

  const expectedArticles = [
    {
      slug: "how-to-beat-ats-resume-screening-2025",
      title: "How to Beat ATS Resume Screening in 2025 (Step-by-Step)",
      tag: "ATS",
      date: "10 Jun 2025",
      readTime: "7 min read",
      snippet:
        "Over 70% of resumes are rejected before a human ever reads them. Here's exactly how to format and write your resume to pass ATS screening every time.",
    },
    {
      slug: "what-is-an-ats-score-and-how-to-improve-yours",
      title: "What Is an ATS Score? (And How to Improve Yours)",
      tag: "ATS",
      date: "5 Jun 2025",
      readTime: "5 min read",
      snippet:
        "Your ATS score determines whether a recruiter ever sees your resume. Learn what it measures, what a good score looks like, and five ways to improve it fast.",
    },
    {
      slug: "best-resume-format-for-freshers-in-india-2025-guide",
      title: "Best Resume Format for Freshers in India (2025 Guide)",
      tag: "India",
      date: "28 May 2025",
      readTime: "6 min read",
      snippet:
        "A practical guide to writing your first resume for the Indian job market — what sections to include, what to skip, how to format for ATS, and how long it should be.",
    },
    {
      slug: "how-to-write-a-software-engineer-resume-that-gets-interviews-2025",
      title: "How to Write a Software Engineer Resume That Gets Interviews (2025)",
      tag: "Resume Tips",
      date: "20 May 2025",
      readTime: "7 min read",
      snippet:
        "Concrete tips for writing a software engineering resume that passes ATS, impresses recruiters, and gets you to the interview stage — with real before/after examples.",
    },
    {
      slug: "7-cover-letter-mistakes-that-get-you-rejected-and-how-to-fix-them",
      title: "7 Cover Letter Mistakes That Get You Rejected (and How to Fix Them)",
      tag: "Resume Tips",
      date: "12 May 2025",
      readTime: "6 min read",
      snippet:
        "Most cover letters are ignored because they make the same seven mistakes. Here's what they are, why they hurt you, and exactly how to fix each one.",
    },
  ];

  it.each(expectedArticles)(
    "verifies exact metadata for $slug",
    ({ slug, title, tag, date, readTime, snippet }) => {
      const guide = getGuideBySlug(slug);
      expect(guide).toBeDefined();
      expect(guide?.title).toBe(title);
      expect(guide?.tag).toBe(tag);
      expect(guide?.date).toBe(date);
      expect(guide?.readTime).toBe(readTime);
      expect(guide?.snippet).toBe(snippet);
    }
  );

  it("verifies getAllGuideSlugs returns all 5 slugs", () => {
    const slugs = getAllGuideSlugs();
    expect(slugs).toEqual(expectedArticles.map((a) => a.slug));
  });

  it("verifies undefined for non-existent slug", () => {
    expect(getGuideBySlug("non-existent-guide-slug")).toBeUndefined();
  });

  it("verifies substantive content for each article (5-7 min read calibration)", () => {
    for (const guide of GUIDES_DATA) {
      expect(guide.content.intro.length).toBeGreaterThan(150);
      expect(guide.content.takeaways).toBeDefined();
      expect(guide.content.takeaways!.length).toBeGreaterThanOrEqual(4);
      expect(guide.content.sections.length).toBeGreaterThanOrEqual(3);
      expect(guide.content.faqs).toBeDefined();
      expect(guide.content.faqs!.length).toBeGreaterThanOrEqual(4);

      // Check total word count is calibrated to 5-7 min read (>800 words)
      const allText = [
        guide.content.intro,
        ...(guide.content.takeaways || []),
        ...guide.content.sections.flatMap((s) => [
          s.heading,
          ...s.body,
          ...(s.bulletPoints || []),
          ...(s.examples?.flatMap((e) => [e.label, e.weak, e.strong, e.explanation]) || []),
          ...(s.table?.headers || []),
          ...(s.table?.rows?.flat() || []),
        ]),
        ...(guide.content.faqs?.flatMap((f) => [f.question, f.answer]) || []),
      ].join(" ");

      const wordCount = allText.split(/\s+/).filter(Boolean).length;
      expect(wordCount).toBeGreaterThanOrEqual(800);
    }
  });

  it("verifies sitemap includes /blog and all 5 guide URLs", () => {
    const pages = sitemap();
    const urls = pages.map((p) => p.url);

    expect(urls).toContain("https://resumeflow.harshithkumar.in/blog");
    for (const article of expectedArticles) {
      expect(urls).toContain(`https://resumeflow.harshithkumar.in/blog/${article.slug}`);
    }
  });

  it("verifies next.config.ts contains /resources -> /blog redirect and /blog/:path* cache header", async () => {
    // Read next.config.ts dynamically
    const nextConfigModule = await import("@/next.config");
    const config = nextConfigModule.default;

    if (config.redirects) {
      const redirects = await config.redirects();
      const resourcesRedirect = redirects.find((r: { source: string }) => r.source === "/resources");
      expect(resourcesRedirect).toBeDefined();
      expect(resourcesRedirect?.destination).toBe("/blog");
      expect(resourcesRedirect?.permanent).toBe(true);
    }

    if (config.headers) {
      const headers = await config.headers();
      const blogHeader = headers.find((h: { source: string }) => h.source === "/blog/:path*");
      expect(blogHeader).toBeDefined();
      expect(blogHeader?.headers[0].key).toBe("Cache-Control");
    }
  });
});
