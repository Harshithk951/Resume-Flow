import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { StaticPageWrapper } from '@/components/StaticPageWrapper';
import { ContactForm } from '@/components/ContactForm';
import { Info, HelpCircle, Mail, Briefcase } from 'lucide-react';

const SITE_URL = 'https://resumeflow.harshithkumar.in';

interface ContentBlock {
  title: string;
  subtitle: string;
  category: string;
  icon: React.ReactNode;
  body: React.ReactNode;
}

const titleMeta: Record<string, string> = {
  about: 'About ResumeFlow — AI Resume Builder & Career Platform',
  blog: 'AI Placement Blog — Resume Tips, ATS Guides & Career Insights',
  contact: 'Contact ResumeFlow — Support & Partnerships',
  careers: 'Careers at ResumeFlow — Join Our Engineering Team',
};

const descriptionMeta: Record<string, string> = {
  about:
    'Learn about ResumeFlow — the AI-powered resume builder trusted by tech candidates. Client-side WASM compilation, ATS optimization, and zero-trust privacy.',
  blog:
    'Expert articles on AI resume writing, ATS optimization, interview preparation, and tech career advancement. Stay ahead in your job search.',
  contact:
    'Get in touch with the ResumeFlow team. Support, partnerships, enterprise placement drives, and general inquiries.',
  careers:
    'Join ResumeFlow and help build the future of AI-powered career acceleration. Open roles in engineering, AI, and design.',
};

