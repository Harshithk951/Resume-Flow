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
