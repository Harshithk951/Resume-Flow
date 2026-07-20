/**
 * components/Toaster.tsx — Themed Sonner Toaster
 *
 * Mounted once in the root layout.
 * Provides consistent styling across the entire app.
 *
 * Positioning: bottom-right aligns with the dashboard's action-oriented layout.
 * Rich colors: semantic green for success, red for error.
 * Expand: stacks multiple toasts vertically with a pleasant animation.
 * Close button: ensures accessibility and user control.
 */

"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      expand={true}
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        className: "text-sm font-medium",
      }}
      gap={10}
      visibleToasts={4}
    />
  );
}
