"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { compileAndUploadResume } from "@/lib/latex/compiler";
import { compileStructuredContentToPdf } from "@/lib/pdf/compiler";
import { uploadToConvexStorage } from "@/lib/convexStorageUpload";
import { resolveTemplate, TEMPLATES } from "@/lib/latex/resolveTemplate";
import { normalizeStructuredContent } from "@/lib/pdf/types";
import { clientLog } from "@/lib/clientLogger";

export function GlobalSilentCompiler() {
  const jobs = useQuery(api.jobs.getMyJobs) ?? [];
  const convex = useConvex();
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);
  const setCompilationCompleted = useMutation(api.jobs.setCompilationCompleted);
  const setCompilationFailed = useMutation(api.jobs.setCompilationFailed);

  const compilingLock = useRef<Set<string>>(new Set());
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const compilingJobs = jobs.filter((job: any) => job.pipelineState === "compiling");

    for (const job of compilingJobs) {
      const jobId = job._id as string;
      if (compilingLock.current.has(jobId)) continue;

      compilingLock.current.add(jobId);

      const safetyTimeout = setTimeout(async () => {
        if (!compilingLock.current.has(jobId)) return;
        clientLog.warn(`[compiler] Job ${jobId} compilation timed out locally.`);
        compilingLock.current.delete(jobId);
        timeoutRefs.current.delete(jobId);
        try {
          await setCompilationFailed({
            jobId: job._id,
            errorMessage:
              "The compilation request exceeded the 90-second safety timeout limit.",
          });
        } catch (err) {
          console.error(`[compiler] Failed to report timeout for job ${jobId}:`, err);
        }
      }, 90000);
      timeoutRefs.current.set(jobId, safetyTimeout);

      (async () => {
        try {
          clientLog.info(`[compiler] Starting background build for job ${jobId}...`);

          const resume = await convex.query(api.jobs.getTailoredResume, {
            jobId: job._id,
          });
          if (!resume?.structuredContent) {
            throw new Error("Resume payload not found in database.");
          }

          const templateId = resolveTemplate(job.extractedRequirements?.resumeType);
          const latex =
            resume.latexSnapshot && resume.latexSnapshot.length > 0
              ? resume.latexSnapshot
              : TEMPLATES[templateId].render(resume.structuredContent);

          const storageResult = await compileAndUploadResume(generateUploadUrl, {
            jobId: job._id,
            latexCode: latex,
            structuredContent: normalizeStructuredContent(
              resume.structuredContent
            ),
            templateId,
          });

          // Async path: compile was enqueued via QStash — worker will complete,
          // OR compile output was cached — complete immediately with cached PDF
          if (typeof storageResult === "object" && "queued" in storageResult && storageResult.queued) {
            if (storageResult.cacheHit && storageResult.storageId) {
              clientLog.info(
                `[compiler] Cache HIT — completing job ${jobId} with existing PDF.`
              );
              await setCompilationCompleted({
                jobId: job._id,
                pdfStorageId: storageResult.storageId as Id<"_storage">,
              });
              return;
            }

            clientLog.info(
              `[compiler] Compile queued. Running fast client-side fallback compilation for job ${jobId}...`
            );
            const fallbackBlob = await compileStructuredContentToPdf(
              normalizeStructuredContent(resume.structuredContent),
              templateId
            );
            const uploadUrl = await generateUploadUrl();
            const { storageId: fallbackStorageId } = await uploadToConvexStorage(
              uploadUrl,
              fallbackBlob,
              "resume.pdf"
            );
            await setCompilationCompleted({
              jobId: job._id,
              pdfStorageId: fallbackStorageId as Id<"_storage">,
            });
            clientLog.info(
              `[compiler] Successfully completed fallback compilation for job ${jobId}.`
            );
            return;
          }

          const storageId = storageResult as string;
          const result = await setCompilationCompleted({
            jobId: job._id,
            pdfStorageId: storageId as Id<"_storage">,
          });

          if (result?.duplicatedIgnored) {
            clientLog.info(`[compiler] Duplicate compile write blocked for job ${jobId}.`);
          } else {
            clientLog.info(`[compiler] Successfully completed compilation for job ${jobId}.`);
          }
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "An unexpected error occurred during LaTeX compilation.";
          console.error(`[compiler] Compilation failed for job ${jobId}:`, err);
          try {
            await setCompilationFailed({
              jobId: job._id,
              errorMessage: message,
            });
          } catch (failErr) {
            console.error(`[compiler] Failed to report error for job ${jobId}:`, failErr);
          }
        } finally {
          const timer = timeoutRefs.current.get(jobId);
          if (timer) clearTimeout(timer);
          timeoutRefs.current.delete(jobId);
          compilingLock.current.delete(jobId);
        }
      })();
    }
  }, [jobs, convex, generateUploadUrl, setCompilationCompleted, setCompilationFailed]);

  return null;
}
