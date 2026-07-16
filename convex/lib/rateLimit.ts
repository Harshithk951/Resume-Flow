// convex/lib/rateLimit.ts
//
// Database-Backed Rate Limiting Helper
// Enforces chat message limit (50/day). Resume generation is now credit-based
// (200 credits/resume, replaces the old 5/day limit).
// Automatically resets counters daily.

import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";

export async function enforceRateLimit(
  ctx: any,
  userId: Id<"users">,
  type: "resume" | "chat"
) {
  const today = new Date().toISOString().split("T")[0];

  // Fetch usage record for user
  let record = await ctx.db
    .query("userGenerations")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .unique();

  if (!record) {
    const newRecordId = await ctx.db.insert("userGenerations", {
      userId,
      resumesGeneratedToday: 0,
      chatMessagesSentToday: 0,
      lastResetDate: today,
    });
    record = await ctx.db.get(newRecordId);
  }

  if (!record) {
    throw new ConvexError("User generation tracking record could not be established.");
  }

  // Reset counters if the day has changed
  if (record.lastResetDate !== today) {
    await ctx.db.patch(record._id, {
      resumesGeneratedToday: 0,
      chatMessagesSentToday: 0,
      lastResetDate: today,
    });
    // Update local record copy for limit checking below
    record = {
      ...record,
      resumesGeneratedToday: 0,
      chatMessagesSentToday: 0,
      lastResetDate: today,
    };
  }

  // Validate and increment counters
  // Note: Resume type is no longer enforced here — moved to credit-based (200 credits/resume)
  if (type === "chat") {
    if (record.chatMessagesSentToday >= 50) {
      throw new ConvexError(
        "You have reached your daily limit for this action. Please try again tomorrow."
      );
    }
    await ctx.db.patch(record._id, {
      chatMessagesSentToday: record.chatMessagesSentToday + 1,
    });
  }
}
