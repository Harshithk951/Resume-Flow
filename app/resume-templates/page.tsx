"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Download, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function ResumeTemplatesPage() {
  const [activePage, setActivePage] = useState<1 | 2>(1);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/templates/master-ats-resume-template.pdf";
    link.download = "master-ats-resume-template.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded master ATS resume template PDF");
  };

  const handleCopyText = () => {
    const text = `HARSHITH KUMAR MANNEPALLI
+91-8977795636 · mharshithkumar6@gmail.com · LinkedIn · GitHub · Portfolio · Dehradun, India

PROFESSIONAL SUMMARY
B.Tech Computer Science (AI & Machine Learning) student seeking a Research Intern role in AI and Quantum Algorithms at IBM Research India. Strong Python foundation with two IEEE conference papers in machine learning, hands-on work building LLM agents, evaluation frameworks, and safety layers with LangGraph and MCP, and 5 pull requests merged into Cal.com and freeCodeCamp.

EXPERIENCE
Open Source Contributor | Cal.com & freeCodeCamp | March 2026 – Present
• Shipped a fix for a Day.js UTC/timezone plugin load-order bug on Cal.com, a platform used by 50k+ teams, after tracing the root cause and verifying it with cross-browser testing.
• Merged 5 pull requests across Cal.com (github.com/calcom/cal.com) and freeCodeCamp (github.com/freeCodeCamp/freeCodeCamp) after maintainer code review.
• Built automated file-structure validation with unit tests for freeCodeCamp workshops and added test coverage for a high-contrast navbar fix.

PROJECTS
RecoveryOS: Guardrailed AI Decision System | TypeScript, Node.js, SQLite, Docker | GitHub
• Designed an AI-driven revenue-recovery system in which AI suggestions pass through a rule-based safety layer (risk limits, retry budgets, cooldowns, kill-switch) before any action is taken.
• Recovered 20,726 extra across 135 failed-payment test cases with zero unsafe actions and zero duplicate executions, using idempotent execution, a reconciliation ledger, and an append-only audit trail.
• Ran controlled, seeded simulations for reproducible results, with 232/232 unit tests and 36/36 validation checks passing in automated release checks.

AgentForensics | Python, LangGraph, MCP | Paper in preparation
• Designed a digital forensics framework for MCP-connected multi-agent systems with four components: EvidenceCollector, ProvenanceGraphBuilder, EscalationDetector, and ForensicReporter.
• Evaluated a LangGraph prototype with two MCP tool servers on 20 synthetic agent sessions to analyse agent behaviour: flagged 17/20 escalation events with 0 false positives, reaching 91.3% precision; manuscript drafted for an IEEE conference; open-source (Apache 2.0) release planned.

Smart Sales Intelligence Agent | Python, FastAPI, LangGraph | GitHub
• Built a modular 4-stage multi-agent workflow (Orchestrator → Research → Analysis → Outreach), tracking latency, errors, and usage for each stage.
• Added real-time execution timelines so every agent run can be traced and debugged.

RESEARCH & PUBLICATIONS
• IEEE Conference Paper: Catastrophic Forgetting Prevention in Federated Learning Using EWC for Edge Intelligence, 93.1% accuracy. IEEE Xplore
• IEEE Conference Paper: AgriCogNet: Explainable Ensemble Learning for Cognitive Fatigue Detection in Indian Agricultural Workers, 91.3% accuracy. IEEE Xplore
• Hackathons & Programs: Smart India Hackathon internal round; built and deployed two applications in 24 hours at the Lakshyagriha Global Hackathon, Dev Bhoomi University; completed GirlScript Summer of Code (GSSoC).

EDUCATION
Bachelor of Technology in Computer Science (AI & Machine Learning) | Uttaranchal University, Dehradun, India | Expected May 2027

SKILLS
Languages: Python, TypeScript, SQL
AI & Machine Learning: Machine Learning, Deep Learning, Neural Networks, NLP, Federated Learning, Ensemble Learning, Model Evaluation, Reproducible Experiments
LLMs & Agents: LLM APIs, AI Agents, RAG, LangGraph, Model Context Protocol (MCP), Tool Calling
AI Safety & Security: Guardrails, Audit Trails, MCP Security, Agent Forensics
MLOps & Deployment: FastAPI, Docker, Kubernetes, CI/CD, Git/GitHub, Microsoft Azure, Microsoft Foundry
Tools & Libraries: VS Code, Jupyter Notebooks, PyTorch, NumPy, Pandas, Data Structures and Algorithms

CERTIFICATIONS
• Oracle Cloud Infrastructure Generative AI Professional, Oracle, 2025 (ID: 322494826OCI25GAIOCP)
• AWS Solutions Architecture, Amazon Web Services`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Master template text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-[#5B50E6]/10 selection:text-[#5B50E6]">
      <Navbar />

      <main className="flex-1">
        {/* ─── HERO HEADER ────────────────────────────────────────── */}
        <div className="relative overflow-hidden pt-12 pb-10 sm:pt-16 sm:pb-14 border-b border-slate-100">
          <div
            className="absolute top-0 right-0 w-[420px] h-[340px] bg-[#F4F1FD] rounded-full blur-3xl opacity-75 pointer-events-none -mr-20 -mt-10"
            aria-hidden="true"
          />

          <div className="max-w-[1280px] mx-auto px-6 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5B50E6]/10 text-[#5B50E6] text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>THE SINGLE ATS MASTER STANDARD</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              The Only Resume Template You Need <br className="hidden sm:inline" />
              <span className="text-[#5B50E6]">— 100% ATS-Safe, Proven by 50k+ Hires</span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              We deliberately do not offer 2-column or graphic-heavy templates. Over 75% of enterprise Applicant Tracking Systems (Workday, Taleo, Greenhouse, Lever) scramble multi-column layouts or drop candidate skills entirely. ResumeFlow unifies on this single Harvard/HireRaft ATS Master Template — and dynamically tailors your details into it when compiling.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/optimize"
                className="py-2.5 px-5 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Optimize My Resume With This Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleDownload}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Download Master PDF</span>
              </button>
              <button
                type="button"
                onClick={handleCopyText}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-500" />
                )}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── LIVE 2-PAGE MASTER TEMPLATE PREVIEW ─────────────────── */}
        <div className="max-w-[1280px] mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: The Interactive Document */}
            <div className="lg:col-span-8 flex flex-col items-center">
              {/* Page Selector Tabs */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setActivePage(1)}
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activePage === 1
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Page 1: Summary, Experience & Projects
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage(2)}
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activePage === 2
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Page 2: Research, Education & Skills
                </button>
              </div>

              {/* Master Document Paper (A4 aspect) */}
              <div className="w-full max-w-[760px] bg-white rounded-2xl border border-slate-200/90 shadow-lg p-8 sm:p-14 text-slate-950 font-serif text-[10pt] leading-[1.4] space-y-5">
                {activePage === 1 ? (
                  <>
                    {/* Header */}
                    <div className="text-center space-y-1 pb-1">
                      <h2 className="text-2xl sm:text-[22pt] font-bold uppercase tracking-normal text-black font-serif">
                        HARSHITH KUMAR MANNEPALLI
                      </h2>
                      <p className="text-[8.5pt] text-slate-700 font-sans tracking-wide">
                        +91-8977795636 &nbsp;·&nbsp; mharshithkumar6@gmail.com &nbsp;·&nbsp; LinkedIn &nbsp;·&nbsp; GitHub &nbsp;·&nbsp; Portfolio &nbsp;·&nbsp; Dehradun, India
                      </p>
                    </div>

                    {/* 1. PROFESSIONAL SUMMARY */}
                    <div className="space-y-1">
                      <h3 className="font-sans text-[8pt] font-bold uppercase tracking-[0.18em] text-black border-b border-black pb-0.5">
                        PROFESSIONAL SUMMARY
                      </h3>
                      <p className="text-slate-900 text-[9.5pt] leading-relaxed text-justify pt-0.5">
                        B.Tech Computer Science (AI & Machine Learning) student seeking a Research Intern role in AI and Quantum Algorithms at IBM Research India. Strong Python foundation with two IEEE conference papers in machine learning, hands-on work building LLM agents, evaluation frameworks, and safety layers with LangGraph and MCP, and 5 pull requests merged into Cal.com and freeCodeCamp.
                      </p>
                    </div>

                    {/* 2. EXPERIENCE */}
                    <div className="space-y-2">
                      <h3 className="font-sans text-[8pt] font-bold uppercase tracking-[0.18em] text-black border-b border-black pb-0.5">
                        EXPERIENCE
                      </h3>
                      <div className="pt-0.5">
                        <p className="font-sans font-bold text-black text-[9.5pt]">
                          Open Source Contributor | Cal.com & freeCodeCamp | March 2026 – Present
                        </p>
                        <ul className="list-disc list-outside ml-4 space-y-1 pt-1 text-[9.5pt] text-slate-900 font-serif">
                          <li>
                            Shipped a fix for a Day.js UTC/timezone plugin load-order bug on Cal.com, a platform used by 50k+ teams, after tracing the root cause and verifying it with cross-browser testing.
                          </li>
                          <li>
                            Merged 5 pull requests across Cal.com (github.com/calcom/cal.com) and freeCodeCamp (github.com/freeCodeCamp/freeCodeCamp) after maintainer code review.
                          </li>
                          <li>
                            Built automated file-structure validation with unit tests for freeCodeCamp workshops and added test coverage for a high-contrast navbar fix.
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* 3. PROJECTS */}
                    <div className="space-y-3">
                      <h3 className="font-sans text-[8pt] font-bold uppercase tracking-[0.18em] text-black border-b border-black pb-0.5">
                        PROJECTS
                      </h3>

                      <div className="space-y-0.5">
                        <p className="font-sans font-bold text-black text-[9.5pt]">
                          RecoveryOS: Guardrailed AI Decision System | TypeScript, Node.js, SQLite, Docker | GitHub
                        </p>
                        <ul className="list-disc list-outside ml-4 space-y-1 text-[9.5pt] text-slate-900 font-serif">
                          <li>
                            Designed an AI-driven revenue-recovery system in which AI suggestions pass through a rule-based safety layer (risk limits, retry budgets, cooldowns, kill-switch) before any action is taken.
                          </li>
                          <li>
                            Recovered 20,726 extra across 135 failed-payment test cases with zero unsafe actions and zero duplicate executions, using idempotent execution, a reconciliation ledger, and an append-only audit trail.
                          </li>
                          <li>
                            Ran controlled, seeded simulations for reproducible results, with 232/232 unit tests and 36/36 validation checks passing in automated release checks.
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-0.5">
                        <p className="font-sans font-bold text-black text-[9.5pt]">
                          AgentForensics | Python, LangGraph, MCP | Paper in preparation
                        </p>
                        <ul className="list-disc list-outside ml-4 space-y-1 text-[9.5pt] text-slate-900 font-serif">
                          <li>
                            Designed a digital forensics framework for MCP-connected multi-agent systems with four components: EvidenceCollector, ProvenanceGraphBuilder, EscalationDetector, and ForensicReporter.
                          </li>
                          <li>
                            Evaluated a LangGraph prototype with two MCP tool servers on 20 synthetic agent sessions to analyse agent behaviour: flagged 17/20 escalation events with 0 false positives, reaching 91.3% precision; manuscript drafted for an IEEE conference; open-source (Apache 2.0) release planned.
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-0.5">
                        <p className="font-sans font-bold text-black text-[9.5pt]">
                          Smart Sales Intelligence Agent | Python, FastAPI, LangGraph | GitHub
                        </p>
                        <ul className="list-disc list-outside ml-4 space-y-1 text-[9.5pt] text-slate-900 font-serif">
                          <li>
                            Built a modular 4-stage multi-agent workflow (Orchestrator → Research → Analysis → Outreach), tracking latency, errors, and usage for each stage.
                          </li>
                          <li>
                            Added real-time execution timelines so every agent run can be traced and debugged.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 4. RESEARCH & PUBLICATIONS */}
                    <div className="space-y-2">
                      <h3 className="font-sans text-[8pt] font-bold uppercase tracking-[0.18em] text-black border-b border-black pb-0.5">
                        RESEARCH &amp; PUBLICATIONS
                      </h3>
                      <ul className="list-disc list-outside ml-4 space-y-1.5 text-[9.5pt] text-slate-900 font-serif">
                        <li>
                          <strong>IEEE Conference Paper:</strong> Catastrophic Forgetting Prevention in Federated Learning Using EWC for Edge Intelligence, 93.1% accuracy. IEEE Xplore
                        </li>
                        <li>
                          <strong>IEEE Conference Paper:</strong> AgriCogNet: Explainable Ensemble Learning for Cognitive Fatigue Detection in Indian Agricultural Workers, 91.3% accuracy. IEEE Xplore
                        </li>
                        <li>
                          <strong>Hackathons &amp; Programs:</strong> Smart India Hackathon internal round; built and deployed two applications in 24 hours at the Lakshyagriha Global Hackathon, Dev Bhoomi University; completed GirlScript Summer of Code (GSSoC).
                        </li>
                      </ul>
                    </div>

                    {/* 5. EDUCATION */}
                    <div className="space-y-1.5">
                      <h3 className="font-sans text-[8pt] font-bold uppercase tracking-[0.18em] text-black border-b border-black pb-0.5">
                        EDUCATION
                      </h3>
                      <p className="font-sans font-bold text-black text-[9.5pt]">
                        Bachelor of Technology in Computer Science (AI & Machine Learning) | Uttaranchal University, Dehradun, India | Expected May 2027
                      </p>
                    </div>

                    {/* 6. SKILLS */}
                    <div className="space-y-2">
                      <h3 className="font-sans text-[8pt] font-bold uppercase tracking-[0.18em] text-black border-b border-black pb-0.5">
                        SKILLS
                      </h3>
                      <div className="space-y-1.5 text-[9.5pt] text-slate-900">
                        <p>
                          <strong className="font-sans font-bold text-[9pt]">Languages:</strong> Python, TypeScript, SQL
                        </p>
                        <p>
                          <strong className="font-sans font-bold text-[9pt]">AI &amp; Machine Learning:</strong> Machine Learning, Deep Learning, Neural Networks, NLP, Federated Learning, Ensemble Learning, Model Evaluation, Reproducible Experiments
                        </p>
                        <p>
                          <strong className="font-sans font-bold text-[9pt]">LLMs &amp; Agents:</strong> LLM APIs, AI Agents, RAG, LangGraph, Model Context Protocol (MCP), Tool Calling
                        </p>
                        <p>
                          <strong className="font-sans font-bold text-[9pt]">AI Safety &amp; Security:</strong> Guardrails, Audit Trails, MCP Security, Agent Forensics
                        </p>
                        <p>
                          <strong className="font-sans font-bold text-[9pt]">MLOps &amp; Deployment:</strong> FastAPI, Docker, Kubernetes, CI/CD, Git/GitHub, Microsoft Azure, Microsoft Foundry
                        </p>
                        <p>
                          <strong className="font-sans font-bold text-[9pt]">Tools &amp; Libraries:</strong> VS Code, Jupyter Notebooks, PyTorch, NumPy, Pandas, Data Structures and Algorithms
                        </p>
                      </div>
                    </div>

                    {/* 7. CERTIFICATIONS */}
                    <div className="space-y-1.5">
                      <h3 className="font-sans text-[8pt] font-bold uppercase tracking-[0.18em] text-black border-b border-black pb-0.5">
                        CERTIFICATIONS
                      </h3>
                      <ul className="list-disc list-outside ml-4 space-y-1 text-[9.5pt] text-slate-900 font-serif">
                        <li>Oracle Cloud Infrastructure Generative AI Professional, Oracle, 2025 (ID: 322494826OCI25GAIOCP)</li>
                        <li>AWS Solutions Architecture, Amazon Web Services</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right 4 Cols: Why ATS Strict Standard Works */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#FAF9F5] rounded-2xl border border-amber-200/60 p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#5B50E6]" />
                  <span>The Single Master Template Rule</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Most resume builders tempt users with colorful 2-column or sidebar layouts. But when you apply on Workday, Lever, or Greenhouse, their backend parsers strip all columns into a single string.
                </p>
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">
                      <strong>Single-column flow:</strong> Scanned top-to-bottom without line-jumping or scrambled dates.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">
                      <strong>Standard typography:</strong> Clean serif body + sans-serif subheads guaranteed to have correct Unicode mapping in PDF parsers.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">
                      <strong>Dynamic compiling:</strong> When you use ResumeFlow, our AI compiler swaps your exact details, metrics, and targeted job skills directly into this master skeleton.
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ready to optimize?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upload your existing PDF or paste your resume. We extract every requirement from the job description and recompile your bullets with real numbers and verified keywords into this exact master template.
                </p>
                <Link
                  href="/optimize"
                  className="w-full py-3 px-4 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Open Free AI Resume Optimizer</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
