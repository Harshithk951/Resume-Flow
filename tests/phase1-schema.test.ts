import { describe, it, expect } from "vitest";
import {
  CanonicalResumeSchema,
  ResumeBulletSchema,
  ResumeSkillSchema,
} from "../lib/resume/schema";
import {
  toCanonicalResume,
  toLegacyStructuredContent,
  generateDeterministicBulletId,
} from "../lib/resume/adapter";
import {
  ALLOWED_PIPELINE_TRANSITIONS,
  canonicalizePipelineState,
} from "../convex/jobs";

describe("Phase 1: Canonical Schema & Provenance", () => {
  const legacySample = {
    personalInfo: {
      name: "Harshith Kumar",
      email: "harshith@example.com",
      phone: "+91 9876543210",
      linkedin: "https://linkedin.com/in/harshith",
    },
    summary: "Senior Full Stack Engineer with 5+ years of experience.",
    education: [
      {
        institution: "IIT Madras",
        degree: "B.Tech Computer Science",
        year: "2020",
        gpa: "8.9",
      },
    ],
    experience: [
      {
        company: "Stripe",
        role: "Software Engineer",
        duration: "2022 - Present",
        bullets: [
          "Engineered distributed idempotency engine reducing duplicate webhook events by 99.8%.",
          "Architected real-time streaming pipeline processing 15M transactions per day.",
        ],
      },
    ],
    projects: [
      {
        name: "ResumeFlow",
        description: "ATS Resume Optimization platform",
        technologies: ["Next.js", "TypeScript", "Convex"],
        bullets: [
          "Built anti-fabrication provenance tracking verifying every bullet origin.",
        ],
      },
    ],
    skills: {
      languages: ["TypeScript", "Python", "Go"],
      frameworks: ["React 19", "Next.js 15"],
      tools: ["Docker", "PostgreSQL", "Redis"],
    },
  };

  it("converts legacy resume to strict canonical resume schema", () => {
    const canonical = toCanonicalResume(legacySample, { deterministic: true });

    // Validates against Zod schema
    const validated = CanonicalResumeSchema.parse(canonical);
    expect(validated.schemaVersion).toBe(1);
    expect(validated.personalInfo.name).toBe("Harshith Kumar");

    // Every bullet has { id, text, origin: 'legacy' }
    expect(validated.experience[0].bullets[0]).toHaveProperty("id");
    expect(validated.experience[0].bullets[0].origin).toBe("legacy");
    expect(validated.experience[0].bullets[0].text).toContain("Engineered distributed idempotency");

    // Every skill has { name, origin: 'legacy' }
    expect(validated.skills.languages[0]).toEqual({
      name: "TypeScript",
      origin: "legacy",
    });
  });

  it("converts canonical resume back to legacy format for old readers without loss", () => {
    const canonical = toCanonicalResume(legacySample, { deterministic: true });
    const legacy = toLegacyStructuredContent(canonical);

    expect(typeof legacy.experience[0].bullets[0]).toBe("string");
    expect(legacy.experience[0].bullets[0]).toContain("Engineered distributed idempotency");
    expect(typeof legacy.skills.languages[0]).toBe("string");
    expect(legacy.skills.languages[0]).toBe("TypeScript");
  });

  it("validates provenance origins (original, rewritten, user_added, legacy)", () => {
    const bullet = {
      id: "b_custom_1",
      text: "Optimized SQL queries reducing latency by 45%",
      origin: "rewritten" as const,
      sourceBulletId: "b_orig_1",
    };
    expect(ResumeBulletSchema.parse(bullet)).toEqual(bullet);

    const invalidBullet = {
      id: "b_invalid",
      text: "Text",
      origin: "invented_by_ai", // Invalid origin
    };
    expect(() => ResumeBulletSchema.parse(invalidBullet)).toThrow();

    const skill = { name: "Kubernetes", origin: "user_confirmed" as const };
    expect(ResumeSkillSchema.parse(skill)).toEqual(skill);
  });

  it("generates deterministic bullet IDs for reproducible migrations", () => {
    const id1 = generateDeterministicBulletId("exp_0", 0, "Engineered idempotency");
    const id2 = generateDeterministicBulletId("exp_0", 0, "Engineered idempotency");
    const idDiff = generateDeterministicBulletId("exp_0", 1, "Engineered idempotency");

    expect(id1).toBe(id2);
    expect(id1).not.toBe(idDiff);
    expect(id1.startsWith("b_")).toBe(true);
  });
});

