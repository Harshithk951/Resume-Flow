/**
 * lib/toast.ts — Centralized toast helpers
 *
 * Wraps Sonner so components never import it directly.
 * Makes it easy to swap toast libraries later if needed.
 *
 * Usage:
 *   import { toast } from "@/lib/toast";
 *   toast.success("Profile saved!");
 *   toast.error("Download failed");
 *   toast.promise(saveAction(), { loading: "Saving...", success: "Saved!", error: "Failed" });
 */

import { toast as sonnerToast } from "sonner";

type ToastOptions = Parameters<typeof sonnerToast.success>[1];

function createAction(label: string, onClick: () => void) {
  return { label, onClick };
}

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    sonnerToast.success(message, options),

  error: (message: string, options?: ToastOptions) =>
    sonnerToast.error(message, options),

  info: (message: string, options?: ToastOptions) =>
    sonnerToast.info(message, options),

  warning: (message: string, options?: ToastOptions) =>
    sonnerToast.warning(message, options),

  loading: (message: string, options?: ToastOptions) =>
    sonnerToast.loading(message, options),

  dismiss: (id?: string | number) =>
    sonnerToast.dismiss(id),

  /**
   * Handles the full lifecycle of an async operation with toasts.
   *
   * Example:
   *   toast.promise(
   *     saveProfile(data),
   *     { loading: "Saving...", success: "Profile saved!", error: "Save failed" }
   *   );
   */
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
    options?: ToastOptions,
  ) =>
    sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...options,
    }),

  /** Create a toast with an undo action */
  undo: (message: string, onUndo: () => void, options?: ToastOptions) =>
    sonnerToast(message, {
      ...options,
      action: createAction("Undo", onUndo),
      duration: 6000,
    }),
};
