// convex/ai/resilience.ts
//
// Shared Resilience Utilities for Convex Actions
//
// Provides:
// 1. CircuitBreaker — Redis-backed state machine (CLOSED / OPEN / HALF-OPEN)
//    shared across all Convex action invocations.
// 2. withRetry — wraps any async function with exponential backoff + jitter
//    (max 3 attempts).
// 3. NimConcurrencyLimiter — Redis-based distributed semaphore to enforce
//    a ceiling on outbound NIM calls matching the free-tier rate limit.
//
// All helpers use raw fetch to Upstash Redis REST API (no @upstash/redis
// dependency needed in the Convex action sandbox).

// ─── Redis REST helpers ───────────────────────────────────────

async function redisGet(key: string): Promise<string | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["GET", key]),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: string | null };
    return data.result ?? null;
  } catch {
    return null;
  }
}

async function redisSet(key: string, value: string, ttlSec: number): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["SET", key, value, "EX", ttlSec.toString()]),
    });
  } catch { /* non-fatal */ }
}

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
  } catch {
    return null;
  }
}

async function redisDecr(key: string): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["DECR", key]),
    });
  } catch { /* non-fatal */ }
}

// ─── Constants ────────────────────────────────────────────────

/** How many consecutive failures trip the breaker */
const CB_THRESHOLD = 10;

/** How long the breaker stays OPEN (ms) before transitioning to HALF-OPEN */
const CB_COOLDOWN_MS = 5_000; // 5 seconds auto-recovery

/** Max retry attempts for withRetry */
const MAX_RETRIES = 2;

/** Max concurrent NIM calls */
const NIM_MAX_CONCURRENCY = 15;

/** Redis key prefix for NIM semaphore */
const SEM_NIM_KEY = "sem:nim";

/** Semaphore lease TTL (seconds) — long enough for a single NIM call */
const SEM_LEASE_SEC = 30;

// ─── 1. Circuit Breaker ──────────────────────────────────────

export interface CircuitBreakerConfig {
  /** Redis key storing the state blob */
  stateKey: string;
  /** Failure threshold before tripping */
  threshold?: number;
  /** Cooldown in ms before half-open */
  cooldownMs?: number;
  /** Label for logging */
  label: string;
}

interface CBState {
  state: "CLOSED" | "OPEN";
  failures: number;
  openedAt: number | null;
}

/**
 * Checks whether the circuit breaker allows a call to proceed.
 * If the circuit is OPEN and the cooldown has expired, it
 * automatically transitions to HALF-OPEN (one trial request).
 *
 * Returns an object with:
 *   - allowed: whether the call should proceed
 *   - reason: if not allowed, a human-readable reason
 */
export async function checkCircuit(
  config: CircuitBreakerConfig
): Promise<{ allowed: boolean; reason?: string }> {
  const cooldownMs = config.cooldownMs ?? CB_COOLDOWN_MS;

  const raw = await redisGet(config.stateKey);
  if (!raw) {
    // No state = CLOSED by default
    return { allowed: true };
  }

  let state: CBState;
  try {
    state = JSON.parse(raw);
  } catch {
    return { allowed: true };
  }

  if (state.state === "CLOSED") {
    return { allowed: true };
  }

  // OPEN — check if cooldown has expired
  if (state.openedAt && Date.now() - state.openedAt >= cooldownMs) {
    // Cooldown expired — transition to HALF-OPEN (let one request through)
    // We don't update Redis here because we'd need a CAS pattern.
    // Instead, the caller should record the result and we handle HALF-OPEN
    // by letting the request through but recording the outcome.
    console.log(`[cb:${config.label}] Cooldown expired — allowing trial request (HALF-OPEN)`);
    return { allowed: true };
  }

  const remainingMs = state.openedAt ? cooldownMs - (Date.now() - state.openedAt) : cooldownMs;
  return {
    allowed: false,
    reason: `${config.label} circuit breaker OPEN — failing fast. Cooldown remaining: ~${Math.ceil(remainingMs / 1000)}s`,
  };
}

/**
 * Records a SUCCESS on the circuit breaker.
 * Resets the failure count and transitions back to CLOSED.
 */
export async function recordSuccess(config: CircuitBreakerConfig): Promise<void> {
  const state: CBState = { state: "CLOSED", failures: 0, openedAt: null };
  await redisSet(config.stateKey, JSON.stringify(state), 300); // 5 min TTL
}

/**
 * Records a FAILURE on the circuit breaker.
 * Increments the failure count. If threshold exceeded, trips to OPEN.
 */
export async function recordFailure(config: CircuitBreakerConfig): Promise<void> {
  const threshold = config.threshold ?? CB_THRESHOLD;

  const raw = await redisGet(config.stateKey);
  let state: CBState;
  if (raw) {
    try {
      state = JSON.parse(raw);
    } catch {
      state = { state: "CLOSED", failures: 0, openedAt: null };
    }
  } else {
    state = { state: "CLOSED", failures: 0, openedAt: null };
  }

  state.failures += 1;

  if (state.failures >= threshold) {
    state.state = "OPEN";
    state.openedAt = Date.now();
    console.error(`[cb:${config.label}] Circuit TRIPPED after ${state.failures} consecutive failures.` +
      ` Cooldown: ${(config.cooldownMs ?? CB_COOLDOWN_MS) / 1000}s`);
    // Longer TTL for OPEN state so it persists across the cooldown
    await redisSet(config.stateKey, JSON.stringify(state), 600); // 10 min TTL
  } else {
    console.warn(`[cb:${config.label}] ${state.failures}/${threshold} failures recorded.`);
    await redisSet(config.stateKey, JSON.stringify(state), 300);
  }
}

