"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import createReport from "docx-templates";

/**
 * Convex action that generates a DOCX resume using docx-templates,
 * uploads it to Convex storage, and returns the signed URL.
 * Declared with "use node" to bypass default V8 sandboxing limits.
 */
export const generateDocx = action({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    // 1. Fetch tailored resume details
    const resume = await ctx.runQuery(api.resumes.getResumeForAction, { jobId: args.jobId });
    if (!resume) throw new Error("Resume not found");

    // 2. Get template storage ID
    const templateStorageId = process.env.DOCX_TEMPLATE_STORAGE_ID;
    if (!templateStorageId) throw new Error("Missing DOCX_TEMPLATE_STORAGE_ID env var");

    // 3. Fetch template file from Convex storage
    const downloadUrl = await ctx.storage.getUrl(templateStorageId);
    if (!downloadUrl) throw new Error("Template download URL could not be generated");

    const tResponse = await fetch(downloadUrl);
    if (!tResponse.ok) throw new Error("Failed to download template file");

    const templateBuffer = await tResponse.arrayBuffer();

    // 4. Map structuredContent to template data
    const resumeData = {
      basics: {
        name: resume.structuredContent?.personalInfo?.name || "",
        email: resume.structuredContent?.personalInfo?.email || "",
        phone: resume.structuredContent?.personalInfo?.phone || "",
        url: resume.structuredContent?.personalInfo?.portfolio || "",
        summary: resume.structuredContent?.summary || "",
        profiles: [
          ...(resume.structuredContent?.personalInfo?.linkedin
            ? [{ network: "LinkedIn", url: resume.structuredContent.personalInfo.linkedin }]
            : []),
          ...(resume.structuredContent?.personalInfo?.github
            ? [{ network: "GitHub", url: resume.structuredContent.personalInfo.github }]
            : []),
        ],
      },
      education: (resume.structuredContent?.education || []).map((edu: any) => ({
        institution: edu.institution,
        studyType: edu.degree,
        score: edu.gpa || "",
        endDate: edu.year,
      })),
      work: (resume.structuredContent?.experience || []).map((exp: any) => ({
        name: exp.company,
        position: exp.role,
        startDate: exp.duration,
        summary: (exp.bullets || []).join("\n"),
      })),
      projects: (resume.structuredContent?.projects || []).map((proj: any) => ({
        name: proj.name,
        description: proj.description,
        summary: (proj.bullets || []).join("\n"),
        keywords: proj.technologies || [],
      })),
      skills: [
        ...(resume.structuredContent?.skills?.languages?.length
          ? [{ name: "Languages", keywords: resume.structuredContent.skills.languages }]
          : []),
        ...(resume.structuredContent?.skills?.frameworks?.length
          ? [{ name: "Frameworks", keywords: resume.structuredContent.skills.frameworks }]
          : []),
        ...(resume.structuredContent?.skills?.tools?.length
          ? [{ name: "Tools", keywords: resume.structuredContent.skills.tools }]
          : []),
      ],
      certifications: (resume.structuredContent?.certifications || []).map((cert: any) => ({
        name: cert.name,
        issuer: cert.issuer,
        date: cert.year,
      })),
      achievements: (resume.structuredContent?.achievements || []).map((ach: any) => ({
        description: ach.description,
        date: ach.year || "",
      })),
    };

    // 5. Generate DOCX
    const docBuffer = await createReport({
      template: Buffer.from(templateBuffer),
      data: resumeData,
      cmdDelimiter: ["{{{", "}}}"],
    });

    // 6. Store DOCX back in Convex storage
    const docBlob = new Blob([docBuffer as any], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const docxStorageId = await ctx.storage.store(docBlob);

    // 7. Save docxStorageId
    await ctx.runMutation(api.resumes.saveDocxStorageId, {
      resumeId: resume._id,
      docxStorageId,
    });

    // 8. Return signed download URL
    return await ctx.storage.getUrl(docxStorageId);
  },
});
