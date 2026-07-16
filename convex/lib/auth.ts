import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Unauthenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new ConvexError("User not found — please sign in again");
  }

  return user;
}

export async function requireOwnership(
  ctx: QueryCtx | MutationCtx,
  doc: { userId: Id<"users"> }
) {
  const user = await requireAuth(ctx);
  if (doc.userId !== user._id) {
    throw new ConvexError("Unauthorized: ownership violation");
  }
  return user;
}
