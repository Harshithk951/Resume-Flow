// convex/jobs.ts
//
// Job Operations & State Machine Transitions
// Manages creation, retrieval, and state progression of jobs.
// Actions call these mutations to transition states and write progress safely.

import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireAuth, requireOwnership } from "./lib/auth";
import { api, internal } from "./_generated/api";
import { enforceRateLimit } from "./lib/rateLimit";

// ─── API Endpoints (Public) ───────────────────────────────────

/**
 * Returns a single job by ID, verifying ownership.
 * Returns null gracefully if the user is not authenticated yet.
 */
export const getJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    const job = await ctx.db.get(args.jobId);
    if (!job || job.userId !== user._id) return null;
    return job;
  },
});

/**
 * Lists all jobs belonging to the authenticated user.
 * Returns [] gracefully if the user is not authenticated yet.
 */
export const getMyJobs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];
    return await ctx.db
      .query("jobs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

/**
 * Creates a new job in the "uploaded" state and schedules Layer 1 processing.
 */
export const createJob = mutation({
  args: {
    companyName: v.string(),
    jobTitle: v.string(),
    rawJdText: v.string(),
    inputType: v.union(
      v.literal("text"),
      v.literal("screenshot"),
      v.literal("pdf")
    ),
    rawFileStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    await enforceRateLimit(ctx, user._id, "resume");

    const jobId = await ctx.db.insert("jobs", {
      userId: user._id,
      companyName: args.companyName,
      jobTitle: args.jobTitle,
      rawJdText: args.rawJdText,
      inputType: args.inputType,
      rawFileStorageId: args.rawFileStorageId,
      pipelineState: "uploaded",
      status: "new",
      tenantId: user.tenantId,
      crmStatus: "Saved",
      statusHistory: [
        {
          oldStatus: "",
          newStatus: "Saved",
          updatedBy: "user",
          timestamp: Date.now(),
        },
      ],
    });

    // Schedule Layer 1 Background Action
    try {
      await ctx.scheduler.runAfter(0, api.ai.processJob.processJob, { jobId });
    } catch (error) {
      console.error("Failed to schedule processJob");
      throw error;
    }

    if (user.tenantId) {
      try {
        await ctx.scheduler.runAfter(0, internal.webhooks.enqueueOutboundWebhook, {
          tenantId: user.tenantId,
          eventType: "job_created",
          payload: {
            jobId,
            userId: user._id,
            companyName: args.companyName,
            jobTitle: args.jobTitle,
            pipelineState: "uploaded",
            crmStatus: "Saved",
          },
        });
      } catch (error) {
        console.error("Failed to enqueue job_created outbound webhook:", error);
      }
    }

    return jobId;
  },
});

/**
 * Submits the user's answers to the gap questions and schedules tailoring.
 */
export const submitGapAnswers = mutation({
  args: {
    jobId: v.id("jobs"),
    answers: v.array(
      v.object({
        skill: v.string(),
        hasSkill: v.boolean(),
        userResponse: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    await requireOwnership(ctx, job);

    if (job.pipelineState !== "needs_user_input") {
      throw new Error("Job is not awaiting user response.");
    }

    // Deduct 10 credits for free users before scheduling AI tailoring
    if (user.plan === "free") {
      const currentCredits = user.credits ?? 0;
      if (currentCredits < 10) {
        throw new ConvexError(
          `Insufficient credits (${currentCredits}/100000). Each resume costs 10 credits. ` +
          `Upgrade to Pro for unlimited generation.`
        );
      }
      await ctx.db.patch(user._id, {
        credits: currentCredits - 10,
      });
    }

    const updatedQuestions = job.skillGapQuestions?.map((q: any) => {
      const match = args.answers.find((a: any) => a.skill === q.skill);
      if (match) {
        return {
          ...q,
          hasSkill: match.hasSkill,
          userResponse: match.userResponse,
        };
      }
      return q;
    });

    await ctx.db.patch(args.jobId, {
      skillGapQuestions: updatedQuestions,
      pipelineState: "tailoring",
    });

    // Schedule Layer 2 Background Action
    try {
      await ctx.scheduler.runAfter(0, api.ai.tailorResume.tailorResume, { jobId: args.jobId });
    } catch (error) {
      console.error("Failed to schedule tailorResume");
      throw error;
    }
  },
});

/**
 * Sets the final PDF storage ID and completes the pipeline.
 * Called by the frontend once WASM compilation completes.
 * Two-Layer Server Idempotency: Safely ignores if state is already completed/failed.
 */
export const setCompilationCompleted = mutation({
  args: {
    jobId: v.id("jobs"),
    pdfStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job execution instance not found");
    }

    // Two-Layer Server Idempotency Check: Safely ignore if state is already completed/failed
    if (job.pipelineState !== "compiling") {
      return { success: true, duplicatedIgnored: true };
    }

    const linkedResume = await ctx.db
      .query("tailoredResumes")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .unique();

    if (linkedResume) {
      await ctx.db.patch(linkedResume._id, {
        pdfStorageId: args.pdfStorageId,
      });
    } else {
      await ctx.db.insert("tailoredResumes", {
        userId: user._id,
        jobId: args.jobId,
        pdfStorageId: args.pdfStorageId,
        structuredContent: {},
        version: 1,
      });
    }

    await ctx.db.patch(args.jobId, {
      pipelineState: "completed",
      pipelineError: undefined,
    });

    const tenantId = job.tenantId || user.tenantId;
    if (tenantId) {
      try {
        await ctx.scheduler.runAfter(0, internal.webhooks.enqueueOutboundWebhook, {
          tenantId,
          eventType: "resume_tailored",
          payload: {
            jobId: args.jobId,
            userId: user._id,
            pdfStorageId: args.pdfStorageId,
            companyName: job.companyName,
            jobTitle: job.jobTitle,
          },
        });
      } catch (error) {
        console.error("Failed to enqueue resume_tailored outbound webhook:", error);
      }
    }

    return { success: true, duplicatedIgnored: false };
  },
});

/**
 * State-Aware Failure Handler: Prevents stale timeouts from overwriting a completed resume.
 * Only allows state transition to failed if currently actively compiling or tailoring.
 */
export const setCompilationFailed = mutation({
  args: {
    jobId: v.id("jobs"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job instance not found");

    // Only allow state transition to failed if currently actively compiling or tailoring
    if (job.pipelineState === "compiling" || job.pipelineState === "tailoring") {
      await ctx.db.patch(args.jobId, {
        pipelineState: "failed",
        pipelineError: args.errorMessage,
      });
      return { success: true, stateChanged: true };
    }

    return { success: true, stateChanged: false };
  },
});

/**
 * Resets a failed job back to the "uploaded" state and re-schedules the action pipeline.
 */
export const retryJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    await requireOwnership(ctx, job);

    await ctx.db.patch(args.jobId, {
      pipelineState: "uploaded",
      pipelineError: undefined,
    });

    // Re-schedule Layer 1 Background Action
    try {
      await ctx.scheduler.runAfter(0, api.ai.processJob.processJob, { jobId: args.jobId });
    } catch (error) {
      console.error("Failed to schedule retry processJob");
      throw error;
    }
  },
});

/**
 * Updates CRM application tracking status on a completed job.
 * Only mutates `status` — never `pipelineState`.
 */
export const updateApplicationStatus = mutation({
  args: {
    jobId: v.id("jobs"),
    status: v.union(
      v.literal("new"),
      v.literal("applied"),
      v.literal("interview"),
      v.literal("offered"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    const currentJobRecord = await ctx.db.get(args.jobId);
    if (!currentJobRecord) {
      throw new Error("Specified job object database reference missing");
    }

    await requireOwnership(ctx, currentJobRecord);

    if (currentJobRecord.pipelineState !== "completed") {
      throw new Error(
        "Operation blocked: Application status tracking requires a successfully completed resume pipeline."
      );
    }

    const oldStatus = currentJobRecord.crmStatus || "Saved";
    const statusMap: Record<string, "Saved" | "Applied" | "Interviewing" | "Offered" | "Rejected"> = {
      new: "Saved",
      applied: "Applied",
      interview: "Interviewing",
      offered: "Offered",
      rejected: "Rejected",
    };
    const mappedCrmStatus = statusMap[args.status] || "Saved";

    const newHistory = [
      ...(currentJobRecord.statusHistory || []),
      {
        oldStatus,
        newStatus: mappedCrmStatus,
        updatedBy: "user" as const,
        timestamp: Date.now(),
      },
    ];

    await ctx.db.patch(args.jobId, {
      status: args.status,
      crmStatus: mappedCrmStatus,
      statusHistory: newHistory,
    });

    const tenantId = currentJobRecord.tenantId;
    if (tenantId) {
      try {
        await ctx.scheduler.runAfter(0, internal.webhooks.enqueueOutboundWebhook, {
          tenantId,
          eventType: "status_updated",
          payload: {
            jobId: args.jobId,
            status: args.status,
            crmStatus: mappedCrmStatus,
            oldCrmStatus: oldStatus,
            userId: currentJobRecord.userId,
          },
        });
      } catch (error) {
        console.error("Failed to enqueue status_updated outbound webhook:", error);
      }
    }

    return { success: true };
  },
});

/**
 * Resets a job's pipelineState to "compiling" to force re-compilation of the PDF.
 */
export const resetToCompiling = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    await requireOwnership(ctx, job);

    await ctx.db.patch(args.jobId, {
      pipelineState: "compiling",
      pipelineError: undefined,
    });
  },
});

