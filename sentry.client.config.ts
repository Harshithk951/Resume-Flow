// sentry.client.config.ts
//
// Sentry client-side configuration.
// Runs in the browser to capture client-side errors.
//
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1, // 10% sampling for performance traces
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV ?? "development",
    enabled: process.env.NODE_ENV === "production",
  });
}
