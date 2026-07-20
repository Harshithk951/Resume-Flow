// lib/tracing.ts
//
// Structured Logging & Observability Utilities
//
// Provides:
//   1. StructuredLogger — Writes consistent JSON-format logs with job IDs
//      that can be grepped and traced across the entire pipeline.
//   2. MetricsTracker — Redis-backed counters for operational metrics
//      (queue depth, compile duration, NIM latency, cache hit ratio,
//       rate-limit rejections).
//   3. Sentry wrapper for Convex actions — captures errors with job context.
//
// All Redis helpers use raw fetch (compatible with Convex action sandbox).

// ─── Redis REST helpers (raw fetch, no @upstash/redis dependency) ───

async function redisIncr(key: string): Promise<number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["INCR", key]),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: number };
    return data.result ?? null;
  } catch { return null; }
}

async function redisIncrBy(key: string, amount: number): Promise<number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["INCRBY", key, amount]),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: number };
    return data.result ?? null;
  } catch { return null; }
}

// ─── 1. Structured Logger ────────────────────────────────────

export type TraceContext = {
  /** Unique ID for this pipeline execution — traces a single job end-to-end */
  traceId: string;
  /** Job ID in Convex */
  jobId?: string;
  /** Current pipeline layer (e.g. "extract", "research", "tailor", "compile") */
  layer?: string;
  /** Company name (for human-readable tracing) */
  company?: string;
  /** Additional key-value metadata */
  [key: string]: unknown;
};

/**
 * Structured logger that writes consistent JSON log lines with trace context.
 *
 * Every log line is prefixed with [trace:<traceId>] for easy grepping.
 * In production, log lines are JSON. In dev, they're human-readable.
 *
 * Usage:
 *   const log = createLogger({ traceId, jobId, company: "Google" });
 *   log.info("Starting NIM extraction", { model: "llama-3.1-70b" });
 *   log.error("NIM request failed", { statusCode: 429 });
 */
export function createLogger(ctx: TraceContext): {
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  child: (overrides: Partial<TraceContext>) => ReturnType<typeof createLogger>;
  getContext: () => TraceContext;
} {
  const isDev = process.env.NODE_ENV === "development";

  function formatLog(
    level: "INFO" | "WARN" | "ERROR",
    message: string,
    meta?: Record<string, unknown>,
  ) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      traceId: ctx.traceId,
      jobId: ctx.jobId,
      layer: ctx.layer,
      company: ctx.company,
      ...meta,
    };

    if (isDev) {
      const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
      return `[${level}] [trace:${ctx.traceId.substring(0, 8)}]${ctx.layer ? ` [${ctx.layer}]` : ""} ${message}${metaStr}`;
    }

    return JSON.stringify(entry);
  }

  return {
    info: (message: string, meta?: Record<string, unknown>) => {
      console.log(formatLog("INFO", message, meta));
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
      console.warn(formatLog("WARN", message, meta));
    },
    error: (message: string, meta?: Record<string, unknown>) => {
      console.error(formatLog("ERROR", message, meta));
    },
    /** Returns a child logger with an additional layer context */
    child: (overrides: Partial<TraceContext>): ReturnType<typeof createLogger> => {
      return createLogger({ ...ctx, ...overrides });
    },
    /** Returns the current trace context for passing through */
    getContext: (): TraceContext => ctx,
  };
}

export type StructuredLogger = ReturnType<typeof createLogger>;

// ─── 2. Metrics Tracker ──────────────────────────────────────

