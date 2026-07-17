// convex/onboarding.ts
import { action, internalAction, mutation, query, internalMutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import { requireAuth } from "./lib/auth";

export const extractProfileFromPdf = action({
  args: {
    storageId: v.id("_storage"),
    fileSize: v.number(),
  },
  handler: async (ctx, args): Promise<any> => {
    // 1. Deduct credits
    const userId = await ctx.runMutation((api as any).users.checkAndDeductCredits, { amount: 5 });

    try {
      // 2. Call extraction action
      const result = await ctx.runAction((api as any).ai.extractResume.extractProfile, {
        storageId: args.storageId,
        fileSize: args.fileSize,
      });
      return result;
    } catch (err: any) {
      // 3. Refund credits on error
      await ctx.runMutation(internal.users.refundCredits, { userId, amount: 5 });
      throw new ConvexError(err.message || String(err));
    }
  },
});

export const confirmProfile = mutation({
  args: {
    userId: v.id("users"),
    branch: v.string(),
    cgpa: v.number(),
    personalInfo: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      portfolio: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (user._id !== args.userId) {
      throw new Error("Unauthorized");
    }

    if (args.cgpa < 0.0 || args.cgpa > 10.0) {
      return { success: false, error: "CGPA must be between 0.0 and 10.0" };
    }

    const existingProfile = await ctx.db
      .query("masterProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const tenantId = user.tenantId ?? "default";

    let profileId;
    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        branch: args.branch,
        cgpa: args.cgpa,
        personalInfo: args.personalInfo,
        tenantId,
        extractionStatus: "success",
        pipelineError: undefined,
      });
      profileId = existingProfile._id;
    } else {
      profileId = await ctx.db.insert("masterProfiles", {
        userId: user._id,
        tenantId,
        extractionStatus: "success",
        branch: args.branch,
        cgpa: args.cgpa,
        personalInfo: args.personalInfo,
        education: [],
        experience: [],
        projects: [],
        skills: { languages: [], frameworks: [], tools: [], databases: [], soft: [] },
      });
    }
    return { success: true, profileId };
  },
});

export const internalMarkOnboardingComplete = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      onboardingComplete: true,
    });
  },
});

export const markOnboardingComplete = action({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Update DB onboarding complete status
    await ctx.runMutation(internal.onboarding.internalMarkOnboardingComplete, {
      userId: args.userId,
    });

    // 2. Talk to Clerk API synchronously
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      console.error("Missing CLERK_SECRET_KEY environment variable");
      return { success: false, error: "Missing Clerk Secret Key" };
    }

    const url = `https://api.clerk.com/v1/users/${args.clerkId}/metadata`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${clerkSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_metadata: {
          onboardingComplete: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update Clerk metadata: ${response.status} ${errorText}`);
    }

    console.log(`Successfully updated Clerk metadata for user ${args.clerkId}`);
    return { success: true };
  },
});


export const syncClerkMetadata = internalAction({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      console.error("Missing CLERK_SECRET_KEY environment variable");
      return;
    }

    const url = `https://api.clerk.com/v1/users/${args.clerkId}/metadata`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${clerkSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_metadata: {
          onboardingComplete: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update Clerk metadata: ${response.status} ${errorText}`);
    }

    console.log(`Successfully updated Clerk metadata for user ${args.clerkId}`);
  },
});

export const testConfirmProfile = mutation({
  args: {
    userId: v.id("users"),
    branch: v.string(),
    cgpa: v.number(),
    personalInfo: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      portfolio: v.optional(v.string()),
    }),
    testSecret: v.string(),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.AUTOMATION_WEBHOOK_SECRET ?? "default_secret";
    if (args.testSecret !== expectedSecret) {
      throw new Error("Unauthorized test access");
    }

    if (args.cgpa < 0.0 || args.cgpa > 10.0) {
      return { success: false, error: "CGPA must be between 0.0 and 10.0" };
    }

    const existingProfile = await ctx.db
      .query("masterProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const user = await ctx.db.get(args.userId);
    const tenantId = user?.tenantId ?? "default";

    let profileId;
    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        branch: args.branch,
        cgpa: args.cgpa,
        personalInfo: args.personalInfo,
        tenantId,
        extractionStatus: "success",
        pipelineError: undefined,
      });
      profileId = existingProfile._id;
    } else {
      profileId = await ctx.db.insert("masterProfiles", {
        userId: args.userId,
        tenantId,
        extractionStatus: "success",
        branch: args.branch,
        cgpa: args.cgpa,
        personalInfo: args.personalInfo,
        education: [],
        experience: [],
        projects: [],
        skills: { languages: [], frameworks: [], tools: [], databases: [], soft: [] },
      });
    }
    return { success: true, profileId };
  },
});

export const testMarkOnboardingComplete = mutation({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
    testSecret: v.string(),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.AUTOMATION_WEBHOOK_SECRET ?? "default_secret";
    if (args.testSecret !== expectedSecret) {
      throw new Error("Unauthorized test access");
    }

    await ctx.db.patch(args.userId, {
      onboardingComplete: true,
    });
  },
});

export const testGetProfile = query({
  args: { userId: v.id("users"), testSecret: v.string() },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.AUTOMATION_WEBHOOK_SECRET ?? "default_secret";
    if (args.testSecret !== expectedSecret) {
      throw new Error("Unauthorized test access");
    }
    return await ctx.db
      .query("masterProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const testGetDashboardSummary = query({
  args: { userId: v.id("users"), testSecret: v.string() },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.AUTOMATION_WEBHOOK_SECRET ?? "default_secret";
    if (args.testSecret !== expectedSecret) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const profile = await ctx.db
      .query("masterProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    let completeness = 0;
    if (profile) {
      const pi = profile.personalInfo;
      if (pi?.name && pi?.email && pi?.phone) completeness += 20;
      if (profile.education && profile.education.length > 0) completeness += 20;
      if (profile.experience && profile.experience.length > 0) completeness += 20;
      if (profile.projects && profile.projects.length > 0) completeness += 20;
      const s = profile.skills;
      if (s && (s.languages?.length > 0 || s.frameworks?.length > 0 || s.tools?.length > 0)) {
        completeness += 20;
      }
    }

    return { completeness, onboardingComplete: user.onboardingComplete };
  },
});
