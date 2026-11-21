import { describe, it, expect, beforeEach } from "vitest";

// Mock user state and optimizations database for billing verification
interface MockUser {
  id: string;
  plan: string;
  freeOptimizationsUsed: number;
  credits?: number;
  passExpiresAt?: number;
}

interface MockOptimization {
  id: string;
  userId: string;
  runId: string;
  status: "queued" | "processing" | "completed" | "failed";
  billed: boolean;
  billedRunId?: string;
  billedAt?: number;
  createdAt: number;
}

class MockBillingEngine {
  users: Map<string, MockUser> = new Map();
  optimizations: Map<string, MockOptimization> = new Map();

  addUser(user: MockUser) {
    this.users.set(user.id, { ...user });
  }

  // Pre-check and start run (server-side generation of runId, in-flight accounting without auto-expiration)
  createOptimization(
    userId: string,
    optId: string,
    status: "queued" | "processing" = "processing",
    createdAt: number = Date.now()
  ): { id: string; runId: string } {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const isPaid =
      user.plan === "pro" ||
      user.plan === "power" ||
      user.plan === "team" ||
      user.plan === "campus" ||
      (user.plan === "pro_pass" && (!user.passExpiresAt || user.passExpiresAt > now));

    // Count all in-flight runs (status is "queued" or "processing" and not billed)
    // Note: A run counts against the allowance until settled as failed.
    let inFlightCount = 0;
    for (const opt of this.optimizations.values()) {
      if (
        opt.userId === userId &&
        (opt.status === "queued" || opt.status === "processing") &&
        !opt.billed
      ) {
        inFlightCount++;
      }
    }

    if (!isPaid) {
      const used = user.freeOptimizationsUsed ?? 0;
      if (used + inFlightCount >= 2) {
        throw new Error("NO_FREE_CREDITS_REMAINING: Allowance reached including in-flight optimizations.");
      }
    } else {
      const isUnlimited =
        user.plan === "pro" ||
        user.plan === "power" ||
        user.plan === "campus" ||
        (user.plan === "pro_pass" && (!user.passExpiresAt || user.passExpiresAt > now));

      if (!isUnlimited) {
        const availableCredits = user.credits ?? 0;
        const inFlightCredits = inFlightCount * 500;
        if (availableCredits - inFlightCredits < 500) {
          throw new Error("INSUFFICIENT_CREDITS: Credit allowance reached including in-flight optimizations.");
        }
      }
    }

    const runId = `server_run_${Math.random().toString(36).substring(7)}`;
    const opt: MockOptimization = {
      id: optId,
      userId,
      runId,
      status,
      billed: false,
      createdAt,
    };
    this.optimizations.set(optId, opt);
    return { id: optId, runId };
  }

  // Internal mutation: server-only settlement
  internalSettleBilling(
    userId: string,
    optId: string,
    runId: string,
    status: "completed" | "failed",
    isClientCall: boolean = false
  ): { billed: boolean; alreadyBilled: boolean } {
    if (isClientCall) {
      throw new Error("FORBIDDEN: Client cannot invoke internal billing settlement.");
    }

    const user = this.users.get(userId);
    const opt = this.optimizations.get(optId);
    if (!user || !opt) throw new Error("Not found");

    // Idempotency: already billed with this runId or marked billed
    if (opt.billed || opt.billedRunId === runId) {
      return { billed: false, alreadyBilled: true };
    }

    if (status === "failed") {
      opt.status = "failed";
      return { billed: false, alreadyBilled: false };
    }

    // Success: bill
    const isPaid =
      user.plan === "pro" ||
      user.plan === "power" ||
      user.plan === "team" ||
      user.plan === "campus";

    if (!isPaid) {
      if (user.freeOptimizationsUsed >= 2) {
        throw new Error("QUOTA_EXCEEDED");
      }
      user.freeOptimizationsUsed += 1;
    } else if (user.credits !== undefined) {
      user.credits = Math.max(0, user.credits - 500);
    }

    opt.status = "completed";
    opt.billed = true;
    opt.billedRunId = runId;
    opt.billedAt = Date.now();

    return { billed: true, alreadyBilled: false };
  }

  // Scheduled cron: fail runs stuck in queued/processing for > 15 minutes
  cleanupStuckOptimizations(): { cleanedCount: number } {
    const now = Date.now();
    const fifteenMinutesAgo = now - 15 * 60 * 1000;
    let cleanedCount = 0;

    for (const opt of this.optimizations.values()) {
      if (
        (opt.status === "queued" || opt.status === "processing") &&
        opt.createdAt < fifteenMinutesAgo
      ) {
        opt.status = "failed";
        cleanedCount++;
      }
    }
    return { cleanedCount };
  }
}