/** Metric key constants — namespaced under "metrics:" in Redis */
export const METRICS = {
  /** Total compile jobs enqueued */
  COMPILE_ENQUEUED: "metrics:compile:enqueued",
  /** Compile jobs completed successfully */
  COMPILE_COMPLETED: "metrics:compile:completed",
  /** Compile jobs that failed */
  COMPILE_FAILED: "metrics:compile:failed",
  /** Current queue depth (when using QStash, this is approximate) */
  COMPILE_QUEUE_DEPTH: "metrics:compile:queue_depth",
  /** Cumulative compile duration in ms (used with count to compute avg) */
  COMPILE_DURATION_SUM: "metrics:compile:duration_sum",
  /** Number of compile jobs that contributed to duration_sum */
  COMPILE_DURATION_COUNT: "metrics:compile:duration_count",

  /** NIM API calls made */
  NIM_CALLS: "metrics:nim:calls",
  /** NIM API calls that failed */
  NIM_FAILURES: "metrics:nim:failures",
  /** Cumulative NIM latency in ms */
  NIM_LATENCY_SUM: "metrics:nim:latency_sum",

  /** Tavily API calls made */
  TAVILY_CALLS: "metrics:tavily:calls",

  /** Cache hits for JD analysis hash */
  JD_CACHE_HITS: "metrics:cache:jd:hits",
  /** Cache misses for JD analysis hash */
  JD_CACHE_MISSES: "metrics:cache:jd:misses",
  /** Cache hits for Tavily company research */
  TAVILY_CACHE_HITS: "metrics:cache:tavily:hits",
  /** Cache hits for compile output */
  COMPILE_CACHE_HITS: "metrics:cache:compile:hits",

  /** Rate-limit rejections (per-minute, auto-resets) */
  RATE_LIMIT_REJECTIONS: "metrics:ratelimit:rejections",

  // ────────────────────────────────────────────────────────────
  // Free-Tier Usage Cap Tracking (Phase 6)
  // These track cumulative usage that can be compared against
  // known free-tier limits to catch caps before they're hit.
  // ────────────────────────────────────────────────────────────

  /** Convex: total function calls (estimate via action call counter) */
  CONVEX_FUNCTION_CALLS: "metrics:usage:convex:function_calls",
  /** Convex: approximation of data read from queries */
  CONVEX_DATA_READ_BYTES: "metrics:usage:convex:data_read_bytes",
  /** Convex: storage usage in bytes (updated after uploads) */
  CONVEX_STORAGE_BYTES: "metrics:usage:convex:storage_bytes",

  /** Vercel: serverless function invocations */
  VERCEL_FUNCTION_INVOCATIONS: "metrics:usage:vercel:function_invocations",
  /** Vercel: approximate bandwidth in bytes (response sizes) */
  VERCEL_BANDWIDTH_BYTES: "metrics:usage:vercel:bandwidth_bytes",
  /** Vercel: build minutes consumed (updated on deploy) */
  VERCEL_BUILD_MINUTES: "metrics:usage:vercel:build_minutes",

  /** Upstash Redis: commands executed */
  UPSTASH_COMMANDS: "metrics:usage:upstash:commands",
  /** Upstash Redis: approximate memory used */
  UPSTASH_MEMORY_BYTES: "metrics:usage:upstash:memory_bytes",
} as const;

/**
 * Increments a numeric metric counter.
 * Best-effort — failures are silently ignored.
 */
export async function incrementMetric(key: string, by = 1): Promise<void> {
  await redisIncrBy(key, by);
}

/**
 * Records a duration value for averaging.
 * Stores both sum and count in separate keys.
 * Uses INCRBY for single-roundtrip atomic increment.
 */
export async function recordDuration(baseKey: string, durationMs: number): Promise<void> {
  const sumKey = `${baseKey}_sum`;
  const countKey = `${baseKey}_count`;
  await redisIncr(countKey);
  await redisIncrBy(sumKey, Math.round(durationMs));
}

// ─── 3. Sentry Wrapper for Convex Actions ────────────────────

/**
 * Wraps an error with job context for Sentry capture.
 * Uses Sentry SDK if available, otherwise falls back to console.
 *
 * In Convex actions, Sentry may not be available, so this is a
 * best-effort wrapper that augments the error with trace context.
 */
export function captureError(
  error: unknown,
  context: TraceContext,
  extra?: Record<string, unknown>,
): void {
  const message = error instanceof Error ? error.message : String(error);
  const tag = `[ERROR] [trace:${(context.traceId || "?").substring(0, 8)}]`;

  if (typeof process !== "undefined" && process.env.SENTRY_DSN) {
    try {
      // Dynamic require to avoid breaking when Sentry isn't installed
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require("@sentry/node");
      Sentry.withScope((scope: any) => {
        scope.setTag("trace_id", context.traceId);
        scope.setTag("job_id", context.jobId);
        scope.setTag("layer", context.layer);
        scope.setExtra("context", context);
        if (extra) scope.setExtra("extra", extra);
        Sentry.captureException(error);
      });
    } catch {
      console.error(`${tag} ${message}`, extra ?? ""); // Fall back to console
    }
  } else {
    console.error(`${tag} ${message}`, extra ?? "");
  }
}

/**
 * Generates a short unique trace ID for a pipeline execution.
 * Format: "ts_<timestamp>_<random>"
 */
export function generateTraceId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `ts_${ts}_${rand}`;
}
