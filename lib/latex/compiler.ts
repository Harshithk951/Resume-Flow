import { compileStructuredContentToPdf } from "../pdf/compiler";
import { StructuredResumeContent } from "../pdf/types";
import { clientLog } from "@/lib/clientLogger";

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
export async function compileLatexToPdf(
  options: CompileOptions
): Promise<{ blob: Blob; engine: "wasm" | "local_api" | "react_pdf" }> {
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

  // ─── LAYER 2: LOCAL PDFLATEX API ROUTE ───
  try {
    clientLog.info(
      "[compiler] Layer 2: Attempting local pdflatex child-process API..."
    );
    const res = await fetch("/api/compile-latex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latex: latexCode, jobId }),
    });

    if (res.ok) {
      const pdfBlob = await res.blob();
      if (pdfBlob.type === "application/pdf") {
        return { blob: pdfBlob, engine: "local_api" };
      }
      clientLog.warn("[compiler] Layer 2 API returned non-PDF response.");
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
      }, 10000);

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
export async function compileAndUploadResume(
  generateUploadUrl: () => Promise<string>,
  options: CompileOptions
): Promise<string> {
  const { blob, engine } = await compileLatexToPdf(options);
  clientLog.info(
    `[compiler] Successful build using engine: ${engine}. Uploading to storage...`
  );

  const uploadUrl = await generateUploadUrl();
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": blob.type || "application/pdf" },
    body: blob,
  });

  if (!response.ok) {
    throw new Error(
      "Failed to upload compiled resume PDF bytes to Convex storage."
    );
  }

  const { storageId } = (await response.json()) as { storageId: string };
  return storageId;
}
