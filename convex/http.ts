import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/api/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
    }

    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing Svix headers", { status: 400 });
    }

    const rawBody = await request.text();
    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
      evt = wh.verify(rawBody, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch {
      return new Response("Invalid signature", { status: 400 });
    }

    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;
      await ctx.runMutation(api.users.createFromClerk, {
        clerkId: id,
        email: email_addresses[0]?.email_address ?? "",
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }),
});

http.route({
  path: "/api/webhooks/make/import-job",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const rawBody = await request.text();
    const signature = request.headers.get("x-resumeflow-signature");
    const secret = process.env.AUTOMATION_WEBHOOK_SECRET ?? "";

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const encoder = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );
      const sigBuffer = new Uint8Array(
        (signature.match(/[\da-f]{2}/gi) ?? []).map((h) => parseInt(h, 16))
      );
      const isValid = await crypto.subtle.verify(
        "HMAC",
        cryptoKey,
        sigBuffer,
        encoder.encode(rawBody)
      );

      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const body = JSON.parse(rawBody);
      const { tenantId, inboundWebhookToken, targetScope, jobDetails, filters } = body;

      if (!tenantId) {
        return new Response(JSON.stringify({ error: "Missing tenantId" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const config = await ctx.runQuery(internal.jobs.getTenantConfig, { tenantId });
      if (!config) {
        return new Response(JSON.stringify({ error: "Tenant not authorized" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (inboundWebhookToken !== config.inboundWebhookToken) {
        return new Response(JSON.stringify({ error: "Unauthorized tenant key" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (targetScope === "broadcast") {
        if (!jobDetails || !filters) {
          return new Response(JSON.stringify({ error: "Missing jobDetails or filters" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const result = await ctx.runMutation(internal.jobs.executeMultiTenantBroadcast, {
          tenantId,
          companyName: jobDetails.companyName,
          jobTitle: jobDetails.jobTitle,
          rawJdText: jobDetails.rawJdText,
          minCgpa: parseFloat(filters.minCgpa),
          targetBranch: filters.targetBranch,
        });

        return new Response(JSON.stringify({ status: "success", count: result.count }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ status: "skipped", reason: "Unsupported targetScope" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("Webhook processing error:", err);
      return new Response(JSON.stringify({ error: err.message || String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

http.route({
  path: "/api/webhooks/razorpay",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing x-razorpay-signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!webhookSecret) {
      console.error("[Razorpay Webhook] Missing RAZORPAY_WEBHOOK_SECRET");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ─── Verify HMAC SHA256 signature ────────────────────────
    try {
      const encoder = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );
      const sigBuffer = new Uint8Array(
        (signature.match(/[\da-f]{2}/gi) ?? []).map((h) => parseInt(h, 16))
      );
      const isValid = await crypto.subtle.verify(
        "HMAC",
        cryptoKey,
        sigBuffer,
        encoder.encode(rawBody)
      );

      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (err: any) {
      console.error("[Razorpay Webhook] Signature verification error:", err);
      return new Response(JSON.stringify({ error: "Signature verification failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ─── Parse and process event ─────────────────────────────
    try {
      const event = JSON.parse(rawBody);
      const eventType = event.event;

      console.log(`[Razorpay Webhook] Received event: ${eventType}`);

      if (eventType === "payment.captured") {
        const payment = event.payload?.payment?.entity;
        const notes = payment?.notes || {};
        const { clerkId, plan, interval } = notes as {
          clerkId?: string;
          plan?: "pro" | "campus";
          interval?: string;
        };

        if (clerkId && plan && (plan === "pro" || plan === "campus")) {
          console.log(
            `[Razorpay Webhook] Upgrading user ${clerkId} to ${plan} (triggered by payment.captured)`
          );
          await ctx.runMutation(internal.users.upgradeUserPlan, {
            clerkId,
            plan,
          });
        } else {
          console.warn(
            "[Razorpay Webhook] payment.captured missing clerkId/plan in notes:",
            { clerkId, plan, interval, paymentId: payment?.id }
          );
        }
      } else if (eventType === "payment.failed") {
        const payment = event.payload?.payment?.entity;
        const errorDescription = payment?.error_description || "Unknown error";
        console.warn(
          `[Razorpay Webhook] Payment failed: ${payment?.id}, order: ${payment?.order_id}, reason: ${errorDescription}`
        );
        // No user action needed — the client-side handler shows the error
      } else {
        // Log other events (payment.authorized, order.paid, etc.)
        console.log(`[Razorpay Webhook] Unhandled event type: ${eventType}`);
      }

      // Always return 200 to acknowledge receipt
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (err: any) {
      console.error("[Razorpay Webhook] Event processing error:", err);
      return new Response(JSON.stringify({ error: err.message || "Event processing failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
