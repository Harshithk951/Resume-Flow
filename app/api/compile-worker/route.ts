import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { exec } from "child_process";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";
import { promisify } from "util";
import { acquireCompileLock, releaseCompileLock, getCompileCache, setCompileCache } from "@/lib/redis";

const execPromise = promisify(exec);

function getPdfLatexPath(): string {
  const customPath = "/Library/TeX/texbin/pdflatex";
  return fs.existsSync(customPath) ? customPath : "pdflatex";
}

/**
 * Calls a Convex mutation via the HTTP API using a deploy key for auth.
 * Falls back to the AUTOMATION_WEBHOOK_SECRET if deploy key is absent.
 */
async function callConvexMutation(
  convexUrl: string,
  functionPath: string,
  args: Record<string, unknown>,
  deployKey: string,
): Promise<unknown> {
  const response = await fetch(`${convexUrl}/api/mutation/${functionPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${deployKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ args }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Convex mutation ${functionPath} failed: ${response.status} ${body}`);
  }

  return response.json();
}

/**
 * POST /api/compile-worker
 *
 * QStash worker endpoint for async LaTeX compilation.
 * Called by QStash after a compile is enqueued via POST /api/compile-latex.
 * Signature-verified via @upstash/qstash/nextjs verifySignatureAppRouter.
 *
 * Required env vars:
 *   - QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY (Upstash console)
 *   - CONVEX_DEPLOY_KEY (Convex dashboard → Settings → Deploy Keys)
 *   - NEXT_PUBLIC_CONVEX_URL (set by Convex)
 *   - AUTOMATION_WEBHOOK_SECRET (your secret)
 */
const handler = async (req: NextRequest): Promise<Response> => {
  const uniqueId = Math.random().toString(36).substring(7);
  const tmpDir = os.tmpdir();

  const texFilePath = path.join(tmpDir, `worker_${uniqueId}.tex`);
  const pdfFilePath = path.join(tmpDir, `worker_${uniqueId}.pdf`);
  const auxFilePath = path.join(tmpDir, `worker_${uniqueId}.aux`);
  const logFilePath = path.join(tmpDir, `worker_${uniqueId}.log`);
  const outFilePath = path.join(tmpDir, `worker_${uniqueId}.out`);

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const deployKey = process.env.CONVEX_DEPLOY_KEY;
  const automationSecret = process.env.AUTOMATION_WEBHOOK_SECRET;

  if (!convexUrl || !deployKey) {
    return NextResponse.json(
      { error: "Worker not configured: missing CONVEX_DEPLOY_KEY or NEXT_PUBLIC_CONVEX_URL" },
      { status: 500 }
    );
  }

  let jobId: string | null = null;
  let lockAcquired = false;

  try {
    const body = await req.json();
    const { latex, jobId: incomingJobId, latexHash } = body as {
      latex?: string;
      jobId?: string;
      latexHash?: string;
    };
    jobId = incomingJobId ?? null;

    if (!latex) {
      return NextResponse.json({ error: "Missing latex code payload" }, { status: 400 });
    }

    // ── Step 1: Acquire distributed compile lock ──
    if (jobId) {
      const lockSuccess = await acquireCompileLock(jobId, 180);
      if (!lockSuccess) {
        return NextResponse.json({ skipped: true, reason: "lock_held" });
      }
      lockAcquired = true;
    }

    // ── Step 2: Check compile output cache ──
    const hash = latexHash ?? crypto.createHash("sha256").update(latex, "utf-8").digest("hex");
    const cachedStorageId = await getCompileCache(hash);
    if (cachedStorageId) {
      // Complete with cached PDF — no pdflatex needed
      await callConvexMutation(convexUrl, "jobs:systemSetCompilationCompleted", {
        jobId,
        pdfStorageId: cachedStorageId,
        secret: automationSecret ?? "",
      }, deployKey);

      return NextResponse.json({ cached: true, storageId: cachedStorageId });
    }

    // ── Step 3: Run pdflatex ──
    await fsPromises.writeFile(texFilePath, latex, "utf-8");

    const pdflatexPath = getPdfLatexPath();
    const compileCmd = `"${pdflatexPath}" -interaction=nonstopmode -output-directory="${tmpDir}" "${texFilePath}"`;

    try {
      await execPromise(compileCmd);
    } catch (execErr: unknown) {
      const err = execErr as { stdout?: string; message?: string };
      throw new Error(`pdflatex failed: ${err.stdout || err.message}`);
    }

    if (!fs.existsSync(pdfFilePath)) {
      let logContent = "";
      try { logContent = await fsPromises.readFile(logFilePath, "utf-8"); } catch { /* ignore */ }
      throw new Error(`PDF not generated. Log: ${logContent.substring(Math.max(0, logContent.length - 2000))}`);
    }

    const pdfBuffer = await fsPromises.readFile(pdfFilePath);

    // ── Step 4: Upload PDF to Convex storage ──
    // 4a. Get upload URL via system mutation
    const uploadUrlResponse = await callConvexMutation(
      convexUrl,
      "profiles:generateSystemUploadUrl",
      { secret: automationSecret ?? "" },
      deployKey,
    ) as { value?: string };

    const uploadUrl = uploadUrlResponse?.value || (uploadUrlResponse as string);

    // 4b. Upload the PDF
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "application/pdf" },
      body: pdfBuffer,
    });

    if (!uploadRes.ok) {
      throw new Error(`Failed to upload PDF to Convex storage: ${await uploadRes.text()}`);
    }

    const { storageId } = (await uploadRes.json()) as { storageId: string };

    // ── Step 5: Mark compilation complete ──
    if (jobId) {
      await callConvexMutation(convexUrl, "jobs:systemSetCompilationCompleted", {
        jobId,
        pdfStorageId: storageId,
        secret: automationSecret ?? "",
      }, deployKey);
    }

    // ── Step 6: Cache compile output ──
    await setCompileCache(hash, storageId);

    return NextResponse.json({
      success: true,
      storageId,
      sizeBytes: pdfBuffer.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Worker compilation failed";

    // Report failure to Convex
    if (jobId && convexUrl && deployKey && automationSecret) {
      try {
        await callConvexMutation(convexUrl, "jobs:systemSetCompilationFailed", {
          jobId,
          errorMessage: message,
          secret: automationSecret,
        }, deployKey);
      } catch (reportErr) {
        console.error("[compile-worker] Failed to report failure:", reportErr);
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await Promise.all([
      fsPromises.unlink(texFilePath).catch(() => {}),
      fsPromises.unlink(pdfFilePath).catch(() => {}),
      fsPromises.unlink(auxFilePath).catch(() => {}),
      fsPromises.unlink(logFilePath).catch(() => {}),
      fsPromises.unlink(outFilePath).catch(() => {}),
    ]);

    if (jobId && lockAcquired) {
      await releaseCompileLock(jobId);
    }
  }
};

// Wrap with QStash signature verification — rejects non-QStash callers.
// Only wraps when env vars are available (they're set in production via Vercel,
// but not during `next build` or local dev without QStash).
const hasQStashKeys =
  !!process.env.QSTASH_CURRENT_SIGNING_KEY &&
  !!process.env.QSTASH_NEXT_SIGNING_KEY;

export const POST = hasQStashKeys
  ? verifySignatureAppRouter(handler)
  : handler;
