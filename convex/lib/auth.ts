// convex/lib/auth.ts
// Row-Level Security (RLS) helpers used by EVERY query and mutation.

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found — please sign in again");
  }

  return user;
}

export async function requireOwnership(
  ctx: QueryCtx | MutationCtx,
  doc: { userId: Id<"users"> }
) {
  const user = await requireAuth(ctx);
  if (doc.userId !== user._id) {
    throw new Error("Unauthorized: ownership violation");
  }
  return user;
}
