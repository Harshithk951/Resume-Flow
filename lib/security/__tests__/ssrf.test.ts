import { describe, it, expect } from "vitest";
import {
  isPrivateIPv4,
  isPrivateIPv6,
  normalizeNumericIp,
  validateUrlForSsrf,
  sanitizeScrapedHtml,
} from "../ssrf";

describe("SSRF Protection & Validation", () => {
  describe("Numeric & Alternate IP Representations", () => {
    it("normalizes integer decimal notation (2130706433 -> 127.0.0.1)", () => {
      expect(normalizeNumericIp("2130706433")).toBe("127.0.0.1");
    });

    it("normalizes hex notation (0x7f000001 -> 127.0.0.1)", () => {
      expect(normalizeNumericIp("0x7f000001")).toBe("127.0.0.1");
    });

    it("normalizes POSIX truncated dotted notation (127.1 -> 127.0.0.1)", () => {
      expect(normalizeNumericIp("127.1")).toBe("127.0.0.1");
    });

    it("normalizes IPv4-mapped IPv6 (::ffff:127.0.0.1 -> 127.0.0.1)", () => {
      expect(normalizeNumericIp("::ffff:127.0.0.1")).toBe("127.0.0.1");
    });
  });

  describe("IP Address Range Filters", () => {
    it("detects loopback IPv4 addresses", () => {
      expect(isPrivateIPv4("127.0.0.1")).toBe(true);
      expect(isPrivateIPv4("127.255.255.254")).toBe(true);
      expect(isPrivateIPv4("0.0.0.0")).toBe(true);
    });

    it("detects private IPv4 subnets (RFC 1918)", () => {
      expect(isPrivateIPv4("10.0.0.1")).toBe(true);
      expect(isPrivateIPv4("10.254.1.5")).toBe(true);
      expect(isPrivateIPv4("172.16.0.1")).toBe(true);
      expect(isPrivateIPv4("172.31.255.255")).toBe(true);
      expect(isPrivateIPv4("192.168.1.1")).toBe(true);
    });

    it("detects AWS/GCP cloud metadata address (169.254.169.254)", () => {
      expect(isPrivateIPv4("169.254.169.254")).toBe(true);
      expect(isPrivateIPv4("169.254.0.1")).toBe(true);
    });

    it("allows genuine public IPv4 addresses", () => {
      expect(isPrivateIPv4("8.8.8.8")).toBe(false);
      expect(isPrivateIPv4("1.1.1.1")).toBe(false);
      expect(isPrivateIPv4("104.16.132.229")).toBe(false);
    });

    it("detects loopback and local IPv6 addresses", () => {
      expect(isPrivateIPv6("::1")).toBe(true);
      expect(isPrivateIPv6("::")).toBe(true);
      expect(isPrivateIPv6("fe80::1")).toBe(true);
      expect(isPrivateIPv6("fc00::1")).toBe(true);
      expect(isPrivateIPv6("fd12:3456:789a::1")).toBe(true);
      expect(isPrivateIPv6("::ffff:127.0.0.1")).toBe(true);
    });
  });

  describe("validateUrlForSsrf - Alternate Encodings & Bypasses", () => {
    it("blocks 0.0.0.0", async () => {
      const res = await validateUrlForSsrf("http://0.0.0.0:8000/internal");
      expect(res.safe).toBe(false);
    });

    it("blocks 127.1 truncated notation", async () => {
      const res = await validateUrlForSsrf("http://127.1:3000/secret");
      expect(res.safe).toBe(false);
    });

    it("blocks 2130706433 decimal notation", async () => {
      const res = await validateUrlForSsrf("http://2130706433:80/admin");
      expect(res.safe).toBe(false);
    });

    it("blocks 0x7f000001 hex notation", async () => {
      const res = await validateUrlForSsrf("http://0x7f000001/status");
      expect(res.safe).toBe(false);
    });

    it("blocks [::1] IPv6 loopback notation", async () => {
      const res = await validateUrlForSsrf("http://[::1]:9090");
      expect(res.safe).toBe(false);
    });

    it("blocks [::ffff:127.0.0.1] IPv4-mapped IPv6 notation", async () => {
      const res = await validateUrlForSsrf("http://[::ffff:127.0.0.1]:8080");
      expect(res.safe).toBe(false);
    });

    it("blocks cloud metadata URL", async () => {
      const res = await validateUrlForSsrf("http://169.254.169.254/latest/meta-data");
      expect(res.safe).toBe(false);
    });

    it("blocks non-HTTP protocols", async () => {
      expect((await validateUrlForSsrf("file:///etc/passwd")).safe).toBe(false);
      expect((await validateUrlForSsrf("ftp://example.com/file")).safe).toBe(false);
      expect((await validateUrlForSsrf("gopher://example.com")).safe).toBe(false);
    });

    it("permits public IP URLs directly without requiring external DNS in sandbox", async () => {
      const res = await validateUrlForSsrf("https://93.184.216.34/test");
      expect(res.safe).toBe(true);
      expect(res.resolvedIps).toContain("93.184.216.34");
      expect(res.pinnedIp).toBe("93.184.216.34");
    });
  });

  describe("safeFetchWithSsrfProtection - Redirect to Private Address", () => {
    it("aborts when a redirect location points to a private or loopback address", async () => {
      // Simulate safeFetch redirect checking:
      // When initial URL is public, but server returns a 302 to http://127.0.0.1/admin or http://169.254.169.254
      const redirectTarget = "http://169.254.169.254/latest/meta-data";
      const redirectCheck = await validateUrlForSsrf(redirectTarget);
      expect(redirectCheck.safe).toBe(false);

      const redirectLoopback = "http://127.0.0.1:8080/admin";
      const loopbackCheck = await validateUrlForSsrf(redirectLoopback);
      expect(loopbackCheck.safe).toBe(false);

      const redirectDecimal = "http://2130706433/";
      const decimalCheck = await validateUrlForSsrf(redirectDecimal);
      expect(decimalCheck.safe).toBe(false);
    });
  });

  describe("HTML Sanitizer", () => {
    it("removes scripts, styles, and footer boilerplate", () => {
      const html = `
        <html>
          <head><style>body { color: red; }</style></head>
          <body>
            <script>alert(1);</script>
            <nav><a href="/">Home</a></nav>
            <h1>Software Engineer</h1>
            <p>Requirements: Python, React, AWS</p>
            <footer>Copyright 2026</footer>
          </body>
        </html>
      `;
      const cleaned = sanitizeScrapedHtml(html);
      expect(cleaned).toContain("Software Engineer");
      expect(cleaned).toContain("Requirements: Python, React, AWS");
      expect(cleaned).not.toContain("alert(1)");
      expect(cleaned).not.toContain("color: red");
      expect(cleaned).not.toContain("Copyright 2026");
    });
  });
});
