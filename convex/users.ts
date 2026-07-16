// convex/users.ts
// User management — syncs Clerk users into the Convex database.

import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

const MAX_CREDITS = 2000;
const CREDITS_PER_RESUME = 200;

export const createFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      tenantId,
      credits: MAX_CREDITS,
      plan: "free",
      onboardingComplete: false,
    });

    return userId;
  },
});

export const createOrGetUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: no identity found");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {
      if (
        existingUser.email !== identity.email ||
        existingUser.name !== identity.name
      ) {
        await ctx.db.patch(existingUser._id, {
          email: identity.email ?? existingUser.email,
          name: identity.name ?? existingUser.name,
        });
      }
      return existingUser._id;
    }

    const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? "",
      name: identity.name ?? "",
      tenantId,
      credits: MAX_CREDITS,
      plan: "free",
      onboardingComplete: false,
    });

    return userId;
  },
});

/** Public-safe user fields for the authenticated client (no clerkId/email). */
export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    return {
      _id: user._id,
      name: user.name,
      credits: user.credits,
      plan: user.plan,
      imageUrl: user.imageUrl,
      tenantId: user.tenantId,
      onboardingComplete: user.onboardingComplete,
    };
  },
});

import { requireAuth } from "./lib/auth";

/**
 * Deducts credits for any operation. Skips deduction for Pro/Campus users.
 * Throws ConvexError if free user has insufficient credits.
 */
export const checkAndDeductCredits = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Pro/Campus users: skip deduction entirely (unlimited)
    if (user.plan === "pro" || user.plan === "campus") {
      return user._id;
    }

    let currentCredits = user.credits ?? 0;
    if (currentCredits < args.amount) {
      throw new ConvexError(
        `Insufficient credits (${currentCredits}/${MAX_CREDITS}). ` +
        `Upgrade to Pro for unlimited resume generation.`
      );
    }

    await ctx.db.patch(user._id, {
      credits: currentCredits - args.amount,
    });
    return user._id;
  },
});

/**
 * Deducts exactly CREDITS_PER_RESUME (200) for a resume tailoring.
 * Convenience wrapper — no args needed.
 */
export const deductResumeCredit = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    if (user.plan === "pro" || user.plan === "campus") {
      return user._id;
    }

    const currentCredits = user.credits ?? 0;
    if (currentCredits < CREDITS_PER_RESUME) {
      throw new ConvexError(
        `Insufficient credits. You have ${currentCredits} credits remaining. ` +
        `Each resume costs ${CREDITS_PER_RESUME} credits. ` +
        `Upgrade to Pro for unlimited generation.`
      );
    }

    await ctx.db.patch(user._id, {
      credits: currentCredits - CREDITS_PER_RESUME,
    });
    return user._id;
  },
});

export const refundCredits = mutation({
  args: { userId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      credits: (await ctx.db.get(args.userId))!.credits + args.amount,
    });
  },
});

export const getTestUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});
