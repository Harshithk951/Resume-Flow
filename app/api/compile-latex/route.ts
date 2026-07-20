import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";
import { promisify } from "util";
import { acquireCompileLock, releaseCompileLock, getCompileCache } from "@/lib/redis";

const execPromise = promisify(exec);

function getPdfLatexPath(): string {
  const customPath = "/Library/TeX/texbin/pdflatex";
  return fs.existsSync(customPath) ? customPath : "pdflatex";
}

/**
 * POST /api/compile-latex
 *
 * Three execution modes, selected automatically:
 *
 * 1. **Cache HIT** — If an identical LaTeX snapshot was compiled before,
 *    returns the cached Convex storage ID immediately (fast path).
 *
 * 2. **QStash async** — If QSTASH_TOKEN is configured, enqueues the compile
 *    job via QStash and returns 202 Accepted. The worker at /api/compile-worker
 *    runs pdflatex, uploads the result, and calls setCompilationCompleted.
 *
 * 3. **Synchronous (fallback)** — Runs pdflatex inline in the request (same as
 *    the original behavior). Used when QStash is not configured.
 */
export async function POST(req: NextRequest) {
  let jobId: string | null = null;
  let lockAcquired = false;
  const uniqueId = Math.random().toString(36).substring(7);
  const tmpDir = os.tmpdir();

  const texFilePath = path.join(tmpDir, `resume_${uniqueId}.tex`);
  const pdfFilePath = path.join(tmpDir, `resume_${uniqueId}.pdf`);
  const auxFilePath = path.join(tmpDir, `resume_${uniqueId}.aux`);
  const logFilePath = path.join(tmpDir, `resume_${uniqueId}.log`);
  const outFilePath = path.join(tmpDir, `resume_${uniqueId}.out`);

  try {
    const body = await req.json();
    const { latex, jobId: incomingJobId } = body as {
      latex?: string;
      jobId?: string;
    };
    jobId = incomingJobId ?? null;

    if (!latex) {
      return NextResponse.json({ error: "Missing latex code payload" }, { status: 400 });
    }

    // ── Step 1: Check compile output cache ──
    const latexHash = crypto.createHash("sha256").update(latex, "utf-8").digest("hex");
    const cachedStorageId = await getCompileCache(latexHash);
    if (cachedStorageId) {
      console.log(`[compile-api] Cache HIT for hash ${latexHash.substring(0, 12)}...`);
      return NextResponse.json({
        cached: true,
        storageId: cachedStorageId,
        hash: latexHash,
      });
    }

    // ── Step 2: Try async enqueue (QStash) ──
    const qstashToken = process.env.QSTASH_TOKEN;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const convexDeployKey = process.env.CONVEX_DEPLOY_KEY;
    if (qstashToken && convexUrl && convexDeployKey) {
      console.log(`[compile-api] Enqueuing compile for job ${jobId ?? "unknown"} via QStash...`);

      // Determine the worker URL (self-referencing the deployment)
      const host = req.headers.get("host") ?? "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      const workerUrl = `${protocol}://${host}/api/compile-worker`;

      const qstashBody = JSON.stringify({
        latex,
        jobId,
        latexHash,
      });

      const qstashRes = await fetch("https://qstash.upstash.io/v1/publish", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${qstashToken}`,
          "Content-Type": "application/json",
          "Upstash-Retries": "2",
          "Upstash-Callback": `${convexUrl}/api/mutation/jobs:setCompilationFailed`,
          "Upstash-Forward-Convex-Deploy-Key": convexDeployKey,
        },
        body: JSON.stringify({
          url: workerUrl,
          body: qstashBody,
        }),
      });

      if (!qstashRes.ok) {
        const errText = await qstashRes.text();
        console.error(`[compile-api] QStash enqueue failed (${qstashRes.status}):`, errText);
        // Fall through to synchronous path
      } else {
        const qstashData = await qstashRes.json();
        console.log(`[compile-api] QStash enqueued: messageId=${qstashData.messageId}`);
        return NextResponse.json({
          accepted: true,
          jobId,
          hash: latexHash,
          messageId: qstashData.messageId,
        }, { status: 202 });
      }
    }

    // ── Step 3: Synchronous path (fallback / unconfigured QStash) ──
    if (jobId) {
      const lockSuccess = await acquireCompileLock(jobId);
      if (!lockSuccess) {
        return NextResponse.json(
          { error: "A compilation is already in progress for this resume." },
          { status: 423 }
        );
      }
      lockAcquired = true;
    }

    await fsPromises.writeFile(texFilePath, latex, "utf-8");

    const pdflatexPath = getPdfLatexPath();
    const compileCmd = `"${pdflatexPath}" -interaction=nonstopmode -output-directory="${tmpDir}" "${texFilePath}"`;

    try {
      await execPromise(compileCmd);
    } catch (execErr: unknown) {
      const err = execErr as { stdout?: string; message?: string };
      return NextResponse.json(
        { error: "pdflatex compilation failed", details: err.stdout || err.message },
        { status: 500 }
      );
    }

    if (!fs.existsSync(pdfFilePath)) {
      let logContent = "";
      try { logContent = await fsPromises.readFile(logFilePath, "utf-8"); } catch { /* ignore */ }
      return NextResponse.json(
        { error: "PDF was not generated", logs: logContent.substring(Math.max(0, logContent.length - 2000)) },
        { status: 500 }
      );
    }

    const pdfBuffer = await fsPromises.readFile(pdfFilePath);

    // Seed the output cache for future requests
    // (The frontend will handle the upload — this just pre-seeds the hash)
    console.log(`[compile-api] Cache MISS — seeded hash ${latexHash.substring(0, 12)}... for future dedup`);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume_${uniqueId}.pdf"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[compile-api] Failed:", err);
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
}
