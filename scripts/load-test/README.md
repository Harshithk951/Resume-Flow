# ResumeFlow Load Testing

Artillery-based load testing suite for measuring 10k+ concurrent user scale-readiness.

## Prerequisites

```bash
# Artillery is installed as a dev dependency
npm install

# Set your Convex deployment URL (Convex HTTP API target)
export CONVEX_URL=https://dynamic-warthog-953.convex.cloud
```

## Authentication — Multi-User Token Pool

Load tests distribute virtual users across a pool of real Clerk-authenticated identities.
This ensures each simulated user has their own rate-limit allowance, credit balance, and data.

### Step 1: Generate test users

```bash
# Get your Clerk API key from https://dashboard.clerk.com → API Keys
export CLERK_SECRET_KEY='sk_test_...'

# Generate 50 Pro-plan test users (adjust count for your needs)
./scripts/load-test/generate-test-users.sh 50
```

This creates `scripts/load-test/test-users.csv` with columns `userId,clerkToken`.
Each user:
- Email: `loadtest-N@resumeflow.dev`
- Plan: free (metadata marked as loadtest)
- Credits: default (10000)

> **Note:** Free-tier users have a 20-message/day chat limit and 500 credits/resume cost.
> For high-volume tests, update the script to set plan: "pro" via Clerk metadata after creation,
> or use the Convex dashboard to upgrade test users manually.

### Step 2: Verify tokens are valid

```bash
# Quick check — count how many tokens we have
wc -l scripts/load-test/test-users.csv

# Spot-check a token (replace N with a row number)
sed -n '2p' scripts/load-test/test-users.csv
```

The Artillery YAML files reference the CSV via `payload` config — users are
distributed randomly across virtual users.

## Tests

### 1. Dashboard Load Test — 10k Concurrent Users

Simulates 10,000 concurrent users loading the dashboard simultaneously.
Each VU hits `getDashboardStats`, `getDashboardSummary`, and `getMyJobs`.

```bash
npx artillery run --output scripts/load-test/reports/dashboard.json \
  scripts/load-test/dashboard-load.yml
```

### 2. Placement Drive Burst — 2k Concurrent createJob

Simulates a placement drive where 2,000 students submit the same job description.
Each VU sends an `idempotencyKey` (random 32-char string) to prevent duplicate jobs
on retry. With JD-hash caching (Phase 1c), only the first unique request triggers the
full LLM pipeline.

```bash
npx artillery run --output scripts/load-test/reports/create-job.json \
  scripts/load-test/create-job-burst.yml
```

### 3. Sustained Chat Traffic

Simulates sustained AI chat traffic with varying message lengths.
Each user sends 2 messages with realistic pauses between them.

```bash
npx artillery run --output scripts/load-test/reports/chat.json \
  scripts/load-test/chat-traffic.yml
```

## Reporting

Generate HTML reports from the JSON output:

```bash
npx artillery report scripts/load-test/reports/dashboard.json
npx artillery report scripts/load-test/reports/create-job.json
npx artillery report scripts/load-test/reports/chat.json
```

Reports open in your browser automatically.

## Baseline Metrics Targets

| Metric | Target | Notes |
|--------|--------|-------|
| p50 latency | < 500ms | Dashboard loads |
| p95 latency | < 2s | Under 10k concurrent |
| p99 latency | < 5s | Worst-case scenarios |
| Error rate | < 1% | All endpoints (excluding expected rate-limit rejections) |
| Compile success rate | > 99% | LaTeX PDF generation |

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| All requests 401 | Missing/invalid `CLERK_SECRET_KEY` | Regenerate test users with valid Clerk key |
| Only ~20 chat requests succeed | Free-tier chat rate limit (20/day) | Use Pro-plan users or increase user pool |
| `createJob` errors after ~5 requests | Resume rate limit | Use Pro-plan users or increase user pool |
| `ENOENT: test-users.csv` | CSV doesn't exist | Run `generate-test-users.sh` first |
| Slow responses (>30s) | NIM/Tavily upstream latency | Expected — Phase 4 will add circuit breakers |
