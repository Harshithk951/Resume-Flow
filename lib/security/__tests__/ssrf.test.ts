import { describe, it, expect } from "vitest";
import { isPrivateIPv4, isPrivateIPv6, validateUrlForSsrf, sanitizeScrapedHtml } from "../ssrf";

describe("SSRF Protection & Validation", () => {
  describe("IP Address Range Filters", () => {
    it("detects loopback IPv4 addresses", () => {
      expect(isPrivateIPv4("127.0.0.1")).toBe(true);
      expect(isPrivateIPv4("127.255.255.254")).toBe(true);
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
    });
  });

  describe("validateUrlForSsrf", () => {
    it("blocks localhost and local URLs directly", async () => {
      expect((await validateUrlForSsrf("http://localhost:3000")).safe).toBe(false);
      expect((await validateUrlForSsrf("http://127.0.0.1:8080/metrics")).safe).toBe(false);
      expect((await validateUrlForSsrf("http://test.localhost/api")).safe).toBe(false);
    });

    it("blocks cloud metadata URL", async () => {
      expect((await validateUrlForSsrf("http://169.254.169.254/latest/meta-data")).safe).toBe(false);
    });

    it("blocks private network URLs", async () => {
      expect((await validateUrlForSsrf("http://192.168.1.100/admin")).safe).toBe(false);
      expect((await validateUrlForSsrf("http://10.0.0.5:5432")).safe).toBe(false);
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
