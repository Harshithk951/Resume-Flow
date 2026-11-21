import { describe, it, expect } from "vitest";
import { verifyOrderIntegrity, RazorpayOrderData } from "../razorpay";

describe("Razorpay Order Verification & Integrity", () => {
  const validProPassOrder: RazorpayOrderData = {
    id: "order_pro_pass_123",
    amount: 24900, // ₹249 in paise
    currency: "INR",
    status: "paid",
    notes: {
      clerkId: "user_valid_123",
      plan: "pro_pass",
    },
  };

  it("approves genuine valid order with matching user, plan, currency, and amount", () => {
    const res = verifyOrderIntegrity(validProPassOrder, "user_valid_123", "pro_pass");
    expect(res.valid).toBe(true);
    expect(res.reason).toBeUndefined();
  });

  it("approves order where notes uses userId instead of clerkId", () => {
    const orderWithUserId: RazorpayOrderData = {
      ...validProPassOrder,
      notes: {
        userId: "user_valid_123",
        plan: "pro_pass",
      },
    };
    const res = verifyOrderIntegrity(orderWithUserId, "user_valid_123", "pro_pass");
    expect(res.valid).toBe(true);
  });

  it("rejects order with a tampered amount (e.g. paying 100 paise instead of 24900 paise for Pro Pass)", () => {
    const tamperedAmountOrder: RazorpayOrderData = {
      ...validProPassOrder,
      amount: 100, // ₹1 instead of ₹249
    };
    const res = verifyOrderIntegrity(tamperedAmountOrder, "user_valid_123", "pro_pass");
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Amount tampering detected");
  });

  it("rejects order when claimed by the wrong user (notes.clerkId mismatch)", () => {
    const res = verifyOrderIntegrity(validProPassOrder, "attacker_user_456", "pro_pass");
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("User mismatch");
    expect(res.reason).toContain("user_valid_123");
    expect(res.reason).toContain("attacker_user_456");
  });

  it("rejects order when notes are missing user identifiers", () => {
    const orderNoUser: RazorpayOrderData = {
      ...validProPassOrder,
      notes: {
        plan: "pro_pass",
      },
    };
    const res = verifyOrderIntegrity(orderNoUser, "user_valid_123", "pro_pass");
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Order notes missing user identifier");
  });

  it("rejects non-INR currencies (e.g. USD or EUR spoofing)", () => {
    const usdOrder: RazorpayOrderData = {
      ...validProPassOrder,
      currency: "USD",
    };
    const res = verifyOrderIntegrity(usdOrder, "user_valid_123", "pro_pass");
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Currency mismatch");
  });

  it("rejects order when requested plan does not match order notes plan", () => {
    const campusOrder: RazorpayOrderData = {
      id: "order_campus_999",
      amount: 7900,
      currency: "INR",
      status: "paid",
      notes: {
        clerkId: "user_valid_123",
        plan: "campus",
      },
    };
    // User tries to claim "power" or "pro_pass" using a cheaper campus order
    const res = verifyOrderIntegrity(campusOrder, "user_valid_123", "power");
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Amount tampering detected");
  });

  it("rejects zero or negative amount orders", () => {
    const zeroOrder: RazorpayOrderData = {
      ...validProPassOrder,
      amount: 0,
    };
    const res = verifyOrderIntegrity(zeroOrder, "user_valid_123");
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Invalid order amount");
  });
});
