import dns from "dns/promises";
import net from "net";
import http from "http";
import https from "https";

export const MAX_JOB_RESPONSE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_JOB_REDIRECTS = 3;
export const JOB_SCRAPE_TIMEOUT_MS = 10_000; // 10 seconds

/**
 * Normalizes decimal, hex, octal, or truncated numeric IPv4 representations into canonical dotted-decimal.
 * e.g.:
 * - "2130706433" -> "127.0.0.1"
 * - "0x7f000001" -> "127.0.0.1"
 * - "127.1" -> "127.0.0.1"
 * - "::ffff:127.0.0.1" -> "127.0.0.1"
 */
export function normalizeNumericIp(str: string): string | null {
  const clean = str.trim().replace(/^\[|\]$/g, "");

  // IPv4-mapped IPv6: ::ffff:127.0.0.1
  const mappedMatch = clean.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mappedMatch) {
    return mappedMatch[1];
  }

  // Integer decimal or hex notation (e.g. 2130706433 or 0x7f000001)
  if (/^(0x[0-9a-f]+|\d+)$/i.test(clean)) {
    try {
      const num = Number(clean);
      if (!isNaN(num) && num >= 0 && num <= 4294967295) {
        const a = (num >>> 24) & 255;
        const b = (num >>> 16) & 255;
        const c = (num >>> 8) & 255;
        const d = num & 255;
        return `${a}.${b}.${c}.${d}`;
      }
    } catch {
      return null;
    }
  }

  // POSIX inet_aton dotted parts (e.g. 127.1 or 10.1.2)
  const parts = clean.split(".");
  if (parts.length >= 1 && parts.length <= 4) {
    const nums: number[] = [];
    for (const p of parts) {
      if (/^0x[0-9a-f]+$/i.test(p)) {
        nums.push(parseInt(p, 16));
      } else if (/^0[0-7]+$/.test(p)) {
        nums.push(parseInt(p, 8));
      } else if (/^\d+$/.test(p)) {
        nums.push(parseInt(p, 10));
      } else {
        return null;
      }
    }

    if (nums.some((n) => isNaN(n) || n < 0)) return null;

    if (nums.length === 1 && nums[0] <= 4294967295) {
      const n = nums[0];
      return `${(n >> 24) & 255}.${(n >> 16) & 255}.${(n >> 8) & 255}.${n & 255}`;
    }
    if (nums.length === 2) {
      if (nums[0] <= 255 && nums[1] <= 16777215) {
        return `${nums[0]}.${(nums[1] >> 16) & 255}.${(nums[1] >> 8) & 255}.${nums[1] & 255}`;
      }
    }
    if (nums.length === 3) {
      if (nums[0] <= 255 && nums[1] <= 255 && nums[2] <= 65535) {
        return `${nums[0]}.${nums[1]}.${(nums[2] >> 8) & 255}.${nums[2] & 255}`;
      }
    }
    if (nums.length === 4) {
      if (nums.every((n) => n <= 255)) return nums.join(".");
    }
  }

  return null;
}

/**
 * Checks if an IPv4 address is in a private, loopback, or reserved range.
 */
export function isPrivateIPv4(ip: string): boolean {
  const normalized = normalizeNumericIp(ip) || ip;
  const parts = normalized.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IP is considered unsafe
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network / unspecified)
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
  if (normalized === "255.255.255.255") return true;

  return false;
}

/**
 * Checks if an IPv6 address is private, loopback, or link-local.
 */
export function isPrivateIPv6(ip: string): boolean {
  const clean = ip.trim().replace(/^\[|\]$/g, "");
  const normalized = clean.toLowerCase();

  // Loopback (::1) or Unspecified (::)
  if (normalized === "::1" || normalized === "::") return true;

  // Link-local (fe80::/10)
  if (
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  ) {
    return true;
  }

  // Unique local address (fc00::/7 -> fc00... or fd00...)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
    return true;
  }

  // IPv4-mapped IPv6 (::ffff:127.0.0.1 or ::ffff:7f00:1)
  if (normalized.startsWith("::ffff:")) {
    const rawIpv4 = normalized.slice(7);
    const resolvedIpv4 = normalizeNumericIp(rawIpv4) || rawIpv4;
    return isPrivateIPv4(resolvedIpv4);
  }

  return false;
}

/**
 * Checks if an IP address (v4 or v6) is private or reserved.
 */
export function isPrivateIP(ip: string): boolean {
  const normalizedIpv4 = normalizeNumericIp(ip);
  if (normalizedIpv4) {
    return isPrivateIPv4(normalizedIpv4);
  }

  const clean = ip.trim().replace(/^\[|\]$/g, "");
  const family = net.isIP(clean);
  if (family === 4) return isPrivateIPv4(clean);
  if (family === 6) return isPrivateIPv6(clean);
  return true; // Unknown format treated as unsafe
}

/**
 * Validates whether a URL is safe against SSRF attacks.
 * Resolves all DNS records for the host and ensures none map to internal/loopback addresses.
 */
