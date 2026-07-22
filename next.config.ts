import type { NextConfig } from "next";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

const devAllowedOrigins =
  process.env.NEXT_DEV_ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://pagead2.googlesyndication.com https://www.termsfeed.com https://clerk.resumeflow.harshithkumar.in https://challenges.cloudflare.com https://cdn.tailwindcss.com https://ep2.adtrafficquality.google https://*.razorpay.com",
  "style-src 'self' 'unsafe-inline' https://clerk.resumeflow.harshithkumar.in https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://www.google-analytics.com https://analytics.google.com https://img.clerk.com https://pagead2.googlesyndication.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://*.razorpay.com",
  "worker-src 'self' blob:",
  "frame-src 'self' blob: https://challenges.cloudflare.com https://clerk.resumeflow.harshithkumar.in https://googleads.g.doubleclick.net https://www.google.com https://ep2.adtrafficquality.google https://www.googletagmanager.com https://analytics.google.com https://*.razorpay.com",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://pagead2.googlesyndication.com https://clerk.resumeflow.harshithkumar.in https://challenges.cloudflare.com https://img.clerk.com wss://*.convex.cloud https://*.convex.cloud https://ep1.adtrafficquality.google https://clerk-telemetry.com https://www.termsfeed.com https://*.razorpay.com",
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
      // ── CDN Cache-Control for static landing pages ──────────
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/free-resume-builder",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/info/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=1800, s-maxage=1800, stale-while-revalidate=43200",
          },
        ],
      },
      {
        source: "/legal/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/resources/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=1800, s-maxage=1800, stale-while-revalidate=43200",
          },
        ],
      },
      // Static images in public/
      {
        source: "/:asset((?:logo|hero-poster|chatbot-icon)\\.(?:png|jpg|webp))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
