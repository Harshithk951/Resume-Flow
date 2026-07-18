import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireAuth } from "./lib/auth";

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    return await ctx.db
      .query("masterProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
  },
});

export const createOrUpdateProfile = mutation({
  args: {
    personalInfo: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      portfolio: v.optional(v.string()),
    }),
    education: v.array(
      v.object({
        institution: v.string(),
        degree: v.string(),
        gpa: v.optional(v.string()),
        year: v.string(),
        relevantCourses: v.optional(v.array(v.string())),
      })
    ),
    experience: v.array(
      v.object({
        company: v.string(),
        role: v.string(),
        duration: v.string(),
        bullets: v.array(v.string()),
        location: v.optional(v.string()),
        technologies: v.optional(v.array(v.string())),
      })
    ),
    projects: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        technologies: v.array(v.string()),
        link: v.optional(v.string()),
        bullets: v.array(v.string()),
      })
    ),
    skills: v.object({
      languages: v.array(v.string()),
      frameworks: v.array(v.string()),
      tools: v.array(v.string()),
      databases: v.optional(v.array(v.string())),
      soft: v.optional(v.array(v.string())),
    }),
    certifications: v.optional(
      v.array(
        v.object({
          name: v.string(),
          issuer: v.string(),
          year: v.string(),
        })
      )
    ),
    achievements: v.optional(
      v.array(
        v.object({
          description: v.string(),
          year: v.optional(v.string()),
        })
      )
    ),
    rawResumeStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const existingProfile = await ctx.db
      .query("masterProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        ...args,
        extractionStatus: "success" as const,
        pipelineError: undefined,
      });
      return existingProfile._id;
    } else {
      return await ctx.db.insert("masterProfiles", {
        userId: user._id,
        extractionStatus: "success" as const,
        ...args,
      });
    }
  },
});

export const markExtractionFailed = internalMutation({
  args: {
    profileId: v.id("masterProfiles"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      extractionStatus: "failed" as const,
      pipelineError: args.errorMessage,
    });
  },
});

export const markExtractionSuccess = internalMutation({
  args: {
    profileId: v.id("masterProfiles"),
    personalInfo: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      portfolio: v.optional(v.string()),
    }),
    education: v.array(
      v.object({
        institution: v.string(),
        degree: v.string(),
        gpa: v.optional(v.string()),
        year: v.string(),
        relevantCourses: v.optional(v.array(v.string())),
      })
    ),
    experience: v.array(
      v.object({
        company: v.string(),
        role: v.string(),
        duration: v.string(),
        bullets: v.array(v.string()),
        location: v.optional(v.string()),
        technologies: v.optional(v.array(v.string())),
      })
    ),
    projects: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        technologies: v.array(v.string()),
        link: v.optional(v.string()),
        bullets: v.array(v.string()),
      })
    ),
    skills: v.object({
      languages: v.array(v.string()),
      frameworks: v.array(v.string()),
      tools: v.array(v.string()),
      databases: v.optional(v.array(v.string())),
      soft: v.optional(v.array(v.string())),
    }),
    certifications: v.optional(
      v.array(
        v.object({
          name: v.string(),
          issuer: v.string(),
          year: v.string(),
        })
      )
    ),
    achievements: v.optional(
      v.array(
        v.object({
          description: v.string(),
          year: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { profileId, ...profileData } = args;
    await ctx.db.patch(profileId, {
      ...profileData,
      extractionStatus: "success" as const,
      pipelineError: undefined,
    });
  },
});

/**
 * Internal query for background actions to fetch a user's master profile.
 * Used by chatAssistant.ts to inject profile context into AI conversations.
 */
export const internalGetProfileOnly = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("masterProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthenticated");
    }

    // Ensure user record exists (handles race condition during onboarding)
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";
      await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email ?? "",
        name: identity.name ?? "",
        tenantId,
        credits: 10000,
        plan: "free",
        onboardingComplete: false,
      });
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const generateSystemUploadUrl = mutation({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    const expected = process.env.AUTOMATION_WEBHOOK_SECRET;
    if (!expected || args.secret !== expected) {
      throw new Error("Unauthorized: Invalid system secret");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateExtractionStatus = mutation({
  args: {
    status: v.union(
      v.literal("idle"),
      v.literal("extracting"),
      v.literal("success"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const existingProfile = await ctx.db
      .query("masterProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        extractionStatus: args.status,
      });
      return existingProfile._id;
    } else {
      const insertedId = await ctx.db.insert("masterProfiles", {
        userId: user._id,
        extractionStatus: args.status,
        personalInfo: {
          name: "",
          email: "",
          phone: "",
        },
        education: [],
        experience: [],
        projects: [],
        skills: {},
      });
      return insertedId;
    }
  },
});