/**
 * Returns the tailored resume JSON for a given jobId, verifying ownership.
 * Returns null gracefully if the user is not authenticated yet.
 */
export const getTailoredResume = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    const resume = await ctx.db
      .query("tailoredResumes")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .unique();
    if (resume && resume.userId !== user._id) return null;
    return resume;
  },
});

// ─── API Endpoints (Internal System Only) ──────────────────────

/**
 * Fetches both job and master profile in a single query.
 */
export const internalGetJobAndProfile = internalQuery({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    const profile = await ctx.db
      .query("masterProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", job.userId))
      .unique();
    return { job, profile };
  },
});

/**
 * Internal mutation to transition job pipeline state.
 */
export const internalUpdateJobState = internalMutation({
  args: {
    jobId: v.id("jobs"),
    expectedState: v.string(),
    newState: v.string(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    if (job.pipelineState !== args.expectedState) {
      console.warn(
        `State machine transition ignored. Expected: ${args.expectedState}, actual: ${job.pipelineState}`
      );
      return;
    }

    await ctx.db.patch(args.jobId, {
      pipelineState: args.newState as any,
      pipelineError: args.error,
    });
  },
});

/**
 * Internal mutation to save requirements and transition to "tailoring",
 * then scheduling Layer 2.
 */
export const internalSetExtractedRequirements = internalMutation({
  args: {
    jobId: v.id("jobs"),
    requirements: v.any(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    // Deduct 10 credits for free users before AI tailoring
    const user = await ctx.db.get(job.userId);
    if (user && user.plan === "free") {
      const currentCredits = user.credits ?? 0;
      if (currentCredits < 10) {
        await ctx.db.patch(args.jobId, {
          pipelineState: "failed",
          pipelineError: "Insufficient credits. Upgrade to Pro for unlimited generation.",
        });
        return;
      }
      await ctx.db.patch(user._id, {
        credits: currentCredits - 10,
      });
    }

    await ctx.db.patch(args.jobId, {
      extractedRequirements: args.requirements,
      pipelineState: "tailoring",
    });
    // Schedule Layer 2
    try {
      await ctx.scheduler.runAfter(0, api.ai.tailorResume.tailorResume, { jobId: args.jobId });
    } catch (error) {
      console.error("Failed to schedule tailorResume from extracted requirements");
      throw error;
    }
  },
});

/**
 * Internal mutation to save requirements, gap questions, and shift to "needs_user_input".
 */
export const internalSetNeedsUserInput = internalMutation({
  args: {
    jobId: v.id("jobs"),
    requirements: v.any(),
    questions: v.array(
      v.object({
        skill: v.string(),
        question: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      extractedRequirements: args.requirements,
      skillGapQuestions: args.questions.map((q) => ({
        skill: q.skill,
        question: q.question,
        userResponse: "",
        hasSkill: false,
      })),
      pipelineState: "needs_user_input",
    });
  },
});

/**
 * Internal mutation to save the tailored resume content and transition state to "compiling".
 */
export const internalSetTailoredResume = internalMutation({
  args: {
    jobId: v.id("jobs"),
    structuredContent: v.any(),
    atsCompatibilityScore: v.number(),
    atsDetails: v.any(),
    diffNotes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    const existing = await ctx.db
      .query("tailoredResumes")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .unique();

    const resumeData = {
      userId: job.userId,
      jobId: args.jobId,
      structuredContent: args.structuredContent,
      atsCompatibilityScore: args.atsCompatibilityScore,
      atsDetails: args.atsDetails,
      diffNotes: args.diffNotes,
      version: existing ? existing.version + 1 : 1,
    };

    if (existing) {
      await ctx.db.patch(existing._id, resumeData);
    } else {
      await ctx.db.insert("tailoredResumes", resumeData);
    }

    await ctx.db.patch(args.jobId, {
      pipelineState: "compiling",
    });
  },
});

export const getTenantConfig = internalQuery({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tenantConfig")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .unique();
  },
});

export const executeMultiTenantBroadcast = internalMutation({
  args: {
    tenantId: v.string(),
    companyName: v.string(),
    jobTitle: v.string(),
    rawJdText: v.string(),
    minCgpa: v.number(),
    targetBranch: v.string(),
  },
  handler: async (ctx, args) => {
    const eligibleProfiles = await ctx.db
      .query("masterProfiles")
      .withIndex("by_tenantId_metrics", (q) =>
        q
          .eq("tenantId", args.tenantId)
          .eq("branch", args.targetBranch)
          .gte("cgpa", args.minCgpa)
      )
      .collect();

    console.log(`Found ${eligibleProfiles.length} eligible students for broadcast.`);

    const jobIds: string[] = [];

    for (const profile of eligibleProfiles) {
      const jobId = await ctx.db.insert("jobs", {
        userId: profile.userId,
        tenantId: args.tenantId,
        companyName: args.companyName,
        jobTitle: args.jobTitle,
        rawJdText: args.rawJdText,
        inputType: "text",
        pipelineState: "uploaded",
        crmStatus: "Saved",
        statusHistory: [
          {
            oldStatus: "",
            newStatus: "Saved",
            updatedBy: "automation_bridge",
            timestamp: Date.now(),
          },
        ],
      });

      jobIds.push(jobId);

      try {
        await ctx.scheduler.runAfter(0, api.ai.processJob.processJob, { jobId });
      } catch (error) {
        console.error(`Failed to schedule processJob for job ${jobId}:`, error);
      }

      try {
        await ctx.scheduler.runAfter(0, internal.webhooks.enqueueOutboundWebhook, {
          tenantId: args.tenantId,
          eventType: "job_created",
          payload: {
            jobId,
            userId: profile.userId,
            companyName: args.companyName,
            jobTitle: args.jobTitle,
            pipelineState: "uploaded",
            crmStatus: "Saved",
          },
        });
      } catch (error) {
        console.error(`Failed to enqueue job_created broadcast webhook for job ${jobId}:`, error);
      }
    }

    return { success: true, count: eligibleProfiles.length, jobIds };
  },
});

export const getMyJobsTest = query({
  args: { userId: v.id("users"), testSecret: v.string() },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.AUTOMATION_WEBHOOK_SECRET ?? "default_secret";
    if (args.testSecret !== expectedSecret) {
      throw new Error("Unauthorized");
    }
    return await ctx.db
      .query("jobs")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getAllFailedJobs = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("jobs").collect();
    return all.map(j => ({ id: j._id, company: j.companyName, state: j.pipelineState, error: j.pipelineError }));
  }
});

export const resetToCompilingAdmin = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      pipelineState: "compiling",
      pipelineError: undefined,
    });
  },
});

export const retryJobAdmin = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    await ctx.db.patch(args.jobId, {
      pipelineState: "uploaded",
      pipelineError: undefined,
    });

    try {
      await ctx.scheduler.runAfter(0, api.ai.processJob.processJob, { jobId: args.jobId });
    } catch (error) {
      console.error("Failed to schedule retry processJob");
      throw error;
    }
  },
});
