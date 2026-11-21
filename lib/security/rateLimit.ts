// lib/security/rateLimit.ts
//
// Rate Limiting Engine for App Router Endpoints
// - Uses platform headers for trusted client IP extraction
// - Redis-backed sliding window with atomic in-memory fallback
// - Supports failClosed mode for expensive workloads

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Redis } from "@upstash/redis";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

function cleanMemoryStore() {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (record.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}

// Periodically clean up expired entries every 2 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanMemoryStore, 120_000).unref?.();
}

let redisClient: Redis | null = null;
function getRedis(): Redis | null {
  if (redisClient) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redisClient = new Redis({ url, token });
  return redisClient;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

export interface CheckRateLimitOptions {
  failClosed?: boolean;
}

/**
 * Extracts the real client IP from trusted platform-provided headers.
 * Never trusts the first x-forwarded-for entry to prevent header spoofing.
 */
export function getClientIp(req: NextRequest | Headers): string {
  const headers = req instanceof Headers ? req : req.headers;

  // 1. Platform-provided edge headers (injected by Vercel / Cloudflare edge)
  const vercelProxiedFor = headers.get("x-vercel-proxied-for");
  if (vercelProxiedFor?.trim()) return vercelProxiedFor.trim();

  const vercelForwardedFor = headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor?.trim()) return vercelForwardedFor.trim();

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp?.trim()) return cfConnectingIp.trim();

  const realIp = headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();

  // 2. Fall back to the LAST entry in X-Forwarded-For (added by the nearest proxy)
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const parts = xForwardedFor
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      return parts[parts.length - 1]; // Nearest/last hop, not spoofed first hop
    }
  }

  return "127.0.0.1";
}

/**
 * Checks and increments rate limit for a given key.
 * Backed by Redis when configured, with an atomic in-memory fallback.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  options: CheckRateLimitOptions = {}
): Promise<RateLimitResult> {
  const redis = getRedis();

  if (redis) {
    try {
      const redisKey = `rl:${key}`;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.expire(redisKey, windowSeconds);
      }
      const ttl = await redis.ttl(redisKey);
      const remaining = Math.max(0, limit - count);

      return {
        success: count <= limit,
        limit,
        remaining,
        resetInSeconds: ttl > 0 ? ttl : windowSeconds,
      };
    } catch (redisErr) {
      console.warn("[rate-limit] Redis error:", redisErr);
      if (options.failClosed) {
        return {
          success: false,
          limit,
          remaining: 0,
          resetInSeconds: windowSeconds,
        };
      }
    }
  }

  // In-Memory Fallback
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetInSeconds: windowSeconds,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  const resetInSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    success: existing.count <= limit,
    limit,
    remaining,
    resetInSeconds,
  };
}

/**
 * Applies rate limiting to a Next.js App Router request.
 * Resolves user identity from Clerk auth if logged in, otherwise from client IP.
 * Returns a 429 NextResponse if rate limit is exceeded, or null if allowed.
 */
export async function applyRateLimit(
  req: NextRequest,
  endpoint: string,
  limit: number,
  windowSeconds: number,
  options: CheckRateLimitOptions = {}
): Promise<NextResponse | null> {
  let identifier: string = "anon";

  try {
    const authSession = await auth();
    if (authSession?.userId) {
      identifier = `user:${authSession.userId}`;
    }
  } catch {
    // Unauthenticated or auth check failed
  }

  if (identifier === "anon") {
    const ip = getClientIp(req);
    identifier = `ip:${ip}`;
  }

  const rateKey = `${endpoint}:${identifier}`;
  const result = await checkRateLimit(rateKey, limit, windowSeconds, options);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Too many requests, please slow down.",
        limit: result.limit,
        resetInSeconds: result.resetInSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.resetInSeconds),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetInSeconds),
        },
      }
    );
  }

  return null;
}
