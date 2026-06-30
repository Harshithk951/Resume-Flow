import { v } from "convex/values";
import { mutation, query, internalMutation, internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

export const WEBHOOK_MAX_ATTEMPTS = 5;
export const WEBHOOK_INITIAL_BACKOFF_MS = 1000;
export const WEBHOOK_BACKOFF_MULTIPLIER = 2;
export const WEBHOOK_MAX_BACKOFF_MS = 60 * 60 * 1000;

export const getWebhookEvent = internalQuery({
  args: { eventId: v.id("webhookQueue") },
  handler: async (ctx, args) => ctx.db.get(args.eventId),
});

export const updateWebhookStatus = internalMutation({
  args: {
    eventId: v.id("webhookQueue"),
    status: v.union(v.literal("pending"), v.literal("delivered"), v.literal("failed")),
    attempts: v.optional(v.number()),
    nextRetryTime: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const update: any = { status: args.status };
    if (args.attempts !== undefined) update.attempts = args.attempts;
    if (args.nextRetryTime !== undefined) update.nextRetryTime = args.nextRetryTime;
    if (args.error !== undefined) update.lastError = args.error;
    await ctx.db.patch(args.eventId, update);
  },
});

export const enqueueOutboundWebhook = internalMutation({
  args: { tenantId: v.string(), eventType: v.string(), payload: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.insert("webhookQueue", {
      tenantId: args.tenantId,
      eventType: args.eventType,
      payload: args.payload,
      attempts: 0,
      status: "pending",
      nextRetryTime: Date.now(),
    });
  },
});

export const processWebhookQueueWorker = internalMutation({
  args: {},
  handler: async (ctx) => {
    const pendingEvents = await ctx.db
      .query("webhookQueue")
      .withIndex("by_status_nextRetryTime", q =>
        q.eq("status", "pending").lte("nextRetryTime", Date.now())
      )
      .take(10);

    for (const event of pendingEvents) {
      // Push nextRetryTime forward immediately to prevent double-dispatch
      await ctx.db.patch(event._id, {
        nextRetryTime: Date.now() + WEBHOOK_INITIAL_BACKOFF_MS * 10,
      });
      await ctx.scheduler.runAfter(0, internal.webhooks.dispatchWebhookAction, {
        eventId: event._id,
        payload: event.payload,
      });
    }
  },
});

export const dispatchWebhookAction = internalAction({
  args: { eventId: v.id("webhookQueue"), payload: v.any() },
  handler: async (ctx, args) => {
    const event = await ctx.runQuery(internal.webhooks.getWebhookEvent, { eventId: args.eventId });
    if (!event || event.status !== "pending") return;

    const targetUrl = process.env.AUTOMATION_OUTBOUND_WEBHOOK_URL;
    if (!targetUrl) {
      await ctx.runMutation(internal.webhooks.updateWebhookStatus, {
        eventId: args.eventId,
        status: "failed",
        error: "Missing AUTOMATION_OUTBOUND_WEBHOOK_URL env variable",
      });
      return;
    }

    try {
      const rawBody = JSON.stringify(args.payload);
      const secret = process.env.AUTOMATION_WEBHOOK_SECRET ?? "";
      const encoder = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const sigBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(rawBody));
      const signature = Array.from(new Uint8Array(sigBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-resumeflow-signature": signature,
        },
        body: rawBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      await ctx.runMutation(internal.webhooks.updateWebhookStatus, {
        eventId: args.eventId,
        status: "delivered",
      });
    } catch (err: any) {
      const nextAttempt = event.attempts + 1;
      const backoff = Math.min(
        WEBHOOK_INITIAL_BACKOFF_MS * Math.pow(WEBHOOK_BACKOFF_MULTIPLIER, event.attempts),
        WEBHOOK_MAX_BACKOFF_MS
      );
      await ctx.runMutation(internal.webhooks.updateWebhookStatus, {
        eventId: args.eventId,
        status: nextAttempt >= WEBHOOK_MAX_ATTEMPTS ? "failed" : "pending",
        attempts: nextAttempt,
        nextRetryTime: Date.now() + backoff,
        error: err.message || String(err),
      });
    }
  },
});

export const manualReplayWebhook = mutation({
  args: { eventId: v.id("webhookQueue") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.patch(args.eventId, {
      status: "pending",
      attempts: 0,
      lastError: undefined,
      nextRetryTime: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.webhooks.dispatchWebhookAction, {
      eventId: args.eventId,
      payload: event.payload,
    });

    return { success: true };
  },
});

export const listWebhookEvents = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("delivered"), v.literal("failed"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const limit = args.limit ?? 50;

    let q = ctx.db.query("webhookQueue");

    if (args.status) {
      return await q
        .withIndex("by_status_nextRetryTime", (indexQ) => indexQ.eq("status", args.status!))
        .order("desc")
        .take(limit);
    }

    const events = await q.collect();
    return events
      .sort((a, b) => b.nextRetryTime - a.nextRetryTime)
      .slice(0, limit);
  },
});

export const forceProcessQueue = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    await ctx.runMutation(internal.webhooks.processWebhookQueueWorker, {});
    return { success: true };
  },
});

export const testEnqueueWebhook = mutation({
  args: {
    tenantId: v.string(),
    eventType: v.string(),
    payload: v.any(),
    testSecret: v.string(),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.AUTOMATION_WEBHOOK_SECRET ?? "default_secret";
    if (args.testSecret !== expectedSecret) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("webhookQueue", {
      tenantId: args.tenantId,
      eventType: args.eventType,
      payload: args.payload,
      attempts: 0,
      status: "pending",
      nextRetryTime: Date.now(),
    });
  },
});

export const testGetWebhookEvent = query({
  args: { eventId: v.id("webhookQueue"), testSecret: v.string() },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.AUTOMATION_WEBHOOK_SECRET ?? "default_secret";
    if (args.testSecret !== expectedSecret) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.get(args.eventId);
  },
});

export const testForceProcessQueue = mutation({
  args: { testSecret: v.string() },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.AUTOMATION_WEBHOOK_SECRET ?? "default_secret";
    if (args.testSecret !== expectedSecret) {
      throw new Error("Unauthorized");
    }
    await ctx.runMutation(internal.webhooks.processWebhookQueueWorker, {});
    return { success: true };
  },
});

export const testManualReplayWebhook = mutation({
  args: { eventId: v.id("webhookQueue"), testSecret: v.string() },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.AUTOMATION_WEBHOOK_SECRET ?? "default_secret";
    if (args.testSecret !== expectedSecret) {
      throw new Error("Unauthorized");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.patch(args.eventId, {
      status: "pending",
      attempts: 0,
      lastError: undefined,
      nextRetryTime: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.webhooks.dispatchWebhookAction, {
      eventId: args.eventId,
      payload: event.payload,
    });

    return { success: true };
  },
});

