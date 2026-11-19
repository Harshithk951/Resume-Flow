// convex/ai/jobCheck.ts
//
// "Should I Apply?" Job Fit Checker
// Evaluates candidate resume text against target job description:
// 1. Match score (0-100%)
// 2. Matched skills & Missing skills
// 3. Experience level alignment analysis
// 4. Red flags detection (suspicious terms, commission-only, 24/7 on-call, toxic requirements)
// 5. Genuineness assessment rating and explanation

"use node";

import { action } from "../_generated/server";
import { v, ConvexError } from "convex/values";
import { OpenAI } from "openai";
import { z } from "zod";
import { cleanAndParseJSON } from "./jsonSanitizer";

// ─── Zod Schema for Result Validation ────────────────────────

export const JobCheckResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  experienceLevel: z.object({
    alignment: z.string(),
    analysis: z.string(),
    candidateEstimatedYears: z.number().optional().default(0),
    requiredEstimatedYears: z.number().optional().default(0),
  }),
  redFlags: z.array(
    z.object({
      flag: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      explanation: z.string(),
    })
  ),
  genuineness: z.object({
    rating: z.enum(["high", "moderate", "suspicious", "unlikely"]),
    score: z.number().min(0).max(100),
    explanation: z.string(),
  }),
  summary: z.string(),
});

export type JobCheckResult = z.infer<typeof JobCheckResultSchema>;

// ─── Skill Taxonomy & Keyword Bank ────────────────────────────

