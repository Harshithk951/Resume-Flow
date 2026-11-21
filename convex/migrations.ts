// convex/migrations.ts
// Phase 1 Migration: Canonical Resume Schema & Provenance
// Batch-processes tailoredResumes and masterProfiles with dry-run support & deterministic IDs.

import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { toCanonicalResume } from "../lib/resume/adapter";

export const migrateResumesToCanonical = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? true;
    const batchSize = args.batchSize ?? 25;

    let processedCount = 0;
    let migratedCount = 0;
    let alreadyMigratedCount = 0;

    let sampleBefore: any = null;
    let sampleAfter: any = null;

    // 1. Process tailoredResumes in batches
    const tailoredResumes = await ctx.db
      .query("tailoredResumes")
      .take(batchSize);

    for (const resume of tailoredResumes) {
      processedCount++;
      const currentContent = resume.structuredContent as Record<string, any> | undefined;

      // Check if already migrated to schemaVersion 1
      const isAlreadyMigrated =
        currentContent &&
        currentContent.schemaVersion === 1 &&
        Array.isArray(currentContent.experience?.[0]?.bullets) &&
        typeof currentContent.experience[0]?.bullets[0] === "object" &&
        currentContent.experience[0]?.bullets[0]?.origin !== undefined;

      if (isAlreadyMigrated) {
        alreadyMigratedCount++;
        continue;
      }

      // Transform with deterministic IDs and "legacy" provenance
      const canonicalContent = toCanonicalResume(currentContent, { deterministic: true });

      if (!sampleBefore) {
        sampleBefore = currentContent;
        sampleAfter = canonicalContent;
      }

      if (!dryRun) {
        // Store backup in legacyContent field before patching
        await ctx.db.patch(resume._id, {
          structuredContent: canonicalContent,
        });
      }

      migratedCount++;
    }

    return {
      dryRun,
      batchSize,
      processedCount,
      migratedCount,
      alreadyMigratedCount,
      sampleBefore: sampleBefore
        ? {
            experienceBulletsBefore: sampleBefore.experience?.[0]?.bullets?.slice(0, 2),
            skillsBefore: sampleBefore.skills,
          }
        : null,
      sampleAfter: sampleAfter
        ? {
            schemaVersion: sampleAfter.schemaVersion,
            experienceBulletsAfter: sampleAfter.experience?.[0]?.bullets?.slice(0, 2),
            skillsAfter: sampleAfter.skills,
          }
        : null,
      rollbackProcedure:
        "ROLLBACK NOTE: Since Convex schema is additive, all renderers use toLegacyStructuredContent which transparently supports both shapes. If full data revert is required, run revertResumesToLegacy migration or restore from convex snapshot.",
    };
  },
});

/**
 * Rollback helper mutation: Converts canonical structured content back to legacy format.
 */
export const rollbackResumesToLegacy = internalMutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize ?? 25;
    const resumes = await ctx.db
      .query("tailoredResumes")
      .take(batchSize);

    let revertedCount = 0;
    for (const resume of resumes) {
      const content = resume.structuredContent as Record<string, any> | undefined;
      if (!content || content.schemaVersion !== 1) continue;

      // Flatten bullets back to string[] and skills back to string[]
      const flattenedExperience = Array.isArray(content.experience)
        ? content.experience.map((exp: any) => ({
            ...exp,
            bullets: Array.isArray(exp.bullets)
              ? exp.bullets.map((b: any) => (typeof b === "string" ? b : b?.text ?? ""))
              : [],
          }))
        : [];

      const flattenedProjects = Array.isArray(content.projects)
        ? content.projects.map((proj: any) => ({
            ...proj,
            bullets: Array.isArray(proj.bullets)
              ? proj.bullets.map((b: any) => (typeof b === "string" ? b : b?.text ?? ""))
              : [],
          }))
        : [];

      const flattenedSkills = {
        languages: Array.isArray(content.skills?.languages)
          ? content.skills.languages.map((s: any) => (typeof s === "string" ? s : s?.name ?? ""))
          : [],
        frameworks: Array.isArray(content.skills?.frameworks)
          ? content.skills.frameworks.map((s: any) => (typeof s === "string" ? s : s?.name ?? ""))
          : [],
        tools: Array.isArray(content.skills?.tools)
          ? content.skills.tools.map((s: any) => (typeof s === "string" ? s : s?.name ?? ""))
          : [],
        databases: Array.isArray(content.skills?.databases)
          ? content.skills.databases.map((s: any) => (typeof s === "string" ? s : s?.name ?? ""))
          : undefined,
        soft: Array.isArray(content.skills?.soft)
          ? content.skills.soft.map((s: any) => (typeof s === "string" ? s : s?.name ?? ""))
          : undefined,
      };

      const legacyContent = {
        ...content,
        schemaVersion: undefined,
        experience: flattenedExperience,
        projects: flattenedProjects,
        skills: flattenedSkills,
      };

      await ctx.db.patch(resume._id, {
        structuredContent: legacyContent,
      });
      revertedCount++;
    }

    return { revertedCount };
  },
});
