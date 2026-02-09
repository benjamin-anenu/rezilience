

# Implementation Plan: Hybrid Cron Schedule (TVL: 5m, Gov: 30m, GitHub: 2h, Deps: 6h)

## Overview

This plan implements the recommended hybrid refresh schedule that balances data freshness with API rate limits and system stability.

---

## Tiered Schedule

| Dimension | Frequency | Justification |
|-----------|-----------|---------------|
| TVL | Every 5 minutes | DeFi prices fluctuate rapidly; real-time accuracy critical |
| Governance | Every 30 minutes | DAO votes happen frequently; 30m catches most activity |
| GitHub | Every 2 hours | Commits are batched; protects against rate limits |
| Dependencies | Every 6 hours | Crates.io updates slowly; no urgency |

---

## Part 1: Update README Data Provenance

**File: `src/pages/Readme.tsx`**

Update the refresh cadences in the Data Provenance section (lines 447-466):

```typescript
<DataSourceItem
  name="GitHub API"
  description="Commits, Contributors, Releases, Events, Statistics endpoints"
  refresh="Every 2 hours via cron + Manual"
/>
<DataSourceItem
  name="Crates.io Registry"
  description="Cargo.toml parsing for Rust dependency analysis"
  refresh="Every 6 hours via cron + Manual"
/>
<DataSourceItem
  name="DeFiLlama API"
  description="TVL data for DeFi protocols via protocol name mapping"
  refresh="Every 5 minutes (real-time)"
/>
<DataSourceItem
  name="Solana RPC"
  description="Governance transaction history for Squads/Realms addresses"
  refresh="Every 30 minutes"
/>
```

---

## Part 2: Update README FAQ

**File: `src/pages/Readme.tsx`**

Update the FAQ answer (line 495):

**From:**
```
"...Governance checks hourly for DAO activity, and GitHub/Dependencies refresh every 6 hours..."
```

**To:**
```
"Data refreshes on a tiered schedule optimized for each dimension's volatility: TVL updates every 5 minutes for real-time DeFi tracking, Governance checks every 30 minutes for DAO activity, GitHub refreshes every 2 hours, and Dependencies refresh every 6 hours. Protocol owners can also trigger a full manual refresh from their dashboard that analyzes all 4 dimensions simultaneously."
```

---

## Part 3: SQL for pg_cron Jobs

The SQL creates 4 scheduled jobs with the hybrid frequencies:

```sql
-- ============================================================
-- HYBRID CRON SCHEDULE SETUP
-- TVL: 5m | Governance: 30m | GitHub: 2h | Dependencies: 6h
-- ============================================================

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================
-- JOB 1: TVL Refresh - Every 5 minutes (DeFi real-time)
-- ============================================================
SELECT cron.schedule(
  'refresh-tvl-realtime',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://gsphlwjoowqkqhgthxtp.supabase.co/functions/v1/refresh-tvl-realtime',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcGhsd2pvb3dxa3FoZ3RoeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjc1NDgsImV4cCI6MjA4NTkwMzU0OH0.Zc1lcT48v5JLCf6EpNiAtGnOTD8bv526no-f_KC-WPs'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- ============================================================
-- JOB 2: Governance Refresh - Every 30 minutes (DAO tracking)
-- ============================================================
SELECT cron.schedule(
  'refresh-governance-30m',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://gsphlwjoowqkqhgthxtp.supabase.co/functions/v1/refresh-governance-hourly',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcGhsd2pvb3dxa3FoZ3RoeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjc1NDgsImV4cCI6MjA4NTkwMzU0OH0.Zc1lcT48v5JLCf6EpNiAtGnOTD8bv526no-f_KC-WPs'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- ============================================================
-- JOB 3: GitHub Refresh - Every 2 hours (rate-limit safe)
-- ============================================================
SELECT cron.schedule(
  'refresh-github-2h',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://gsphlwjoowqkqhgthxtp.supabase.co/functions/v1/refresh-all-profiles',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcGhsd2pvb3dxa3FoZ3RoeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjc1NDgsImV4cCI6MjA4NTkwMzU0OH0.Zc1lcT48v5JLCf6EpNiAtGnOTD8bv526no-f_KC-WPs'
    ),
    body := '{"dimensions": ["github"]}'::jsonb
  ) AS request_id;
  $$
);

-- ============================================================
-- JOB 4: Dependencies Refresh - Every 6 hours (slow-changing)
-- ============================================================
SELECT cron.schedule(
  'refresh-deps-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://gsphlwjoowqkqhgthxtp.supabase.co/functions/v1/refresh-all-profiles',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcGhsd2pvb3dxa3FoZ3RoeHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjc1NDgsImV4cCI6MjA4NTkwMzU0OH0.Zc1lcT48v5JLCf6EpNiAtGnOTD8bv526no-f_KC-WPs'
    ),
    body := '{"dimensions": ["dependencies"]}'::jsonb
  ) AS request_id;
  $$
);

-- ============================================================
-- VERIFICATION: Check all scheduled jobs
-- ============================================================
SELECT jobid, jobname, schedule, active 
FROM cron.job 
WHERE jobname LIKE 'refresh-%'
ORDER BY jobname;
```

---

## Part 4: Update refresh-all-profiles to Support Dimension Filtering

**File: `supabase/functions/refresh-all-profiles/index.ts`**

Add support for the `dimensions` parameter so GitHub and Dependencies can run independently:

```typescript
// At the start of the try block, after parsing request
const body = await req.json().catch(() => ({}));
const requestedDimensions = body.dimensions || ['github', 'dependencies', 'governance', 'tvl'];

// Then wrap each dimension call in a condition:
if (requestedDimensions.includes('github')) {
  // Call analyze-github-repo
}
if (requestedDimensions.includes('dependencies')) {
  // Call analyze-dependencies
}
// etc.
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Readme.tsx` | Update Data Provenance refresh cadences + FAQ answer |
| `supabase/functions/refresh-all-profiles/index.ts` | Add dimension filtering support |

---

## Summary of Refresh Cadences

```text
┌─────────────────────────────────────────────────────────────┐
│                  HYBRID REFRESH SCHEDULE                    │
├─────────────────┬───────────────┬───────────────────────────┤
│  Dimension      │  Frequency    │  Cron Expression          │
├─────────────────┼───────────────┼───────────────────────────┤
│  TVL            │  Every 5 min  │  */5 * * * *              │
│  Governance     │  Every 30 min │  */30 * * * *             │
│  GitHub         │  Every 2 hrs  │  0 */2 * * *              │
│  Dependencies   │  Every 6 hrs  │  0 */6 * * *              │
│  Manual Refresh │  On-demand    │  All 4 dimensions         │
└─────────────────┴───────────────┴───────────────────────────┘
```

This approach ensures:
- Real-time DeFi accuracy (5-minute TVL)
- Fresh governance data (30-minute DAO tracking)
- Safe GitHub API usage (2-hour cycle avoids rate limits)
- Efficient dependency checks (6-hour slow-changing data)
- Full manual override available to protocol owners

