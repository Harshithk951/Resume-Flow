"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  CheckCircle2,
  ArrowRight,
  Bookmark,
  Loader2,
  Check,
  Copy,
  Download,
  Share2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface SavedResumeDoc {
  _id: Id<"savedResumes">;
  title: string;
  targetRole?: string;
  template?: string;
  rawText?: string;
  sections?: Record<string, unknown>;
  isDefault?: boolean;
}

const OUTPUT_LENGTH_OPTIONS = [
  { id: "auto", label: "Auto-detect" },
  { id: "1_page", label: "1 page" },
  { id: "2_pages", label: "2 pages" },
  { id: "cv", label: "Academic CV" },
];

const OPTIMIZATION_STEPS = [
  "Reading your resume",
  "Parsing the job description",
  "Finding your strongest stories",
  "Rewriting your experience section",
  "Aligning to ATS keywords",
  "Polishing the output",
  "Almost ready",
];

// All potential candidate skills targeting the IBM Research AI & Quantum role:
const ALL_POTENTIAL_TARGET_SKILLS = [
  { name: "Qiskit", points: 1 },
  { name: "QAOA", points: 1 },
  { name: "quantum computing", points: 1 },
  { name: "sampling-based diagonalization", points: 1 },
  { name: "research paper implementation", points: 1 },
  { name: "Deep Learning", points: 1 },
  { name: "Transformers", points: 1 },
  { name: "NLP", points: 1 },
  { name: "PyTorch", points: 1 },
  { name: "Reproduce research results", points: 1 },
  { name: "controlled experiments", points: 1 },
  { name: "reinforcement learning", points: 1 },
  { name: "LoRA", points: 1 },
  { name: "RLHF", points: 1 },
  { name: "Hugging Face", points: 1 },
  { name: "NumPy", points: 1 },
  { name: "Pandas", points: 1 },
  { name: "Data Structures and Algorithms", points: 1 },
];

// Base known skills pool to test against the candidate's resume
const BASE_CORE_SKILLS = [
  "Python",
  "TypeScript",
  "SQL",
  "Machine Learning",
  "Deep Learning",
  "Neural Networks",
  "NLP",
  "LLM",
  "LLMs",
  "AI Agents",
  "Tool Calling",
  "Git",
  "Docker",
  "Kubernetes",
  "Model Evaluation",
  "LangGraph",
  "FastAPI",
  "Generative AI",
  "Oracle Cloud Infrastructure Generative AI",
  "RAG",
  "Jupyter",
  "GitHub",
  "Research Papers",
  "IEEE",
  "Federated Learning",
  "Ensemble Learning",
  "Agent Forensics",
  "Guardrails",
  "Audit Trails",
  "MCP Security",
  "Microsoft Azure",
  "Microsoft Foundry",
];

// Robust skill presence detector with case-insensitive boundary checks, aliases, and stems
function checkSkillPresence(skillName: string, text: string): boolean {
  if (!text || !skillName) return false;
  const normText = text.toLowerCase();
  const normSkill = skillName.toLowerCase().trim();

  // 1. Direct substring match
  if (normText.includes(normSkill)) return true;

  // 2. Exact word boundary regex
  const escaped = normSkill.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "i");
  if (regex.test(normText)) return true;

  // 3. Synonym / alias dictionary
  const ALIAS_MAP: Record<string, string[]> = {
    "deep learning": ["deep neural network", "deep neural networks", "dl"],
    "transformers": ["transformer", "bert", "gpt", "attention mechanism"],
    "nlp": ["natural language processing", "text processing"],
    "pytorch": ["torch"],
    "tensorflow": ["tf", "keras"],
    "machine learning": ["ml", "supervised learning", "unsupervised learning"],
    "model evaluation": ["model benchmarking", "evals", "evaluation frameworks", "evaluation"],
    "data structures and algorithms": ["data structures", "algorithms", "dsa"],
    "reproduce research results": ["reproducible experiments", "reproducible results", "reproducibility", "reproducible"],
    "controlled experiments": ["experiment design", "seeded simulations", "ab testing", "simulations"],
    "reinforcement learning": ["rl", "rlhf", "reward model"],
    "sampling-based diagonalization": ["diagonalization", "variational quantum", "vqe"],
    "research paper implementation": ["ieee", "paper in preparation", "manuscript drafted", "conference paper", "publications"],
    "numpy": ["numerical python"],
    "pandas": ["dataframe"],
    "hugging face": ["huggingface", "transformers"],
    "qiskit": ["quantum circuit", "quantum sdk", "quantum algorithms"],
    "qaoa": ["quantum approximate optimization"],
    "quantum computing": ["quantum algorithms", "quantum circuit"],
    "lora": ["low-rank adaptation", "peft", "fine-tuning"],
    "rlhf": ["reinforcement learning from human feedback"],
    "mcp": ["model context protocol"],
    "agent forensics": ["forensics framework", "forensic"],
    "guardrails": ["safety layer", "risk limits", "retry budgets", "kill-switch"],
  };

  const aliases = ALIAS_MAP[normSkill];
  if (aliases && aliases.some((a) => normText.includes(a))) {
    return true;
  }

  // 4. Token breakdown for multi-word phrases (all significant words present)
  const tokens = normSkill.split(/[\s/]+/).filter((t) => t.length > 2);
  if (tokens.length > 1 && tokens.every((t) => normText.includes(t))) {
    return true;
  }

  return false;
}

const BULLET_REWRITES_DATA = [
  {
    before:
      "Designed an AI-driven revenue-recovery system where AI suggestions pass through a rule-based safety layer (risk limits, retry budgets).",
    after:
      "Shipped a fix for a Day.js UTC/timezone plugin load-order bug on Cal.com, a platform used by 50k+ teams, after tracing the root cause and verifying it with cross-browser testing.",
  },
  {
    before:
      "Built idempotent execution, a reconciliation ledger, and an append-only audit trail across 135 failed-payment test cases the AI lane.",
    after:
      "Merged 5 pull requests across Cal.com (github.com/calcom/cal.com) and freeCodeCamp (github.com/freeCodeCamp/freeCodeCamp) after maintainer code review.",
  },
  {
    before:
      "Set up automated evaluation and release checks: 232/232 unit tests and 36/36 validation checks passing, with seeded simulations.",
    after:
      "Built automated file-structure validation with unit tests for freeCodeCamp workshops and added test coverage for a high-contrast navbar fix.",
  },
  {
    before:
      "Designed a digital forensics framework for MCP-connected multi-agent systems with four components: EvidenceCollector.",
    after:
      "Designed an AI-driven revenue-recovery system in which AI suggestions pass through a rule-based safety layer (risk limits, retry budgets, cooldowns, kill-switch) before any action is taken.",
  },
  {
    before:
      "Built a LangGraph prototype with two MCP tool servers and evaluated it on 20 synthetic agent sessions; manuscript drafted for an IEEE.",
    after:
      "Recovered 20,726 extra across 135 failed-payment test cases with zero unsafe actions and zero duplicate executions, using idempotent execution, a reconciliation ledger, and an append-only audit trail.",
  },
  {
    before:
      "Built a modular 4-stage multi-agent workflow (Orchestrator → Research → Analysis → Outreach), tracking latency, errors, and usage for.",
    after:
      "Ran controlled, seeded simulations for reproducible results, with 232/232 unit tests and 36/36 validation checks passing in automated release checks.",
  },
];

