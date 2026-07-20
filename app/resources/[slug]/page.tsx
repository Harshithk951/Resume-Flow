import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { StaticPageWrapper } from '@/components/StaticPageWrapper';
import { BookOpen, HelpCircle, CheckSquare, Terminal } from 'lucide-react';

const SITE_URL = 'https://resumeflow.harshithkumar.in';

interface ContentBlock {
  title: string;
  subtitle: string;
  category: string;
  icon: React.ReactNode;
  body: React.ReactNode;
}

const titleMeta: Record<string, string> = {
  handbook: 'Resume Handbook — Google XYZ Formula & ATS Layout Guide | ResumeFlow',
  'interview-prep':
    'Interview Prep Guide — STAR Method & Technical Checklist | ResumeFlow',
  'ats-best-practices':
    'ATS Best Practices — Optimize Your Resume for Applicant Tracking Systems | ResumeFlow',
  'api-docs':
    'Developer API Documentation — ResumeFlow Resume Tailoring API',
};

const descriptionMeta: Record<string, string> = {
  handbook:
    'The ultimate resume handbook: Google XYZ formula, action verbs, ATS layout tips, and proven strategies to get more interviews. Write a resume that converts.',
  'interview-prep':
    'Master behavioral rounds with the STAR method and technical interviews with our comprehensive preparation checklist. Land your dream tech role.',
  'ats-best-practices':
    'ATS optimization guide: Learn how to make your resume parse correctly by Applicant Tracking Systems. 95% of Fortune 500 companies use ATS software.',
  'api-docs':
    'Integrate ResumeFlow automated tailoring engines into your pipelines with our developer API. Process job descriptions and generate tailored resumes programmatically.',
};

