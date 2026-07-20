// convex/chat.ts
//
// Chat CRUD Database Mutations & Queries
// Handles message insertion and chat history queries.
// Actions write response payloads via internal system mutations.

import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { api } from "./_generated/api";
import { enforceRateLimit } from "./lib/rateLimit";

// ─── Session helper ───────────────────────────────────────────
// Two messages belong to the same session if they share the same jobId
// AND fall within the same calendar day (UTC). This lets us group chat
// history into discrete "conversations" without a schema migration.
function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Returns chat messages for the current session (jobId + today's date by default,
 * or a specific sessionDate if provided for history viewing).
 */
export const getChatHistory = query({
  args: {
    jobId: v.optional(v.id("jobs")),
    sessionDate: v.optional(v.string()), // "YYYY-MM-DD" — if omitted, returns today's session
  },
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

    const targetDay = args.sessionDate ?? dayKey(Date.now());

    // Scope by jobId AND session date
    return messages.filter(
      (m) =>
        m.jobId === args.jobId &&
        dayKey(m._creationTime) === targetDay
    );
  },
});

/**
 * Returns a list of distinct chat sessions for the sidebar history panel.
 * Each session is {jobId, sessionDate, lastMessage, messageCount}.
 */
export const getChatSessions = query({
  args: {},
  handler: async (ctx) => {
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

    // Group by jobId + sessionDate
    const sessionMap = new Map<
      string,
      { jobId: string | undefined; sessionDate: string; lastMessage: string; messageCount: number; lastTs: number }
    >();

    for (const msg of messages) {
      const sd = dayKey(msg._creationTime);
      const key = `${msg.jobId ?? "general"}::${sd}`;
      const existing = sessionMap.get(key);
      if (!existing) {
        sessionMap.set(key, {
          jobId: msg.jobId,
          sessionDate: sd,
          lastMessage: msg.content.slice(0, 80),
          messageCount: 1,
          lastTs: msg._creationTime,
        });
      } else {
        existing.messageCount += 1;
        if (msg._creationTime > existing.lastTs) {
          existing.lastTs = msg._creationTime;
          existing.lastMessage = msg.content.slice(0, 80);
        }
      }
    }

    // Sort newest first
    return Array.from(sessionMap.values()).sort((a, b) => b.lastTs - a.lastTs);
  },
});

/**
 * Deletes all messages for a specific session (jobId + sessionDate).
 */
export const deleteChatSession = mutation({
  args: {
    jobId: v.optional(v.id("jobs")),
    sessionDate: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const toDelete = messages.filter(
      (m) => m.jobId === args.jobId && dayKey(m._creationTime) === args.sessionDate
    );

    for (const msg of toDelete) {
      await ctx.db.delete(msg._id);
    }
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
    // For AI context, return all messages (not session-scoped) so the AI has full history
    return messages.filter((m) => m.jobId === args.jobId);
  },
});

