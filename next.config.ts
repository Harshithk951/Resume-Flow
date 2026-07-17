import type { NextConfig } from "next";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

const devAllowedOrigins =
  process.env.NEXT_DEV_ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const cspDirectives = [
  // Default: restrict to same-origin
  "default-src 'self'",
  // Scripts: self + inline (for JSON-LD + consent mode) + GTM + GA4 + AdSense
  `script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://www.googletagmanager.com
    https://www.google-analytics.com
    https://analytics.google.com
    https://pagead2.googlesyndication.com
    https://www.termsfeed.com`,
  // Styles: inline allowed for Tailwind + Framer Motion
  "style-src 'self' 'unsafe-inline'",
  // Images: self + GA4 collect endpoint
  `img-src 'self' data: blob:
    https://www.google-analytics.com
    https://analytics.google.com`,
  // Frames: Clerk auth, Cloudflare challenges, AdSense, reCAPTCHA, GTM
  `frame-src 'self' blob:
    https://challenges.cloudflare.com
    https://*.clerk.accounts.dev
    https://clerk.resumeflow.harshithkumar.in
    https://googleads.g.doubleclick.net
    https://www.google.com
    https://ep2.adtrafficquality.google
    https://www.googletagmanager.com
    https://analytics.google.com`,
  // Connections: GA4, GTM, AdSense
  `connect-src 'self'
    https://www.google-analytics.com
    https://analytics.google.com
    https://pagead2.googlesyndication.com`,
];

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: cspDirectives.join("; "),
  },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve("."),
  serverExternalPackages: ["@react-pdf/renderer"],
  ...(devAllowedOrigins.length > 0 ? { allowedDevOrigins: devAllowedOrigins } : {}),
  compiler: {
    removeConsole: isProd ? { exclude: ["error", "warn"] } : false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
