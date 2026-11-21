# ResumeFlow: Complete Recreated Architecture Specification

> **Version**: 2.5 (Production Release)  
> **Platform**: Next.js 15, React 19, TypeScript, Convex Cloud, Clerk Auth, Razorpay, WASM React-PDF & LaTeX  
> **Repository**: [ResumeFlow (Harshithk951/Resume-Flow)](https://github.com/Harshithk951/Resume-Flow)

---

## Table of Contents
1. [Executive Summary & High-Level Architecture](#1-executive-summary--high-level-architecture)
2. [Frontend Architecture & Screen Flows](#2-frontend-architecture--screen-flows)
3. [Backend API Routes & Serverless Microservices](#3-backend-api-routes--serverless-microservices)
4. [AI Tailoring Engine & Multi-Provider Router](#4-ai-tailoring-engine--multi-provider-router)
5. [Convex Reactive Real-Time Database Schema](#5-convex-reactive-real-time-database-schema)
6. [Dual PDF Compilation Pipeline (LaTeX & Client WASM)](#6-dual-pdf-compilation-pipeline-latex--client-wasm)
7. [Authentication, State & Onboarding Flow](#7-authentication-state--onboarding-flow)
8. [Monetization, Pricing & Razorpay Billing](#8-monetization-pricing--razorpay-billing)
9. [Genuine vs Hallucinated Logic (Integrity Audit)](#9-genuine-vs-hallucinated-logic-integrity-audit)
10. [Testing, CI/CD & Production Verification](#10-testing-cicd--production-verification)

---

## 1. Executive Summary & High-Level Architecture

ResumeFlow is an enterprise-grade AI resume engineering platform built to match modern applicant tracking systems (ATS) such as Greenhouse, Lever, Workday, Taleo, and iCIMS with 100% parse fidelity.

### Architectural Blueprint

```
+-----------------------------------------------------------------------------------+
|                                 USER BROWSER                                      |
+-----------------------------------------------------------------------------------+
       |                                      ^                               ^
       | HTTPS Request                        | PDF Download                  | Real-Time Sync
       v                                      v                               v
+-----------------------+           +--------------------+         +----------------+
|  Vercel Edge Network  |           | Client-Side WASM   |         | Convex Cloud   |
|  Next.js 15 AppRouter |           | React-PDF Compiler |         | WebSocket Bus  |
+-----------------------+           +--------------------+         +----------------+
       |                                      ^                            ^
       +--------------------+                 | Structured JSON            |
       | API Route Calls    |                 +----------------------------+
       v                    v                                              |
+----------------+  +-----------------+                                    |
| /api/parse-pdf |  | /api/compile    |                                    |
| Multi-Parser   |  | LaTeX Engine    |                                    |
+----------------+  +-----------------+                                    |
       |                    |                                              |
       v                    v                                              v
+-----------------------------------------------------------------------------------+
|                             CONVEX AI BACKEND ENGINE                             |
|  - Multi-Provider Model Router (Gemini 2.5, OpenRouter, Groq, NVIDIA NIM, OpenAI)|
|  - Google XYZ Experience Bullet Re-engineering & Keyword Lemmatization Engine     |
|  - Anti-Hallucination Guardrails & Anti-Fabrication Rule Engine                  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Frontend Architecture & Screen Flows

The frontend is built on **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, and **Framer Motion**. All legacy 3-step placement onboarding screens have been removed in favor of a direct-to-optimizer experience.

### 2.1 Screen 1: The Modern Public Landing Page
* **File Reference**: `app/page.tsx` & `components/Navbar.tsx`
* **Clean Light Navbar**: Left-aligned brand logo grouped directly with five navigation links (`Features`, `Templates`, `ATS Checker`, `Resources`, `Pricing`), eliminating floating center gaps. The right side features a single high-converting CTA button (`Get Started Free ->`) with a soft purple glow (`shadow-[0_4px_14px_rgba(91,80,230,0.35)]`).
* **Hero Section**: Clean white background (`bg-white`) with zero dark dividing borders. Headline: *"Your resume, ready for the role."* Features an interactive before/after bullet comparison selector (Data Analyst, Product Manager, Fresher) and a floating video player.
* **ATS Performance Stat Card**: Showcases ResumeFlow's verified performance benchmarks:
  * Primary metric: `94% Average ATS match`
  * Speed metric: `~27s optimize time`

### 2.2 Screen 2: Authentication & Transparent Cards
* **File Reference**: `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`, `proxy.ts`
* **Clerk Customization**: Suppressed all Clerk development mode badges, dev notices, and third-party footer watermarks. Card background set to transparent with custom Tailwind form controls.
* **Direct Routing**: Users logging in or signing up are routed directly to `/optimize`.

### 2.3 Screen 3: Resume Input & Configuration
* **File Reference**: `app/(app)/optimize/page.tsx`
* **Section 1 (Your Resume)**: Drag-and-drop or file upload for `.pdf` and `.tex`, plus raw text pasting. Features hyperlink preservation with counter badge (`✓ Found X links behind words in your PDF and kept them`).
* **Section 2 (The Job You Want)**: Paste raw job description text or submit a live job URL (fetched and parsed automatically via `/api/scrape-job`).
* **Section 3 (Anything We Can't See? - Optional)**: Freeform box for accomplishments not yet documented on the resume (e.g. *“Migrated database to Snowflake saving ₹18L/yr”*).
* **Section 4 (Output Length)**: Length picker: `Auto-detect`, `1 page`, `2 pages`, or `Academic CV`.

### 2.4 Screen 4: Animated Circular Evaluation Screen
* **File Reference**: `app/(app)/optimize/page.tsx`
* Animated circular SVG meter displaying completion percentage (10% -> 100%) and estimated time remaining (`~28s left`), stepping through 7 distinct phases:
  1. Reading your resume
  2. Parsing the job description
  3. Finding your strongest stories
  4. Rewriting your experience section
  5. Aligning to ATS keywords
  6. Polishing the output
  7. Almost ready

### 2.5 Screen 5: "One Quick Thing" Interactive Questionnaire
* **File Reference**: `app/(app)/optimize/page.tsx`
* Triggered dynamically when the AI detects high-potential bullets lacking quantifiable metrics (e.g. *“For the AgentForensics project on 20 synthetic agent sessions, what was the measured detection rate or precision — can you quantify the result?”*).
* Users can input real metrics before final rendering, skip the question, or skip all questions.

### 2.6 Screen 6: Results & Optimization Dashboard (6 Integrated Tabs)
* **File Reference**: `app/(app)/optimize/page.tsx`
* **Top Bar**: Highlights score improvements (e.g. `Score improved 55% -> 69% (+14 points)`), target company/role, `+ Add to job tracker`, and `Share result`.
* **Tab 1 - Resume**:
  * Action controls: `Preview`, `Raw text [POWER]`, `Links as names` toggle, `Copy`, `Download PDF`, and `Word (paid)`.
  * Right column: ATS Match Gauge and "Share your win" viral sharing card (LinkedIn, WhatsApp, Copy link).
* **Tab 2 - What Changed**:
  * Metrics: `Keywords present`, `Bullets rewritten`, `Skills matched`.
  * `Keywords we added`: Pill tags showing integrated terms.
  * `Wanted by the job, not added`: High-value missing keywords with `+1` score impact badges and `[POWER] Copy` buttons. Users can tick "I have this" to dynamically re-evaluate.
* **Tab 3 - Score Breakdown**: Complete audit covering Keyword Density, Action Verb Quality, Impact Quantification, and Section Formatting.
* **Tab 4 - Skill Roadmap**: Prioritized learning path, recommended open-source projects, and technical skills needed to bridge gaps.
* **Tab 5 - Cover Letter**: AI-tailored cover letter mapping existing candidate experience to target requirements.
* **Tab 6 - Application Kit**: Recruiter cold email templates, LinkedIn connection notes, and custom interview talking points.

---

## 3. Backend API Routes & Serverless Microservices

### 3.1 Robust Multi-Strategy PDF Parser (`/api/parse-resume`)
* **File Reference**: `app/api/parse-resume/route.ts`
* Overcomes corrupted text layers, unusual font encodings, and missing spaces through a 3-tier cascade:
  1. **Primary**: `pdfjs-dist/legacy/build/pdf.mjs` with Y-axis coordinate tracking (`abs(item.transform[5] - lastY) > 2`) to preserve exact layout and paragraph breaks.
  2. **Secondary Fallback**: `pdf-parse` v2 stream parsing.
  3. **Tertiary Fallback**: `@cedrugs/pdf-parse`.
  4. **Direct Regex Link Extractor**: Scans raw binary streams for `/URI` and `/Annot` dictionaries to extract hyperlinks embedded behind anchor text.
  5. **Client-Side Fallback**: In-browser client fallback using `pdfjs-dist` inside `app/(app)/optimize/page.tsx`.

### 3.2 Live Job Post Scraper (`/api/scrape-job`)
* **File Reference**: `app/api/scrape-job/route.ts`
* Fetches job descriptions directly from job board URLs, stripping navigational boilerplate and preserving core requirements.

### 3.3 Server LaTeX Compilation Service (`/api/compile-latex`)
* **File Reference**: `app/api/compile-latex/route.ts`
* Compiles `.tex` source into publication-quality PDFs using `pdflatex` / `xelatex` container workers.

### 3.4 Payment & Subscription Gateway (`/api/razorpay`)
* **File Reference**: `app/api/razorpay/create-order/route.ts` & `app/api/razorpay/verify-payment/route.ts`
* Handles cryptographic HMAC-SHA256 signature verification, credit top-ups, and subscription provisioning.

---

## 4. AI Tailoring Engine & Multi-Provider Router

* **Directory**: `convex/ai/`
* **Core Components**:
  * `modelRouter.ts`: Multi-provider fallback engine (Gemini 2.5, OpenRouter, Groq Llama-3.3-70B, NVIDIA NIM, OpenAI GPT-4o) with automatic circuit breaking.
  * `tailorResume.ts`: Applies the Google XYZ formula: *"Accomplished [X] as measured by [Y], by doing [Z]"*. Integrates target job keywords without hallucination.
  * `extractResume.ts`: Deconstructs resume text into structured JSON across 7 standardized sections.
  * `jobCheck.ts`: Evaluates job-to-resume compatibility before tailoring.
  * `jsonSanitizer.ts`: Corrects incomplete or malformed JSON streams before writing to Convex.

---

## 5. Convex Reactive Real-Time Database Schema

* **File Reference**: `convex/schema.ts`

```typescript
export default defineSchema({
  // 1. Users Collection
  users: defineTable({
    clerkId: v.string(),
    tenantId: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    credits: v.number(),
    plan: v.optional(v.union(
      v.literal("free"),
      v.literal("pro_pass"),
      v.literal("pro"),
      v.literal("power"),
      v.literal("team"),
      v.literal("campus")
    )),
    freeOptimizationsUsed: v.optional(v.number()),
    passExpiresAt: v.optional(v.number()),
    teamWalletBalance: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
  }).index("by_clerkId", ["clerkId"]).index("by_tenantId", ["tenantId"]),

  // 2. Canonical Master Profiles
  masterProfiles: defineTable({
    userId: v.id("users"),
    tenantId: v.optional(v.string()),
    extractionStatus: v.string(),
    branch: v.optional(v.string()),
    cgpa: v.optional(v.float64()),
    personalInfo: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      backlogs: v.optional(v.number()),
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      portfolio: v.optional(v.string()),
    }),
    education: v.array(v.any()),
    experience: v.array(v.any()),
    projects: v.array(v.any()),
    skills: v.any(),
    certifications: v.optional(v.array(v.any())),
    achievements: v.optional(v.array(v.any())),
    rawResumeStorageId: v.optional(v.id("_storage")),
    pipelineError: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  // 3. Target Jobs & Job Tracker CRM
  jobs: defineTable({
    userId: v.id("users"),
    tenantId: v.optional(v.string()),
    companyName: v.string(),
    jobTitle: v.string(),
    rawJdText: v.string(),
    inputType: v.optional(v.union(v.literal("text"), v.literal("screenshot"), v.literal("pdf"))),
    pipelineState: v.string(),
    extractedRequirements: v.optional(v.any()),
    skillGapQuestions: v.optional(v.any()),
    crmStatus: v.optional(v.union(
      v.literal("Saved"),
      v.literal("Applied"),
      v.literal("Interviewing"),
      v.literal("Offered"),
      v.literal("Rejected")
    )),
    statusHistory: v.optional(v.array(v.object({
      oldStatus: v.string(),
      newStatus: v.string(),
      updatedBy: v.union(v.literal("user"), v.literal("automation_bridge")),
      timestamp: v.number(),
    }))),
    url: v.optional(v.string()),
    matchScore: v.optional(v.number()),
  }).index("by_userId", ["userId"]).index("by_tenantId_crmStatus", ["tenantId", "crmStatus"]),

  // 4. Tailored Resumes
  tailoredResumes: defineTable({
    userId: v.id("users"),
    jobId: v.id("jobs"),
    structuredContent: v.any(),
    template: v.optional(v.string()),
    latexSnapshot: v.optional(v.string()),
    pdfStorageId: v.optional(v.id("_storage")),
    docxStorageId: v.optional(v.id("_storage")),
    atsCompatibilityScore: v.optional(v.number()),
    diffNotes: v.optional(v.array(v.string())),
    coverLetter: v.optional(v.string()),
    outreachNotes: v.optional(v.string()),
    version: v.number(),
  }).index("by_jobId", ["jobId"]).index("by_userId", ["userId"]),

  // 5. Saved Resumes Library
  savedResumes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    sections: v.optional(v.any()),
    rawText: v.optional(v.string()),
    fileStorageId: v.optional(v.id("_storage")),
    template: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
```

---

## 6. Dual PDF Compilation Pipeline (LaTeX & Client WASM)

To eliminate broken columns and parsing errors, all competing templates were replaced with a unified, single-column ATS master template.

### 6.1 Client-Side WASM React-PDF (`AtsStrictPdf.tsx`)
* **File Reference**: `lib/pdf/compiler.ts` & `lib/pdf/templates/AtsStrictPdf.tsx`
* Direct client-side generation using `@react-pdf/renderer` with zero server timeout risk.
* **Layout Specifications**:
  * 0.5 in margins (`36pt`) across all sides.
  * Standard Serif typography (`Times-Roman`, `Times-Bold`, `Times-Italic`).
  * Centered applicant header with bullet-separated contact points and clickable hyperlinks.
  * Section titles rendered in letterspaced small-caps with horizontal dividing lines (`borderBottomWidth: 0.75`).
  * Bold title/role, italicized employer/institution, right-aligned dates.

### 6.2 Publication LaTeX Template (`ats-master-template.tex`)
* **File Reference**: `lib/latex/ats-master-template.tex`
* Generates source `.tex` and `.pdf` files utilizing standard packages (`hyperref`, `titlesec`, `geometry`).

---

## 7. Authentication, State & Onboarding Flow

* **Clerk + Convex JWT Synchronization**: Configured via `ConvexClerkProvider.tsx`.
* **Zero Legacy Onboarding Friction**: Legacy onboarding guards were completely removed. Login and registration links redirect directly to `/optimize`.

---

## 8. Monetization, Pricing & Razorpay Billing

* **File Reference**: `app/pricing/page.tsx` & `components/RazorpayCheckout.tsx`
* **Free Plan**: 2 complete optimizations included for all users with no credit card required. Free PDF downloads forever.
* **Pro 30-Day Pass (₹249)**: Marked as **Coming Soon** with a disabled action button.
* **Team Plan (₹500 min top-up)**: Marked as **Coming Soon** with a disabled action button.

---

## 9. Genuine vs Hallucinated Logic (Integrity Audit)

1. **Keyword Detection vs Hallucination**: Skills already present in the uploaded resume are preserved and matched. Missing skills are categorized under *"Wanted by the job, not added"*; they are never fabricated into the candidate's work history.
2. **Quantified Bullet Rewrites**: Bullets are rephrased using the Google XYZ structure based solely on supplied experience. If a metric is missing, the platform prompts the user via the *"One quick thing"* screen rather than generating fake statistics.

---

## 10. Testing, CI/CD & Production Verification

* **TypeScript Compilation**: `npx tsc --noEmit` validates with **0 errors**.
* **Test Suite**: `npx vitest run` passes **13/13 tests** (`lib/quality/quality.test.ts` & `lib/quality/blogData.test.ts`).
* **Deployment**: Live on Vercel from branch `main`.
