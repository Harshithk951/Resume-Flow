import { describe, it, expect, beforeEach } from "vitest";

// Mock user state and optimizations database for billing verification
interface MockUser {
  id: string;
  plan: string;
  freeOptimizationsUsed: number;
  passExpiresAt?: number;
}

interface MockOptimization {
  id: string;
  userId: string;
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

  // Pre-check and start run
  createOptimization(userId: string, optId: string, status: "queued" | "processing" = "processing"): { id: string } {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const isPaid =
      user.plan === "pro" ||
      user.plan === "power" ||
      user.plan === "team" ||
      user.plan === "campus" ||
      (user.plan === "pro_pass" && (!user.passExpiresAt || user.passExpiresAt > now));

    if (!isPaid) {
      const used = user.freeOptimizationsUsed ?? 0;
      const fifteenMinutesAgo = now - 15 * 60 * 1000;

      // Count in-flight
      let inFlightCount = 0;
      for (const opt of this.optimizations.values()) {
        if (
          opt.userId === userId &&
          (opt.status === "queued" || opt.status === "processing") &&
          opt.createdAt > fifteenMinutesAgo
        ) {
          inFlightCount++;
        }
      }

      if (used + inFlightCount >= 2) {
        throw new Error("NO_FREE_CREDITS_REMAINING: Allowance reached including in-flight optimizations.");
      }
    }

    const opt: MockOptimization = {
      id: optId,
      userId,
      status,
      billed: false,
      createdAt: now,
    };
    this.optimizations.set(optId, opt);
    return { id: optId };
  }

  // Settle billing
  settleBilling(userId: string, optId: string, runId: string, status: "completed" | "failed"): { billed: boolean; alreadyBilled: boolean } {
    const user = this.users.get(userId);
    const opt = this.optimizations.get(optId);
    if (!user || !opt) throw new Error("Not found");

    // Idempotency: already billed
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
    }

    opt.status = "completed";
    opt.billed = true;
    opt.billedRunId = runId;
    opt.billedAt = Date.now();

    return { billed: true, alreadyBilled: false };
  }
}

describe("Billing & Quota Hardening", () => {
  let engine: MockBillingEngine;

  beforeEach(() => {
    engine = new MockBillingEngine();
    engine.addUser({
      id: "user_free",
      plan: "free",
      freeOptimizationsUsed: 0,
    });
  });

  it("success bills once", () => {
    const opt = engine.createOptimization("user_free", "opt_1");
    const result = engine.settleBilling("user_free", opt.id, "run_abc", "completed");

    expect(result.billed).toBe(true);
    expect(result.alreadyBilled).toBe(false);
    expect(engine.users.get("user_free")?.freeOptimizationsUsed).toBe(1);
  });

  it("retry with same runId does not bill twice (idempotency)", () => {
    const opt = engine.createOptimization("user_free", "opt_1");
    // First settlement
    const first = engine.settleBilling("user_free", opt.id, "run_abc", "completed");
    expect(first.billed).toBe(true);
    expect(engine.users.get("user_free")?.freeOptimizationsUsed).toBe(1);

    // Duplicate retry call with same runId
    const retry = engine.settleBilling("user_free", opt.id, "run_abc", "completed");
    expect(retry.alreadyBilled).toBe(true);
    expect(retry.billed).toBe(false);
    expect(engine.users.get("user_free")?.freeOptimizationsUsed).toBe(1);
  });

  it("failure does not bill", () => {
    const opt = engine.createOptimization("user_free", "opt_fail");
    const result = engine.settleBilling("user_free", opt.id, "run_fail", "failed");

    expect(result.billed).toBe(false);
    expect(engine.users.get("user_free")?.freeOptimizationsUsed).toBe(0);
    expect(engine.optimizations.get(opt.id)?.status).toBe("failed");
  });

  it("5 parallel submissions on a 2-run allowance admit at most 2", () => {
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
});
