import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { verifyQStashSignature } from "@/app/api/compile-worker/route";

describe("QStash Signature Verification (Worker Security)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("rejects unsigned requests with missing upstash-signature header", async () => {
    const result = await verifyQStashSignature(
      null,
      JSON.stringify({ latex: "\\documentclass{article}" }),
      "https://example.com/api/compile-worker"
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Missing upstash-signature header");
  });

  it("rejects requests when signing keys are not configured", async () => {
    delete process.env.QSTASH_CURRENT_SIGNING_KEY;
    delete process.env.QSTASH_NEXT_SIGNING_KEY;

    const result = await verifyQStashSignature(
      "fake_sig_token",
      JSON.stringify({ latex: "\\documentclass{article}" }),
      "https://example.com/api/compile-worker"
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toContain("QStash signing keys not configured");
  });

  it("rejects forged or tampered signatures", async () => {
    process.env.QSTASH_CURRENT_SIGNING_KEY = "sigkey_current_test";
    process.env.QSTASH_NEXT_SIGNING_KEY = "sigkey_next_test";

    const result = await verifyQStashSignature(
      "forged.signature.token",
      JSON.stringify({ latex: "\\documentclass{article}" }),
      "https://example.com/api/compile-worker"
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
  });
});
