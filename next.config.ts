import type { NextConfig } from "next";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

const devAllowedOrigins =
  process.env.NEXT_DEV_ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://pagead2.googlesyndication.com https://www.termsfeed.com https://*.clerk.accounts.dev https://cdn.tailwindcss.com https://ep2.adtrafficquality.google",
  "style-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://www.google-analytics.com https://analytics.google.com https://img.clerk.com https://pagead2.googlesyndication.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
  "worker-src 'self' blob:",
  "frame-src 'self' blob: https://challenges.cloudflare.com https://*.clerk.accounts.dev https://clerk.resumeflow.harshithkumar.in https://googleads.g.doubleclick.net https://www.google.com https://ep2.adtrafficquality.google https://www.googletagmanager.com https://analytics.google.com",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://pagead2.googlesyndication.com https://*.clerk.accounts.dev wss://*.convex.cloud https://*.convex.cloud https://ep1.adtrafficquality.google https://clerk-telemetry.com https://www.termsfeed.com",
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
