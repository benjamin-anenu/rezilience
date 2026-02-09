

# Implementation Plan: Full-Spectrum Manual Refresh + Tiered Cron Jobs

## Executive Summary

This implementation addresses two critical gaps in the data freshness architecture:

1. **Manual Refresh Gap**: Currently only triggers GitHub analysis (40% of score). Must trigger all 4 dimensions.
2. **Stale Cron Data**: Daily refresh is too slow for volatile metrics like Governance (hourly events) and TVL (minute-by-minute fluctuations).

---

## Part 1: Full-Spectrum Manual Refresh

### Current State (Broken)

```text
User clicks "Refresh Metrics"
        ↓
ProfileDetail.tsx → analyze-github-repo (ONLY)
        ↓
40% of score updated, 60% remains stale
```

### Target State

```text
User clicks "Refresh Metrics"
        ↓
ProfileDetail.tsx → analyze-github-repo (40%)
                  → analyze-dependencies (25%)
                  → analyze-governance (20%)
                  → analyze-tvl (15%)
        ↓
100% of score updated, integrated score recalculated
```

### Technical Changes

**File: `src/pages/ProfileDetail.tsx`**

Update `handleRefresh` function to call all 4 edge functions in parallel:

```typescript
const handleRefresh = async () => {
  if (!profile?.githubOrgUrl || !profile?.id) {
    toast({ title: 'Cannot refresh', description: 'No GitHub URL configured', variant: 'destructive' });
    return;
  }
  
  setIsRefreshing(true);
  try {
    // Call ALL 4 dimension analyses in parallel
    const [githubResult, depsResult, govResult, tvlResult] = await Promise.allSettled([
      // 1. GitHub (40%)
      supabase.functions.invoke('analyze-github-repo', {
        body: { github_url: profile.githubOrgUrl, profile_id: profile.id },
      }),
      // 2. Dependencies (25%)
      supabase.functions.invoke('analyze-dependencies', {
        body: { github_url: profile.githubOrgUrl, profile_id: profile.id },
      }),
      // 3. Governance (20%) - only if multisig configured
      profile.governanceMetrics?.governance_address
        ? supabase.functions.invoke('analyze-governance', {
            body: { governance_address: profile.governanceMetrics.governance_address, profile_id: profile.id },
          })
        : Promise.resolve({ data: null }),
      // 4. TVL (15%) - only for DeFi category
      profile.category === 'defi'
        ? supabase.functions.invoke('analyze-tvl', {
            body: { protocol_name: profile.projectName, profile_id: profile.id, monthly_commits: profile.githubAnalytics?.commits_30d || 30 },
          })
        : Promise.resolve({ data: null }),
    ]);

    // Check for any errors
    const errors = [githubResult, depsResult, govResult, tvlResult]
      .filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error));
    
    if (errors.length > 0) {
      console.warn('Some dimension analyses failed:', errors);
    }

    // Invalidate queries to show new data
    await queryClient.invalidateQueries({ queryKey: ['claimed-profile', profile.id] });
    await queryClient.invalidateQueries({ queryKey: ['claimed-profiles'] });
    
    toast({ 
      title: 'Full refresh complete', 
      description: `All 4 dimensions analyzed and score recalculated.` 
    });
  } catch (err) {
    console.error('Refresh exception:', err);
    toast({ title: 'Refresh failed', description: 'Please try again later', variant: 'destructive' });
  } finally {
    setIsRefreshing(false);
  }
};
```

### Integrated Score Recalculation

The edge functions already update their respective columns. We need to ensure the integrated score is recalculated after all 4 dimensions update. This will be handled by adding a database trigger or by explicitly calling a recalculation in the last step.

**Option A (Preferred)**: Create a new edge function `recalculate-integrated-score` that is called after all dimension updates.

**Option B**: Move the integrated score calculation into a Postgres trigger that fires on ANY update to dimension columns.

For this implementation, we'll add the recalculation logic directly to the manual refresh flow.

---

## Part 2: Tiered Cron Job Architecture

### Current State

```text
refresh-all-profiles (DAILY)
├── analyze-github-repo
├── analyze-dependencies
├── analyze-governance
└── analyze-tvl
```

### Target State

