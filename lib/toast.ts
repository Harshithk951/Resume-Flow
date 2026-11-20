/**
 * lib/toast.ts — Centralized toast helpers
 *
 * Wraps Sonner and automatically sanitizes all error messages.
 * Never leaks database or platform names (Convex, Supabase, internal stack traces).
 * Always converts errors to clean, user-facing causes.
 */

import { toast as sonnerToast } from "sonner";

type ToastOptions = Parameters<typeof sonnerToast.success>[1];

function createAction(label: string, onClick: () => void) {
  return { label, onClick };
}

/**
 * Sanitizes any raw server, database, or client error.
 * Strips platform prefixes like [CONVEX ...], [Request ID: ...], stack traces,
 * and converts known codes to clear, friendly explanations.
 */
export function cleanErrorMessage(
  raw: unknown,
  fallback = "An error occurred. Please try again."
): string {
  if (!raw) return fallback;

  let msg = "";
  if (typeof raw === "string") {
    msg = raw;
  } else if (raw instanceof Error) {
    msg = raw.message;
  } else if (typeof raw === "object" && raw !== null && "message" in raw) {
    msg = String((raw as { message: unknown }).message);
  } else {
    msg = String(raw);
  }

  // 1. If it's a wrapped ConvexError, extract the inner message first
  const matchConvex = msg.match(/Uncaught ConvexError:\s*([^\n]+)/i);
  if (matchConvex && matchConvex[1]) {
    msg = matchConvex[1].trim();
  }

  // 2. Strip bracketed request and platform headers
  msg = msg.replace(/\[CONVEX\s+[^\]]+\]/gi, "");
  msg = msg.replace(/\[Request ID:[^\]]+\]/gi, "");
  msg = msg.replace(/\[Server Error\]/gi, "");
  msg = msg.replace(/Server Error/gi, "");
  msg = msg.replace(/Uncaught ConvexError:\s*/gi, "");
  msg = msg.replace(/Uncaught Error:\s*/gi, "");
  msg = msg.replace(/Called by client/gi, "");

  // 3. Remove stack traces and handler paths (e.g., "at handler (.../convex/...)")
  msg = msg.replace(/at\s+handler\s*\([^)]*\)/gi, "");
  msg = msg.replace(/at\s+[a-zA-Z0-9_$./]+\s*\([^)]*\)/gi, "");
  msg = msg.replace(/^\s*at\s+.*$/gim, "");

  // 4. Remove platform names like "Convex", "Supabase", etc.
  msg = msg.replace(/\bConvexError\b/gi, "");
  msg = msg.replace(/\bConvex\b/gi, "");

  // 5. Clean up whitespace and punctuation
  msg = msg.replace(/\s+/g, " ").trim();
  msg = msg.replace(/^[:\-\s,]+|[:\-\s,]+$/g, "").trim();

  // 6. Map common technical error strings to clear, helpful user-facing causes
  if (!msg || msg.length < 3) {
    return fallback;
  }

  const lower = msg.toLowerCase();
  if (lower.includes("optimization not found")) {
    return "This optimization record was already removed or does not exist.";
  }
  if (lower.includes("job not found")) {
    return "This job application was already removed or does not exist.";
  }
  if (lower.includes("saved resume not found") || lower.includes("resume not found")) {
    return "This resume was already removed or does not exist.";
  }
  if (lower.includes("slot_limit_reached") || lower.includes("slot limit reached")) {
    return "Resume slot limit reached. Please upgrade your plan or remove an existing resume.";
  }
  if (lower.includes("unauthenticated") || lower.includes("authentication required")) {
    return "Your session has expired. Please sign in again.";
  }
  if (lower.includes("unauthorized") || lower.includes("ownership violation")) {
    return "You do not have permission to modify this record.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Rate limit reached. Please wait a moment and try again.";
  }

  return msg.charAt(0).toUpperCase() + msg.slice(1);
}

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    sonnerToast.success(message, options),

  error: (messageOrError: unknown, options?: ToastOptions) => {
    const cleanMsg = cleanErrorMessage(messageOrError);
    return sonnerToast.error(cleanMsg, options);
  },

  info: (message: string, options?: ToastOptions) =>
    sonnerToast.info(message, options),

  warning: (message: string, options?: ToastOptions) =>
    sonnerToast.warning(message, options),

  loading: (message: string, options?: ToastOptions) =>
    sonnerToast.loading(message, options),

  dismiss: (id?: string | number) =>
    sonnerToast.dismiss(id),

  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string | ((err: unknown) => string) },
    options?: ToastOptions,
  ) =>
    sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: (err) => {
        if (typeof messages.error === "function") {
          return cleanErrorMessage(messages.error(err));
        }
        return cleanErrorMessage(err, messages.error);
      },
      ...options,
    }),

  undo: (message: string, onUndo: () => void, options?: ToastOptions) =>
    sonnerToast(message, {
      ...options,
      action: createAction("Undo", onUndo),
      duration: 6000,
    }),
};
