import { query } from "./_generated/server";
import { requireAuth } from "./lib/auth";

/**
 * getDashboardStats — cached reactively by Convex's built-in query result cache.
 * Under load, Convex automatically deduplicates concurrent identical queries
 * (same args, same user) without hammering the database.
 * No external Redis cache is needed here — Convex's native caching handles
 * the repeated-dashboard-polling use case more safely than HTTP fetch calls
 * from within a query handler.
 */
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    const allJobs = await ctx.db
      .query("jobs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const allResumes = await ctx.db
      .query("tailoredResumes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const resumesByJobMap = new Map<string, (typeof allResumes)[0]>();
    allResumes.forEach((resume) => {
      resumesByJobMap.set(resume.jobId, resume);
    });

    const totalCompanies = allJobs.length;
    let resumesReadyCount = 0;
    let combinedMatchScoreSum = 0;
    let scoredJobsCount = 0;

    const needsAttentionJobs: Array<{
      id: string;
      companyName: string;
      roleTitle: string;
      pipelineState: string;
    }> = [];

    allJobs.forEach((job) => {
      if (job.pipelineState === "completed") {
        resumesReadyCount++;
      }

      const relatedResume = resumesByJobMap.get(job._id);
      if (relatedResume && relatedResume.atsCompatibilityScore !== undefined) {
        combinedMatchScoreSum += relatedResume.atsCompatibilityScore;
        scoredJobsCount++;
      }

      if (
        job.pipelineState === "needs_user_input" ||
        job.pipelineState === "failed"
      ) {
        needsAttentionJobs.push({
          id: job._id,
          companyName: job.companyName,
          roleTitle: job.jobTitle,
          pipelineState: job.pipelineState,
        });
      }
    });

    const avgMatchCompatibility =
      scoredJobsCount > 0
        ? Math.round(combinedMatchScoreSum / scoredJobsCount)
        : 0;

    return {
      metrics: {
        totalCompanies,
        resumesReady: resumesReadyCount,
        avgMatch: avgMatchCompatibility,
      },
      needsAttention: needsAttentionJobs,
      pipelinesSummary: allJobs.map((job) => ({
        id: job._id,
        companyName: job.companyName,
        roleTitle: job.jobTitle,
        pipelineState: job.pipelineState,
        matchScore: resumesByJobMap.get(job._id)?.atsCompatibilityScore ?? 0,
      })),
    };
  },
});

/**
 * getDashboardSummary — cached reactively by Convex's built-in query result cache.
 */
export const getDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    // 1. Profile Completeness
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

    // 2. CRM Status Counts
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const statusCounts = {
      Saved: 0,
      Applied: 0,
      Interviewing: 0,
      Offered: 0,
      Rejected: 0,
    };

    jobs.forEach((job) => {
      const status = job.crmStatus ?? "Saved";
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts]++;
      }
    });

    // 3. Activity Ledger (Compile last 5 events from jobs, status histories, and resumes)
    const tailoredResumes = await ctx.db
      .query("tailoredResumes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const activities: Array<{
      id: string;
      type: "job_created" | "status_updated" | "resume_tailored";
      title: string;
      timestamp: number;
    }> = [];

    // Job creation events
    jobs.forEach((job) => {
      activities.push({
        id: job._id,
        type: "job_created",
        title: `Added job for ${job.jobTitle} at ${job.companyName}`,
        timestamp: job._creationTime,
      });

      // Status change history events
      if (job.statusHistory) {
        job.statusHistory.forEach((hist, index) => {
          activities.push({
            id: `${job._id}-hist-${index}`,
            type: "status_updated",
            title: `Moved ${job.companyName} to ${hist.newStatus}`,
            timestamp: hist.timestamp,
          });
        });
      }
    });

    // Resume tailored events
    tailoredResumes.forEach((resume) => {
      const relatedJob = jobs.find((j) => j._id === resume.jobId);
      const company = relatedJob?.companyName ?? "Unknown";
      activities.push({
        id: resume._id,
        type: "resume_tailored",
        title: `Generated tailored resume for ${company}`,
        timestamp: resume._creationTime,
      });
    });

    // Sort activities descending by timestamp and take the top 5
    const recentActivities = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    // 4. Count total resumes ever generated (across all jobs)
    const totalResumesGenerated = tailoredResumes.length;

    return {
      completeness,
      statusCounts,
      recentActivities,
      totalResumesGenerated,
      user: {
        name: user.name,
        credits: user.credits,
        plan: user.plan,
        onboardingComplete: user.onboardingComplete ?? false,
      },
    };
  },
});

export const getMyJobsEnriched = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const resumes = await ctx.db
      .query("tailoredResumes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const resumeMap = new Map(resumes.map((r) => [r.jobId as string, r]));

    return jobs.map((job) => ({
      ...job,
      atsScore: resumeMap.get(job._id as string)?.atsCompatibilityScore ?? null,
      pdfStorageId: resumeMap.get(job._id as string)?.pdfStorageId ?? null,
      hasResume: resumeMap.has(job._id as string),
    }));
  },
});

