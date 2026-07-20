# ResumeFlow Load Testing

Artillery-based load testing suite for measuring 10k+ concurrent user scale-readiness.

## Prerequisites

```bash
# Artillery is installed as a dev dependency
npm install

# Set your target URL (defaults to http://localhost:3000)
export TARGET_URL=https://resumeflow.harshithkumar.in
# For local testing:
export TARGET_URL=http://localhost:3000

# Set auth tokens — load tests require valid Clerk sessions
export CLERK_TOKEN=<test-user-jwt>
```

## Tests

### 1. Dashboard Load Test — 10k Concurrent Users

Simulates 10,000 concurrent users loading the dashboard simultaneously.

```bash
npx artillery run scripts/load-test/dashboard-load.yml
```

### 2. Placement Drive Burst — 2k Concurrent createJob

Simulates a placement drive where 2,000 students submit the same job description simultaneously.

```bash
npx artillery run scripts/load-test/create-job-burst.yml
```

### 3. Sustained Chat Traffic

Simulates sustained AI chat traffic with varying message lengths.

```bash
npx artillery run scripts/load-test/chat-traffic.yml
```

## Reporting

Artillery generates JSON reports in `scripts/load-test/reports/`:

```bash
npx artillery run --output scripts/load-test/reports/dashboard.json scripts/load-test/dashboard-load.yml
npx artillery report scripts/load-test/reports/dashboard.json
```

## Baseline Metrics to Capture

| Metric | Target | Notes |
|--------|--------|-------|
| p50 latency | < 500ms | Dashboard loads |
| p95 latency | < 2s | Under 10k concurrent |
| p99 latency | < 5s | Worst-case scenarios |
| Error rate | < 1% | All endpoints |
| Compile success rate | > 99% | LaTeX PDF generation |
