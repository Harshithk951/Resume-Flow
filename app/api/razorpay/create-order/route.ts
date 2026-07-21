// app/api/razorpay/create-order/route.ts
// Creates a Razorpay order for the selected plan.
// Called from the client when user clicks "Upgrade".

import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// ─── Plan → Price Configuration ───────────────────────────────
// Amounts are in the smallest currency unit (paise for INR, cents for USD).
// Keep in sync with the pricing UI in components/blocks/pricing-section.tsx
// Amounts are in the smallest currency unit (paise for INR).
// Unit prices match the UI: Pro ₹199/mo (monthly) or ₹149/mo (yearly).
// For yearly billing, amount = per-month price × 12 (charged once annually).
const PLAN_PRICES: Record<
  string,
  Record<string, { amount: number; currency: string }>
> = {
  pro: {
    monthly: { amount: 19900, currency: "INR" },     // ₹199 one-time monthly charge
    yearly: { amount: 178800, currency: "INR" },     // ₹149 × 12 = ₹1,788/year
  },
  campus: {
    monthly: { amount: 7900, currency: "INR" },      // ₹79 one-time monthly charge
    yearly: { amount: 78000, currency: "INR" },      // ₹65 × 12 = ₹780/year
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
      interval: "monthly" | "yearly";
      clerkId?: string;
    };

    // Validate plan
    const priceConfig = PLAN_PRICES[plan]?.[interval];
    if (!priceConfig) {
      return NextResponse.json(
        { error: `Invalid plan "${plan}" or interval "${interval}"` },
        { status: 400 }
      );
    }

    if (!clerkId) {
      return NextResponse.json(
        { error: "Missing clerkId — required for webhook reconciliation" },
        { status: 400 }
      );
    }

    const { key_id, key_secret } = getRazorpayCredentials();
    const razorpay = new Razorpay({ key_id, key_secret });

    const options = {
      amount: priceConfig.amount,
      currency: priceConfig.currency,
      receipt: `receipt_${plan}_${interval}_${Date.now()}`,
      notes: {
        plan,
        interval,
        clerkId, // stored for webhook reconciliation
      },
    };

    const order = await razorpay.orders.create(options);

    // Return key_id so client can initialize checkout without relying on NEXT_PUBLIC_ env
    return NextResponse.json(
      {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        key_id, // Client uses this to initialize Razorpay checkout
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