describe("Server-Side Billing & In-Flight Quota Hardening", () => {
  let engine: MockBillingEngine;

  beforeEach(() => {
    engine = new MockBillingEngine();
    engine.addUser({
      id: "user_free",
      plan: "free",
      freeOptimizationsUsed: 0,
    });
    engine.addUser({
      id: "user_credits",
      plan: "team",
      freeOptimizationsUsed: 0,
      credits: 1000,
    });
  });

  it("the client cannot settle (internal mutation protection)", () => {
    const opt = engine.createOptimization("user_free", "opt_1");
    expect(() =>
      engine.internalSettleBilling("user_free", opt.id, opt.runId, "completed", true /* isClientCall */)
    ).toThrow("Client cannot invoke internal billing settlement");
  });

  it("completion bills once", () => {
    const opt = engine.createOptimization("user_free", "opt_1");
    const result = engine.internalSettleBilling("user_free", opt.id, opt.runId, "completed", false);

    expect(result.billed).toBe(true);
    expect(result.alreadyBilled).toBe(false);
    expect(engine.users.get("user_free")?.freeOptimizationsUsed).toBe(1);
  });

  it("a retry of the same run does not bill twice (idempotency)", () => {
    const opt = engine.createOptimization("user_free", "opt_1");
    // First settlement
    const first = engine.internalSettleBilling("user_free", opt.id, opt.runId, "completed", false);
    expect(first.billed).toBe(true);
    expect(engine.users.get("user_free")?.freeOptimizationsUsed).toBe(1);

    // Duplicate retry call with same runId
    const retry = engine.internalSettleBilling("user_free", opt.id, opt.runId, "completed", false);
    expect(retry.alreadyBilled).toBe(true);
    expect(retry.billed).toBe(false);
    expect(engine.users.get("user_free")?.freeOptimizationsUsed).toBe(1);
  });

  it("failure does not bill", () => {
    const opt = engine.createOptimization("user_free", "opt_fail");
    const result = engine.internalSettleBilling("user_free", opt.id, opt.runId, "failed", false);

    expect(result.billed).toBe(false);
    expect(engine.users.get("user_free")?.freeOptimizationsUsed).toBe(0);
    expect(engine.optimizations.get(opt.id)?.status).toBe("failed");
  });

  it("a stuck run is failed by the scheduled job and not billed", () => {
    const sixteenMinutesAgo = Date.now() - 16 * 60 * 1000;
    // Create an optimization that was started 16 minutes ago
    const stuckOpt = engine.createOptimization("user_free", "opt_stuck", "processing", sixteenMinutesAgo);

    // Run scheduled cleanup
    const cleanupResult = engine.cleanupStuckOptimizations();
    expect(cleanupResult.cleanedCount).toBe(1);

    const record = engine.optimizations.get(stuckOpt.id);
    expect(record?.status).toBe("failed");
    expect(record?.billed).toBe(false);
    expect(engine.users.get("user_free")?.freeOptimizationsUsed).toBe(0);

    // After failure cleanup, user can now submit another run within allowance
    const nextOpt = engine.createOptimization("user_free", "opt_next");
    expect(nextOpt.id).toBe("opt_next");
  });

  it("parallel submissions cannot exceed the allowance (free tier: 2 max)", () => {
    const results: string[] = [];
    const errors: string[] = [];

    for (let i = 1; i <= 5; i++) {
      try {
        const opt = engine.createOptimization("user_free", `opt_parallel_${i}`, "processing");
        results.push(opt.id);
      } catch (err: any) {
        errors.push(err.message);
      }
    }

    // Exactly 2 admitted, 3 rejected
    expect(results.length).toBe(2);
    expect(errors.length).toBe(3);
    expect(errors[0]).toContain("Allowance reached including in-flight optimizations");
  });

  it("in-flight accounting applies to paid-credit users as well", () => {
    // user_credits has 1000 credits (allows 2 runs at 500 credits each)
    const opt1 = engine.createOptimization("user_credits", "credit_opt_1");
    const opt2 = engine.createOptimization("user_credits", "credit_opt_2");
    expect(opt1.id).toBe("credit_opt_1");
    expect(opt2.id).toBe("credit_opt_2");

    // Third concurrent run must be rejected
    expect(() =>
      engine.createOptimization("user_credits", "credit_opt_3")
    ).toThrow("Credit allowance reached including in-flight optimizations");
  });
});
