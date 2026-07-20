// convex/lib/rateLimit.ts
//
// Database-Backed Rate Limiting Helper
// Enforces chat message limit (20/day for free users). Resume generation is
// credit-based (500 credits/resume), checked inline in the calling mutations.
// Automatically resets counters daily.
//
// Atomicity: This helper is designed to be called from within Convex mutations.
// Convex guarantees serializable isolation per document, so the read-check-write
// cycle within a single mutation is inherently atomic — no separate lock needed.

import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";

export async function enforceRateLimit(
  ctx: any,
  userId: Id<"users">,
  type: "resume" | "chat"
) {
  const today = new Date().toISOString().split("T")[0];

  // 1. Fetch or create the usage record (atomic within parent mutation)
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

  // 2. Reset counters if day changed — combined with the increment to stay atomic
  const effectiveDate = record.lastResetDate;
  const chatCount = effectiveDate !== today ? 0 : (record.chatMessagesSentToday ?? 0);
  const resumeCount = effectiveDate !== today ? 0 : (record.resumesGeneratedToday ?? 0);

  // 3. Validate and increment in a single atomic patch
  if (type === "chat") {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError("User not found.");
    }
    const isPro = user.plan === "pro" || user.plan === "campus";

    if (!isPro && chatCount >= 20) {
      throw new ConvexError(
        "You have reached your daily free limit for this action. Upgrade to Pro for unlimited AI chatting!"
      );
    }

    // Atomically reset (if needed) and increment
    await ctx.db.patch(record._id, {
      resumesGeneratedToday: resumeCount,
      chatMessagesSentToday: chatCount + 1,
      lastResetDate: today,
    });
  }
  // Resume type: no-op here — rate limiting for resumes is handled via credit
  // deduction (500 credits/resume) in submitGapAnswers and internalSetExtractedRequirements
}
