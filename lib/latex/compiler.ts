import { compileStructuredContentToPdf } from "../pdf/compiler";
import { StructuredResumeContent } from "../pdf/types";
import { clientLog } from "@/lib/clientLogger";
import { uploadToConvexStorage } from "@/lib/convexStorageUpload";

export interface CompileOptions {
  jobId: string;
  latexCode: string;
  structuredContent: StructuredResumeContent;
  templateId: string;
}

/**
 * Robust 4-Layer Fallback Compiler Chain
 * Layer 1: Browser WASM LaTeX
 * Layer 2: Next.js API Child Process pdflatex
 * Layer 3: Client-side React-PDF Vector Compile
 * Layer 4: Strict compilation failure (Option B — no text/plain upload)
 */
export type CompileResult =
  | { blob: Blob; engine: "wasm" | "local_api" | "react_pdf" }
  | { engine: "queued"; cacheHit?: boolean; storageId?: string };

export type CompileAndUploadResult =
  | string
  | { queued: true; cacheHit?: boolean; storageId?: string };

export async function compileLatexToPdf(
  options: CompileOptions
): Promise<CompileResult> {
  const { jobId, latexCode, structuredContent, templateId } = options;

  if (typeof window === "undefined") {
    throw new Error("PDF compilation can only occur in a browser context.");
  }

  // ─── LAYER 1: BROWSER WASM COMPILER ───
  try {
    clientLog.info("[compiler] Layer 1: Attempting Browser WASM compilation...");
    const pdfBlob = await runWasmCompilation(latexCode);
    return { blob: pdfBlob, engine: "wasm" };
  } catch (wasmError: unknown) {
    const message =
      wasmError instanceof Error ? wasmError.message : String(wasmError);
    clientLog.warn("[compiler] Layer 1 WASM failed:", message);
  }

  // ─── LAYER 2: API ROUTE (sync or async via QStash) ───
  try {
    clientLog.info(
      "[compiler] Layer 2: Attempting server-side LaTeX compilation..."
    );
    const res = await fetch("/api/compile-latex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latex: latexCode, jobId }),
    });

    if (res.ok) {
      // Check for cache hit first
      if (res.status === 200) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          // JSON response: either cache hit or 202 enqueue
          const data = await res.json();
          if (data.cached && data.storageId) {
            clientLog.info(`[compiler] Layer 2: Cache HIT — storageId=${data.storageId}`);
            return { engine: "queued", cacheHit: true, storageId: data.storageId };
          }
        } else if (contentType.includes("application/pdf")) {
          // PDF response: synchronous compile completed
          const pdfBlob = await res.blob();
          return { blob: pdfBlob, engine: "local_api" };
        }
      }

      // Status 202 Accepted — async enqueue via QStash
      if (res.status === 202) {
        clientLog.info("[compiler] Layer 2: Compile enqueued via QStash — waiting for worker...");
        return { engine: "queued" };
      }

      clientLog.warn(`[compiler] Layer 2 API returned status ${res.status} — unexpected.`);
    } else if (res.status === 423) {
      // Lock already held — another compile is in progress for this job
      clientLog.warn("[compiler] Layer 2: Compile lock held by another instance — waiting...");
      return { engine: "queued" };
    } else {
      const errData = await res.json().catch(() => ({}));
      clientLog.warn(
        "[compiler] Layer 2 API failed:",
        (errData as { error?: string }).error || `HTTP ${res.status}`
      );
    }
  } catch (apiError: unknown) {
    const message =
      apiError instanceof Error ? apiError.message : String(apiError);
    clientLog.warn("[compiler] Layer 2 API connection failed:", message);
  }

  // ─── LAYER 3: CLIENT-SIDE REACT-PDF ENGINE ───
  try {
    clientLog.info(
      "[compiler] Layer 3: Attempting client-side React-PDF compilation fallback..."
    );
    const pdfBlob = await compileStructuredContentToPdf(
      structuredContent,
      templateId
    );
    return { blob: pdfBlob, engine: "react_pdf" };
  } catch (pdfError: unknown) {
    const message =
      pdfError instanceof Error ? pdfError.message : String(pdfError);
    console.error("[compiler] Layer 3 React-PDF failed:", message);
  }

  // ─── LAYER 4: STRICT COMPILATION FAILURE (Option B) ───
  throw new Error(
    "Compilation failed across all standard and fallback PDF rendering engines."
  );
}

async function runWasmCompilation(latexCode: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      if (!window.Worker) {
        throw new Error("Web Workers are not supported in this browser.");
      }

      const worker = new Worker("/wasm/latex-worker.js");

      const timeout = setTimeout(() => {
        worker.terminate();
        reject(
          new Error(
            "WASM compiler timeout. WASM assets not initialized in /public/wasm/."
          )
        );
      }, 50);

      worker.onmessage = (event) => {
        clearTimeout(timeout);
        const { type, pdfBlob, error } = event.data as {
          type: string;
          pdfBlob?: Blob;
          error?: string;
        };
        worker.terminate();

        if (type === "success" && pdfBlob instanceof Blob) {
          resolve(pdfBlob);
        } else {
          reject(new Error(error || "WASM compilation failed."));
        }
      };

      worker.onerror = (err) => {
        if (err && typeof err.preventDefault === "function") {
          err.preventDefault();
        }
        clearTimeout(timeout);
        worker.terminate();
        reject(
          new Error(
            "WASM assets not initialized in /public/wasm/ on local filesystem."
          )
        );
      };

      worker.postMessage({ type: "compile", latex: latexCode });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      reject(
        new Error(
          message ||
            "WASM assets not initialized in /public/wasm/ on local filesystem."
        )
      );
    }
  });
}

/**
 * Unified compiler and Convex storage uploader.
 * Throws on Layer 4 failure so callers can invoke setCompilationFailed.
 */
/**
 * Unified compiler and Convex storage uploader.
 *
 * When the compile is queued (async QStash path), returns a special marker
 * so callers can wait for pipeline state change instead of uploading.
 *
 * On cache hit, returns the storage ID from the cache (no upload needed).
 *
 * Normal synchronous compile: uploads the PDF blob and returns storage ID.
 *
 * Throws on Layer 4 failure so callers can invoke setCompilationFailed.
 */
export async function compileAndUploadResume(
  generateUploadUrl: () => Promise<string>,
  options: CompileOptions
): Promise<CompileAndUploadResult> {
  const result = await compileLatexToPdf(options);

  // Async enqueue path: compile was queued via QStash — caller should wait
  // for pipelineState to change to "completed" via Convex reactive query
  if (result.engine === "queued") {
    clientLog.info(
      "[compiler] Compile queued for server-side processing. Waiting for pipeline state change..."
    );
    return { queued: true, cacheHit: result.cacheHit, storageId: result.storageId };
  }

  const { blob, engine } = result;
  clientLog.info(
    `[compiler] Successful build using engine: ${engine}. Uploading to storage...`
  );

  const uploadUrl = await generateUploadUrl();
  const { storageId } = await uploadToConvexStorage(uploadUrl, blob, "resume.pdf");
  return storageId;
}