describe("Phase 1: Migration Dry-Run and Double-Run Idempotency", () => {
  interface MockDbRecord {
    _id: string;
    structuredContent: any;
  }

  class MockMigrationRunner {
    records: Map<string, MockDbRecord> = new Map();

    addRecord(id: string, content: any) {
      this.records.set(id, { _id: id, structuredContent: content });
    }

    runMigration(dryRun: boolean = true) {
      let processedCount = 0;
      let migratedCount = 0;
      let alreadyMigratedCount = 0;

      for (const record of this.records.values()) {
        processedCount++;
        const current = record.structuredContent;

        const isAlreadyMigrated =
          current &&
          current.schemaVersion === 1 &&
          Array.isArray(current.experience?.[0]?.bullets) &&
          typeof current.experience[0]?.bullets[0] === "object" &&
          current.experience[0]?.bullets[0]?.origin !== undefined;

        if (isAlreadyMigrated) {
          alreadyMigratedCount++;
          continue;
        }

        const canonical = toCanonicalResume(current, { deterministic: true });

        if (!dryRun) {
          record.structuredContent = canonical;
        }
        migratedCount++;
      }

      return { dryRun, processedCount, migratedCount, alreadyMigratedCount };
    }
  }

  it("dry-run reports counts without modifying records", () => {
    const runner = new MockMigrationRunner();
    runner.addRecord("res_1", {
      personalInfo: { name: "Alice" },
      experience: [{ company: "Acme", bullets: ["Built feature X"] }],
    });

    const dryRunResult = runner.runMigration(true);
    expect(dryRunResult.dryRun).toBe(true);
    expect(dryRunResult.migratedCount).toBe(1);
    expect(dryRunResult.processedCount).toBe(1);

    // Underlying record must still have raw strings
    const doc = runner.records.get("res_1");
    expect(typeof doc?.structuredContent.experience[0].bullets[0]).toBe("string");
  });

  it("real migration transforms records and running twice is strictly idempotent", () => {
    const runner = new MockMigrationRunner();
    runner.addRecord("res_1", {
      personalInfo: { name: "Bob" },
      experience: [{ company: "Globex", bullets: ["Designed API gateway"] }],
      skills: { languages: ["Go"] },
    });

    // Run 1: Real migration
    const run1 = runner.runMigration(false);
    expect(run1.dryRun).toBe(false);
    expect(run1.migratedCount).toBe(1);
    expect(run1.alreadyMigratedCount).toBe(0);

    const docAfterRun1 = runner.records.get("res_1");
    expect(docAfterRun1?.structuredContent.schemaVersion).toBe(1);
    const bulletId1 = docAfterRun1?.structuredContent.experience[0].bullets[0].id;
    expect(bulletId1).toBeDefined();

    // Run 2: Real migration again
    const run2 = runner.runMigration(false);
    expect(run2.migratedCount).toBe(0);
    expect(run2.alreadyMigratedCount).toBe(1);

    const docAfterRun2 = runner.records.get("res_1");
    const bulletId2 = docAfterRun2?.structuredContent.experience[0].bullets[0].id;
    // IDs must remain 100% identical
    expect(bulletId2).toBe(bulletId1);
  });
});

