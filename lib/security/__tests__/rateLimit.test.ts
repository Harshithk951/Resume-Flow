import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit } from "../rateLimit";

describe("Rate Limiting Service", () => {
  beforeEach(() => {
    // Clear in-memory store between runs if needed
  });

  it("permits requests within configured threshold", async () => {
    const key = `test_permit_${Date.now()}`;
    const limit = 5;
    const window = 10;

    for (let i = 1; i <= limit; i++) {
      const res = await checkRateLimit(key, limit, window);
      expect(res.success).toBe(true);
      expect(res.remaining).toBe(limit - i);
    }
  });

  it("blocks requests that exceed the limit", async () => {
    const key = `test_block_${Date.now()}`;
    const limit = 3;
    const window = 10;

    for (let i = 1; i <= limit; i++) {
      const res = await checkRateLimit(key, limit, window);
      expect(res.success).toBe(true);
    }

    const blocked = await checkRateLimit(key, limit, window);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});
