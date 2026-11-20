// convex/savedResumes.ts
//
// Saved Resumes Management with slot-based quota enforcement.
// Quotas: Free = 3, Pro/Pro Pass = 20, Power/Team = 1000.

import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireAuth, requireOwnership } from "./lib/auth";

export function getSlotLimit(plan?: string, passExpiresAt?: number): number {
  const now = Date.now();
  const isProPass = plan === "pro_pass" && (!passExpiresAt || passExpiresAt > now);
  if (plan === "power" || plan === "team") return 1000;
  if (plan === "pro" || isProPass || plan === "campus") return 20;
  return 3;
}

/**
 * Lists the authenticated user's saved resumes along with quota metrics.
 */
export const getMySavedResumes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        resumes: [],
        count: 0,
        slotLimit: 3,
        slotsRemaining: 3,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return {
        resumes: [],
        count: 0,
        slotLimit: 3,
        slotsRemaining: 3,
      };
    }

    const resumes = await ctx.db
      .query("savedResumes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Sort descending by updatedAt
    resumes.sort((a, b) => b.updatedAt - a.updatedAt);

    const slotLimit = getSlotLimit(user.plan, user.passExpiresAt);
    const count = resumes.length;
    const slotsRemaining = Math.max(0, slotLimit - count);

    return {
      resumes,
      count,
      slotLimit,
      slotsRemaining,
    };
  },
});

/**
 * Creates a new saved resume after verifying plan slot limit.
 * Throws ConvexError("SLOT_LIMIT_REACHED") if slot quota is exceeded.
 */
export const createSavedResume = mutation({
  args: {
    title: v.string(),
    sections: v.optional(v.any()),
    rawText: v.optional(v.string()),
    fileStorageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    template: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    targetRole: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const existingResumes = await ctx.db
      .query("savedResumes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const slotLimit = getSlotLimit(user.plan, user.passExpiresAt);
    if (existingResumes.length >= slotLimit) {
      throw new ConvexError("SLOT_LIMIT_REACHED");
    }

    const now = Date.now();

    // If marked default, unset default on other resumes
    if (args.isDefault) {
      for (const r of existingResumes) {
        if (r.isDefault) {
          await ctx.db.patch(r._id, { isDefault: false });
        }
      }
    }

    const resumeId = await ctx.db.insert("savedResumes", {
      userId: user._id,
      title: args.title.trim() || "Untitled Resume",
      sections: args.sections,
      rawText: args.rawText,
      fileStorageId: args.fileStorageId,
      fileName: args.fileName,
      fileType: args.fileType,
      template: args.template,
      isDefault: args.isDefault ?? (existingResumes.length === 0),
      targetRole: args.targetRole,
      createdAt: now,
      updatedAt: now,
    });

    return resumeId;
  },
});

/**
 * Deletes a saved resume by ID after verifying ownership.
 */
export const deleteSavedResume = mutation({
  args: { id: v.id("savedResumes") },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      return { success: true, alreadyDeleted: true };
    }
    await requireOwnership(ctx, resume);

    if (resume.fileStorageId) {
      try {
        await ctx.storage.delete(resume.fileStorageId);
      } catch (err) {
        console.warn("Failed to delete storage file for resume:", err);
      }
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * Updates a saved resume's metadata or contents.
 */
export const updateSavedResume = mutation({
  args: {
    id: v.id("savedResumes"),
    title: v.optional(v.string()),
    sections: v.optional(v.any()),
    rawText: v.optional(v.string()),
    fileStorageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    template: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    targetRole: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      return { success: true, alreadyDeleted: true };
    }
    const user = await requireOwnership(ctx, resume);

    // If making this the default, unmark others
    if (args.isDefault) {
      const existingResumes = await ctx.db
        .query("savedResumes")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect();

      for (const r of existingResumes) {
        if (r._id !== args.id && r.isDefault) {
          await ctx.db.patch(r._id, { isDefault: false });
        }
      }
    }

    const patchData: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) patchData.title = args.title.trim();
    if (args.sections !== undefined) patchData.sections = args.sections;
    if (args.rawText !== undefined) patchData.rawText = args.rawText;
    if (args.fileStorageId !== undefined) patchData.fileStorageId = args.fileStorageId;
    if (args.fileName !== undefined) patchData.fileName = args.fileName;
    if (args.fileType !== undefined) patchData.fileType = args.fileType;
    if (args.template !== undefined) patchData.template = args.template;
    if (args.isDefault !== undefined) patchData.isDefault = args.isDefault;
    if (args.targetRole !== undefined) patchData.targetRole = args.targetRole;

    await ctx.db.patch(args.id, patchData);
    return { success: true };
  },
});

/**
 * Generates an upload URL for resume file storage.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