// ─── 2. Retry with Exponential Backoff + Jitter ──────────────

/**
 * Wraps an async operation with retry logic.
 * Uses exponential backoff with full jitter.
 *
 * @param fn — Async function to retry
 * @param label — Label for logging
 * @param maxRetries — Max retry attempts (default: 3)
 * @returns The result of the successful invocation
 * @throws The last error if all retries are exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;

      if (attempt < maxRetries) {
        // Exponential backoff: base 500ms with jitter
        const baseDelayMs = 500 * Math.pow(2, attempt - 1); // 500ms, 1000ms
        const jitterMs = Math.random() * baseDelayMs;
        const delayMs = baseDelayMs + jitterMs;

        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[retry:${label}] Attempt ${attempt}/${maxRetries} failed: ${message}.` +
          ` Retrying in ${Math.round(delayMs)}ms...`);

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[retry:${label}] All ${maxRetries} attempts exhausted. Last error: ${message}`);
      }
    }
  }

  throw lastError;
}

// ─── 3. NIM Concurrency Ceiling (Distributed Semaphore) ──────

/**
 * Acquires a NIM concurrency permit from the distributed semaphore.
 * Uses Redis INCR to atomically increment a counter. If the counter
 * exceeds the max, we DECR and retry after a short wait.
 *
 * TTL-based lease ensures stale permits auto-expire if the action
 * crashes mid-flight.
 *
 * When Redis is unavailable (dev), permit is auto-granted.
 */
export async function acquireNimPermit(timeoutMs = 10_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  const countKey = SEM_NIM_KEY;

  while (Date.now() < deadline) {
    const newCount = await redisIncr(countKey);
    // Redis unavailable — grant permit (dev mode bypass)
    if (newCount === null) return true;

    if (newCount <= NIM_MAX_CONCURRENCY) {
      // Permit acquired — set TTL for auto-cleanup on crash
      await redisSet(countKey, String(newCount), SEM_LEASE_SEC);
      return true;
    }

    // Over limit — decrement and retry
    await redisDecr(countKey);
    await new Promise((r) => setTimeout(r, 100 + Math.random() * 100)); // faster jittered wait
  }

  console.warn(`[nim-sem] Timed out after ${timeoutMs}ms waiting for NIM permit.`);
  return false;
}

/**
 * Releases a NIM concurrency permit.
 */
export async function releaseNimPermit(): Promise<void> {
  await redisDecr(SEM_NIM_KEY);
}

// ─── 4. Unified NIM/Tavily Resilient Call Wrapper ────────────

export type ExternalServiceConfig = {
  /** Circuit breaker state key in Redis */
  circuitKey: string;
  /** Label for logging */
  label: string;
};

/**
 * Calls an external service (NIM or Tavily) with full resilience:
 * 1. Check circuit breaker
 * 2. Acquire concurrency permit (NIM only)
 * 3. Retry with backoff + jitter
 * 4. Record success/failure on circuit breaker
 * 5. Release concurrency permit
 *
 * @param service — Service config (circuit key, label)
 * @param userId — User ID for concurrency tracking
 * @param fn — The actual API call function
 * @param useConcurrencyLimit — Whether to apply NIM concurrency ceiling
 */
export async function callWithResilience<T>(
  service: ExternalServiceConfig,
  fn: () => Promise<T>,
  useConcurrencyLimit = false
): Promise<T> {
  // Step 1: Check circuit breaker
  const cb = await checkCircuit({
    stateKey: service.circuitKey,
    label: service.label,
  });
  if (!cb.allowed) {
    throw new Error(cb.reason ?? `${service.label} is unavailable`);
  }

  let permitAcquired = false;

  // Step 2: Acquire concurrency permit (for NIM calls)
  if (useConcurrencyLimit) {
    permitAcquired = await acquireNimPermit();
  }

  try {
    // Step 3: Call with retry
    const result = await withRetry(fn, service.label);

    // Step 4: Record success (resets failure count)
    await recordSuccess({ stateKey: service.circuitKey, label: service.label });
    return result;
  } catch (err: unknown) {
    // Step 4: Record failure (may trip breaker)
    await recordFailure({ stateKey: service.circuitKey, label: service.label });
    throw err;
  } finally {
    // Step 5: Release concurrency permit
    if (permitAcquired) {
      await releaseNimPermit();
    }
  }
}

// ─── 5. Pre-configured Service Configs ───────────────────────

export const NIM_SERVICE: ExternalServiceConfig = {
  circuitKey: "cb:nim",
  label: "nim",
};

export const TAVILY_SERVICE: ExternalServiceConfig = {
  circuitKey: "cb:tavily",
  label: "tavily",
};
