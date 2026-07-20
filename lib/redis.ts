import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.warn(
      "[redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured — distributed locks disabled."
    );
    return null;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

/**
 * Acquires a distributed compilation lock for a specific job ID.
 * Uses Redis SET with NX (set if not exists) and EX (expiration) to prevent deadlocks.
 * Returns true when Redis is unavailable so local compilation is not blocked in dev.
 */
export async function acquireCompileLock(jobId: string, ttlSec = 90): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return true;

  try {
    const key = `compile:lock:${jobId}`;
    const result = await redis.set(key, "1", { nx: true, ex: ttlSec });
    return result === "OK";
  } catch (error) {
    console.error(`[redis-lock] Failed to acquire lock for job ${jobId}:`, error);
    return false;
  }
}

/**
 * Releases the distributed compilation lock for a specific job ID.
 */
export async function releaseCompileLock(jobId: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const key = `compile:lock:${jobId}`;
    await redis.del(key);
  } catch (error) {
    console.error(`[redis-lock] Failed to release lock for job ${jobId}:`, error);
  }
}

// ─── Compile Output Caching ───────────────────────────────────
// Caches compiled PDF storage IDs by LaTeX snapshot hash.
// During placement drives, many students targeting the same company
// generate nearly identical LaTeX — this cache eliminates redundant
// pdflatex invocations.

/**
 * Computes a SHA-256 hex hash of the LaTeX source.
 * Works in both Node.js and browser environments.
 */
export function hashLatexSource(latexCode: string): string {
  if (typeof window === "undefined") {
    // Node.js: use crypto module
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(latexCode, "utf-8").digest("hex");
  }
  // Browser: use Web Crypto API (async, but caller handles)
  // This path is only used from the frontend compiler
  throw new Error("Use hashLatexSourceBrowser in browser context");
}

export async function hashLatexSourceBrowser(latexCode: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(latexCode);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Gets a cached compile result by LaTeX hash.
 * Returns the Convex storage ID if found, null otherwise.
 */
export async function getCompileCache(
  latexHash: string
): Promise<string | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    return await redis.get<string>(`compile:cache:${latexHash}`);
  } catch (error) {
    console.error(`[compile-cache] Failed to read cache for hash ${latexHash}:`, error);
    return null;
  }
}

/**
 * Stores a compile result in the cache.
 * TTL defaults to 7 days — placement drives rarely span longer.
 */
export async function setCompileCache(
  latexHash: string,
  storageId: string,
  ttlSec = 604800
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.set(`compile:cache:${latexHash}`, storageId, { ex: ttlSec });
  } catch (error) {
    console.error(`[compile-cache] Failed to write cache for hash ${latexHash}:`, error);
  }
}
