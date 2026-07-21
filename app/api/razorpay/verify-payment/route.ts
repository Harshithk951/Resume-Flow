// app/api/razorpay/verify-payment/route.ts
// Verifies Razorpay payment signature and upgrades the user's plan.
// Called from the Razorpay checkout handler on the client.
// Uses CONVEX_DEPLOY_KEY for server-side Convex auth (same pattern as compile-worker).

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Calls a Convex internal mutation via the HTTP API using a deploy key.
 * Matches the pattern used in app/api/compile-worker/route.ts.
 */
async function callConvexMutation(
  convexUrl: string,
  functionPath: string,
  args: Record<string, unknown>,
  deployKey: string,
): Promise<unknown> {
  const response = await fetch(`${convexUrl}/api/mutation/${functionPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${deployKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ args }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Convex mutation ${functionPath} failed: ${response.status} ${body}`);
  }

  return response.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      clerkId,
      plan,
    } = body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      clerkId: string;
      plan: "pro" | "campus";
    };

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !clerkId || !plan) {
      return NextResponse.json(
        { error: "Missing required payment verification fields" },
        { status: 400 }
      );
    }

    // ─── Step 1: Verify HMAC Signature ──────────────────────────
    const secret =
      process.env.RAZORPAY_KEY_SECRET ?? process.env.RAZOR_PAY_SECRET ?? "";
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      console.error("[Razorpay] Signature mismatch — possible tampering", {
        razorpay_order_id,
        razorpay_payment_id,
      });
      return NextResponse.json(
        { error: "Payment signature verification failed" },
        { status: 400 }
      );
    }

    // ─── Step 2: Update user plan in Convex ─────────────────────
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const deployKey = process.env.CONVEX_DEPLOY_KEY;

    if (!convexUrl || !deployKey) {
      console.error("[Razorpay] Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_DEPLOY_KEY");
      return NextResponse.json(
        { error: "Server configuration error — deploy key not configured" },
        { status: 500 }
      );
    }

    const result = (await callConvexMutation(
      convexUrl,
      "users:upgradeUserPlan",
      { clerkId, plan },
      deployKey,
    )) as { success: boolean; plan: string };

    if (!result.success) {
      throw new Error("Failed to upgrade user plan");
    }

    console.log(
      `[Razorpay] Payment verified & plan upgraded: ${clerkId} → ${plan}`
    );

    return NextResponse.json(
      {
        success: true,
        plan: result.plan,
        message: `Successfully upgraded to ${plan} plan!`,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[Razorpay] Verify payment error:", err);
    return NextResponse.json(
      { error: err.message ?? "Payment verification failed" },
      { status: 500 }
    );
  }
}
