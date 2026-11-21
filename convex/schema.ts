import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    tenantId: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    credits: v.number(),
    plan: v.optional(
      v.union(
        v.literal("free"),
        v.literal("pro_pass"),
        v.literal("pro"),
        v.literal("power"),
        v.literal("team"),
        v.literal("campus")
      )
    ),
    freeOptimizationsUsed: v.optional(v.number()),
    passExpiresAt: v.optional(v.number()),
    teamWalletBalance: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_tenantId", ["tenantId"]),

  userGenerations: defineTable({
    userId: v.id("users"),
    resumesGeneratedToday: v.number(),
    chatMessagesSentToday: v.number(),
    lastResetDate: v.string(), // "YYYY-MM-DD"
  }).index("by_userId", ["userId"]),

  masterProfiles: defineTable({
    userId: v.id("users"),
    tenantId: v.optional(v.string()),
    extractionStatus: v.string(),
    branch: v.optional(v.string()),
    cgpa: v.optional(v.float64()),
    personalInfo: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      backlogs: v.optional(v.number()),
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      portfolio: v.optional(v.string()),
    }),
    education: v.array(v.any()),
    experience: v.array(v.any()),
    projects: v.array(v.any()),
    skills: v.any(),
    certifications: v.optional(v.array(v.any())),
    achievements: v.optional(v.array(v.any())),
    rawResumeStorageId: v.optional(v.id("_storage")),
    pipelineError: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_tenantId_metrics", ["tenantId", "branch", "cgpa"]),

  savedResumes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    sections: v.optional(v.any()),
    rawText: v.optional(v.string()),
    fileStorageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    template: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    targetRole: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  optimizations: defineTable({
    userId: v.id("users"),
    jobId: v.optional(v.id("jobs")),
    roleTitle: v.string(),
    companyName: v.string(),
    outputLength: v.optional(v.string()),
    additionalContext: v.optional(v.string()),
    score: v.optional(v.number()),
    atsCompatibilityScore: v.optional(v.number()),
    bulletDiffs: v.optional(v.any()),
    matchedKeywords: v.optional(v.array(v.string())),
    missingKeywords: v.optional(v.array(v.string())),
    pdfStorageId: v.optional(v.id("_storage")),
    docxStorageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("queued"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    runId: v.optional(v.string()),
    billed: v.optional(v.boolean()),
    billedRunId: v.optional(v.string()),
    billedAt: v.optional(v.number()),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_userId", ["userId"]),

  jobs: defineTable({
    userId: v.id("users"),
    tenantId: v.optional(v.string()),
    companyName: v.string(),
    jobTitle: v.string(),
    rawJdText: v.string(),
    inputType: v.optional(v.union(v.literal("text"), v.literal("screenshot"), v.literal("pdf"))),
    rawFileStorageId: v.optional(v.id("_storage")),
    pipelineState: v.string(),
    pipelineError: v.optional(v.string()),
    extractedRequirements: v.optional(v.any()),
    skillGapQuestions: v.optional(v.any()),
    status: v.optional(v.any()), // legacy field to prevent validation errors
    crmStatus: v.optional(
      v.union(
        v.literal("Saved"),
        v.literal("Applied"),
        v.literal("Interviewing"),
        v.literal("Offered"),
        v.literal("Rejected")
      )
    ),
    statusHistory: v.optional(
      v.array(
        v.object({
          oldStatus: v.string(),
          newStatus: v.string(),
          updatedBy: v.union(v.literal("user"), v.literal("automation_bridge")),
          timestamp: v.number(),
        })
      )
    ),
    autoLogged: v.optional(v.boolean()),
    optimizationId: v.optional(v.id("optimizations")),
    url: v.optional(v.string()),
    matchScore: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_tenantId_crmStatus", ["tenantId", "crmStatus"]),

  tailoredResumes: defineTable({
    userId: v.id("users"),
    tenantId: v.optional(v.string()),
    jobId: v.id("jobs"),
    structuredContent: v.any(),
    template: v.optional(v.string()),
    styles: v.optional(v.string()),
    latexSnapshot: v.optional(v.string()),
    pdfStorageId: v.optional(v.id("_storage")),
    docxStorageId: v.optional(v.id("_storage")),
    atsCompatibilityScore: v.optional(v.number()),
    atsDetails: v.optional(v.any()),
    diffNotes: v.optional(v.array(v.string())),
    coverLetter: v.optional(v.string()),
    outreachNotes: v.optional(v.string()),
    version: v.number(),
  })
    .index("by_jobId", ["jobId"])
    .index("by_userId", ["userId"])
    .index("by_tenantId", ["tenantId"]),

  webhookQueue: defineTable({
    tenantId: v.string(),
    eventType: v.string(),
    payload: v.any(),
    attempts: v.number(),
    status: v.union(v.literal("pending"), v.literal("delivered"), v.literal("failed")),
    lastError: v.optional(v.string()),
    nextRetryTime: v.number(),
  }).index("by_status_nextRetryTime", ["status", "nextRetryTime"]),

  tenantConfig: defineTable({
    tenantId: v.string(),
    displayName: v.string(),
    inboundWebhookToken: v.string(),
    outboundWebhookUrl: v.optional(v.string()),
  }).index("by_tenantId", ["tenantId"]),

  chatMessages: defineTable({
    userId: v.id("users"),
    jobId: v.optional(v.id("jobs")),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  }).index("by_userId", ["userId"]),

  processedPayments: defineTable({
    paymentId: v.string(),
    orderId: v.string(),
    clerkId: v.string(),
    plan: v.string(),
    amount: v.optional(v.number()),
    processedAt: v.number(),
    source: v.union(v.literal("webhook"), v.literal("client_verify")),
  }).index("by_paymentId", ["paymentId"]),

  aiRuns: defineTable({
    runId: v.string(),
    userId: v.id("users"),
    jobId: v.optional(v.id("jobs")),
    stage: v.string(),
    provider: v.string(),
    model: v.string(),
    promptVersion: v.string(),
    tokens: v.optional(v.number()),
    costEstimate: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    verificationReport: v.optional(v.any()),
    error: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_runId", ["runId"])
    .index("by_userId", ["userId"])
    .index("by_jobId", ["jobId"]),
});
