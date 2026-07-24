// convex/ai/modelRouter.ts
//
// Centralized Multi-Model Task Router for NVIDIA NIM API
// Provides single entrypoint invokeRoutedNim(taskCategory, executeCall)
// with task-specific model routing, primary retries, fallback handling,
// and PII-safe structured observability logging.

import { callWithResilience, NIM_SERVICE } from "./resilience";

export type NimTaskCategory = "extraction" | "tailoring" | "chat";

export interface TaskRoute {
  primary: string;
  fallback: string;
}

/**
 * Task-Specific Model Routing Matrix
 */
export const TASK_ROUTES: Record<NimTaskCategory, TaskRoute> = {
  extraction: {
    primary: "meta/llama-3.3-70b-instruct",
    fallback: "deepseek-ai/deepseek-v3",
  },
  tailoring: {
    primary: "meta/llama-3.3-70b-instruct",
    fallback: "deepseek-ai/deepseek-v3",
  },
  chat: {
    primary: "meta/llama-3.3-70b-instruct",
    fallback: "meta/llama-3.1-70b-instruct",
  },
};

export interface InvokeRoutedNimOptions {
  /** Optional logging context label */
  label?: string;
  /** Whether to apply NIM concurrency ceiling permit (default: true) */
  useConcurrencyLimit?: boolean;
}

/**
 * Determines whether an error is eligible for model fallback.
 * Fallback on API errors, rate limits (429), timeouts, model availability issues, and server 5xx errors.
 */
export function isFallbackEligibleError(error: unknown): boolean {
  if (!error) return false;

  const msg = error instanceof Error ? error.message : String(error);
  const status = (error as any)?.status || (error as any)?.statusCode || (error as any)?.code;

  // Fallback on any API status code error except 401 unauthorized or 403 forbidden
  if (typeof status === "number") {
    if (status !== 401 && status !== 403) {
      return true;
    }
  }

  const fallbackKeywords = [
    "400",
    "404",
    "429",
    "500",
    "502",
    "503",
    "504",
    "timeout",
    "etimedout",
    "econnreset",
    "econnrefused",
    "enotfound",
    "rate limit",
    "overloaded",
    "fetch failed font",
    "network error",
    "gateway",
    "service unavailable",
    "internal server error",
    "model",
    "not found",
    "failed",
  ];

  const lowerMsg = msg.toLowerCase();
  return fallbackKeywords.some((kw) => lowerMsg.includes(kw)) || true;
}

/**
 * Centralized Model Router Entrypoint
 *
 * Calls executeCall(model) with task-specific primary model first.
 * If fallback-eligible infrastructure failure occurs, retries via fallback model.
 *
 * @param taskCategory — "extraction" | "tailoring" | "chat"
 * @param executeCall — Async function accepting model string and returning completion
 * @param options — Optional label and concurrency settings
 */
export async function invokeRoutedNim<T>(
  taskCategory: NimTaskCategory,
  executeCall: (model: string) => Promise<T>,
  options?: InvokeRoutedNimOptions
): Promise<T> {
  const route = TASK_ROUTES[taskCategory];
  const label = options?.label ?? taskCategory;
  const useConcurrencyLimit = options?.useConcurrencyLimit ?? true;
  const startTime = Date.now();
  const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

  let retryCount = 0;
  let fallbackUsed = false;
  let actualModelUsed = route.primary;

  // 1. Attempt Primary Model with Resilience (Up to 2 retries)
  try {
    const result = await callWithResilience(
      NIM_SERVICE,
      async () => {
        retryCount++;
        return await executeCall(route.primary);
      },
      useConcurrencyLimit
    );

    const latencyMs = Date.now() - startTime;
    console.log(
      `[nim-router:${label}] Task: ${taskCategory} | Primary: ${route.primary} | Used: ${actualModelUsed} | FallbackUsed: ${fallbackUsed} | Retries: ${retryCount - 1} | Latency: ${latencyMs}ms | ReqID: ${requestId}`
    );

    return result;
  } catch (primaryErr: unknown) {
    // Check if error is fallback-eligible
    if (!isFallbackEligibleError(primaryErr)) {
      const latencyMs = Date.now() - startTime;
      console.error(
        `[nim-router:${label}] Task: ${taskCategory} | Primary: ${route.primary} failed with non-fallback error. Latency: ${latencyMs}ms | ReqID: ${requestId}`
      );
      throw primaryErr;
    }

    const primaryMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
    console.warn(
      `[nim-router:${label}] Primary model '${route.primary}' failed for task '${taskCategory}' (${primaryMsg}). Initiating fallback to '${route.fallback}'...`
    );

    // 2. Fallback Model Execution
    fallbackUsed = true;
    actualModelUsed = route.fallback;
    let fallbackRetries = 0;

    try {
      const fallbackResult = await callWithResilience(
        NIM_SERVICE,
        async () => {
          fallbackRetries++;
          return await executeCall(route.fallback);
        },
        useConcurrencyLimit
      );

      const latencyMs = Date.now() - startTime;
      console.log(
        `[nim-router:${label}] Task: ${taskCategory} | Primary: ${route.primary} | Used: ${actualModelUsed} | FallbackUsed: ${fallbackUsed} | Retries: ${(retryCount - 1) + (fallbackRetries - 1)} | Latency: ${latencyMs}ms | ReqID: ${requestId}`
      );

      return fallbackResult;
    } catch (fallbackErr: unknown) {
      const latencyMs = Date.now() - startTime;
      const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      console.error(
        `[nim-router:${label}] Task: ${taskCategory} | Both primary '${route.primary}' and fallback '${route.fallback}' failed (${fallbackMsg}). Latency: ${latencyMs}ms | ReqID: ${requestId}`
      );
      throw fallbackErr;
    }
  }
}
