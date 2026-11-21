import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import crypto from "crypto";
import { acquireCompileLock, releaseCompileLock, getCompileCache, setCompileCache } from "@/lib/redis";
import { compileLatexSandboxed } from "@/lib/latex/sandbox";

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

export async function verifyQStashSignature(
  signature: string | null,
  body: string,
  url: string
): Promise<{ valid: boolean; reason?: string }> {
  if (!signature) {
    return { valid: false, reason: "Missing upstash-signature header" };
  }

  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

  if (!currentSigningKey || !nextSigningKey) {
    return { valid: false, reason: "QStash signing keys not configured on server" };
  }

  const receiver = new Receiver({
    currentSigningKey,
    nextSigningKey,
  });

  try {
    const isValid = await receiver.verify({
      signature,
      body,
      url,
    });
    return { valid: isValid };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return { valid: false, reason: message };
  }
}

/**
 * POST /api/compile-worker
 *
 * QStash worker endpoint for async LaTeX compilation.
 * Called by QStash after a compile is enqueued via POST /api/compile-latex.
 * Signature-verified via Upstash QStash Receiver.
 */
export async function POST(req: NextRequest): Promise<Response> {
  const rawBody = await req.text();
  const signature = req.headers.get("upstash-signature");

  const auth = await verifyQStashSignature(signature, rawBody, req.url);
  if (!auth.valid) {
    return NextResponse.json(
      { error: `Unauthorized: ${auth.reason}` },
      { status: 401 }
    );
  }

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
    const body = JSON.parse(rawBody);
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

    // ── Step 3: Run sandboxed pdflatex ──
    const { pdfBuffer } = await compileLatexSandboxed(latex);

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
      body: new Uint8Array(pdfBuffer),
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
    if (jobId && lockAcquired) {
      await releaseCompileLock(jobId);
    }
  }
}
