# Free-Tier Limits Runbook

Last updated: July 2026

This document tracks the current free-tier caps for all services ResumeFlow depends on,
along with monitoring instructions and escalation procedures when a cap is approached.

---

## 1. Vercel Hobby Plan

| Cap | Limit | Metric Key | Notes |
|---|---|---|---|
| Bandwidth | **100 GB/month** | `metrics:usage:vercel:bandwidth_bytes` | Combined egress for all routes, API, and static assets |
| Serverless Function Execution Time | **10s per invocation** | — | Hard timeout; compile workers are offloaded to QStash/Oracle (Phase 2/3) |
| Serverless Function Concurrency | **1,000 concurrent invocations** | `metrics:usage:vercel:function_invocations` | Burst limit across all functions |
| Serverless Function Invocations | **500K per month** | `metrics:usage:vercel:function_invocations` | Per-function and aggregate |
| Build Minutes | **6,000 min/month** | `metrics:usage:vercel:build_minutes` | Resets monthly |
| Storage (Images, etc.) | **1 GB** | — | Only logo + hero-poster in public/ |

### Monitoring

- Dashboard: https://vercel.com/resumeflow/dashboard/usage
- Alerts: Set up a Vercel Usage webhook → Slack (see `convex/webhooks.ts`)
- Metric: `VERCEL_FUNCTION_INVOCATIONS` is incremented in API routes; monitor against 500K/mo

### Escalation

- **Bandwidth > 80 GB**: Verify CDN cache headers are active (Phase 6d). Check if any route is missing caching.
- **Function invocations > 400K**: Add tighter Redis caching on heavy queries. Increase stale-while-revalidate TTLs.
- **Build minutes > 4,500**: Audit unnecessary dependencies. Consider `output: "standalone"` to reduce build size.

---

## 2. Convex Free Plan

| Cap | Limit | Metric Key | Notes |
|---|---|---|---|
| Function Calls | **1M per month** | `metrics:usage:convex:function_calls` | Includes queries, mutations, and actions |
| Database Reads | **5M per month** | — | Each `.collect()`, `.first()`, `.unique()` = 1+ read |
| Database Writes | **100K per month** | — | Each `.insert()`, `.patch()`, `.replace()` = 1 write |
| Storage (Files) | **1 GB** | `metrics:usage:convex:storage_bytes` | PDFs, uploads |
| Egress Bandwidth | **100 GB/month** | `metrics:usage:convex:data_read_bytes` | Query result sizes |

### Monitoring

- Dashboard: https://dashboard.convex.dev/deployment/<deployment>/usage
- Metric: `CONVEX_FUNCTION_CALLS` is incremented in action wrappers
- Metric: `CONVEX_DATA_READ_BYTES` — estimate from query result sizes
- Key surface: `getMyJobsEnriched` was optimized in Phase 6c to not over-fetch `rawJdText`

### Escalation

- **Function calls > 800K**: Tighten `getDashboardStats` caching. Reduce polling interval from 10s to 30s.
- **Database reads > 4M**: Audit queries that call `.collect()` on large tables (jobs, tailoredResumes). Add pagination.
- **Storage > 800 MB**: Add a TTL cleanup mutation for old generated PDFs (> 30 days).

---

## 3. Upstash Redis Free Plan

| Cap | Limit | Metric Key | Notes |
|---|---|---|---|
| Daily Commands | **10,000 per day** | `metrics:usage:upstash:commands` | Each INCR, GET, SET = 1 command |
| Storage | **100 MB** | `metrics:usage:upstash:memory_bytes` | Cache entries + circuit breaker state |
| Concurrent Connections | **20** | — | Shared across serverless functions |
| Data Transfer | **2 GB/month** | — | Combined upload/download |

### Monitoring

- Dashboard: https://console.upstash.com/redis/<database>/monitoring
- Metric: `UPSTASH_COMMANDS` tracked in `lib/tracing.ts` incrementMetric calls
- Metric: `UPSTASH_MEMORY_BYTES` — estimated from cache entry sizes

### Escalation

- **Commands > 8,000/day**: The main consumers are circuit breaker state checks + compile cache + JD analysis cache. If approaching limit, increase compile cache TTL (currently 7 days) or circuit breaker cooldown (currently 30s).
- **Storage > 80 MB**: Run `redis-cli --scan --pattern 'cache:*' | head -1000` to audit cache entry sizes. Add TTL enforcement on all keys.
- **Key evictions**: Check Upstash dashboard for `evicted_keys` — indicates memory pressure. Shorten TTLs on non-critical caches.

---

## 4. Other Services

### Clerk Auth (Free Plan)

| Cap | Limit |
|---|---|
| Monthly Active Users | 10,000 |
| Authentication Events | 100K/month |
| Team Members | 3 |
| Organization Limit | 1 |

### QStash (Free Plan)

| Cap | Limit |
|---|---|
| Messages per Month | 10,000 |
| Message Size | 64 KB |
| Retention | 3 days |

### NVIDIA NIM (Free API)

| Cap | Limit |
|---|---|
| Rate Limit | ~5 req/s per model |
| Daily Cap | Varies by model |

### Tavily Search (Free API)

| Cap | Limit |
|---|---|
| API Calls per Month | 1,000 |
| Rate Limit | 1 req/s |

---

## 5. Proactive Limit-Approach Procedure

When any usage metric reaches **80% of its cap**:

1. **Identify the consumer**: Check the `metrics:*` keys in Redis to see which operations are driving usage.
2. **Apply the cheapest fix first**:
   - Increase cache TTL (compile cache: 7d → 14d; JD analysis: 48h → 72h)
   - Increase stale-while-revalidate window
   - Tighten rate-limits for non-authenticated endpoints
   - Add pagination to list queries
3. **If still > 80%**: Reduce polling intervals on the dashboard (10s → 30s).
4. **If > 95%**: Consider a temporary feature toggle (e.g., disable circuit breaker health checks to save Redis commands).

**Never upgrade to a paid plan without explicit approval.** The fix is always a smarter caching/dedup/rate-limit strategy.

---

## 6. How to Read the Metrics

All metrics are stored in Redis under `metrics:*` keys. To read them:

```bash
# Via Upstash CLI (if installed):
redis-cli KEYS "metrics:*"

# Or via the metric endpoints (if exposed):
curl -H "Authorization: Bearer $UPSTASH_TOKEN" \
  "$UPSTASH_REDIS_REST_URL" \
  -d '["KEYS", "metrics:*"]'
```

Each metric is a cumulative counter. To compute rate (per hour/day): diff two readings over a time window, then divide by the window duration.

For duration metrics (e.g., NIM latency), key pattern is `metrics:nim:latency_sum` and `metrics:nim:latency_count`. Average = sum / count.
