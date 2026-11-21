// convex/aiRuns.ts
// AI Run Telemetry & Audit Logging (Phase 1)
// Records model usage, tokens, latency, cost estimates, and stage telemetry.

import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

export const logAiRun = internalMutation({
  args: {
    runId: v.string(),
    userId: v.id("users"),
    jobId: v.optional(v.id("jobs")),
    stage: v.string(),
    provider: v.string(),
    model: v.string(),
    promptVersion: v.string(),
    tokens: v.optional(v.number()),
    costEstimate: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    verificationReport: v.optional(v.any()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const runRecordId = await ctx.db.insert("aiRuns", {
      runId: args.runId,
      userId: args.userId,
      jobId: args.jobId,
      stage: args.stage,
      provider: args.provider,
      model: args.model,
      promptVersion: args.promptVersion,
      tokens: args.tokens,
      costEstimate: args.costEstimate,
      durationMs: args.durationMs,
      verificationReport: args.verificationReport,
      error: args.error,
      createdAt: Date.now(),
    });

    return { success: true, id: runRecordId };
  },
});

export const getAiRunsForJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.userId !== user._id) return [];

    return await ctx.db
      .query("aiRuns")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .collect();
  },
});

export const internalGetAiRunsByRunId = internalQuery({
  args: { runId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiRuns")
      .withIndex("by_runId", (q) => q.eq("runId", args.runId))
      .collect();
  },
});