describe("Phase 1: Pipeline State Machine Transitions", () => {
  function checkTransition(from: string, to: string): boolean {
    const canonicalFrom = canonicalizePipelineState(from);
    const canonicalTo = canonicalizePipelineState(to);
    const allowed = ALLOWED_PIPELINE_TRANSITIONS[canonicalFrom];
    return Boolean(allowed && allowed.includes(canonicalTo));
  }

  it("allows standard forward pipeline path", () => {
    expect(checkTransition("queued", "parsing")).toBe(true);
    expect(checkTransition("parsing", "extracting")).toBe(true);
    expect(checkTransition("extracting", "planning")).toBe(true);
    expect(checkTransition("planning", "rewriting")).toBe(true);
    expect(checkTransition("rewriting", "verifying")).toBe(true);
    expect(checkTransition("verifying", "rendering")).toBe(true);
    expect(checkTransition("rendering", "done")).toBe(true);
  });

  it("allows user input pause and resume path", () => {
    expect(checkTransition("extracting", "needs_input")).toBe(true);
    expect(checkTransition("needs_input", "planning")).toBe(true);
    expect(checkTransition("needs_input", "rewriting")).toBe(true);
  });

  it("allows transition to failed from active states", () => {
    expect(checkTransition("queued", "failed")).toBe(true);
    expect(checkTransition("parsing", "failed")).toBe(true);
    expect(checkTransition("extracting", "failed")).toBe(true);
    expect(checkTransition("planning", "failed")).toBe(true);
    expect(checkTransition("rewriting", "failed")).toBe(true);
    expect(checkTransition("rendering", "failed")).toBe(true);
  });

  it("rejects invalid out-of-order transitions", () => {
    expect(checkTransition("queued", "rewriting")).toBe(false);
    expect(checkTransition("parsing", "rendering")).toBe(false);
    expect(checkTransition("done", "rendering")).toBe(false); // terminal state
    expect(checkTransition("failed", "parsing")).toBe(false); // terminal state
  });

  it("transparently supports legacy state aliases", () => {
    expect(canonicalizePipelineState("uploaded")).toBe("queued");
    expect(canonicalizePipelineState("tailoring")).toBe("rewriting");
    expect(canonicalizePipelineState("compiling")).toBe("rendering");
    expect(canonicalizePipelineState("needs_user_input")).toBe("needs_input");
    expect(canonicalizePipelineState("completed")).toBe("done");

    // uploaded -> parsing allowed (mapped from queued -> parsing)
    expect(checkTransition("uploaded", "parsing")).toBe(true);
  });
});

describe("Phase 1: aiRuns Telemetry Table Writes", () => {
  interface MockAiRun {
    id: string;
    runId: string;
    userId: string;
    jobId?: string;
    stage: string;
    provider: string;
    model: string;
    promptVersion: string;
    tokens?: number;
    costEstimate?: number;
    durationMs?: number;
    verificationReport?: any;
    error?: string;
    createdAt: number;
  }

  const aiRunsTable: MockAiRun[] = [];

  function logAiRun(data: Omit<MockAiRun, "id" | "createdAt">): string {
    const id = `airun_${Math.random().toString(36).substring(7)}`;
    aiRunsTable.push({
      ...data,
      id,
      createdAt: Date.now(),
    });
    return id;
  }

  it("writes structured AI run telemetry records", () => {
    const id = logAiRun({
      runId: "run_test_123",
      userId: "user_456",
      jobId: "job_789",
      stage: "rewriting",
      provider: "nvidia",
      model: "meta/llama-3.3-70b-instruct",
      promptVersion: "v1.0",
      tokens: 1420,
      costEstimate: 0.002,
      durationMs: 840,
      verificationReport: {
        antiFabricationPassed: true,
        claimsChecked: 8,
      },
    });

    expect(id.startsWith("airun_")).toBe(true);
    const recorded = aiRunsTable.find((r) => r.id === id);
    expect(recorded).toBeDefined();
    expect(recorded?.runId).toBe("run_test_123");
    expect(recorded?.stage).toBe("rewriting");
    expect(recorded?.tokens).toBe(1420);
    expect(recorded?.verificationReport.antiFabricationPassed).toBe(true);
  });
});
