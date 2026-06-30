import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "process-webhook-queue",
  { minutes: 1 },
  internal.webhooks.processWebhookQueueWorker
);

export default crons;
