// convex/optimizations.ts
//
// Optimization History & Runs with plan-based retention countdowns.
// Free: 30 days, Pro/Pro Pass: 90 days, Power/Team: 180 days.
// Auto-logs optimizations to the jobs tracking table.

import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireAuth, requireOwnership } from "./lib/auth";

/**
 * Computes retention window in days based on user plan.
 */
export function getRetentionDays(plan?: string, passExpiresAt?: number): number {
  const now = Date.now();
  const isProPass = plan === "pro_pass" && (!passExpiresAt || passExpiresAt > now);
  if (plan === "power" || plan === "team") return 180;
  if (plan === "pro" || isProPass || plan === "campus") return 90;
  return 30; // Free plan
}

/**
 * Returns all optimizations for the authenticated user with retention countdowns.
 */
export const getMyOptimizations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const list = await ctx.db
      .query("optimizations")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const now = Date.now();
    // Sort descending by createdAt
    list.sort((a, b) => b.createdAt - a.createdAt);

    return list.map((opt) => {
      const daysRemaining = Math.max(0, Math.ceil((opt.expiresAt - now) / 86400000));
      const isExpired = opt.expiresAt < now;
      return {
        ...opt,
        daysRemaining,
        isExpired,
      };
    });
  },
});

/**
 * Retrieves a single optimization run by ID after verifying ownership.
 */
export const getOptimizationById = query({
  args: { id: v.id("optimizations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const opt = await ctx.db.get(args.id);
    if (!opt || opt.userId !== user._id) return null;

    const now = Date.now();
    const daysRemaining = Math.max(0, Math.ceil((opt.expiresAt - now) / 86400000));
    const isExpired = opt.expiresAt < now;

    return {
      ...opt,
      daysRemaining,
      isExpired,
    };
  },
});

/**
 * Stores an optimization run, computes retention expiration,
 * updates credit allowance for free users, and auto-logs to jobs.
 */
export const createOptimization = mutation({
  args: {
    roleTitle: v.string(),
    companyName: v.string(),
    jobId: v.optional(v.id("jobs")),
    outputLength: v.optional(v.string()),
    additionalContext: v.optional(v.string()),
    score: v.optional(v.number()),
    atsCompatibilityScore: v.optional(v.number()),
    bulletDiffs: v.optional(v.any()),
    matchedKeywords: v.optional(v.array(v.string())),
    missingKeywords: v.optional(v.array(v.string())),
    pdfStorageId: v.optional(v.id("_storage")),
    docxStorageId: v.optional(v.id("_storage")),
    status: v.optional(
      v.union(
        v.literal("queued"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
    jobDescriptionText: v.optional(v.string()),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const now = Date.now();

    // Deduct credit for free tier users
    const isPaid =
      user.plan === "pro" ||
      user.plan === "power" ||
      user.plan === "team" ||
      user.plan === "campus" ||
      (user.plan === "pro_pass" && (!user.passExpiresAt || user.passExpiresAt > now));

    if (!isPaid) {
      const currentUsed = user.freeOptimizationsUsed ?? 0;
      if (currentUsed >= 2) {
        throw new ConvexError(
          "NO_FREE_CREDITS_REMAINING: You have used your 2 lifetime free optimizations. Please upgrade to continue."
        );
      }
      await ctx.db.patch(user._id, {
        freeOptimizationsUsed: currentUsed + 1,
      });
    }

    const retentionDays = getRetentionDays(user.plan, user.passExpiresAt);
    const expiresAt = now + retentionDays * 86400000;

    // Truncate additionalContext to 490 characters maximum
    const sanitizedContext = args.additionalContext
      ? args.additionalContext.slice(0, 490)
      : undefined;

    const optId = await ctx.db.insert("optimizations", {
      userId: user._id,
      jobId: args.jobId,
      roleTitle: args.roleTitle.trim(),
      companyName: args.companyName.trim(),
      outputLength: args.outputLength,
      additionalContext: sanitizedContext,
      score: args.score,
      atsCompatibilityScore: args.atsCompatibilityScore,
      bulletDiffs: args.bulletDiffs,
      matchedKeywords: args.matchedKeywords,
      missingKeywords: args.missingKeywords,
      pdfStorageId: args.pdfStorageId,
      docxStorageId: args.docxStorageId,
      status: args.status ?? "completed",
      createdAt: now,
      expiresAt,
    });

    // Link to jobs table if an existing jobId was explicitly passed
    let linkedJobId = args.jobId;

    if (linkedJobId) {
      const existingJob = await ctx.db.get(linkedJobId);
      if (existingJob && existingJob.userId === user._id) {
        await ctx.db.patch(linkedJobId, {
          optimizationId: optId,
          matchScore: args.score ?? args.atsCompatibilityScore ?? existingJob.matchScore,
          url: args.url ?? existingJob.url,
        });
      }
    }

    return {
      optimizationId: optId,
      jobId: linkedJobId,
      expiresAt,
    };
  },
});

/**
 * Deletes an optimization run by ID after verifying ownership.
 */
export const deleteOptimization = mutation({
  args: { id: v.id("optimizations") },
  handler: async (ctx, args) => {
    const opt = await ctx.db.get(args.id);
    if (!opt) {
      throw new ConvexError("Optimization not found");
    }
    await requireOwnership(ctx, opt);

    if (opt.pdfStorageId) {
      try {
        await ctx.storage.delete(opt.pdfStorageId);
      } catch (err) {
        console.warn("Failed to delete pdf storage:", err);
      }
    }
    if (opt.docxStorageId) {
      try {
        await ctx.storage.delete(opt.docxStorageId);
      } catch (err) {
        console.warn("Failed to delete docx storage:", err);
      }
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