const resourcesContent: Record<string, ContentBlock> = {
  handbook: {
    category: 'Placement Resource',
    title: 'Resume Handbook',
    subtitle:
      'A comprehensive guide to writing engineering and tech resumes that convert.',
    icon: <BookOpen className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            1. The Google XYZ Resume Formula
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            The most effective way to frame your achievements is using the XYZ
            formula:{' '}
            <strong>
              &ldquo;Accomplished [X] as measured by [Y], by doing [Z].&rdquo;
            </strong>
          </p>
          <div className="bg-[var(--color-surface-soft)] border border-[var(--color-hairline)]/50 p-4 rounded-xl text-xs space-y-2">
            <p className="text-[var(--color-ash)]">
              <span className="text-rose-500 font-bold">Weak:</span> Helped
              build the company frontend website.
            </p>
            <p className="text-[var(--color-ink-soft)]">
              <span className="text-green-600 font-bold">Strong:</span>{' '}
              Redesigned the core dashboard frontend [X], resulting in a 34%
              reduction in load latency [Y], by implementing React code-splitting
              and state optimizations [Z].
            </p>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            2. Layout and Structure Guidelines
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Corporate recruiters spend an average of 6 seconds reviewing a
            resume. Keep your structure clean:
          </p>
          <ul className="list-disc pl-5 text-[var(--color-mute)] text-xs space-y-1.5">
            <li>
              Single page only (unless you have 8+ years of experience).
            </li>
            <li>Single-column layout to ensure ATS compatibility.</li>
            <li>Consistent margins of 0.5 to 1.0 inch.</li>
            <li>
              No visual scales, percentages, or stars for skill levels.
            </li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            3. Action Verbs to Start Every Bullet
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Always begin bullet points with strong, active verbs in the past
            tense (or present for current roles):
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-[var(--color-surface-soft)] p-3 rounded-lg border border-[var(--color-hairline-soft)]">
              <p className="font-bold text-rose-700 mb-1">
                Creation & Dev
              </p>
              <p className="text-[var(--color-ash)]">
                Architected, Deployed, Built, Formulated, Engineered, Developed.
              </p>
            </div>
            <div className="bg-[var(--color-surface-soft)] p-3 rounded-lg border border-[var(--color-hairline-soft)]">
              <p className="font-bold text-rose-700 mb-1">
                Leadership & Impact
              </p>
              <p className="text-[var(--color-ash)]">
                Spearheaded, Directed, Guided, Restructured, Optimized,
                Accelerated.
              </p>
            </div>
          </div>
        </section>
      </div>
    ),
  },
  'interview-prep': {
    category: 'Placement Resource',
    title: 'Interview Prep Guide',
    subtitle:
      'Master the behavioral and technical rounds with targeted preparation structures.',
    icon: <HelpCircle className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            1. Behavioral Prep: The STAR Method
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Behavioral questions (&ldquo;Tell me about a time when...&rdquo;)
            should always be answered using the STAR method:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-[var(--color-surface-soft)] p-3 rounded-xl border border-[var(--color-hairline-soft)]">
              <h3 className="font-bold text-rose-700 mb-1">Situation</h3>
              <p className="text-[var(--color-ash)]">
                Set the context. What was the project or conflict?
              </p>
            </div>
            <div className="bg-[var(--color-surface-soft)] p-3 rounded-xl border border-[var(--color-hairline-soft)]">
              <h3 className="font-bold text-rose-700 mb-1">Task</h3>
              <p className="text-[var(--color-ash)]">
                What was your specific responsibility in that situation?
              </p>
            </div>
            <div className="bg-[var(--color-surface-soft)] p-3 rounded-xl border border-[var(--color-hairline-soft)]">
              <h3 className="font-bold text-rose-700 mb-1">Action</h3>
              <p className="text-[var(--color-ash)]">
                What specific steps did you take to resolve it?
              </p>
            </div>
            <div className="bg-[var(--color-surface-soft)] p-3 rounded-xl border border-[var(--color-hairline-soft)]">
              <h3 className="font-bold text-rose-700 mb-1">Result</h3>
              <p className="text-[var(--color-ash)]">
                What was the positive business or engineering outcome?
              </p>
            </div>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            2. Technical Preparation Checklist
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Ensure you have solid ground in key computer science foundations:
          </p>
          <ul className="list-disc pl-5 text-[var(--color-mute)] text-xs space-y-1.5">
            <li>
              <strong>Algorithms:</strong> Trees, Graphs, Dynamic Programming,
              Heap/Queue.
            </li>
            <li>
              <strong>System Design:</strong> Load Balancers, Caching (Redis),
              Sharding, Rate Limiting.
            </li>
            <li>
              <strong>Databases:</strong> SQL Join optimization, Indexing
              (B-Trees), Transaction isolation levels.
            </li>
            <li>
              <strong>CS Core:</strong> OOP principles, Operating Systems,
              Computer Networks (TCP/IP, HTTP/S).
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  'ats-best-practices': {
    category: 'Placement Resource',
    title: 'ATS Best Practices',
    subtitle:
      'A detailed checklist to optimize your resume files for automated parsing algorithms.',
    icon: <CheckSquare className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            1. Why ATS Matters
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Over 95% of Fortune 500 companies use Applicant Tracking Systems
            (ATS) to filter resumes before they reach human eyes. An
            unoptimized layout can result in automatic rejection due to parsing
            errors.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            2. Essential Optimization Rules
          </h2>
          <ul className="list-disc pl-5 text-[var(--color-mute)] text-xs space-y-2">
            <li>
              <strong>Use standard headings:</strong> Stick to simple section
              labels like &ldquo;Education&rdquo;, &ldquo;Experience&rdquo;,
              &ldquo;Projects&rdquo;, and &ldquo;Skills&rdquo;.
            </li>
            <li>
              <strong>Avoid tables and graphic vectors:</strong> Complex grid
              dividers, sidebars, charts, or images break standard text parsers.
            </li>
            <li>
              <strong>Choose compatible fonts:</strong> Use standard system
              fonts like Times-Roman, Helvetica, Arial, or Georgia.
            </li>
            <li>
              <strong>PDF or DOCX:</strong> Export as standard PDF to lock
              formatting, but ensure it contains extractable text (no scanned
              images/screenshots without OCR).
            </li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            3. Keywords Alignment
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            ATS engines grade resumes based on the density of matching keywords
            from the job description. Always mirror key terminology naturally in
            your skills and experience lists (e.g. if the JD asks for &ldquo;API
            design&rdquo;, do not just write &ldquo;REST backend&rdquo;).
          </p>
        </section>
      </div>
    ),
  },
  'api-docs': {
    category: 'Placement Resource',
    title: 'Developer API Documentation',
    subtitle:
      'Integrate ResumeFlow automated tailoring engines into your pipelines.',
    icon: <Terminal className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            1. Ingesting Job Descriptions
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Submit a job listing text or PDF storage ID to parse and extract
            hard skills, soft skills, and ATS keywords:
          </p>
          <pre className="bg-[var(--color-surface-dark)] text-[var(--color-ash)] p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
{`POST /api/v1/jobs/process
Headers: { "Authorization": "Bearer <YOUR_KEY>" }
Body:
{
  "companyName": "Google",
  "jobTitle": "L4 Frontend Engineer",
  "rawJdText": "We are looking for React, TypeScript, and state management experts..."
}`}
          </pre>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            2. Tailoring Response Schema
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            The API returns tailored JSON matching the candidate master profile
            layout:
          </p>
          <pre className="bg-[var(--color-surface-dark)] text-[var(--color-ash)] p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
{`{
  "structuredContent": {
    "personalInfo": { "name": "..." },
    "experience": [
      {
        "company": "...",
        "bullets": ["Optimized dashboard rendering using React code-splitting..."]
      }
    ]
  },
  "atsCompatibilityScore": 92
}`}
          </pre>
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
  const title =
    titleMeta[slug] || 'Resources — ResumeFlow AI Resume Builder';
  const description =
    descriptionMeta[slug] ||
    'Free resources to help you write better resumes, ace interviews, and optimize for ATS systems.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/resources/${slug}`,
    },
    alternates: {
      canonical: `${SITE_URL}/resources/${slug}`,
    },
  };
}

export default async function ResourceSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pageData = resourcesContent[slug];

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
