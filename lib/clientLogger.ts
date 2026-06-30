/**
 * Client-side logger — suppresses info/debug in production so resume
 * payloads and job IDs are not written to the browser console.
 */
const isDev = process.env.NODE_ENV === "development";

export const clientLog = {
  info: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
