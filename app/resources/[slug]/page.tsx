import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { StaticPageWrapper } from '@/components/StaticPageWrapper';
import { BookOpen, HelpCircle, CheckSquare, Terminal } from 'lucide-react';

const SITE_URL = 'https://resumeflow.harshithkumar.in';

interface ContentBlock {
  title: string;
  subtitle: string;
  category: string;
  icon: ReactNode;
  body: ReactNode;
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
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            The XYZ formula was popularized by Google&apos;s internal resume review guidelines and is now widely adopted across the tech industry. It forces you to quantify your impact rather than simply listing responsibilities. Every bullet point on your resume should answer three questions: What did you accomplish? How did you measure success? What specific actions did you take? This structure gives hiring managers and ATS algorithms concrete evidence of your capabilities rather than vague descriptions of job duties.
          </p>
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
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Beyond these basics, maintain consistent spacing between sections, use a font size between 10 and 12 points for body text, and keep section headings at 14 to 16 points. Your name should be the largest element on the page at 18 to 24 points. Avoid using header and footer regions in document editors, as ATS parsers often skip content placed in these areas entirely. Stick to a chronological or hybrid format — functional resumes that hide employment timelines are strongly flagged by ATS algorithms as potential attempt to conceal employment gaps.
          </p>
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
            <div className="bg-[var(--color-surface-soft)] p-3 rounded-lg border border-[var(--color-hairline-soft)]">
              <p className="font-bold text-rose-700 mb-1">
                Analysis & Strategy
              </p>
              <p className="text-[var(--color-ash)]">
                Analyzed, Evaluated, Identified, Forecasted, Prioritized, Modeled.
              </p>
            </div>
            <div className="bg-[var(--color-surface-soft)] p-3 rounded-lg border border-[var(--color-hairline-soft)]">
              <p className="font-bold text-rose-700 mb-1">
                Communication & Collaboration
              </p>
              <p className="text-[var(--color-ash)]">
                Presented, Facilitated, Mediated, Authored, Coordinated, Advised.
              </p>
            </div>
          </div>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Avoid weak verbs like &ldquo;Was responsible for,&rdquo; &ldquo;Helped with,&rdquo; &ldquo;Worked on,&rdquo; or &ldquo;Participated in.&rdquo; These phrases dilute your impact and fail to communicate ownership. Each bullet should start with a powerful verb that immediately signals your direct contribution to the outcome.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            4. Quantifying Impact with Metrics
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Numbers are the single strongest signal you can include on a resume. Whenever possible, attach concrete metrics to your achievements. Common dimensions include: percentage improvements in performance or efficiency, absolute counts of users, customers, or transactions affected, revenue generated or costs saved measured in currency, time saved measured in hours or days per cycle, and scale of systems managed (servers, databases, codebases in LOC).
          </p>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            For software engineering roles, prioritize metrics that demonstrate technical impact: reduced page load times, increased test coverage percentages, decreased error rates in production, throughput improvements in data pipelines, and uptime or availability percentages for critical services. If you don&apos;t have access to exact numbers, research industry benchmarks and use conservative estimates clearly marked with &ldquo;approximately&rdquo; or &ldquo;~.&rdquo;
          </p>
          <div className="bg-[var(--color-surface-soft)] border border-[var(--color-hairline)]/50 p-4 rounded-xl text-xs space-y-2">
            <p className="text-[var(--color-ink-soft)]">
              <span className="text-green-600 font-bold">Example:</span> Reduced API response time by 42% (from 320ms to 185ms) by introducing Redis caching and optimizing N+1 database queries, serving 2.8M daily active users.
            </p>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            5. ATS-Compatible Formatting Guide
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Applicant Tracking Systems parse resumes by extracting text from the file and matching it against job requirements. To ensure your resume parses correctly: use standard section headings (Education, Experience, Skills, Projects, Certifications), avoid text boxes, tables, columns, and floating elements that confuse parsers, embed all fonts in your PDF to prevent rendering discrepancies, save your final file as PDF/A format for maximum compatibility, and name your file professionally (FirstName_LastName_Resume_Company.pdf rather than resume_final_v3.pdf).
          </p>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            ResumeFlow&apos;s default ATS Strict template automatically handles all of these requirements. The LaTeX compiler ensures single-column flow, standard font embedding, and precise margin control that passes parsing audits for Greenhouse, Lever, Workday, Taleo, and SmartRecruiters.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            6. Common Resume Mistakes to Avoid
          </h2>
          <ul className="list-disc pl-5 text-[var(--color-mute)] text-xs space-y-2">
            <li><strong>Including a photo or headshot:</strong> In most countries outside of parts of Europe and Asia, photos on resumes lead to immediate rejection due to anti-discrimination hiring policies.</li>
            <li><strong>Listing references or &ldquo;References available upon request&rdquo;:</strong> This wastes valuable space. Hiring managers know to request references when needed.</li>
            <li><strong>Using jargon or acronyms without expansion:</strong> Spell out abbreviations at least once — the ATS or recruiter may not recognize team-specific acronyms.</li>
            <li><strong>Including outdated technologies:</strong> If you haven&apos;t used a technology in over 5 years and it&apos;s not relevant to the target role, remove it to keep your skills section focused.</li>
            <li><strong>Submitting in editable formats:</strong> Never send .docx or .pages files. These formats render differently across operating systems and can have formatting stripped by ATS ingestion pipelines.</li>
            <li><strong>Using creative fonts or decorative elements:</strong> Stick to professional fonts like Times New Roman, Helvetica, Arial, Calibri, or Georgia. Fancy scripts and decorative fonts are stripped or garbled by parsers.</li>
          </ul>
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
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Prepare at least 5 STAR stories covering key competencies: leadership, conflict resolution, technical problem-solving, failure and learning, and cross-functional collaboration. Each story should take approximately 90 seconds to deliver. Practice them aloud until they feel natural — avoid memorizing scripts, as interviewers can detect canned responses. Instead, internalize the structure and adapt the language to each specific question.
          </p>
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
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            For coding interviews, practice on platforms like LeetCode, HackerRank, or AlgoExpert targeting the &ldquo;Medium&rdquo; difficulty tier. Focus on patterns rather than memorizing solutions: Sliding Window, Two Pointers, BFS/DFS, Topological Sort, Union-Find, and Trie-based approaches. During the interview, always clarify the problem with examples before writing code. Communicate your thought process out loud — interviewers evaluate your problem-solving approach as much as your final solution. After coding, test your solution with edge cases (empty inputs, large values, duplicate entries) and discuss time and space complexity trade-offs unprompted.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            3. Behavioral Question Bank
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Prepare structured responses for these frequently asked behavioral questions. Map each question to a STAR story from your career:
          </p>
          <ul className="list-disc pl-5 text-[var(--color-mute)] text-xs space-y-2">
            <li><strong>&ldquo;Tell me about a time you disagreed with a teammate or manager.&rdquo;</strong> Focus on respectful communication and finding common ground. Emphasize how you presented data-driven alternatives rather than emotional arguments.</li>
            <li><strong>&ldquo;Describe a project that failed. What did you learn?&rdquo;</strong> Be honest about the failure but quickly pivot to lessons learned and how you applied those lessons in subsequent work. Avoid blaming teammates or external factors.</li>
            <li><strong>&ldquo;Give an example of a time you led a team through a complex technical challenge.&rdquo;</strong> Highlight how you broke down the problem, delegated effectively, and maintained team morale under pressure.</li>
            <li><strong>&ldquo;How do you handle tight deadlines with competing priorities?&rdquo;</strong> Demonstrate your ability to triage, communicate trade-offs to stakeholders, and maintain code quality under time constraints.</li>
            <li><strong>&ldquo;Tell me about a time you went above and beyond your job description.&rdquo;</strong> Show initiative and ownership — describe a situation where you identified an unaddressed problem and took action without being asked.</li>
          </ul>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            For each question, keep your response concise: set the situation in 15 seconds, describe the task in 10 seconds, spend 30 seconds on your actions, and close with 20 seconds on the measurable result. This 75-second rhythm keeps interviewers engaged and gives them time to ask follow-ups.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            4. Portfolio and Work Sample Strategy
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            For engineering roles, a well-organized portfolio can significantly strengthen your application. Focus on quality over quantity — three strong projects with clear technical depth are more impressive than ten shallow ones. For each project in your portfolio, prepare to discuss: the architecture decisions you made and why, the trade-offs you considered, specific technical challenges you overcame, the impact or results achieved, and what you would do differently with hindsight.
          </p>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Host your portfolio on GitHub with well-structured README files that include setup instructions, architecture diagrams, and live demo links. Clean code, meaningful commit messages, and CI/CD badges signal engineering professionalism. If your work is proprietary or under NDA, prepare a &ldquo;sanitized&rdquo; version that describes the problem, your approach, and the outcomes without revealing confidential details.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            5. Mock Interview Schedule
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Treat your interview preparation as a structured curriculum. A recommended 4-week schedule: Week 1 focuses on algorithm patterns and daily LeetCode practice (2 problems per day). Week 2 adds system design study using resources like &ldquo;Designing Data-Intensive Applications&rdquo; and mock design sessions. Week 3 integrates behavioral story refinement and full-length mock interviews with peers or platforms like Pramp. Week 4 is dedicated to targeted preparation for your specific target companies, reviewing their engineering blogs, common question patterns, and cultural values.
          </p>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Record your mock sessions to identify verbal tics, pacing issues, and areas where your explanations lack clarity. Aim for at least 5 full mock interviews before your first real on-site. Each mock should simulate real conditions including time pressure, whiteboard coding (or shared editor), and the expectation to verbalize your thought process throughout.
          </p>
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
            errors. Common ATS platforms include Greenhouse, Lever, Workday,
            Taleo, SmartRecruiters, iCIMS, and JazzHR. Each platform parses
            resumes slightly differently, but they all share a common weakness:
            they extract text linearly, top-to-bottom, left-to-right. Any
            deviation from this flow — such as multi-column layouts, text
            boxes, or floating graphics — can cause content to be misread,
            skipped, or assigned to the wrong section.
          </p>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            The financial impact of poor ATS optimization is substantial. Studies by hiring analytics firms show that over 75% of qualified candidates are rejected by ATS filters before a recruiter ever reviews their application. A resume that fails to parse correctly has a near-zero chance of advancing in the pipeline, regardless of the candidate&apos;s qualifications.
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
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Beyond these basics, ensure your PDF is not password-protected or encrypted. ATS systems cannot process protected files and will silently skip them. Similarly, avoid embedding multimedia elements like hyperlinks that require interaction — while hyperlinks are fine in theory, some ATS platforms strip all link formatting, leaving behind garbled URL text that clutters your parsed content.
          </p>
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
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            To optimize keyword alignment: extract 15-20 key terms from the job description before writing your resume, ensure each keyword appears at least twice in relevant context (skills section + experience bullet), use both acronyms and full forms (&ldquo;AWS (Amazon Web Services)&rdquo;), include industry-specific tools and frameworks even if they seem obvious, and avoid keyword stuffing — modern ATS platforms detect unnatural keyword density and may flag your resume as spam. ResumeFlow&apos;s AI tailoring engine handles keyword matching automatically, analyzing the job description against your master profile and selecting the most relevant terms for the targeted version.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            4. Section Naming Conventions That Parse Correctly
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            ATS parsers identify sections by looking for common header keywords. Using non-standard section names can cause content to be miscategorized or dropped entirely. Recommended section headers:
          </p>
          <ul className="list-disc pl-5 text-[var(--color-mute)] text-xs space-y-2">
            <li><strong>Experience / Work Experience / Professional Experience:</strong> Acceptable variations. Avoid &ldquo;Career History,&rdquo; &ldquo;Employment Timeline,&rdquo; or &ldquo;Where I&apos;ve Worked.&rdquo;</li>
            <li><strong>Education / Academic Background:</strong> Standard and universally parsed. Avoid &ldquo;Schooling&rdquo; or &ldquo;Qualifications.&rdquo;</li>
            <li><strong>Skills / Technical Skills / Core Competencies:</strong> All three are well-recognized. Avoid &ldquo;What I Know&rdquo; or &ldquo;Toolbox.&rdquo;</li>
            <li><strong>Projects / Key Projects / Personal Projects:</strong> Standard. Avoid &ldquo;Side Work&rdquo; or &ldquo;Hobby Projects.&rdquo;</li>
            <li><strong>Certifications / Certificates:</strong> Include relevant professional certifications. Avoid &ldquo;Badges&rdquo; or &ldquo;Accolades.&rdquo;</li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            5. File Naming and Submission Best Practices
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Your resume file name is the first piece of information a recruiter sees. Follow these naming conventions to project professionalism: use your full name (e.g., &ldquo;Priya_Sharma_Resume_Google.pdf&rdquo;), avoid generic names like &ldquo;resume.pdf&rdquo; or &ldquo;my_CV_final_v3.pdf,&rdquo; include the target company name when applying to specific roles, use underscores or hyphens instead of spaces, and keep the file name under 50 characters. When submitting through online portals, always double-check that the uploaded file rendered correctly. Some portals support preview — use it to verify formatting integrity before final submission.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            6. Common ATS Parsing Errors and Fixes
          </h2>
          <ul className="list-disc pl-5 text-[var(--color-mute)] text-xs space-y-2">
            <li><strong>Scrambled text order:</strong> Caused by multi-column layouts or text boxes. Fix: Use single-column flow with consistent left alignment.</li>
            <li><strong>Missing contact information:</strong> Phone numbers or email addresses not extracted. Fix: Place contact details in a single line at the very top of the document. Avoid placing them in headers or footers.</li>
            <li><strong>Dates not recognized:</strong> Parsers expect consistent date formats. Fix: Use a uniform format throughout (e.g., &ldquo;Jun 2020 &ndash; Aug 2022&rdquo;). Avoid relative dates like &ldquo;Present.&rdquo;</li>
            <li><strong>Skills merged into paragraphs:</strong> Skills listed inline within descriptions are harder to extract. Fix: Maintain a dedicated skills section with comma-separated or bullet-pointed technologies.</li>
            <li><strong>Special characters causing truncation:</strong> Bullet characters (&bull;), arrows (&rarr;), and emojis can break parsers. Fix: Use standard hyphens (-), asterisks (*), or numbered lists.</li>
          </ul>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            ResumeFlow&apos;s ATS Strict template is specifically engineered to avoid all of these common parsing errors. The LaTeX compilation engine produces a clean, linear text flow that major ATS platforms parse with near-perfect accuracy. After compiling your resume, you can use our built-in ATS audit feature to test how your document will appear after parsing.
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
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            The job description ingestion endpoint accepts both raw text input and references to previously uploaded PDF documents. When submitting a PDF, the system extracts text using OCR and natural language processing before beginning the skill extraction pipeline. The response includes extracted hard skills, soft skills, required experience levels, and an ATS keyword density map that shows which terms from the JD appear most frequently.
          </p>
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
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            The tailoring response includes not only the rewritten resume content but also metadata about the tailoring process: which sections were modified, what skill gaps were identified, and a comparison score between the original profile and the tailored version. The ATS compatibility score ranges from 0 to 100 and reflects how well the tailored content aligns with the extracted keywords from the job description.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            3. Authentication and Rate Limiting
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            All API requests require authentication via Bearer token in the Authorization header. Tokens are issued per user account and can be generated from the API Settings page in your dashboard. Each token carries the same quota limits as your account tier. Free tier accounts are limited to 50 API requests per 24-hour rolling window. Pro and Campus accounts have significantly higher limits with burst capacity for batch processing.
          </p>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Rate limiting is enforced using a sliding window algorithm. The response headers include X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset Unix timestamp fields. When you exceed your rate limit, the API returns HTTP 429 (Too Many Requests) with a Retry-After header indicating when you can resume. Implement exponential backoff in your integration to handle rate limits gracefully.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            4. Webhook Integration for Real-Time Updates
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            ResumeFlow supports webhook callbacks for asynchronous job processing. When you submit a tailoring request, the system immediately returns a job ID and processes the request in the background. Once processing completes, the system sends a POST request to your configured webhook URL with the full tailoring response payload.
          </p>
          <pre className="bg-[var(--color-surface-dark)] text-[var(--color-ash)] p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
{`// Webhook payload example
{
  "jobId": "job_abc123",
  "status": "completed",
  "payload": {
    "structuredContent": { /* tailored resume */ },
    "atsCompatibilityScore": 94,
    "processingTimeMs": 2847
  }
}`}
          </pre>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            Configure webhook endpoints in your dashboard settings. We support retry logic for failed deliveries: if your endpoint returns a non-2xx status code, we retry up to 3 times with exponential backoff (10s, 60s, 300s). Webhook payloads are signed with an HMAC-SHA256 signature sent in the X-Signature header so you can verify the authenticity of incoming callbacks.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">
            5. Error Handling and Best Practices
          </h2>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            The API uses conventional HTTP response codes to indicate success and failure. 200-level responses indicate successful processing. 400-level errors indicate client-side issues such as invalid input format, missing required fields, or authentication failures. 500-level errors indicate server-side issues — implement retry logic with backoff for these cases.
          </p>
          <ul className="list-disc pl-5 text-[var(--color-mute)] text-xs space-y-2">
            <li><strong>400 Bad Request:</strong> Invalid JSON payload or missing required fields. Check your request structure against the schema documentation.</li>
            <li><strong>401 Unauthorized:</strong> Missing or invalid authentication token. Verify your Bearer token is current and correctly formatted.</li>
            <li><strong>402 Payment Required:</strong> Account quota exhausted. Upgrade your plan or wait for quota reset at midnight UTC.</li>
            <li><strong>429 Too Many Requests:</strong> Rate limit exceeded. Check Retry-After header and implement backoff.</li>
            <li><strong>5xx Server Errors:</strong> Temporary server issues. Retry with exponential backoff starting at 5 seconds, doubling up to a maximum of 300 seconds.</li>
          </ul>
          <p className="text-[var(--color-mute)] text-sm leading-relaxed">
            For production integrations, implement idempotency keys for critical operations to prevent duplicate processing in case of network retries. Send an Idempotency-Key header with a unique UUID for each request — if the same key is received within 24 hours, the system returns the cached response from the original request rather than processing a duplicate.
          </p>
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
