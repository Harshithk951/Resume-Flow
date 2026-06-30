// convex/chat.ts
//
// Chat CRUD Database Mutations & Queries
// Handles message insertion and chat history queries.
// Actions write response payloads via internal system mutations.

import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { api, internal } from "./_generated/api";
import { enforceRateLimit } from "./lib/rateLimit";

/**
 * Returns chat history for the user, scoped by jobId.
 */
export const getChatHistory = query({
  args: { jobId: v.optional(v.id("jobs")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Scope conversations by jobId
    return messages.filter((m) => m.jobId === args.jobId);
  },
});

/**
 * Inserts a user message and schedules the assistant background action.
 */
export const sendChatMessage = mutation({
  args: {
    jobId: v.optional(v.id("jobs")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    await enforceRateLimit(ctx, user._id, "chat");

    // Save user message
    await ctx.db.insert("chatMessages", {
      userId: user._id,
      jobId: args.jobId,
      role: "user",
      content: args.content,
    });

    // Schedule background AI response
    try {
      await ctx.scheduler.runAfter(0, api.ai.chatAssistant.generateResponse, {
        userId: user._id,
        jobId: args.jobId,
      });
    } catch (schedError) {
      console.error("Failed to schedule chat assistant response.");
      throw schedError;
    }
  },
});

/**
 * Internal mutation called by background action to save assistant messages.
 */
export const saveAssistantMessage = internalMutation({
  args: {
    userId: v.id("users"),
    jobId: v.optional(v.id("jobs")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("chatMessages", {
      userId: args.userId,
      jobId: args.jobId,
      role: "assistant",
      content: args.content,
    });
  },
});

/**
 * Returns chat history for internal background action loading.
 */
export const internalGetChatHistory = internalQuery({
  args: { userId: v.id("users"), jobId: v.optional(v.id("jobs")) },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return messages.filter((m) => m.jobId === args.jobId);
  },
});
