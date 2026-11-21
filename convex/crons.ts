import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "process-webhook-queue",
  { minutes: 1 },
  internal.webhooks.processWebhookQueueWorker
);

crons.interval(
  "cleanup-stuck-optimizations",
  { minutes: 5 },
  internal.optimizations.cleanupStuckOptimizations
);

export default crons;
