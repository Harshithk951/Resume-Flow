import dns from "dns/promises";
import net from "net";

export const MAX_JOB_RESPONSE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_JOB_REDIRECTS = 3;
export const JOB_SCRAPE_TIMEOUT_MS = 10_000; // 10 seconds

/**
 * Checks if an IPv4 address is in a private, loopback, or reserved range.
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IP is considered unsafe
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 10.0.0.0/8 (Private network)
  if (a === 10) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 169.254.0.0/16 (Link-local, AWS/GCP/Azure instance metadata 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (Private network)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private network)
  if (a === 192 && b === 168) return true;

  // 100.64.0.0/10 (Shared address space / Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved)
  if (a >= 240) return true;

  // 255.255.255.255 (Broadcast)
  if (ip === "255.255.255.255") return true;

  return false;
}

/**
 * Checks if an IPv6 address is private, loopback, or link-local.
 */
export function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // Loopback (::1) or Unspecified (::)
  if (normalized === "::1" || normalized === "::") return true;

  // Link-local (fe80::/10)
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) {
    return true;
  }

  // Unique local address (fc00::/7 -> fc00... or fd00...)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
    return true;
  }

  // IPv4-mapped IPv6 (::ffff:192.0.2.128 or ::ffff:c000:0280)
  if (normalized.startsWith("::ffff:")) {
    const rawIpv4 = normalized.slice(7);
    if (net.isIPv4(rawIpv4)) {
      return isPrivateIPv4(rawIpv4);
    }
  }

  return false;
}

/**
 * Checks if an IP address (v4 or v6) is private or reserved.
 */
export function isPrivateIP(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return isPrivateIPv4(ip);
  if (family === 6) return isPrivateIPv6(ip);
  return true; // Unknown is treated as unsafe
}

/**
 * Validates whether a URL is safe against SSRF attacks.
 * Resolves all DNS records for the host and ensures none map to internal/loopback addresses.
 */
export async function validateUrlForSsrf(urlStr: string): Promise<{ safe: boolean; reason?: string; resolvedIps?: string[] }> {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { safe: false, reason: "Malformed URL syntax" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { safe: false, reason: `Unsupported protocol ${parsed.protocol} (only http: and https: are permitted)` };
  }

  const hostname = parsed.hostname;

  // Quick check for literal localhost or IP address in hostname
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    return { safe: false, reason: "Local and internal hostnames are prohibited" };
  }

  if (net.isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      return { safe: false, reason: `Direct private IP access (${hostname}) is prohibited` };
    }
    return { safe: true, resolvedIps: [hostname] };
  }

  // Resolve hostname via DNS
  try {
    const records = await dns.lookup(hostname, { all: true });
    if (!records || records.length === 0) {
      return { safe: false, reason: `Could not resolve hostname: ${hostname}` };
    }

    const resolvedIps = records.map((r) => r.address);
    for (const ip of resolvedIps) {
      if (isPrivateIP(ip)) {
        return {
          safe: false,
          reason: `Hostname ${hostname} resolves to blocked internal IP: ${ip}`,
          resolvedIps,
        };
      }
    }

    return { safe: true, resolvedIps };
  } catch (dnsErr) {
    return { safe: false, reason: `DNS lookup failed for ${hostname}: ${(dnsErr as Error).message}` };
  }
}

/**
 * Fetches an external URL with comprehensive SSRF protection, manual redirect validation,
 * size capping, and execution timeout.
 */
export async function safeFetchWithSsrfProtection(
  initialUrl: string,
  options: {
    maxRedirects?: number;
    maxBytes?: number;
    timeoutMs?: number;
    userAgent?: string;
  } = {}
): Promise<{ text: string; finalUrl: string; status: number }> {
  const maxRedirects = options.maxRedirects ?? MAX_JOB_REDIRECTS;
  const maxBytes = options.maxBytes ?? MAX_JOB_RESPONSE_BYTES;
  const timeoutMs = options.timeoutMs ?? JOB_SCRAPE_TIMEOUT_MS;
  const userAgent =
    options.userAgent ||
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

  let currentUrl = initialUrl;
  let redirectsCount = 0;

  while (redirectsCount <= maxRedirects) {
    // Validate target URL before every single fetch hop
    const ssrfCheck = await validateUrlForSsrf(currentUrl);
    if (!ssrfCheck.safe) {
      throw new Error(`SSRF_BLOCKED: ${ssrfCheck.reason}`);
    }

    const res = await fetch(currentUrl, {
      method: "GET",
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,text/plain",
      },
      redirect: "manual", // Handle redirects manually to validate destination IPs
      signal: AbortSignal.timeout(timeoutMs),
    });

    // Check for redirection response codes (301, 302, 303, 307, 308)
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) {
        throw new Error(`HTTP_${res.status}_MISSING_LOCATION: Redirection header missing`);
      }

      redirectsCount++;
      if (redirectsCount > maxRedirects) {
        throw new Error(`TOO_MANY_REDIRECTS: Exceeded redirect limit of ${maxRedirects}`);
      }

      // Resolve relative redirect against current URL
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (!res.ok) {
      throw new Error(`FETCH_FAILED_HTTP_${res.status}: Failed to retrieve content from ${currentUrl}`);
    }

    // Stream and cap response body size to prevent memory exhaustion (Zip-bombs / huge files)
    if (!res.body) {
      return { text: "", finalUrl: currentUrl, status: res.status };
    }

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        receivedBytes += value.byteLength;
        if (receivedBytes > maxBytes) {
          await reader.cancel("Response exceeded byte limit");
          throw new Error(`PAYLOAD_TOO_LARGE: Response exceeded maximum allowed size of ${maxBytes / 1024 / 1024} MB`);
        }
        chunks.push(value);
      }
    }

    const fullBuffer = Buffer.concat(chunks);
    const text = fullBuffer.toString("utf-8");

    return { text, finalUrl: currentUrl, status: res.status };
  }

  throw new Error(`TOO_MANY_REDIRECTS: Exceeded redirect limit of ${maxRedirects}`);
}

/**
 * Strips HTML boilerplate, navigation, scripts, styles, and extracts readable text.
 */
export function sanitizeScrapedHtml(html: string): string {
  if (!html) return "";

  return html
    // Remove script, style, noscript, svg, iframe, nav, footer, header tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, " ")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
    // Convert line-break tags to newlines
    .replace(/<(?:br|hr|\/p|\/div|\/li|\/tr|h[1-6]|\/h[1-6])\b[^>]*>/gi, "\n")
    // Strip remaining tags
    .replace(/<[^>]+>/g, " ")
    // Unescape common HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean whitespace while preserving line structure
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n")
    .trim();
}
