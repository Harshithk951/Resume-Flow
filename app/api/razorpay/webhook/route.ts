// app/api/razorpay/webhook/route.ts
//
// Razorpay Webhook Handler
// Securely processes asynchronous payment events directly from Razorpay.
// - Verifies HMAC-SHA256 signature using RAZORPAY_WEBHOOK_SECRET
// - Idempotent processing by payment_id
// - Automatically provisions plan upgrades even if user closed browser checkout modal

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
    }

    const secret =
      process.env.RAZORPAY_WEBHOOK_SECRET ??
      process.env.RAZORPAY_KEY_SECRET ??
      process.env.RAZOR_PAY_SECRET ??
      "";

    if (!secret) {
      console.error("[Razorpay-Webhook] Webhook secret not configured");
      return NextResponse.json({ error: "Server webhook configuration error" }, { status: 500 });
    }

    // ── Step 1: Verify Webhook HMAC Signature ──
    const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    if (expectedSignature !== signature) {
      console.error("[Razorpay-Webhook] Signature verification failed");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    // ── Step 2: Parse Webhook Event ──
    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const paymentId = paymentEntity?.id;
      const orderId = paymentEntity?.order_id || "";
      const notes = paymentEntity?.notes || {};
      const clerkId = notes.clerkId;
      const plan = notes.plan;
      const amount = paymentEntity?.amount;

      if (paymentId && clerkId && plan) {
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        const deployKey = process.env.CONVEX_DEPLOY_KEY;

        if (convexUrl && deployKey) {
          await callConvexMutation(
            convexUrl,
            "users:upgradeUserPlanWithPayment",
            {
              clerkId,
              plan,
              paymentId,
              orderId,
              amount,
              source: "webhook",
            },
            deployKey
          );
          console.log(`[Razorpay-Webhook] Processed payment ${paymentId} for ${clerkId} (${plan})`);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook processing error";
    console.error("[Razorpay-Webhook] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