```text
┌─────────────────────────────────────────────────────────────┐
│                     CRON SCHEDULE                            │
├─────────────────┬───────────────┬───────────────────────────┤
│  Dimension      │  Frequency    │  Justification            │
├─────────────────┼───────────────┼───────────────────────────┤
│  GitHub         │  Every 6 hrs  │  Commits are batched      │
│  Dependencies   │  Daily        │  Crates.io updates slowly │
│  Governance     │  Hourly       │  DAO votes happen fast    │
│  TVL            │  Every 5 min  │  DeFi fluctuates rapidly  │
└─────────────────┴───────────────┴───────────────────────────┘
```

### Technical Implementation

**New Edge Functions**:

1. **`refresh-governance-hourly`** - Loops through all profiles with `multisig_address`, calls `analyze-governance`
2. **`refresh-tvl-realtime`** - Loops through all DeFi profiles, calls `analyze-tvl`

**SQL for pg_cron Jobs**:

```sql
-- Governance: Every hour at minute 0
SELECT cron.schedule(
  'refresh-governance-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://gsphlwjoowqkqhgthxtp.supabase.co/functions/v1/refresh-governance-hourly',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- TVL: Every 5 minutes
SELECT cron.schedule(
  'refresh-tvl-realtime',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://gsphlwjoowqkqhgthxtp.supabase.co/functions/v1/refresh-tvl-realtime',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- GitHub: Every 6 hours
SELECT cron.schedule(
  'refresh-github-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://gsphlwjoowqkqhgthxtp.supabase.co/functions/v1/refresh-all-profiles',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
    body := '{"dimensions": ["github", "dependencies"]}'::jsonb
  );
  $$
);
```

---

## Part 3: Update README Documentation

### Current Data Provenance Section (Lines 446-472)

```typescript
<DataSourceItem
  name="GitHub API"
  description="..."
  refresh="Every 30 minutes via cron"  // INCORRECT
/>
<DataSourceItem
  name="Crates.io Registry"
  refresh="On profile update"  // INCORRECT
/>
<DataSourceItem
  name="DeFiLlama API"
  refresh="Daily"  // INCORRECT
/>
<DataSourceItem
  name="Solana RPC"
  refresh="On profile update"  // INCORRECT
/>
```

### Updated Data Provenance Section

```typescript
<DataSourceItem
  name="GitHub API"
  description="Commits, Contributors, Releases, Events, Statistics endpoints"
  refresh="Every 6 hours via cron + Manual"
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
  refresh="Every hour"
/>
<DataSourceItem
  name="OtterSec API"
  description="Bytecode fingerprinting for originality classification"
  refresh="On verification request (static)"
/>
```

### Update FAQ Answer

**Current (Line 495)**:
```
"GitHub metrics are refreshed every 30 minutes via automated cron jobs. TVL data updates daily."
```

**Updated**:
```
"Data refreshes on a tiered schedule optimized for each dimension's volatility: TVL updates every 5 minutes for real-time DeFi tracking, Governance checks hourly for DAO activity, and GitHub/Dependencies refresh every 6 hours. Protocol owners can also trigger a full manual refresh from their dashboard."
```

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `supabase/functions/refresh-governance-hourly/index.ts` | Hourly governance cron job |
| `supabase/functions/refresh-tvl-realtime/index.ts` | 5-minute TVL cron job |

### Modified Files

| File | Changes |
|------|---------|
| `src/pages/ProfileDetail.tsx` | Update `handleRefresh` to call all 4 edge functions |
| `src/pages/Readme.tsx` | Update Data Provenance section with new refresh cadences |
| `supabase/config.toml` | Add new edge functions with `verify_jwt = false` |

---

## Edge Cases Handled

| Case | Handling |
|------|----------|
| No governance address | Skip governance refresh (neutral score) |
| Non-DeFi category | Skip TVL refresh (neutral score) |
| Edge function timeout | Promise.allSettled catches failures, partial refresh succeeds |
| Rate limiting (GitHub) | 2-second delay between profiles in cron job |
| DeFiLlama API down | Returns 0 TVL, doesn't crash |
| Solana RPC congestion | Returns last known governance tx count |

---

## Implementation Sequence

1. Create `refresh-governance-hourly` edge function
2. Create `refresh-tvl-realtime` edge function
3. Update `supabase/config.toml` with new function configs
4. Update `ProfileDetail.tsx` with full-spectrum manual refresh
5. Update `Readme.tsx` Data Provenance section
6. Update `Readme.tsx` FAQ answer
7. Deploy edge functions
8. Create pg_cron SQL jobs (via Cloud SQL editor)
9. Test manual refresh end-to-end
10. Monitor cron job execution logs

