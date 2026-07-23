"use client";

import { useEffect } from "react";

/**
 * Global Network Error Logger & Interceptor
 * Traps all failed client-side fetch requests and logs URL, Status Code,
 * Error Message, and Response Time for Grafana k6 and observability tracking.
 */
export function NetworkErrorLogger() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const startTime = performance.now();
      const input = args[0];
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
          ? input.toString()
          : (input as Request)?.url || "unknown";

      try {
        const response = await originalFetch.apply(this, args);
        const durationMs = Math.round(performance.now() - startTime);

        if (!response.ok) {
          console.error(
            `[NETWORK_FAILURE] URL: ${url} | Status: ${response.status} | StatusText: ${response.statusText} | ResponseTime: ${durationMs}ms`
          );
        }
        return response;
      } catch (err: any) {
        const durationMs = Math.round(performance.now() - startTime);
        console.error(
          `[NETWORK_FAILURE] URL: ${url} | Status: 0 | Error: ${err?.message || String(err)} | ResponseTime: ${durationMs}ms`
        );
        throw err;
      }
    };
  }, []);

  return null;
}
