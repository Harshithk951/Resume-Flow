// app/api/razorpay/create-order/route.ts
// Creates a Razorpay order for the selected plan.
// Called from the client when user clicks "Upgrade".

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Razorpay from "razorpay";

// ─── Plan → Price Configuration ───────────────────────────────
// Amounts are in the smallest currency unit (paise for INR).
// Pro Pass: ₹249 one-time (24900 paise)
// Pro: ₹199/mo (19900 paise) or ₹1,990/yr (199000 paise)
// Power: ₹399/mo (39900 paise) or ₹3,990/yr (399000 paise)
// Team: ₹500 min top-up (50000 paise)
// Campus: ₹79/mo (7900 paise) or ₹780/yr (78000 paise)
const PLAN_PRICES: Record<
  string,
  Record<string, { amount: number; currency: string }>
> = {
  pro_pass: {
    once: { amount: 24900, currency: "INR" },
    monthly: { amount: 24900, currency: "INR" },
    yearly: { amount: 24900, currency: "INR" },
  },
  pro: {
    monthly: { amount: 19900, currency: "INR" },
    yearly: { amount: 199000, currency: "INR" },
    once: { amount: 19900, currency: "INR" },
  },
  power: {
    monthly: { amount: 39900, currency: "INR" },
    yearly: { amount: 399000, currency: "INR" },
    once: { amount: 39900, currency: "INR" },
  },
  team: {
    once: { amount: 50000, currency: "INR" },
    monthly: { amount: 50000, currency: "INR" },
    yearly: { amount: 50000, currency: "INR" },
  },
  campus: {
    monthly: { amount: 7900, currency: "INR" },
    yearly: { amount: 78000, currency: "INR" },
    once: { amount: 7900, currency: "INR" },
  },
};

function getRazorpayCredentials() {
  const key_id = process.env.RAZORPAY_KEY_ID ?? process.env.RAZOR_PAY_TEST;
  const key_secret =
    process.env.RAZORPAY_KEY_SECRET ?? process.env.RAZOR_PAY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials not configured");
  }

  return { key_id, key_secret };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, interval, clerkId } = body as {
      plan: string;
      interval?: "monthly" | "yearly" | "once";
      clerkId?: string;
    };

    const intervalKey = interval || (plan === "pro_pass" || plan === "team" ? "once" : "monthly");
    const priceConfig =
      PLAN_PRICES[plan]?.[intervalKey] ||
      PLAN_PRICES[plan]?.["monthly"] ||
      PLAN_PRICES[plan]?.["once"];

    if (!priceConfig) {
      return NextResponse.json(
        { error: `Invalid plan "${plan}" or interval "${interval}"` },
        { status: 400 }
      );
    }

    let finalClerkId = clerkId;
    if (!finalClerkId) {
      try {
        const { userId } = await auth();
        if (userId) finalClerkId = userId;
      } catch {
        // Clerk auth extraction attempt
      }
    }

    if (!finalClerkId) {
      return NextResponse.json(
        { error: "Missing clerkId — required for payment reconciliation" },
        { status: 400 }
      );
    }

    const { key_id, key_secret } = getRazorpayCredentials();
    const razorpay = new Razorpay({ key_id, key_secret });

    const options = {
      amount: priceConfig.amount,
      currency: priceConfig.currency,
      receipt: `receipt_${plan}_${intervalKey}_${Date.now()}`,
      notes: {
        plan,
        interval: intervalKey,
        clerkId: finalClerkId,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(
      {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        key_id,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[Razorpay] Create order error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to create order" },
      { status: 500 }
    );
  }
}