const SKILL_TAXONOMY: { name: string; aliases: string[] }[] = [
  // Programming Languages
  { name: "TypeScript", aliases: ["typescript", "ts"] },
  { name: "JavaScript", aliases: ["javascript", "js", "ecmascript"] },
  { name: "Python", aliases: ["python", "py"] },
  { name: "Java", aliases: ["java"] },
  { name: "C++", aliases: ["c++", "cpp"] },
  { name: "C#", aliases: ["c#", "csharp", ".net"] },
  { name: "Go", aliases: ["golang", "go"] },
  { name: "Rust", aliases: ["rust"] },
  { name: "SQL", aliases: ["sql", "mysql", "postgresql", "postgres", "sqlite"] },
  { name: "HTML/CSS", aliases: ["html", "css", "html5", "css3"] },
  { name: "Ruby", aliases: ["ruby", "ruby on rails", "rails"] },
  { name: "PHP", aliases: ["php", "laravel"] },
  { name: "Kotlin", aliases: ["kotlin"] },
  { name: "Swift", aliases: ["swift"] },

  // Frameworks & Libraries
  { name: "React", aliases: ["react", "react.js", "reactjs"] },
  { name: "Next.js", aliases: ["next.js", "nextjs", "next"] },
  { name: "Node.js", aliases: ["node.js", "nodejs", "node"] },
  { name: "Express", aliases: ["express", "express.js", "expressjs"] },
  { name: "Vue.js", aliases: ["vue", "vue.js", "vuejs"] },
  { name: "Angular", aliases: ["angular", "angularjs"] },
  { name: "Django", aliases: ["django"] },
  { name: "FastAPI", aliases: ["fastapi"] },
  { name: "Spring Boot", aliases: ["spring boot", "spring"] },
  { name: "Tailwind CSS", aliases: ["tailwind", "tailwindcss"] },
  { name: "GraphQL", aliases: ["graphql"] },
  { name: "REST APIs", aliases: ["rest", "restful", "rest api", "apis"] },

  // Cloud & Infrastructure
  { name: "AWS", aliases: ["aws", "amazon web services", "s3", "ec2", "lambda"] },
  { name: "Azure", aliases: ["azure", "microsoft azure"] },
  { name: "Google Cloud", aliases: ["gcp", "google cloud"] },
  { name: "Docker", aliases: ["docker", "containerization", "containers"] },
  { name: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { name: "CI/CD", aliases: ["ci/cd", "ci cd", "github actions", "gitlab ci", "jenkins"] },
  { name: "Terraform", aliases: ["terraform", "iac"] },
  { name: "Linux", aliases: ["linux", "bash", "shell scripting"] },
  { name: "Redis", aliases: ["redis", "caching"] },
  { name: "MongoDB", aliases: ["mongodb", "mongo", "nosql"] },

  // AI & Data
  { name: "Machine Learning", aliases: ["machine learning", "ml", "deep learning"] },
  { name: "PyTorch", aliases: ["pytorch"] },
  { name: "TensorFlow", aliases: ["tensorflow", "tf"] },
  { name: "Data Engineering", aliases: ["data pipeline", "etl", "spark", "kafka"] },
  { name: "LLM / AI", aliases: ["llm", "large language models", "prompt engineering", "genai"] },

  // Core Software Engineering
  { name: "System Design", aliases: ["system design", "distributed systems", "scalability", "architecture"] },
  { name: "Agile / Scrum", aliases: ["agile", "scrum", "kanban", "sprints"] },
  { name: "Unit Testing", aliases: ["unit testing", "jest", "cypress", "vitest", "playwright", "tdd"] },
  { name: "Git", aliases: ["git", "github", "gitlab", "version control"] },
];

// ─── Red Flag Pattern Definitions ─────────────────────────────

interface RedFlagPattern {
  name: string;
  severity: "low" | "medium" | "high";
  regex: RegExp;
  explanation: string;
}

const RED_FLAG_PATTERNS: RedFlagPattern[] = [
  {
    name: "Commission-Only Compensation",
    severity: "high",
    regex: /\b(commission[\s-]only|100%\s*commission|no\s*base\s*(?:salary|pay)|unpaid\s*(?:role|work|internship))\b/i,
    explanation: "The job appears to be unpaid or commission-only, lacking guaranteed base pay.",
  },
  {
    name: "Upfront Fee / Pay-to-Work",
    severity: "high",
    regex: /\b(pay\s*for\s*(?:training|equipment|software)|deposit\s*required|registration\s*fee|candidate\s*investment)\b/i,
    explanation: "Legitimate employers never demand upfront fees, deposits, or equipment purchases from candidates.",
  },
  {
    name: "Extreme 24/7 Availability / Burnout Culture",
    severity: "high",
    regex: /\b(24\/7(?:\s*availability)?|round[\s-]the[\s-]clock|always[\s-]on|respond\s*(?:at\s*all\s*hours|weekends)|work\s*around\s*the\s*clock)\b/i,
    explanation: "Demands perpetual availability without clear work-life boundaries or on-call compensation.",
  },
  {
    name: "Suspicious Contact Channels",
    severity: "high",
    regex: /\b(contact\s*(?:via\s*)?(?:only\s*)?telegram|interview\s*(?:via\s*)?whatsapp|crypto\s*payout|western\s*union)\b/i,
    explanation: "Recruitment exclusively conducted via messaging apps or cryptocurrency payouts is a major hallmark of employment scams.",
  },
  {
    name: "Toxic Workplace Euphemisms",
    severity: "medium",
    regex: /\b(we\s*are\s*like\s*a\s*family|handle\s*extreme\s*stress\s*without\s*complaining|must\s*have\s*thick\s*skin|high\s*pressure\s*tolerance)\b/i,
    explanation: "Phrasing such as 'like a family' or 'thick skin required' often correlates with boundary erosion and high turnover.",
  },
  {
    name: "Uncapped Responsibility / Vague Role",
    severity: "low",
    regex: /\b(wear\s*(?:many|every)\s*hats?|do\s*whatever\s*it\s*takes|duties\s*as\s*assigned\s*without\s*limit)\b/i,
    explanation: "Signals role ambiguity where one candidate may be expected to handle 3+ distinct full-time roles.",
  },
];

// ─── Heuristic Extraction Helpers ─────────────────────────────

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const matched: string[] = [];

  for (const item of SKILL_TAXONOMY) {
    for (const alias of item.aliases) {
      // Word boundary match
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
      if (regex.test(lower)) {
        matched.push(item.name);
        break;
      }
    }
  }

  return matched;
}

function extractYearsOfExperience(text: string): number {
  const matches = text.matchAll(/(?:(\d+)(?:\s*-\s*(\d+))?|\b(\d+)\+?)\s*(?:years|yrs)(?:\s*of\s*experience)?/gi);
  let maxYears = 0;
  for (const m of matches) {
    const val = parseInt(m[1] || m[3] || "0", 10);
    if (val > maxYears && val <= 30) {
      maxYears = val;
    }
  }
  return maxYears;
}

function detectRedFlags(jobText: string): Array<{ flag: string; severity: "low" | "medium" | "high"; explanation: string }> {
  const detected: Array<{ flag: string; severity: "low" | "medium" | "high"; explanation: string }> = [];

  for (const p of RED_FLAG_PATTERNS) {
    if (p.regex.test(jobText)) {
      detected.push({
        flag: p.name,
        severity: p.severity,
        explanation: p.explanation,
      });
    }
  }

  return detected;
}