export async function validateUrlForSsrf(
  urlStr: string
): Promise<{ safe: boolean; reason?: string; resolvedIps?: string[]; pinnedIp?: string }> {
  let parsed: URL;

  try {
    parsed = new URL(urlStr);
  } catch {
    return { safe: false, reason: "Malformed URL syntax" };
  }

  // 1. Enforce strict HTTP/HTTPS protocols
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      safe: false,
      reason: `Disallowed protocol: "${parsed.protocol}". Only http: and https: are permitted.`,
    };
  }

  const hostname = parsed.hostname;

  // 2. Block known cloud metadata hostnames directly
  const lowerHost = hostname.toLowerCase();
  if (
    lowerHost === "metadata.google.internal" ||
    lowerHost === "169.254.169.254" ||
    lowerHost === "instance-data" ||
    lowerHost === "localhost" ||
    lowerHost.endsWith(".localhost") ||
    lowerHost.endsWith(".internal") ||
    lowerHost.endsWith(".local")
  ) {
    return { safe: false, reason: `Forbidden hostname: ${hostname}` };
  }

  // 3. Check if hostname is an alternate or literal IP (e.g. 127.1, 0x7f000001, [::1])
  const directNormalized = normalizeNumericIp(hostname);
  if (directNormalized) {
    if (isPrivateIPv4(directNormalized)) {
      return {
        safe: false,
        reason: `Target address ${hostname} (${directNormalized}) is private or loopback`,
      };
    }
    return { safe: true, resolvedIps: [directNormalized], pinnedIp: directNormalized };
  }

  const cleanHost = hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(cleanHost)) {
    if (isPrivateIP(cleanHost)) {
      return { safe: false, reason: `Target IP ${cleanHost} is private or loopback` };
    }
    return { safe: true, resolvedIps: [cleanHost], pinnedIp: cleanHost };
  }

  // 4. Resolve DNS records and verify all returned addresses
  try {
    const addresses = await dns.lookup(hostname, { all: true });

    if (!addresses || addresses.length === 0) {
      return { safe: false, reason: `DNS resolution returned no addresses for host: ${hostname}` };
    }

    const resolvedIps = addresses.map((a) => a.address);

    for (const ip of resolvedIps) {
      if (isPrivateIP(ip)) {
        return {
          safe: false,
          reason: `DNS resolved ${hostname} to private/disallowed IP: ${ip}`,
          resolvedIps,
        };
      }
    }

    return { safe: true, resolvedIps, pinnedIp: resolvedIps[0] };
  } catch (dnsErr: unknown) {
    const message = dnsErr instanceof Error ? dnsErr.message : "DNS lookup failed";
    return { safe: false, reason: `DNS lookup failed for ${hostname}: ${message}` };
  }
}

/**
 * Fetches an HTTP/HTTPS URL pinning the connection to a specific validated IP.
 * Guarantees immunity to DNS rebinding attacks because DNS is not resolved a second time.
 */
function fetchWithPinnedIp(
  urlStr: string,
  pinnedIp: string,
  timeoutMs: number,
  maxBytes: number,
  userAgent: string
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const isHttps = parsed.protocol === "https:";
    const port = parsed.port ? parseInt(parsed.port, 10) : isHttps ? 443 : 80;

    const options: https.RequestOptions = {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port,
      path: `${parsed.pathname}${parsed.search}`,
      method: "GET",
      headers: {
        Host: parsed.hostname,
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,text/plain",
        Connection: "close",
      },
      lookup: (_hostname, _opts, callback) => {
        const family = net.isIP(pinnedIp);
        callback(null, pinnedIp, family);
      },
      timeout: timeoutMs,
      servername: isHttps ? parsed.hostname : undefined,
    };

    const client = isHttps ? https : http;
    const req = client.request(options, (res) => {
      let receivedBytes = 0;
      const chunks: Buffer[] = [];

      res.on("data", (chunk: Buffer) => {
        receivedBytes += chunk.length;
        if (receivedBytes > maxBytes) {
          req.destroy(new Error(`PAYLOAD_TOO_LARGE: Response exceeded maximum allowed size of ${maxBytes / 1024 / 1024} MB`));
          return;
        }
        chunks.push(chunk);
      });

      res.on("end", () => {
        const fullBuffer = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode || 200,
          headers: res.headers,
          body: fullBuffer.toString("utf-8"),
        });
      });
    });

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy(new Error(`TIMEOUT: Request exceeded timeout of ${timeoutMs}ms`));
    });

    req.end();
  });
}

/**
 * Fetches an external URL with pinned IP connection, manual redirect validation,
 * size capping, and timeout.
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
    const ssrfCheck = await validateUrlForSsrf(currentUrl);
    if (!ssrfCheck.safe || !ssrfCheck.pinnedIp) {
      throw new Error(`SSRF_BLOCKED: ${ssrfCheck.reason}`);
    }

    const res = await fetchWithPinnedIp(
      currentUrl,
      ssrfCheck.pinnedIp,
      timeoutMs,
      maxBytes,
      userAgent
    );

    // Check for redirection response codes (301, 302, 303, 307, 308)
    if (res.statusCode >= 300 && res.statusCode < 400) {
      const location = res.headers["location"];
      if (!location) {
        throw new Error(`HTTP_${res.statusCode}_MISSING_LOCATION: Redirection header missing`);
      }

      redirectsCount++;
      if (redirectsCount > maxRedirects) {
        throw new Error(`TOO_MANY_REDIRECTS: Exceeded redirect limit of ${maxRedirects}`);
      }

      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw new Error(`FETCH_FAILED_HTTP_${res.statusCode}: Failed to retrieve content from ${currentUrl}`);
    }

    return { text: res.body, finalUrl: currentUrl, status: res.statusCode };
  }

  throw new Error(`TOO_MANY_REDIRECTS: Exceeded redirect limit of ${maxRedirects}`);
}

/**
 * Strips HTML boilerplate, navigation, scripts, styles, and extracts readable text.
 */
export function sanitizeScrapedHtml(html: string): string {
  if (!html) return "";

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, " ")
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
