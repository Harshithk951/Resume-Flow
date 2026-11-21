// lib/security/razorpay.ts
//
// Razorpay Order Verification & Integrity Check
// Validates order amount, currency (INR), and user ownership (notes.clerkId / notes.userId).

export interface RazorpayOrderData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  notes?: Record<string, string>;
}

export function getRazorpayApiCredentials(): { key_id: string; key_secret: string } {
  const key_id =
    process.env.RAZORPAY_KEY_ID ??
    process.env.RAZOR_PAY_TEST ??
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ??
    "";
  const key_secret =
    process.env.RAZORPAY_KEY_SECRET ??
    process.env.RAZOR_PAY_SECRET ??
    "";

  if (!key_id || !key_secret) {
    throw new Error("RAZORPAY_CREDS_MISSING: Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
  }

  return { key_id, key_secret };
}

/**
 * Fetches an order from the Razorpay API by Order ID.
 */
export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrderData> {
  if (!orderId || typeof orderId !== "string") {
    throw new Error("INVALID_ORDER_ID: orderId must be a valid non-empty string");
  }

  const { key_id, key_secret } = getRazorpayApiCredentials();
  const authHeader = "Basic " + Buffer.from(`${key_id}:${key_secret}`).toString("base64");

  const response = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`RAZORPAY_API_ERROR: HTTP ${response.status} - ${errorBody}`);
  }

  return response.json();
}

/**
 * Known valid price thresholds in paise (INR)
 */
export const ALLOWED_PLAN_PRICES: Record<string, number[]> = {
  pro_pass: [24900],
  pro: [19900, 199000],
  power: [39900, 399000],
  team: [50000],
  campus: [7900, 78000],
};

/**
 * Verifies that an order has not been tampered with and belongs to the specified user.
 */
export function verifyOrderIntegrity(
  order: RazorpayOrderData,
  expectedClerkId: string,
  expectedPlan?: string
): { valid: boolean; reason?: string } {
  if (!order) {
    return { valid: false, reason: "Order data is null or undefined" };
  }

  // 1. Check Currency (must be INR)
  if (order.currency?.toUpperCase() !== "INR") {
    return {
      valid: false,
      reason: `Currency mismatch: expected INR, received ${order.currency}`,
    };
  }

  // 2. Check User Association
  const orderUser = order.notes?.clerkId || order.notes?.userId;
  if (!orderUser) {
    return {
      valid: false,
      reason: "Order notes missing user identifier (notes.clerkId / notes.userId)",
    };
  }

  if (orderUser !== expectedClerkId) {
    return {
      valid: false,
      reason: `User mismatch: order was created for user "${orderUser}", but attempted claim by "${expectedClerkId}"`,
    };
  }

  // 3. Check Plan & Amount Integrity
  if (expectedPlan) {
    const normalizedPlan = expectedPlan.toLowerCase();
    const validAmounts = ALLOWED_PLAN_PRICES[normalizedPlan];

    if (validAmounts && !validAmounts.includes(order.amount)) {
      return {
        valid: false,
        reason: `Amount tampering detected: plan "${expectedPlan}" cannot cost ${order.amount} paise (expected one of [${validAmounts.join(", ")}])`,
      };
    }

    if (order.notes?.plan && order.notes.plan.toLowerCase() !== normalizedPlan) {
      return {
        valid: false,
        reason: `Plan mismatch: order was created for "${order.notes.plan}", but requested "${expectedPlan}"`,
      };
    }
  }

  // 4. General sanity check on amount
  if (typeof order.amount !== "number" || order.amount <= 0) {
    return {
      valid: false,
      reason: `Invalid order amount: ${order.amount}`,
    };
  }

  return { valid: true };
}