const infoContent: Record<string, ContentBlock> = {
  about: {
    category: 'Company',
    title: 'About ResumeFlow',
    subtitle:
      'Automating placement preparation and empowering tech candidates globally.',
    icon: <Info className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">Our Mission</h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            ResumeFlow was built on the core belief that applying for jobs
            shouldn&apos;t feel like a lottery. In a world dominated by
            automated tracking systems and algorithmic filtering, candidates
            deserve tools that level the playing field. We automate the
            repetitive, tedious tasks of resume writing and optimization,
            allowing you to focus on what matters: interview preparation and
            coding.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            Our Core Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
            <div className="bg-[var(--color-surface-soft)] p-4 rounded-xl border border-slate-150">
              <h3 className="font-bold text-rose-700 mb-1.5">
                Factual Integrity
              </h3>
              <p className="text-[var(--color-ash)]">
                We optimize experience presentation and highlight key skills,
                but never hallucinate or invent qualifications.
              </p>
            </div>
            <div className="bg-[var(--color-surface-soft)] p-4 rounded-xl border border-slate-150">
              <h3 className="font-bold text-rose-700 mb-1.5">
                Absolute Privacy
              </h3>
              <p className="text-[var(--color-ash)]">
                By employing local masking and WASM-based compilers, we ensure
                your personal details are fully protected.
              </p>
            </div>
            <div className="bg-[var(--color-surface-soft)] p-4 rounded-xl border border-slate-150">
              <h3 className="font-bold text-rose-700 mb-1.5">
                Recruiter Alignment
              </h3>
              <p className="text-[var(--color-ash)]">
                Our layouts are compiled to comply strictly with the design
                patterns preferred by top-tier engineering recruiters.
              </p>
            </div>
          </div>
        </section>
      </div>
    ),
  },
  blog: {
    category: 'Company Insights',
    title: 'AI Placement Blog',
    subtitle:
      'Expert articles on tech recruitment trends, resume writing, and hiring processes.',
    icon: <HelpCircle className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8">
        {[
          {
            title:
              '10 Best Free Resume Builders 2026: Tested & Reviewed',
            date: 'July 20, 2026',
            href: '/info/blog/best-free-resume-builders-2026',
            snippet:
              'We tested 10 free resume builders — comparing ATS compatibility, AI features, pricing, and privacy. Find the best free resume builder for your job search.',
          },
          {
            title:
              'Landing FAANG Offers in 2026: The New Tech Landscape',
            date: 'June 15, 2026',
            snippet:
              'The recruitment landscape is evolving rapidly. Discover how companies are using AI filtering, and what you can do to stand out.',
          },
          {
            title:
              'The Google XYZ Formula Explained: Case Studies and Examples',
            date: 'May 28, 2026',
            snippet:
              "A breakdown of metrics-driven bullet points that grab recruiters' attention and increase interview callbacks.",
          },
          {
            title:
              'Zero-Trust Web Compilation: Why Client-Side WASM is the Future',
            date: 'April 10, 2026',
            snippet:
              'Behind the scenes of our compiler pipeline. How we compile complex LaTeX documents in V8 client engines without database overhead.',
          },
        ].map((article, idx) => {
          const content = (
            <div
              className="bg-[var(--color-surface-soft)] p-6 rounded-2xl border border-[var(--color-hairline)]/50 space-y-2 hover:border-rose-300 transition-colors cursor-pointer"
            >
              <span className="text-[10px] font-bold text-rose-600">
                {article.date}
              </span>
              <h3 className="text-base font-bold text-[var(--color-ink-soft)]">
                {article.title}
              </h3>
              <p className="text-[var(--color-ash)] text-xs leading-relaxed">
                {article.snippet}
              </p>
            </div>
          );

          if (article.href) {
            return (
              <Link key={idx} href={article.href}>
                {content}
              </Link>
            );
          }

          return <div key={idx}>{content}</div>;
        })}
      </div>
    ),
  },
  contact: {
    category: 'Company',
    title: 'Get in Touch',
    subtitle:
      'Have questions or need assistance? Reach out to our support or partnership teams.',
    icon: <Mail className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
              Support & Feedback
            </h2>
            <p className="text-[var(--color-mute)] text-sm leading-relaxed">
              If you have any questions about resume tailoring, quota
              limitations, or billing, our support team is available 24/7.
            </p>
            <p className="text-rose-600 text-sm font-semibold">
              support@resumeflow.ai
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
              Enterprise Drives
            </h2>
            <p className="text-[var(--color-mute)] text-sm leading-relaxed">
              Interested in onboarding ResumeFlow for university placements or
              corporate hiring drives? Reach out to our team.
            </p>
            <p className="text-rose-600 text-sm font-semibold">
              partnerships@resumeflow.ai
            </p>
          </section>
        </div>
        <ContactForm />
      </div>
    ),
  },
  careers: {
    category: 'Company',
    title: 'Work with Us',
    subtitle:
      'Join our team and help build the future of technical career acceleration.',
    icon: <Briefcase className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            Why Join ResumeFlow?
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            We are a highly focused team of software engineers and designers
            building tools that impact millions of candidates. We value clean
            architecture, low-latency UI performance, and state-of-the-art AI
            orchestration.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">Open Roles</h2>
          {[
            {
              title:
                'Senior AI Engineer (NIM & Agent Orchestration)',
              type: 'Remote / Full-time',
              desc:
                'Lead the design of context-aware search pipelines, LLM fine-tuning, and agent routing configurations.',
            },
            {
              title:
                'Lead Frontend Engineer (Next.js & WASM Compiler)',
              type: 'Remote / Full-time',
              desc:
                'Own client-side compilers, low-latency document rendering engines, and premium bento UI development.',
            },
          ].map((role, idx) => (
            <div
              key={idx}
              className="bg-[var(--color-surface-soft)] p-5 rounded-xl border border-[var(--color-hairline)]/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-rose-300 transition-colors"
            >
              <div>
                <h3 className="text-sm font-bold text-[var(--color-ink-soft)]">
                  {role.title}
                </h3>
                <span className="text-[10px] text-[var(--color-stone)] font-bold">
                  {role.type}
                </span>
                <p className="text-[var(--color-ash)] text-xs mt-1 leading-relaxed max-w-xl">
                  {role.desc}
                </p>
              </div>
              <button className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-lg transition-colors shrink-0">
                Apply Now
              </button>
            </div>
          ))}
        </section>
      </div>
    ),
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = titleMeta[slug] || 'ResumeFlow - AI Resume Builder';
  const description =
    descriptionMeta[slug] ||
    'AI-powered resume engineering platform with real-time ATS optimization.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/info/${slug}`,
    },
    alternates: {
      canonical: `${SITE_URL}/info/${slug}`,
    },
  };
}

export default async function InfoSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pageData = infoContent[slug];

  if (!pageData) {
    notFound();
  }

  return (
    <StaticPageWrapper
      category={pageData.category}
      title={pageData.title}
      subtitle={pageData.subtitle}
    >
      <div className="flex gap-4 items-center mb-6">
        {pageData.icon}
        <div className="h-px bg-[var(--color-secondary-bg)]/60 flex-1" />
      </div>
      {pageData.body}
    </StaticPageWrapper>
  );
}
