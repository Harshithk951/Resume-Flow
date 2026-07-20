// sentry.server.config.ts
//
// Sentry server-side configuration.
// Captures errors from API routes and server-side rendering.
//
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2, // 20% sampling for backend traces
    environment: process.env.NODE_ENV ?? "development",
    enabled: process.env.NODE_ENV === "production",
  });
}
