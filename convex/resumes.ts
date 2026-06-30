import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

/**
 * Returns a signed PDF download URL only when the caller owns the job's resume.
 * Never accepts a raw storageId from the client (prevents ID-guessing leaks).
 */
export const getPdfUrl = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const job = await ctx.db.get(args.jobId);
    if (!job || job.userId !== user._id) return null;

    const resume = await ctx.db
      .query("tailoredResumes")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .unique();

    if (!resume || resume.userId !== user._id || !resume.pdfStorageId) {
      return null;
    }

    return await ctx.storage.getUrl(resume.pdfStorageId);
  },
});

/**
 * Returns a signed DOCX download URL only when the caller owns the job's resume.
 */
export const getDocxUrl = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const job = await ctx.db.get(args.jobId);
    if (!job || job.userId !== user._id) return null;

    const resume = await ctx.db
      .query("tailoredResumes")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .unique();

    if (!resume || resume.userId !== user._id || !resume.docxStorageId) {
      return null;
    }

    return await ctx.storage.getUrl(resume.docxStorageId);
  },
});

/**
 * Internal query used by actions to retrieve tailored resume details.
 */
export const getResumeForAction = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tailoredResumes")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .unique();
  },
});

/**
 * Internal mutation used by actions to save the compiled docxStorageId.
 */
export const saveDocxStorageId = mutation({
  args: {
    resumeId: v.id("tailoredResumes"),
    docxStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.resumeId, {
      docxStorageId: args.docxStorageId,
    });
  },
});


/**
 * Test helper mutation to insert a tailored resume and associated job record for tests.
 */
export const testCreateTailoredResume = mutation({
  args: {
    userId: v.id("users"),
    companyName: v.string(),
    jobTitle: v.string(),
    structuredContent: v.any(),
    testSecret: v.string(),
  },
  handler: async (ctx, args) => {
    const expected = process.env.AUTOMATION_WEBHOOK_SECRET;
    if (!expected || args.testSecret !== expected) {
      throw new Error("Unauthorized: Invalid test secret");
    }

    const jobId = await ctx.db.insert("jobs", {
      userId: args.userId,
      companyName: args.companyName,
      jobTitle: args.jobTitle,
      rawJdText: "Test JD",
      pipelineState: "success",
      crmStatus: "Saved",
    });

    const resumeId = await ctx.db.insert("tailoredResumes", {
      userId: args.userId,
      jobId,
      structuredContent: args.structuredContent,
      version: 1,
    });

    return { jobId, resumeId };
  },
});

/**
 * Mutation to save generated cover letter and outreach notes.
 */
export const saveCoverLetterAndOutreach = mutation({
  args: {
    jobId: v.id("jobs"),
    coverLetter: v.string(),
    outreachNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db
      .query("tailoredResumes")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .unique();
    if (!resume) {
      throw new Error("Tailored resume not found for this job");
    }
    await ctx.db.patch(resume._id, {
      coverLetter: args.coverLetter,
      outreachNotes: args.outreachNotes,
    });
  },
});

