"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle, Zap } from "lucide-react";
import confetti from "canvas-confetti";

type Plan = "pro" | "campus";
type Interval = "monthly" | "yearly";

interface RazorpayCheckoutProps {
  plan: Plan;
  interval?: Interval;
  label?: string;
  className?: string;
  variant?: "button" | "link";
  disabled?: boolean;
  /** Called after successful payment & plan upgrade */
  onSuccess?: () => void;
}

/**
 * RazorpayCheckout — Handles the full Razorpay payment flow.
 *
 * Flow:
 *   1. User clicks → creates Razorpay order via server API
 *   2. Opens Razorpay checkout modal
 *   3. On success → verifies payment signature server-side
 *   4. On verify success → Convex mutation upgrades user plan
 *   5. Fires confetti + toast
 */
export function RazorpayCheckout({
  plan,
  interval = "monthly",
  label,
  className = "",
  variant = "button",
  disabled = false,
  onSuccess,
}: RazorpayCheckoutProps) {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "creating" | "checkout" | "verifying" | "success" | "error"
  >("idle");

  // For optimistic UI — refetch user data on success
  const rerun = useMutation(api.users.createOrGetUser);

  const displayLabel =
    label ||
    `Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;

  const fireConfetti = useCallback(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#e11d48", "#f43f5e", "#fb7185"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#e11d48", "#f43f5e", "#fb7185"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const handlePayment = async () => {
    if (!isLoaded || !isSignedIn || !userId) {
      toast.error("Please sign in to upgrade");
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    setStatus("creating");

    try {
      // ─── Step 1: Create Razorpay order ──────────────────────
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval, clerkId: userId }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || "Failed to create order");
      }

      const order = await orderRes.json();
      setStatus("checkout");

      // ─── Step 2: Load Razorpay script if needed ────────────
      if (typeof (window as any).Razorpay === "undefined") {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
          document.body.appendChild(script);
        });
      }

      // ─── Step 3: Open Razorpay checkout ─────────────────────
      // Use key_id from the API response (runtime, not build-time)
      const razorpayKey = (order as any).key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error(
          "Payment configuration error: Razorpay key missing."
        );
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "ResumeFlow",
        description:
          plan === "pro"
            ? `Pro Plan (${interval})`
            : `Campus Plan (${interval})`,
        order_id: order.id,
        prefill: {
          contact: "",
          email: "",
        },
        theme: {
          color: "#e11d48",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setStatus("idle");
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setStatus("verifying");

          // ─── Step 4: Verify payment signature server-side ──
          console.log("[Razorpay] Verifying payment...", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
          });

          // Add a timeout to prevent hanging on "Verifying..."
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                clerkId: userId,
                plan,
              }),
            });

            clearTimeout(timeoutId);
            console.log("[Razorpay] Verify response status:", verifyRes.status);

            const verifyData = await verifyRes.json();
            console.log("[Razorpay] Verify response data:", verifyData);

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(
                verifyData.error || `Verification failed (${verifyRes.status})`
              );
            }
          } catch (fetchErr: any) {
            clearTimeout(timeoutId);
            if (fetchErr.name === "AbortError") {
              throw new Error("Payment verification timed out. Please contact support.");
            }
            throw fetchErr;
          }

          setStatus("success");
          fireConfetti();
          toast.success(
            `Welcome to ${plan.charAt(0).toUpperCase() + plan.slice(1)}! 🎉`,
            { duration: 5000 }
          );

          // Refresh user data
          try {
            await rerun();
          } catch {
            // Silent — user data will sync on next page load
          }

          onSuccess?.();
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", (response: any) => {
        console.error("[Razorpay] Payment failed:", response.error);
        toast.error(
          response.error?.description || "Payment failed. Please try again."
        );
        setIsProcessing(false);
        setStatus("error");
      });

      rzp.open();
    } catch (err: any) {
      console.error("[Razorpay] Checkout error:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
      setStatus("error");
      setIsProcessing(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────
  const buttonContent = (
    <span className="flex items-center justify-center gap-2">
      {status === "creating" || status === "verifying" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>
            {status === "creating" ? "Preparing..." : "Verifying..."}
          </span>
        </>
      ) : status === "success" ? (
        <>
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>Upgraded!</span>
        </>
      ) : status === "error" ? (
        <>
          <AlertCircle className="h-4 w-4 text-rose-500" />
          <span>Try Again</span>
        </>
      ) : (
        <>
          <Zap className="h-4 w-4" />
          <span>{displayLabel}</span>
        </>
      )}
    </span>
  );

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={handlePayment}
        disabled={disabled || isProcessing || status === "success"}
        className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-all ${
          disabled || isProcessing
            ? "opacity-50 cursor-not-allowed"
            : "hover:opacity-80"
        } ${className}`}
      >
        {buttonContent}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={disabled || isProcessing || status === "success"}
      className={`inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all active:scale-[0.98] h-11 w-full ${
        disabled || isProcessing || status === "success"
          ? "opacity-60 cursor-not-allowed"
          : ""
      } ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={status}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-center gap-2"
        >
          {buttonContent}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
