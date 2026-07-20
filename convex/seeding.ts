import { mutation } from "./_generated/server";

export const seedTenantConfig = mutation({
  args: {},
  handler: async (ctx) => {
    const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";
    const displayName = "Uttaranchal University — Campus Placement Office";
    const inboundWebhookToken = process.env.AUTOMATION_WEBHOOK_SECRET ?? "default_secret";

    const existing = await ctx.db
      .query("tenantConfig")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", tenantId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName,
        inboundWebhookToken,
      });
      return existing._id;
    }

    const id = await ctx.db.insert("tenantConfig", {
      tenantId,
      displayName,
      inboundWebhookToken,
    });
    return id;
  },
});
