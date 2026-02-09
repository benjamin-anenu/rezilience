
# Auto-Analyze Unclaimed Profiles with GitHub URLs

## The Problem

Currently, unclaimed profiles like Drift Protocol V2 sit in the registry with:
- `resilience_score: 0`
- `liveness_status: STALE`
- `github_analyzed_at: null`

This gives users no visibility into the actual health of these projects, making the registry look incomplete and the data stale.

## The Solution

Automatically analyze unclaimed profiles that have a public GitHub URL, keeping their metrics fresh just like claimed profiles. This provides:

1. **Accurate Discovery** - Users see real liveness status (ACTIVE/STALE/DECAYING) for unclaimed projects
2. **Trend Tracking** - Score history is captured for sparkline charts in Explorer
3. **Informed Claims** - Builders see current health before claiming
4. **Active Registry** - No "dead" entries with zero scores

---

## Technical Approach

### Option A: Extend Existing Cron Job (Recommended)

Modify `refresh-all-profiles` to also include unclaimed profiles with GitHub URLs:

**Current Query:**
```sql
SELECT id, project_name, github_org_url 
FROM claimed_profiles 
WHERE verified = true 
AND github_org_url IS NOT NULL
```

**New Query:**
```sql
SELECT id, project_name, github_org_url 
FROM claimed_profiles 
WHERE (verified = true OR claim_status = 'unclaimed')
AND github_org_url IS NOT NULL
```

This is the simplest approach - one line change in the edge function.

### Option B: Immediate Analysis on Insert (Additional)

When seeding a new unclaimed profile, trigger an immediate analysis so it appears with real data right away:

1. Add a database trigger or modify the seed process
2. Call `analyze-github-repo` immediately after insert
3. Profile shows up with real metrics from day one

---

## Implementation Details

### Part 1: Update refresh-all-profiles

**File:** `supabase/functions/refresh-all-profiles/index.ts`

Change line 29 from:
```typescript
.eq("verified", true)
```

To:
```typescript
.or("verified.eq.true,claim_status.eq.unclaimed")
```

This single change ensures:
- All verified (claimed) profiles get refreshed
- All unclaimed profiles with GitHub URLs get refreshed
- Score history is captured for trend charts
- Liveness status stays accurate

### Part 2: Immediate Analysis for New Unclaimed Profiles

Create a utility function to analyze a profile immediately after seeding:

**Approach:** When inserting unclaimed profiles (like Drift), immediately call the analyze function to populate metrics.

For the existing Drift Protocol entry, we can trigger a manual analysis to populate its data now.

### Part 3: Auto-Refresh on Explorer View (Optional Enhancement)

The Explorer page could trigger background refreshes for stale unclaimed profiles when they're viewed, similar to how the profile detail page works.

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/refresh-all-profiles/index.ts` | Update query to include unclaimed profiles |

## Files to Create (Optional)

| File | Purpose |
|------|---------|
| `supabase/functions/seed-unclaimed-profile/index.ts` | Helper to seed + immediately analyze unclaimed profiles |

---

## Immediate Action: Analyze Drift Protocol

After updating the cron job, we can immediately trigger an analysis for Drift Protocol V2 to populate its real metrics:

```
POST /analyze-github-repo
{
  "github_url": "https://github.com/drift-labs/protocol-v2",
  "profile_id": "27bb7693-d7c8-47a1-b8da-f0d7a9730f7a"
}
```

This will:
- Calculate the real resilience score
- Determine liveness status (likely ACTIVE given Drift's activity)
- Populate all GitHub metrics (stars, forks, contributors, etc.)
- Create a score history entry for trend charts

---

## Expected Outcome

After implementation, Drift Protocol V2 in the Explorer will show:
- Real resilience score (likely 60-80+ given their activity)
- Accurate liveness badge (likely "ACTIVE")
- Stars, forks, contributors data
- Sparkline trend chart (after a few cron cycles)
- "UNCLAIMED" badge still visible
- "Claim This" CTA still available

---

## Testing Checklist

- Verify refresh-all-profiles includes unclaimed profiles
- Trigger manual analysis for Drift Protocol
- Confirm Drift shows real metrics in Explorer
- Verify score history is being captured
- Check sparkline chart shows data after refresh cycles
- Ensure claimed profiles still refresh normally

---

## Summary

This is a minimal change (one line in the cron job) with maximum impact. All unclaimed profiles with GitHub URLs will be actively monitored, making the registry feel alive and providing real value to users browsing for projects to claim or support.