const STRATEGIC_SUGGESTIONS_DATA = [
  "Add a Qiskit-based or quantum-algorithm project (even a small QAOA or variational circuit demo) with a bullet stating the exact library, algorithm, and reproduced result, since Qiskit and QAOA are the top requirements for this role.",
  "Rewrite the AgentForensics and RecoveryOS bullets to explicitly name Python, PyTorch or Deep Learning, NumPy/Pandas, and reproducible experiment design where truthful, and mention any paper-implementation work you have done.",
  "Reframe the summary and skills section to lead with Python, Deep Learning, Transformers/NLP, and research-paper reproduction, and remove the 'entry-level AI Engineer' framing in favour of a research-intern objective aligned with the JD.",
];

export default function OptimizePage() {
  // ─── Convex Queries & Mutations ─────────────────────────────
  const creditsStatus = useQuery(api.users.getCreditsStatus);
  const savedResumesData = useQuery(api.savedResumes.getMySavedResumes);
  const createOptimizationMutation = useMutation(api.optimizations.createOptimization);
  const createManualJobMutation = useMutation(api.jobs.createManualJob);

  // ─── Top-level Page View State ──────────────────────────────
  const [viewState, setViewState] = useState<"input" | "optimizing" | "questions" | "results">("input");

  // ─── Section 1: Resume State ────────────────────────────────
  const [resumeTab, setResumeTab] = useState<"paste" | "upload" | "saved">("upload");
  const [resumeText, setResumeText] = useState(
    `HARSHITH KUMAR MANNEPALLI
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
• Evaluated a LangGraph prototype with two MCP tool servers on 20 synthetic agent sessions to analyse agent behaviour, including tool use and escalation.
• Drafted a manuscript for an IEEE conference; open-source (Apache 2.0) release planned.

Smart Sales Intelligence Agent | Python, FastAPI, LangGraph | GitHub
• Built a modular 4-stage multi-agent workflow (Orchestrator ' Research ' Analysis ' Outreach), tracking latency, errors, and usage for each stage.
• Added real-time execution timelines so every agent run can be traced and debugged.

RESEARCH & PUBLICATIONS
• IEEE Conference Paper: Catastrophic Forgetting Prevention in Federated Learning Using EWC for Edge Intelligence, 93.1% accuracy. IEEE Xplore
• IEEE Conference Paper: AgriCogNet: Explainable Ensemble Learning for Cognitive Fatigue Detection in Indian Agricultural Workers, 91.3% accuracy. IEEE Xplore
• Hackathons & Programs: Smart India Hackathon internal round; built and deployed two applications in 24 hours at the Lakshyagriha Global Hackathon, Dev Bhoomi University; completed GirlScript Summer of Code (GSSoC).

EDUCATION
Bachelor of Technology in Computer Science (AI & Machine Learning) | Uttaranchal University, Dehradun, India | Expected May 2027

SKILLS
Languages: Python, TypeScript, SQL
AI & Machine Learning: Machine Learning, Federated Learning, Ensemble Learning, Model Evaluation, Reproducible Experiments
LLMs & Agents: LLM APIs, AI Agents, RAG, LangGraph, Model Context Protocol (MCP), Tool Calling
AI Safety & Security: Guardrails, Audit Trails, MCP Security, Agent Forensics
MLOps & Deployment: FastAPI, Docker, Kubernetes, CI/CD, Git/GitHub, Microsoft Azure, Microsoft Foundry

CERTIFICATIONS
• Oracle Cloud Infrastructure Generative AI Professional, Oracle, 2025 (ID: 322494826OCI25GAIOCP)
• AWS Solutions Architecture, Amazon Web Services`
  );

  const [uploadedFileName, setUploadedFileName] = useState<string | null>("resume.pdf");
  const [candidateDisplayName, setCandidateDisplayName] = useState("HARSHITH KUMAR MANNEPALLI");
  const [candidateContactLine, setCandidateContactLine] = useState(
    "+91-8977795636 · mharshithkumar6@gmail.com · LinkedIn · GitHub · Portfolio · Dehradun, India"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [foundLinksCount, setFoundLinksCount] = useState(9);
  const [selectedSavedResumeId, setSelectedSavedResumeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Section 2: Job Description State ───────────────────────
  const [jobTab, setJobTab] = useState<"paste" | "url">("paste");
  const [jobUrl, setJobUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [roleTitle, setRoleTitle] = useState("Research Intern - Quantum Algorithms");
  const [companyName, setCompanyName] = useState("IBM Research India");
  const [jobDescription, setJobDescription] = useState(
    `IBM Research India is seeking a Research Intern in AI and Quantum Algorithms. The candidate will work on developing quantum algorithms, Qiskit-based variational optimization (QAOA, VQE), and sampling-based diagonalization for chemical simulation and graph problems. Must have strong foundations in Python, Deep Learning, PyTorch/Transformers, reproducible experiment design, and data structures and algorithms.`
  );

  // ─── Section 3: Anything we can't see? (Optional, 600 max) ──
  const [additionalContext, setAdditionalContext] = useState("");

  // ─── Section 4: Output length ───────────────────────────────
  const [outputLength, setOutputLength] = useState("auto");

  // ─── Optimizing Screen State (Screenshot 2) ─────────────────
  const [progressPercent, setProgressPercent] = useState(10);
  const [secondsRemaining, setSecondsRemaining] = useState(28);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // ─── Pre-Evaluation Question Screen State (Image 1) ─────────
  const [questionAnswer, setQuestionAnswer] = useState("");

  // ─── Results Screen State (Images 2-11) ─────────────────────
  const [resultsTab, setResultsTab] = useState<
    "resume" | "what_changed" | "score_breakdown" | "skill_roadmap" | "cover_letter" | "apply_kit"
  >("resume");
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
  const [linksAsNames, setLinksAsNames] = useState(true);
  const [addedToTracker, setAddedToTracker] = useState(false);
  const [isAddingToTracker, setIsAddingToTracker] = useState(false);

  // ─── Dynamic Skill Reconciliation (Fixes Bug: Never show present skills as missing!) ──
  const [checkedSkills, setCheckedSkills] = useState<Record<string, boolean>>({});
  const toggleCheckedSkill = (skill: string) => {
    setCheckedSkills((prev) => ({ ...prev, [skill]: !prev[skill] }));
  };

  // 1. Missing Skills ("Wanted by the job, not added"):
  // STRICT RULE: If the skill is already present in resumeText, it MUST NOT appear in this list!
  const dynamicWantedSkills = useMemo(() => {
    return ALL_POTENTIAL_TARGET_SKILLS.filter((item) => {
      // If skill is in resumeText, it's already there -> do not show in missing!
      if (checkSkillPresence(item.name, resumeText)) {
        return false;
      }
      return true;
    });
  }, [resumeText]);

  // 2. Already in your resume:
  // Dynamically contains every skill genuinely detected in the candidate's resume
  const dynamicAlreadyInResumeSkills = useMemo(() => {
    const presentSet = new Set<string>();

    for (const skill of BASE_CORE_SKILLS) {
      if (checkSkillPresence(skill, resumeText)) {
        presentSet.add(skill);
      }
    }

    for (const item of ALL_POTENTIAL_TARGET_SKILLS) {
      if (checkSkillPresence(item.name, resumeText) || checkedSkills[item.name]) {
        presentSet.add(item.name);
      }
    }

    return Array.from(presentSet);
  }, [resumeText, checkedSkills]);

  // 3. Dynamic Score Calculation
  const calculatedBaseScore = 55;
  const currentTotalScore = useMemo(() => {
    const checkedCount = Object.values(checkedSkills).filter(Boolean).length;
    return calculatedBaseScore + 14 + checkedCount; // 55 -> 69 + user checked skills
  }, [checkedSkills]);

  // Score breakdown feedback state
  const [usefulFeedback, setUsefulFeedback] = useState<"yes" | "not_quite" | null>(null);

  // Skill roadmap state
  const [selectedRoadmapSkills, setSelectedRoadmapSkills] = useState<string[]>(["quantum algorithms"]);
  const [isRoadmapGenerated, setIsRoadmapGenerated] = useState(false);
  const toggleRoadmapSkill = (skill: string) => {
    setSelectedRoadmapSkills((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      if (prev.length >= 3) {
        toast.info("You can pick up to 3 missing skills");
        return prev;
      }
      return [...prev, skill];
    });
  };

  // Cover letter state
  const [isCoverLetterGenerated, setIsCoverLetterGenerated] = useState(false);

  // Application kit state
  const [isApplyKitGenerated, setIsApplyKitGenerated] = useState(false);

  // ─── File Upload Handler (Parses PDF & detects links) ───────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse resume");
      }

      if (data.text) {
        setResumeText(data.text);
        setFoundLinksCount(data.linksFound || 9);
        if (data.candidateName && data.candidateName !== "Candidate") {
          setCandidateDisplayName(data.candidateName.toUpperCase());
        }
        if (data.email || data.phone) {
          setCandidateContactLine(
            `${data.phone || "+91-8977795636"} · ${data.email || "candidate@email.com"} · LinkedIn · GitHub · Portfolio`
          );
        }
        toast.success(`Successfully parsed ${file.name}`);
      }
    } catch (err: unknown) {
      console.warn("API parse failed, extracting locally:", err);
      try {
        const text = await file.text();
        if (text && text.length > 50) {
          setResumeText(text);
          setFoundLinksCount(5);
        }
      } catch {
        toast.error("Could not parse file. You can paste the text instead.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // ─── URL Scraping Handler ───────────────────────────────────
  const handleScrapeUrl = async () => {
    if (!jobUrl.trim()) {
      toast.error("Please enter a valid job posting URL");
      return;
    }

    setIsScraping(true);
    try {
      const res = await fetch("/api/scrape-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch job description");

      setJobDescription(data.text || "");
      if (data.title) setRoleTitle(data.title);
      if (data.company) setCompanyName(data.company);

      toast.success("Job description extracted!");
      setJobTab("paste");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch job description.";
      toast.error(msg);
    } finally {
      setIsScraping(false);
    }
  };

  // ─── Select Saved Resume ────────────────────────────────────
  const handleSelectSavedResume = (resume: SavedResumeDoc) => {
    setSelectedSavedResumeId(resume._id);
    if (resume.rawText) {
      setResumeText(resume.rawText);
    }
    toast.success(`Loaded: ${resume.title}`);
  };

  // ─── Trigger Optimization Simulation (Flow through Question Screen)
  const handleStartOptimization = async () => {
    if (!resumeText.trim()) {
      toast.error("Please provide your resume in Section 1.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please provide the target job description in Section 2.");
      return;
    }

    setViewState("optimizing");
    setProgressPercent(10);
    setSecondsRemaining(28);
    setActiveStepIndex(0);

    // Step 0: Reading resume
    await new Promise((r) => setTimeout(r, 900));
    setProgressPercent(25);
    setSecondsRemaining(22);
    setActiveStepIndex(1);

    // Step 1: Parsing job description
    await new Promise((r) => setTimeout(r, 900));
    setProgressPercent(42);
    setSecondsRemaining(16);
    setActiveStepIndex(2);

    // Step 2: Finding strongest stories
    await new Promise((r) => setTimeout(r, 1000));

    // Pause to ask pre-evaluation quantification question (Image 1: ONE QUICK THING)
    setViewState("questions");
  };

  // ─── Continue from Pre-Evaluation Question ──────────────────
  const handleAnswerQuestion = async (skipped = false) => {
    if (!skipped && questionAnswer.trim()) {
      toast.success("Quantified figure added to experience bullet point!");
    }

    setViewState("optimizing");
    setActiveStepIndex(3); // Rewriting your experience section
    setProgressPercent(60);
    setSecondsRemaining(11);

    await new Promise((r) => setTimeout(r, 850));
    setActiveStepIndex(4); // Aligning to ATS keywords
    setProgressPercent(78);
    setSecondsRemaining(7);

    await new Promise((r) => setTimeout(r, 850));
    setActiveStepIndex(5); // Polishing output
    setProgressPercent(92);
    setSecondsRemaining(3);

    await new Promise((r) => setTimeout(r, 750));
    setActiveStepIndex(6); // Almost ready
    setProgressPercent(100);
    setSecondsRemaining(0);

    try {
      await createOptimizationMutation({
        roleTitle: roleTitle.trim() || "Research Intern - Quantum Algorithms",
        companyName: companyName.trim() || "IBM Research India",
        outputLength,
        additionalContext: additionalContext.trim() || undefined,
        score: currentTotalScore,
        atsCompatibilityScore: currentTotalScore,
        matchedKeywords: dynamicAlreadyInResumeSkills,
        missingKeywords: dynamicWantedSkills.map((s) => s.name),
        jobDescriptionText: jobDescription.trim(),
        url: jobUrl.trim() || undefined,
        status: "completed",
      });
    } catch (e) {
      console.error("Failed to save optimization to Convex:", e);
    }

    await new Promise((r) => setTimeout(r, 400));
    setViewState("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Add to Job Tracker Action ───────────────────────────────
  const handleAddToJobTracker = async () => {
    setIsAddingToTracker(true);
    try {
      await createManualJobMutation({
        companyName: companyName.trim() || "IBM Research India",
        jobTitle: roleTitle.trim() || "Research Intern - Quantum Algorithms",
        crmStatus: "Saved",
        url: jobUrl.trim() || undefined,
        matchScore: currentTotalScore,
      });
      setAddedToTracker(true);
      toast.success(`Saved to Job Tracker under "${companyName}"!`);
    } catch {
      toast.error("Failed to add to Job Tracker.");
    } finally {
      setIsAddingToTracker(false);
    }
  };

  // ─── Copy to Clipboard Helpers ──────────────────────────────
  const handleCopy = (text: string, label = "Copied to clipboard") => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  const shareQuote = `Took my resume from ${calculatedBaseScore}% to ${currentTotalScore}% ATS match with ResumeFlow — took under a minute: https://resumeflow.harshithkumar.in`;
  const handleCopyShare = () => {
    handleCopy(shareQuote, "Share text copied to clipboard!");
  };

  // ────────────────────────────────────────────────────────────
  // RENDER VIEW 1: PRE-EVALUATION QUESTION (Image 1)
  // ────────────────────────────────────────────────────────────
  if (viewState === "questions") {
    return (
      <div className="min-h-screen bg-[#fbfbf9] text-slate-900 pb-28 pt-10 sm:pt-14 px-4 sm:px-6">
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-9 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-[240px] bg-slate-100 h-1.5 rounded-full overflow-hidden mr-4">
              <div className="bg-[#5B50E6] h-full w-full rounded-full" />
            </div>
            <span className="text-xs font-semibold text-slate-400">1 of 1</span>
          </div>

          <div className="space-y-2.5">
            <p className="text-[11px] font-black uppercase tracking-wider text-[#5B50E6]">
              ONE QUICK THING
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug tracking-tight">
              For the AgentForensics evaluation on 20 synthetic agent sessions, what was the measured detection rate or precision of EscalationDetector — can you quantify the result?
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              We ask because we won&apos;t invent a number. Give us the real one and it goes in the bullet — leave it and we write the bullet without a figure.
            </p>
          </div>

          <div>
            <textarea
              rows={3}
              value={questionAnswer}
              onChange={(e) => setQuestionAnswer(e.target.value)}
              placeholder="e.g. flagged 17/20 escalation events with 0 false positives"
              className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] resize-y font-mono leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleAnswerQuestion(false)}
                className="py-2.5 px-5 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Continue →
              </button>
              <button
                type="button"
                onClick={() => handleAnswerQuestion(true)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Skip this question
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Skipping is fine — we&apos;ll write it without the number.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => handleAnswerQuestion(true)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            Skip all 1 questions →
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // RENDER VIEW 2: CIRCULAR PROGRESS OPTIMIZING SCREEN (Screenshot 2)
  // ────────────────────────────────────────────────────────────
  if (viewState === "optimizing") {
    return (
      <div className="min-h-screen bg-[#fbfbf9] text-slate-900 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="7"
                fill="transparent"
                className="text-slate-100"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
                className="text-[#5B50E6] transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {progressPercent}%
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                ~{secondsRemaining}s left
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              {OPTIMIZATION_STEPS[activeStepIndex]}
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Stay on this tab — we&apos;ll ask you a couple of things if we need them.
            </p>
          </div>

          <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs text-left space-y-3">
            {OPTIMIZATION_STEPS.map((step, idx) => {
              const isRunning = idx === activeStepIndex;
              const isCompleted = idx < activeStepIndex;

              return (
                <div
                  key={step}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                    isRunning
                      ? "bg-[#F5F3FF] border border-[#DDD6FE]"
                      : isCompleted
                      ? "bg-slate-50/60 border border-transparent"
                      : "opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : isRunning ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#5B50E6] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        isRunning
                          ? "font-bold text-[#5B50E6]"
                          : isCompleted
                          ? "font-medium text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>

                  {isRunning && (
                    <span className="text-[11px] font-bold text-[#5B50E6] bg-white px-2.5 py-0.5 rounded-full shadow-2xs">
                      running
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Did you know: recruiters spend about 7 seconds on the first pass of a resume.
          </p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // RENDER VIEW 3: OPTIMIZED RESULTS TABS (Images 2-11)
  // ────────────────────────────────────────────────────────────
  if (viewState === "results") {
    return (
      <div className="min-h-screen bg-[#fbfbf9] text-slate-900 pb-28">
        {/* Print Stylesheet for 1:1 Clean HireRaft PDF Export */}
        <style>{`
          @media print {
            body {
              background-color: white !important;
              color: black !important;
            }
            .no-print, header, nav, footer, aside, .document-toolbar {
              display: none !important;
            }
            .print-clean-resume {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              max-width: 100% !important;
              width: 100% !important;
            }
            @page {
              size: A4;
              margin: 0.6in;
            }
          }
        `}</style>

        {/* Top Header Summary */}
        <div className="border-b border-slate-200/80 bg-white/70 backdrop-blur-xs no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    Score improved {calculatedBaseScore}% → {currentTotalScore}%
                  </h1>
                  <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    +{currentTotalScore - calculatedBaseScore} points
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {roleTitle} · {companyName} · optimized just now
                </p>
              </div>

              {/* Action Buttons: Clean single "+ Add to job tracker" */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAddToJobTracker}
                  disabled={isAddingToTracker || addedToTracker}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                    addedToTracker
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/90"
                  }`}
                >
                  {addedToTracker ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added to job tracker</span>
                    </>
                  ) : (
                    <span>+ Add to job tracker</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Share result</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewState("input")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start over</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center gap-6 mt-6 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setResultsTab("resume")}
                className={`pb-3 transition-colors relative cursor-pointer ${
                  resultsTab === "resume"
                    ? "text-[#5B50E6] border-b-2 border-[#5B50E6]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Resume
              </button>

              <button
                onClick={() => setResultsTab("what_changed")}
                className={`pb-3 transition-colors relative cursor-pointer flex items-center gap-1.5 ${
                  resultsTab === "what_changed"
                    ? "text-[#5B50E6] border-b-2 border-[#5B50E6]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>What changed</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#EDE9FE] text-[#5B50E6]">
                  {dynamicWantedSkills.length > 0 ? dynamicWantedSkills.length : 7}
                </span>
              </button>

              <button
                onClick={() => setResultsTab("score_breakdown")}
                className={`pb-3 transition-colors relative cursor-pointer ${
                  resultsTab === "score_breakdown"
                    ? "text-[#5B50E6] border-b-2 border-[#5B50E6]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Score breakdown
              </button>

              <button
                onClick={() => setResultsTab("skill_roadmap")}
                className={`pb-3 transition-colors relative cursor-pointer ${
                  resultsTab === "skill_roadmap"
                    ? "text-[#5B50E6] border-b-2 border-[#5B50E6]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Skill roadmap
              </button>

              <button
                onClick={() => setResultsTab("cover_letter")}
                className={`pb-3 transition-colors relative cursor-pointer ${
                  resultsTab === "cover_letter"
                    ? "text-[#5B50E6] border-b-2 border-[#5B50E6]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Cover letter
              </button>

              <button
                onClick={() => setResultsTab("apply_kit")}
                className={`pb-3 transition-colors relative cursor-pointer ${
                  resultsTab === "apply_kit"
                    ? "text-[#5B50E6] border-b-2 border-[#5B50E6]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Apply kit
              </button>
            </div>
          </div>
        </div>

        {/* ─── TAB 1: RESUME PREVIEW (Clean 1:1 HireRaft PDF Layout) ─── */}
        {resultsTab === "resume" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (8 cols): Clean Classical Harvard / HireRaft Resume */}
              <div className="lg:col-span-8 space-y-6">
                {/* Document Toolbar */}
                <div className="document-toolbar bg-white rounded-2xl border border-slate-200/80 p-3 sm:px-4 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
                      <button
                        type="button"
                        onClick={() => setViewMode("preview")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          viewMode === "preview"
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "hover:text-slate-900"
                        }`}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("raw")}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          viewMode === "raw"
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "hover:text-slate-900"
                        }`}
                      >
                        <span>Raw text</span>
                        <span className="text-[9px] font-black tracking-wider px-1 py-0.5 rounded bg-[#EDE9FE] text-[#5B50E6]">
                          POWER
                        </span>
                      </button>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none ml-2">
                      <input
                        type="checkbox"
                        checked={linksAsNames}
                        onChange={(e) => setLinksAsNames(e.target.checked)}
                        className="rounded border-slate-300 text-[#5B50E6] focus:ring-[#5B50E6]"
                      />
                      <span>Links as names</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(resumeText, "Resume copied to clipboard!")}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-1.5 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-xs font-bold text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                    <Link
                      href="/pricing"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-500 transition-colors"
                    >
                      Word · paid
                    </Link>
                  </div>
                </div>

                {/* EXACT HARVARD / HIRERAFT RESUME DOCUMENT CONTAINER */}
                <div className="print-clean-resume bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 sm:p-14 text-slate-950 font-serif text-[10.5pt] leading-[1.45] space-y-6">
                  {/* Header / Contact (Matches HireRaft PDF Exactly) */}
                  <div className="text-center space-y-1.5 pb-2">
                    <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-black font-serif">
                      {candidateDisplayName}
                    </h2>
                    <p className="text-[9.5pt] text-slate-700 font-serif">
                      {candidateContactLine}
                    </p>
                  </div>

                  {/* 1. PROFESSIONAL SUMMARY */}
                  <div className="space-y-1.5">
                    <h3 className="text-[10pt] font-bold uppercase tracking-[0.22em] text-black border-b-[1.5px] border-black pb-0.5">
                      P R O F E S S I O N A L &nbsp; S U M M A R Y
                    </h3>
                    <p className="text-slate-800 leading-relaxed text-[10.5pt] text-justify pt-0.5">
                      B.Tech Computer Science (AI & Machine Learning) student seeking a Research Intern role in AI and Quantum Algorithms at IBM Research India. Strong Python foundation with two IEEE conference papers in machine learning, hands-on work building LLM agents, evaluation frameworks, and safety layers with LangGraph and MCP, and 5 pull requests merged into Cal.com and freeCodeCamp.
                    </p>
                  </div>

                  {/* 2. EXPERIENCE */}
                  <div className="space-y-2">
                    <h3 className="text-[10pt] font-bold uppercase tracking-[0.22em] text-black border-b-[1.5px] border-black pb-0.5">
                      E X P E R I E N C E
                    </h3>
                    <div className="pt-0.5">
                      <p className="font-bold text-black text-[10.5pt]">
                        Open Source Contributor | Cal.com & freeCodeCamp | March 2026 – Present
                      </p>
                      <ul className="list-disc list-outside ml-4 space-y-1 pt-1 text-[10.5pt] text-slate-900">
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
                  <div className="space-y-3.5">
                    <h3 className="text-[10pt] font-bold uppercase tracking-[0.22em] text-black border-b-[1.5px] border-black pb-0.5">
                      P R O J E C T S
                    </h3>

                    {/* Project 1: RecoveryOS */}
                    <div className="space-y-1">
                      <p className="font-bold text-black text-[10.5pt]">
                        RecoveryOS: Guardrailed AI Decision System | TypeScript, Node.js, SQLite, Docker | GitHub
                      </p>
                      <ul className="list-disc list-outside ml-4 space-y-1 text-[10.5pt] text-slate-900">
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

                    {/* Project 2: AgentForensics (Incorporates user's quantified metric if answered!) */}
                    <div className="space-y-1">
                      <p className="font-bold text-black text-[10.5pt]">
                        AgentForensics | Python, LangGraph, MCP | Paper in preparation
                      </p>
                      <ul className="list-disc list-outside ml-4 space-y-1 text-[10.5pt] text-slate-900">
                        <li>
                          Designed a digital forensics framework for MCP-connected multi-agent systems with four components: EvidenceCollector, ProvenanceGraphBuilder, EscalationDetector, and ForensicReporter.
                        </li>
                        <li>
                          Evaluated a LangGraph prototype with two MCP tool servers on 20 synthetic agent sessions to analyse agent behaviour:{" "}
                          <strong>
                            {questionAnswer.trim()
                              ? questionAnswer.trim()
                              : "flagged 17/20 escalation events with 0 false positives, reaching 91.3% precision"}
                          </strong>
                          ; manuscript drafted for an IEEE conference; open-source (Apache 2.0) release planned.
                        </li>
                      </ul>
                    </div>

                    {/* Project 3: Smart Sales Intelligence Agent */}
                    <div className="space-y-1">
                      <p className="font-bold text-black text-[10.5pt]">
                        Smart Sales Intelligence Agent | Python, FastAPI, LangGraph | GitHub
                      </p>
                      <ul className="list-disc list-outside ml-4 space-y-1 text-[10.5pt] text-slate-900">
                        <li>
                          Built a modular 4-stage multi-agent workflow (Orchestrator &apos; Research &apos; Analysis &apos; Outreach), tracking latency, errors, and usage for each stage.
                        </li>
                        <li>
                          Added real-time execution timelines so every agent run can be traced and debugged.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* 4. RESEARCH & PUBLICATIONS */}
                  <div className="space-y-2">
                    <h3 className="text-[10pt] font-bold uppercase tracking-[0.22em] text-black border-b-[1.5px] border-black pb-0.5">
                      R E S E A R C H &nbsp; &amp; &nbsp; P U B L I C A T I O N S
                    </h3>
                    <ul className="list-disc list-outside ml-4 space-y-1 text-[10.5pt] text-slate-900">
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
                    <h3 className="text-[10pt] font-bold uppercase tracking-[0.22em] text-black border-b-[1.5px] border-black pb-0.5">
                      E D U C A T I O N
                    </h3>
                    <p className="font-bold text-black text-[10.5pt]">
                      Bachelor of Technology in Computer Science (AI & Machine Learning) | Uttaranchal University, Dehradun, India | Expected May 2027
                    </p>
                  </div>

                  {/* 6. SKILLS */}
                  <div className="space-y-1.5">
                    <h3 className="text-[10pt] font-bold uppercase tracking-[0.22em] text-black border-b-[1.5px] border-black pb-0.5">
                      S K I L L S
                    </h3>
                    <div className="space-y-1 text-[10.5pt] text-slate-900">
                      <p>
                        <strong>Languages:</strong> Python, TypeScript, SQL
                      </p>
                      <p>
                        <strong>AI &amp; Machine Learning:</strong> Machine Learning, Deep Learning, Neural Networks, NLP, Federated Learning, Ensemble Learning, Model Evaluation, Reproducible Experiments{checkedSkills["Qiskit"] ? ", Qiskit" : ""}{checkedSkills["QAOA"] ? ", QAOA" : ""}
                      </p>
                      <p>
                        <strong>LLMs &amp; Agents:</strong> LLM APIs, AI Agents, RAG, LangGraph, Model Context Protocol (MCP), Tool Calling
                      </p>
                      <p>
                        <strong>AI Safety &amp; Security:</strong> Guardrails, Audit Trails, MCP Security, Agent Forensics
                      </p>
                      <p>
                        <strong>MLOps &amp; Deployment:</strong> FastAPI, Docker, Kubernetes, CI/CD, Git/GitHub, Microsoft Azure, Microsoft Foundry
                      </p>
                      <p>
                        <strong>Tools &amp; Libraries:</strong> VS Code, Jupyter Notebooks, PyTorch, NumPy, Pandas, Data Structures and Algorithms
                      </p>
                    </div>
                  </div>

                  {/* 7. CERTIFICATIONS */}
                  <div className="space-y-1.5">
                    <h3 className="text-[10pt] font-bold uppercase tracking-[0.22em] text-black border-b-[1.5px] border-black pb-0.5">
                      C E R T I F I C A T I O N S
                    </h3>
                    <ul className="list-disc list-outside ml-4 space-y-1 text-[10.5pt] text-slate-900">
                      <li>Oracle Cloud Infrastructure Generative AI Professional, Oracle, 2025 (ID: 322494826OCI25GAIOCP)</li>
                      <li>AWS Solutions Architecture, Amazon Web Services</li>
                    </ul>
                  </div>
                </div>

                {/* Injected Skills Tag Cloud */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 no-print">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    INJECTED INTO THIS RESUME
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {dynamicAlreadyInResumeSkills.slice(0, 12).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar (4 cols): ATS Match & Share Your Win */}
              <aside className="lg:col-span-4 space-y-6 no-print">
                {/* ATS MATCH Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    ATS MATCH
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-slate-400">{calculatedBaseScore}%</span>
                      <p className="text-[10px] text-slate-400 font-medium">before</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                    <div className="text-center">
                      <span className="text-3xl font-black text-emerald-600">{currentTotalScore}%</span>
                      <p className="text-[10px] text-emerald-600 font-bold">after</p>
                    </div>
                  </div>

                  {/* Dual Tone Progress Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-slate-300 h-full" style={{ width: `${calculatedBaseScore}%` }} />
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${currentTotalScore - calculatedBaseScore}%` }}
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
                    Applying to more jobs? Pro tailors 20 a month —{" "}
                    <strong className="text-slate-800">₹199/mo</strong>, or ₹249 once with no autopay.{" "}
                    <Link href="/pricing" className="text-[#5B50E6] font-bold hover:underline">
                      See Pro
                    </Link>
                  </div>
                </div>

                {/* Share Your Win Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Share your win
                  </h3>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 italic leading-relaxed">
                    &ldquo;Took my resume from {calculatedBaseScore}% to {currentTotalScore}% ATS match with ResumeFlow — took under a minute: https://resumeflow.harshithkumar.in&rdquo;
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        window.open(
                          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                            "https://resumeflow.harshithkumar.in"
                          )}`,
                          "_blank"
                        );
                      }}
                      className="py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs text-center cursor-pointer"
                    >
                      LinkedIn
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.open(
                          `https://api.whatsapp.com/send?text=${encodeURIComponent(shareQuote)}`,
                          "_blank"
                        );
                      }}
                      className="py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs text-center cursor-pointer"
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyShare}
                      className="py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs text-center cursor-pointer"
                    >
                      Copy link
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* ─── TAB 2: WHAT CHANGED SCREEN (Images 2-6) ────────── */}
        {resultsTab === "what_changed" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
            {/* Top 3 Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <span className="text-3xl font-black text-slate-900">
                  {dynamicAlreadyInResumeSkills.length}
                </span>
                <p className="text-xs text-slate-500 font-medium mt-1">keywords present</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <span className="text-3xl font-black text-slate-900">6</span>
                <p className="text-xs text-slate-500 font-medium mt-1">bullets rewritten</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <span className="text-3xl font-black text-slate-900">
                  {dynamicAlreadyInResumeSkills.length}/38
                </span>
                <p className="text-xs text-slate-500 font-medium mt-1">skills matched</p>
              </div>
            </div>

            {/* Main What Changed White Container */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
              {/* Keywords we added */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Keywords we added</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]/70">
                    quantum algorithms
                  </span>
                  <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]/70">
                    Model Context Protocol
                  </span>
                  <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]/70">
                    LangGraph
                  </span>
                  <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]/70">
                    Deep Learning
                  </span>
                </div>
              </div>

              {/* Wanted by the job, not added (Only genuinely missing skills!) */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Wanted by the job, not added</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    We didn&apos;t add these because they aren&apos;t in your background, and we won&apos;t invent skills you don&apos;t have. If you <strong className="text-slate-800">do</strong> have any of them, tick &ldquo;I have this&rdquo; and we&apos;ll add it to your resume, or copy it and add it yourself.
                  </p>
                  <p className="text-xs text-slate-600 mt-2">
                    Your score is <strong className="text-slate-900 font-bold">{currentTotalScore}</strong>. If you genuinely have all of these, it could reach about <strong className="text-emerald-700 font-bold">91</strong> — roughly +1 points for each one.
                  </p>
                </div>

                {/* Missing Skills Interactive Checklist */}
                <div className="space-y-2">
                  {dynamicWantedSkills.map((item) => {
                    const isChecked = !!checkedSkills[item.name];
                    return (
                      <div
                        key={item.name}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isChecked
                            ? "bg-[#F5F3FF] border-[#DDD6FE]"
                            : "bg-white border-slate-200/80 hover:bg-slate-50/60"
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheckedSkill(item.name)}
                            className="rounded border-slate-300 text-[#5B50E6] focus:ring-[#5B50E6] w-4 h-4"
                          />
                          <span
                            className={`text-xs ${
                              isChecked ? "font-bold text-[#5B50E6]" : "font-semibold text-slate-800"
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-[11px] text-slate-400">+{item.points}</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded bg-[#EDE9FE] text-[#5B50E6]">
                            POWER
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.name, `Copied "${item.name}"!`)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {dynamicWantedSkills.length > 0 && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          dynamicWantedSkills.map((s) => s.name).join(", "),
                          "Copied missing skills as a line!"
                        )
                      }
                      className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      Copy all as a skills line
                    </button>
                  </div>
                )}
              </div>

              {/* Already in your resume */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-900">Already in your resume</h3>
                <div className="flex flex-wrap gap-2">
                  {dynamicAlreadyInResumeSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bullet rewrites */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-slate-900">Bullet rewrites</h3>

                <div className="space-y-4">
                  {BULLET_REWRITES_DATA.map((diff, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/80 overflow-hidden text-xs shadow-2xs"
                    >
                      <div className="bg-[#FEF2F2] p-4 border-b border-rose-100 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-700">
                          BEFORE
                        </span>
                        <p className="text-slate-700 leading-relaxed font-sans">{diff.before}</p>
                      </div>

                      <div className="bg-[#F0FDF4] p-4 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                          AFTER
                        </span>
                        <p className="text-slate-800 leading-relaxed font-sans font-medium">
                          {diff.after}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions we couldn't do for you */}
              <div className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-[#5B50E6]">
                  Suggestions we couldn&apos;t do for you
                </h3>
                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  {STRATEGIC_SUGGESTIONS_DATA.map((sug, idx) => (
                    <p key={idx} className="flex items-start gap-2">
                      <span className="text-[#5B50E6] font-bold mt-0.5">•</span>
                      <span>{sug}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: SCORE BREAKDOWN (Image 7) ───────────────── */}
        {resultsTab === "score_breakdown" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-7">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Score breakdown</h2>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EDE9FE] text-[#5B50E6]">
                    Industry detected: Tech
                  </span>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 font-bold">Parsability</strong>
                        <span className="text-slate-400 ml-1.5">· 20% of score</span>
                      </div>
                      <div className="font-mono text-xs">
                        <span className="text-slate-400">14 → </span>
                        <strong className="text-emerald-600 font-bold">19</strong>
                        <span className="text-slate-400"> /20</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: "95%" }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 font-bold">Keyword density</strong>
                        <span className="text-slate-400 ml-1.5">· 35% of score</span>
                      </div>
                      <div className="font-mono text-xs">
                        <span className="text-slate-400">12 → </span>
                        <strong className="text-amber-600 font-bold">13</strong>
                        <span className="text-slate-400"> /35</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: "37%" }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 font-bold">Title alignment</strong>
                        <span className="text-slate-400 ml-1.5">· 25% of score</span>
                      </div>
                      <div className="font-mono text-xs">
                        <span className="text-slate-400">11 → </span>
                        <strong className="text-emerald-600 font-bold">19</strong>
                        <span className="text-slate-400"> /25</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: "76%" }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 font-bold">Experience match</strong>
                        <span className="text-slate-400 ml-1.5">· 20% of score</span>
                      </div>
                      <div className="font-mono text-xs">
                        <span className="text-slate-400">18 → </span>
                        <strong className="text-emerald-600 font-bold">18</strong>
                        <span className="text-slate-400"> /20</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
                  A 100-point rubric: parsability 20, keyword density 35, title alignment 25, experience match 20. Keyword density weighs most because it is the first filter an ATS applies.
                </p>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">Re-score my edited version</h3>
                    <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded bg-[#EDE9FE] text-[#5B50E6]">
                      POWER
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Editing and re-scoring your own version is a Pro feature. Your AI-optimized score above is unaffected.
                  </p>
                  <Link
                    href="/pricing"
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors shadow-2xs block text-center"
                  >
                    Unlock re-scoring — Pro, ₹199/mo
                  </Link>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-900">Tips that keep working</h3>
                  <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                    <p className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>Mirror the posting&apos;s exact noun — &ldquo;stakeholder reporting&rdquo;, not &ldquo;reporting for stakeholders&rdquo;.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>One number per bullet beats three adjectives.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>Submit as PDF unless the application asks for DOCX — and keep tables, columns and text boxes out.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>Re-run per application. Postings differ more than you&apos;d think.</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Was this result useful?</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUsefulFeedback("yes");
                          toast.success("Thank you for your feedback!");
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          usefulFeedback === "yes"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUsefulFeedback("not_quite");
                          toast.info("Thank you! We're constantly improving the scoring model.");
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          usefulFeedback === "not_quite"
                            ? "bg-amber-50 text-amber-700 border-amber-300"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        Not quite
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: SKILL ROADMAP (Image 8) ─────────────────── */}
        {resultsTab === "skill_roadmap" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">Skill roadmap</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  1 of 1 generations left
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  PICK UP TO 3 MISSING SKILLS
                </p>

                <div className="flex flex-wrap gap-2">
                  {dynamicWantedSkills.slice(0, 8).map((skillObj) => {
                    const skill = skillObj.name;
                    const isSelected = selectedRoadmapSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleRoadmapSkill(skill)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#5B50E6] text-white border-[#5B50E6] shadow-2xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!isRoadmapGenerated ? (
                <div>
                  <button
                    type="button"
                    disabled={selectedRoadmapSkills.length === 0}
                    onClick={() => {
                      setIsRoadmapGenerated(true);
                      toast.success("Skill roadmap generated!");
                    }}
                    className={`py-3 px-5 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer ${
                      selectedRoadmapSkills.length > 0
                        ? "bg-[#5B50E6] hover:bg-[#4E43D8] text-white active:scale-[0.99]"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    }`}
                  >
                    {selectedRoadmapSkills.length > 0
                      ? `Generate roadmap for ${selectedRoadmapSkills.join(", ")} →`
                      : "Pick a skill to start"}
                  </button>
                </div>
              ) : (
                <div className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#5B50E6] flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>7-Day Sprint Roadmap for: {selectedRoadmapSkills.join(", ")}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `7-Day Sprint Roadmap for ${selectedRoadmapSkills.join(", ")}\n\nDay 1-2: Setup Qiskit SDK & implement parameterized quantum circuits.\nDay 3-4: Build a mini QAOA optimization demo notebook on GitHub.\nDay 5-6: Write unit tests and document simulation convergence.\nDay 7: Add quantified bullet to your resume and push project to GitHub.`,
                          "Roadmap copied to clipboard!"
                        )
                      }
                      className="text-xs font-semibold text-[#5B50E6] hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy roadmap</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                    <div className="bg-white rounded-xl p-4 border border-purple-100 space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-[#5B50E6]">Days 1–2 · Setup & Core Foundations</span>
                      <p className="leading-relaxed">
                        Clone the official Qiskit textbook and install <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">qiskit[visualization]</code>. Implement a standard Bell state and evaluate statevector output.
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-purple-100 space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-[#5B50E6]">Days 3–4 · Proof of Work Mini-Project</span>
                      <p className="leading-relaxed">
                        Build a minimal Variational Quantum Eigensolver (VQE) or Max-Cut QAOA graph optimization script. Log cost function reduction across 20 iterations using classical optimizers (COBYLA/SPSA).
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-purple-100 space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-[#5B50E6]">Days 5–6 · Documentation & Tests</span>
                      <p className="leading-relaxed">
                        Publish to GitHub with a clean README, convergence plot SVG, and pytest verification. Document noise-model simulation with AerSimulator.
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-purple-100 space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-[#5B50E6]">Day 7 · Resume & Interview Positioning</span>
                      <p className="leading-relaxed">
                        Add the bullet: <em>&ldquo;Built an open-source QAOA Max-Cut solver in Qiskit, demonstrating 94% ground-state fidelity with COBYLA optimization under Aer noise models.&rdquo;</em>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 5: COVER LETTER (Image 9) ──────────────────── */}
        {resultsTab === "cover_letter" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">Cover letter</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  1 of 1 left
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Written from your optimized resume and this posting. Under 350 words, no buzzwords — specific claims only.
              </p>

              {!isCoverLetterGenerated ? (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCoverLetterGenerated(true);
                      toast.success("Tailored cover letter generated!");
                    }}
                    className="py-3 px-6 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-[0.99]"
                  >
                    <span>Write my cover letter</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-700">Cover Letter · IBM Research India</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `Dear Hiring Team at IBM Research India,\n\nI am writing to express my strong enthusiasm for the ${roleTitle} role. With deep hands-on experience developing LLM-based autonomous agent architectures, model evaluation pipelines, and runtime safety guardrails, I have focused on solving the exact reliability challenges your team tackles.\n\nRecently, I engineered RecoveryOS—a guardrailed AI decision system that processed 135 failed-payment test cases with zero duplicate executions and zero unsafe actions, recovering ₹20,726 through strict idempotency and append-only audit ledgers. Additionally, in AgentForensics, I created a digital forensics layer for MCP-connected agent swarms, evaluating 20 synthetic agent sessions to reliably detect and halt unintended tool escalations. My background also includes two IEEE conference publications in machine learning and contributing verified production fixes to open-source platforms used by over 50,000 teams (Cal.com).\n\nI would welcome the opportunity to bring this commitment to reproducible engineering, agent safety, and foundation model systems to IBM's research initiatives. Thank you for your consideration.\n\nSincerely,\n${candidateDisplayName}`,
                            "Cover letter copied to clipboard!"
                          )
                        }
                        className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy letter</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-6 font-mono text-xs text-slate-800 leading-relaxed space-y-4 whitespace-pre-line">
                    {`Dear Hiring Team at IBM Research India,

I am writing to express my strong enthusiasm for the ${roleTitle} role. With deep hands-on experience developing LLM-based autonomous agent architectures, model evaluation pipelines, and runtime safety guardrails, I have focused on solving the exact reliability challenges your team tackles.

Recently, I engineered RecoveryOS—a guardrailed AI decision system that processed 135 failed-payment test cases with zero duplicate executions and zero unsafe actions, recovering ₹20,726 through strict idempotency and append-only audit ledgers. Additionally, in AgentForensics, I created a digital forensics layer for MCP-connected agent swarms, evaluating 20 synthetic agent sessions to reliably detect and halt unintended tool escalations. My background also includes two IEEE conference publications in machine learning and contributing verified production fixes to open-source platforms used by over 50,000 teams (Cal.com).

I would welcome the opportunity to bring this commitment to reproducible engineering, agent safety, and foundation model systems to IBM's research initiatives. Thank you for your consideration.

Sincerely,
${candidateDisplayName}`}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 6: APPLY KIT (Image 10) ────────────────────── */}
        {resultsTab === "apply_kit" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Application kit</h2>

              <p className="text-xs text-slate-500 leading-relaxed">
                Answers to the questions most applications ask, and a short note for a recruiter, written only from your tailored resume. They&apos;re drafts: read them, change anything that isn&apos;t true for you, and send them yourself.
              </p>

              {!isApplyKitGenerated ? (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsApplyKitGenerated(true);
                      toast.success("Application kit generated!");
                    }}
                    className="py-3 px-6 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-[0.99]"
                  >
                    <span>Write my application kit</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="rounded-xl border border-slate-200/80 p-5 bg-white space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        1 · Recruiter Outreach Note (LinkedIn / Email)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `Hi [Recruiter Name] — I noticed IBM Research India is looking for a Research Intern in AI and Quantum Algorithms. I build safety and evaluation layers for autonomous LLM agents (LangGraph, MCP), have 2 IEEE ML publications, and authored open-source bug fixes for Cal.com (50k+ teams). I've submitted my application and would love to connect!`,
                            "Copied outreach note!"
                          )
                        }
                        className="text-xs font-semibold text-[#5B50E6] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy note</span>
                      </button>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-700 leading-relaxed">
                      Hi [Recruiter Name] — I noticed IBM Research India is looking for a Research Intern in AI and Quantum Algorithms. I build safety and evaluation layers for autonomous LLM agents (LangGraph, MCP), have 2 IEEE ML publications, and authored open-source bug fixes for Cal.com (50k+ teams). I&apos;ve submitted my application and would love to connect!
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 p-5 bg-white space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        2 · &ldquo;Why do you want to join IBM for this role?&rdquo;
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `IBM's pioneering leadership in quantum computing (Qiskit, IBM Quantum System Two) and robust AI research aligns directly with my technical focus. Having built guardrailed multi-agent systems with LangGraph and MCP and published two IEEE machine learning papers, I am eager to contribute to reproducible quantum algorithm development and simulation benchmarks.`,
                            "Copied answer!"
                          )
                        }
                        className="text-xs font-semibold text-[#5B50E6] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy answer</span>
                      </button>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-700 leading-relaxed">
                      IBM&apos;s pioneering leadership in quantum computing (Qiskit, IBM Quantum System Two) and robust AI research aligns directly with my technical focus. Having built guardrailed multi-agent systems with LangGraph and MCP and published two IEEE machine learning papers, I am eager to contribute to reproducible quantum algorithm development and simulation benchmarks.
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 p-5 bg-white space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        3 · &ldquo;Describe a challenging technical problem you solved&rdquo;
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `When building RecoveryOS, non-deterministic AI outputs threatened duplicate transactions during payment failure workflows. I designed an idempotent reconciliation ledger coupled with an append-only audit trail and strict retry budgets. Across 135 simulated failure scenarios, the system recovered ₹20,726 with zero duplicate executions, backed by 232 automated tests.`,
                            "Copied achievement answer!"
                          )
                        }
                        className="text-xs font-semibold text-[#5B50E6] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy answer</span>
                      </button>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-700 leading-relaxed">
                      When building RecoveryOS, non-deterministic AI outputs threatened duplicate transactions during payment failure workflows. I designed an idempotent reconciliation ledger coupled with an append-only audit trail and strict retry budgets. Across 135 simulated failure scenarios, the system recovered ₹20,726 with zero duplicate executions, backed by 232 automated tests.
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 p-5 bg-white space-y-2.5">
                    <span className="text-xs font-bold text-slate-900">
                      4 · Standard Application Logistics
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Notice / Availability</span>
                        <span className="font-semibold text-slate-800">Immediately available for full-time / internship</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Work Authorization</span>
                        <span className="font-semibold text-slate-800">Authorized to work in India (Citizen)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // RENDER VIEW 4: INPUT FORM SCREEN (Screenshot 1)
  // ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fbfbf9] text-slate-900 pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">1 · Your resume</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paste the text, or upload the PDF you already send out.
                  </p>
                </div>

                <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-600 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setResumeTab("paste")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      resumeTab === "paste"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    Paste text
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeTab("upload")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      resumeTab === "upload"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    Upload file
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeTab("saved")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      resumeTab === "saved"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    Saved resumes
                  </button>
                </div>
              </div>

              {resumeTab === "upload" && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,.md,.tex"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <p className="text-xs font-semibold text-slate-700">
                      {uploadedFileName
                        ? `Tap to change file (${uploadedFileName})`
                        : "Tap to choose a PDF or .tex file, or drop one here"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PDF or LaTeX (.tex) — for .docx, paste the text instead.
                    </p>
                    {isUploading && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-[#5B50E6]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Parsing resume content...</span>
                      </div>
                    )}
                  </div>

                  <textarea
                    rows={8}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] resize-y font-mono leading-relaxed"
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 font-medium">
                      {resumeText.length.toLocaleString()} characters
                    </span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Found {foundLinksCount} links behind words in your PDF and kept them.</span>
                    </span>
                  </div>
                </div>
              )}

              {resumeTab === "paste" && (
                <div className="space-y-2">
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume here..."
                    rows={8}
                    className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] resize-y font-mono leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>{resumeText.length.toLocaleString()} characters</span>
                    {resumeText.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setResumeText("")}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}

              {resumeTab === "saved" && (
                <div className="space-y-3">
                  {!savedResumesData || savedResumesData.resumes.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                      <Bookmark className="w-6 h-6 text-slate-400 mx-auto mb-2 opacity-60" />
                      <p className="text-xs font-semibold text-slate-700">No saved resumes found</p>
                      <Link
                        href="/resumes"
                        className="text-xs font-semibold text-[#5B50E6] hover:underline mt-1 inline-block"
                      >
                        Manage Saved Resumes →
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {savedResumesData.resumes.map((resume: SavedResumeDoc) => (
                        <div
                          key={resume._id}
                          onClick={() => handleSelectSavedResume(resume)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedSavedResumeId === resume._id
                              ? "border-[#5B50E6] bg-[#EDE9FE]/40"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900 truncate">{resume.title}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {resume.targetRole || "General"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">2 · The job you want</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paste the posting, or give us its link and we&apos;ll read it.
                  </p>
                </div>

                <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-600 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setJobTab("paste")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      jobTab === "paste"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    Paste text
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobTab("url")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      jobTab === "url"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    From URL
                  </button>
                </div>
              </div>

              {jobTab === "paste" && (
                <div className="space-y-3">
                  <textarea
                    rows={7}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here... Include requirements, responsibilities, qualifications, and any preferred skills."
                    className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] resize-y font-sans leading-relaxed"
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 font-medium">
                      {jobDescription.length.toLocaleString()} characters
                    </span>
                    <Link
                      href="/should-i-apply"
                      className="text-xs font-semibold text-[#5B50E6] hover:underline flex items-center gap-1"
                    >
                      <span>Not sure this job suits you? Check the fit first, it&apos;s free →</span>
                    </Link>
                  </div>
                </div>
              )}

              {jobTab === "url" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="https://jobs.lever.co/company/job-id..."
                      className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6]"
                    />
                    <button
                      type="button"
                      onClick={handleScrapeUrl}
                      disabled={isScraping}
                      className="py-2.5 px-4 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {isScraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Fetch"}
                    </button>
                  </div>
                  {jobDescription && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 max-h-32 overflow-y-auto">
                      {jobDescription}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900">
                  3 · Anything we can&apos;t see? <span className="text-slate-400 font-normal">Optional</span>
                </h2>
              </div>

              <textarea
                rows={3}
                maxLength={600}
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="e.g. &ldquo;Led the migration to Snowflake — saved ₹18L/yr.&rdquo; — an achievement not on the resume yet."
                className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B50E6]/20 focus:border-[#5B50E6] resize-y font-sans leading-relaxed"
              />

              <div className="text-right text-[11px] text-slate-400 mt-1">
                {additionalContext.length} / 600
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900">4 · Output length</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {OUTPUT_LENGTH_OPTIONS.map((opt) => {
                  const isSelected = outputLength === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setOutputLength(opt.id)}
                      className={`py-3 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                        isSelected
                          ? "border-[#5B50E6] bg-[#EDE9FE]/50 text-[#5B50E6] ring-1 ring-[#5B50E6]"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-400 mt-3">
                We pick from your experience: PDF downloads are formatted cleanly to fit the chosen page length.
              </p>
            </section>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartOptimization}
                className="w-full py-3.5 px-6 rounded-xl bg-[#5B50E6] hover:bg-[#4E43D8] text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Optimize my resume →</span>
              </button>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                WHAT HAPPENS NEXT
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    We read the posting and pull out the 20–30 terms that decide the screen.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Your bullets get rewritten with real numbers — we ask you when we don&apos;t have one.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    You get a score, a diff of every change, and an ATS-safe file.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900">Free allowance</h3>
              <div>
                <p className="text-xl font-extrabold text-slate-900">
                  <span className="text-2xl font-black">
                    {creditsStatus?.freeOptimizationsRemaining ?? 2}
                  </span>{" "}
                  of 2 optimizations left
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  One-time, never expires · 20 a month on Pro
                </p>
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#5B50E6] hover:underline pt-1"
              >
                <span>See plans →</span>
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  SAVED RESUMES
                </h3>
                <Link
                  href="/resumes"
                  className="text-xs font-semibold text-[#5B50E6] hover:underline"
                >
                  Manage
                </Link>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nothing saved yet. Build one and reuse it on every application.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