function evaluateGenuineness(jobText: string): {
  rating: "high" | "moderate" | "suspicious" | "unlikely";
  score: number;
  explanation: string;
} {
  const words = jobText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount < 25) {
    return {
      rating: "unlikely",
      score: 15,
      explanation: "Job posting is too short or incomplete (under 25 words) to evaluate as a genuine listing.",
    };
  }

  // Check structure markers
  const markers = [
    /\b(responsibilities|duties|what you('ll| will) do|role overview)\b/i,
    /\b(requirements|qualifications|skills|who you are|what we('re| are) looking for)\b/i,
    /\b(about (us|our team|the company)|company overview)\b/i,
    /\b(benefits|perks|compensation|what we offer|salary)\b/i,
  ];

  let markersFound = 0;
  for (const m of markers) {
    if (m.test(jobText)) markersFound++;
  }

  // Check red flag count
  const redFlags = detectRedFlags(jobText);
  const highSeverityCount = redFlags.filter((f) => f.severity === "high").length;

  if (highSeverityCount >= 2) {
    return {
      rating: "suspicious",
      score: 30,
      explanation: "Multiple critical red flags detected (e.g. upfront costs, commission-only, or non-standard contact methods).",
    };
  }

  if (markersFound >= 3 && wordCount >= 100) {
    return {
      rating: "high",
      score: 95,
      explanation: "Well-structured job description with standard responsibilities, requirements, and clear company expectations.",
    };
  }

  if (markersFound >= 1 && wordCount >= 50) {
    return {
      rating: "moderate",
      score: 75,
      explanation: "Legitimate description with standard role expectations, though some section details are brief.",
    };
  }

  return {
    rating: "moderate",
    score: 60,
    explanation: "Basic description provided without complete section breakdown, but no active scam indicators observed.",
  };
}

function computeHeuristicFit(resumeText: string, jobText: string): JobCheckResult {
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobText);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of jobSkills) {
    if (resumeSkills.includes(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // Match score calculation
  let matchScore: number;
  if (jobSkills.length === 0) {
    // If no specific technical skills found, perform lexical term overlap
    const resumeWords = new Set(resumeText.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
    const jobWords = jobText.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const overlap = jobWords.filter((w) => resumeWords.has(w)).length;
    const ratio = jobWords.length > 0 ? overlap / jobWords.length : 0.5;
    matchScore = Math.min(95, Math.max(35, Math.round(ratio * 100)));
  } else {
    const rawRatio = matchedSkills.length / jobSkills.length;
    // Scale smoothly: even a partial match gives realistic score
    matchScore = Math.round(rawRatio * 85 + (matchedSkills.length > 0 ? 15 : 0));
    matchScore = Math.min(100, Math.max(10, matchScore));
  }

  const candidateYears = extractYearsOfExperience(resumeText);
  const requiredYears = extractYearsOfExperience(jobText);

  let alignment = "Well Aligned";
  let analysis = `Candidate profile demonstrates approx. ${candidateYears} years experience against ${requiredYears ? `${requiredYears}+ years requested` : "standard requirements"}.`;

  if (requiredYears > 0 && candidateYears < requiredYears) {
    const gap = requiredYears - candidateYears;
    if (gap > 3) {
      alignment = "Seniority Gap";
      analysis = `Role requests ${requiredYears}+ years experience, which exceeds the candidate's current estimated ${candidateYears} years. Consider highlighting leadership & high-impact projects.`;
    } else {
      alignment = "Moderate Stretch";
      analysis = `Role requests ${requiredYears} years vs ~${candidateYears} years on resume. Highly achievable by highlighting relevant domain accomplishments.`;
    }
  } else if (requiredYears > 0 && candidateYears >= requiredYears) {
    alignment = "Strong Fit";
    analysis = `Candidate experience (~${candidateYears} years) comfortably satisfies the role's requested ${requiredYears} years.`;
  }

  const redFlags = detectRedFlags(jobText);
  const genuineness = evaluateGenuineness(jobText);

  const summary =
    matchScore >= 75
      ? `Strong job match (${matchScore}%). You meet ${matchedSkills.length} of ${jobSkills.length || matchedSkills.length} core requirements with high alignment.`
      : matchScore >= 50
      ? `Moderate job match (${matchScore}%). You have solid foundations in ${matchedSkills.slice(0, 3).join(", ") || "the domain"}, but should bridge ${missingSkills.slice(0, 2).join(", ") || "skill gaps"} before applying.`
      : `Challenging match (${matchScore}%). Several primary technologies (${missingSkills.slice(0, 3).join(", ")}) are missing from your resume text.`;

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    experienceLevel: {
      alignment,
      analysis,
      candidateEstimatedYears: candidateYears,
      requiredEstimatedYears: requiredYears,
    },
    redFlags,
    genuineness,
    summary,
  };
}

// ─── Public Action: checkJobFit ───────────────────────────────

export const checkJobFit = action({
  args: {
    resumeText: v.string(),
    jobText: v.string(),
  },
  handler: async (_ctx, args): Promise<JobCheckResult> => {
    const trimmedResume = args.resumeText.trim();
    const trimmedJob = args.jobText.trim();

    if (!trimmedResume) {
      throw new ConvexError("Resume text is required for job fit analysis.");
    }
    if (!trimmedJob) {
      throw new ConvexError("Job description text is required for job fit analysis.");
    }

    // Always compute baseline heuristic result (used for grounding and fallback)
    const baseline = computeHeuristicFit(trimmedResume, trimmedJob);

    // If API keys are available, enhance evaluation with NVIDIA NIM / OpenAI
    const nimKey = process.env.NVIDIA_NIM_API_KEY || process.env.OPENAI_API_KEY;
    if (!nimKey) {
      return baseline;
    }

    try {
      const isNim = Boolean(process.env.NVIDIA_NIM_API_KEY);
      const openai = new OpenAI({
        apiKey: nimKey,
        baseURL: isNim ? "https://integrate.api.nvidia.com/v1" : undefined,
      });

      const model = isNim ? "meta/llama-3.1-8b-instruct" : "gpt-4o-mini";

      const prompt = `You are a principal talent acquisition specialist and career strategist.
Analyze the following candidate resume text against the target job description to determine fit and identify any red flags in the job posting.

=== RESUME TEXT ===
${trimmedResume.slice(0, 4000)}

=== JOB DESCRIPTION ===
${trimmedJob.slice(0, 4000)}

Evaluate and return a single valid JSON object strictly matching this schema:
{
  "matchScore": <number from 0 to 100 indicating percentage match>,
  "matchedSkills": [<array of skill strings found in both resume and job>],
  "missingSkills": [<array of key skills required by job but not found in resume>],
  "experienceLevel": {
    "alignment": "<e.g. Strong Fit | Well Aligned | Moderate Stretch | Seniority Gap>",
    "analysis": "<1-2 sentence analysis of seniority alignment>",
    "candidateEstimatedYears": <number>,
    "requiredEstimatedYears": <number>
  },
  "redFlags": [
    {
      "flag": "<name of red flag, e.g. Commission-Only or 24/7 On-Call>",
      "severity": "<low | medium | high>",
      "explanation": "<why this is a concern>"
    }
  ],
  "genuineness": {
    "rating": "<high | moderate | suspicious | unlikely>",
    "score": <number from 0 to 100>,
    "explanation": "<assessment of whether this is a legitimate, structured job posting>"
  },
  "summary": "<2-3 sentence strategic takeaway on whether the candidate should apply and what to optimize>"
}

Rules:
1. Be realistic and honest with matchScore. Do not inflate.
2. Check for real red flags (unpaid, commission only, 24/7 on-call, upfront fees, telegram only interviews).
3. Return ONLY the raw JSON block. No explanation or markdown wrapper.`;

      const completion = await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1500,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      const parsed = cleanAndParseJSON(responseText);
      const validated = JobCheckResultSchema.parse(parsed);

      // Merge baseline detected red flags to ensure safety patterns aren't missed
      const combinedRedFlags = [...validated.redFlags];
      for (const bf of baseline.redFlags) {
        if (!combinedRedFlags.some((f) => f.flag.toLowerCase() === bf.flag.toLowerCase())) {
          combinedRedFlags.push(bf);
        }
      }

      return {
        ...validated,
        redFlags: combinedRedFlags,
      };
    } catch (err) {
      console.warn("[checkJobFit] AI completion failed or timed out — using reliable heuristic engine:", err);
      return baseline;
    }
  },
});
