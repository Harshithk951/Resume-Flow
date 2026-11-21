import { describe, it, expect } from "vitest";
import { getClientIp, checkRateLimit } from "../rateLimit";

describe("Rate Limiting & Client IP Security", () => {
  describe("getClientIp - Platform Header Prioritization & Anti-Spoofing", () => {
    it("prioritizes x-vercel-proxied-for edge header", () => {
      const headers = new Headers({
        "x-vercel-proxied-for": "198.51.100.4",
        "x-forwarded-for": "1.2.3.4, 5.6.7.8",
      });
      expect(getClientIp(headers)).toBe("198.51.100.4");
    });

    it("prioritizes x-vercel-forwarded-for over standard headers", () => {
      const headers = new Headers({
        "x-vercel-forwarded-for": "203.0.113.19",
        "x-forwarded-for": "attacker.spoofed.ip",
      });
      expect(getClientIp(headers)).toBe("203.0.113.19");
    });

    it("prioritizes cf-connecting-ip for Cloudflare edge routing", () => {
      const headers = new Headers({
        "cf-connecting-ip": "172.68.25.10",
        "x-forwarded-for": "1.1.1.1, 2.2.2.2",
      });
      expect(getClientIp(headers)).toBe("172.68.25.10");
    });

    it("prioritizes x-real-ip if edge headers are absent", () => {
      const headers = new Headers({
        "x-real-ip": "192.0.2.1",
        "x-forwarded-for": "attacker.spoofed.ip, 192.0.2.1",
      });
      expect(getClientIp(headers)).toBe("192.0.2.1");
    });

    it("takes the LAST (nearest proxy) hop from x-forwarded-for, NOT the spoofed first entry", () => {
      const headers = new Headers({
        "x-forwarded-for": "1.1.1.1, 2.2.2.2, 198.51.100.99",
      });
      // The attacker may inject "1.1.1.1", but the nearest proxy appended "198.51.100.99"
      expect(getClientIp(headers)).toBe("198.51.100.99");
    });

    it("falls back to 127.0.0.1 if no headers are provided", () => {
      const headers = new Headers({});
      expect(getClientIp(headers)).toBe("127.0.0.1");
    });
  });

  describe("checkRateLimit - Sliding Window & Limits", () => {
    it("allows requests within the limit", async () => {
      const key = `test_rate_ok_${Date.now()}`;
      const res1 = await checkRateLimit(key, 3, 60);
      expect(res1.success).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = await checkRateLimit(key, 3, 60);
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = await checkRateLimit(key, 3, 60);
      expect(res3.success).toBe(true);
      expect(res3.remaining).toBe(0);
    });

    it("rejects requests exceeding the limit", async () => {
      const key = `test_rate_exceed_${Date.now()}`;
      await checkRateLimit(key, 2, 60);
      await checkRateLimit(key, 2, 60);

      const exceedRes = await checkRateLimit(key, 2, 60);
      expect(exceedRes.success).toBe(false);
      expect(exceedRes.remaining).toBe(0);
    });
  });

  describe("Fail-Closed Mode for Expensive Operations", () => {
    it("supports failClosed flag in CheckRateLimitOptions", async () => {
      const key = `test_failclosed_${Date.now()}`;
      const res = await checkRateLimit(key, 5, 60, { failClosed: true });
      expect(res.success).toBe(true);
    });
  });
});
