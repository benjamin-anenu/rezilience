

## Fix Score Discrepancies

### Fix 1: Ecosystem Pulse Average (27.1 vs 39)

**File:** `src/hooks/useEcosystemPulse.ts`, function `computeAggregates`

Change the average score calculation to exclude zero-scored profiles (matching the logic used by `useHeroStats` and `useEcosystemStats`):

```
// Current (buggy): divides by ALL profiles
const avgScore = total > 0 
  ? profiles.reduce((s, p) => s + (p.resilience_score || 0), 0) / total 
  : 0;

// Fixed: exclude unscored profiles
const scoredProfiles = profiles.filter(p => (p.resilience_score || 0) > 0);
const avgScore = scoredProfiles.length > 0
  ? scoredProfiles.reduce((s, p) => s + (p.resilience_score || 0), 0) / scoredProfiles.length
  : 0;
```

This brings all three displays (Hero, Explorer Stats, Ecosystem Pulse) into alignment at ~39.

### Fix 2: Score Chart vs Hero Score Divergence

**Root cause:** The `refresh-all-profiles` edge function updates `resilience_score` on the live profile, but the `score_history` snapshot is written at a different point in the refresh cycle -- potentially before all dimension analyses (dependencies, governance, TVL) complete. This causes the snapshot score to diverge from the final computed score.

**Fix approach:** In the `refresh-all-profiles` edge function, ensure the `score_history` INSERT happens **after** the final `resilience_score` is written to `claimed_profiles`, and reads the score directly from the freshly-updated profile row rather than computing it independently.

**File:** `supabase/functions/refresh-all-profiles/index.ts`

The specific change: after the profile's `resilience_score` is updated, the snapshot should read `resilience_score` from the profile itself (single source of truth) rather than recalculating it. This guarantees the chart and the hero always show the same number for any given date.

### Summary

| Change | File | What |
|--------|------|------|
| Average calculation | `src/hooks/useEcosystemPulse.ts` | Exclude score=0 profiles from average |
| Snapshot consistency | `supabase/functions/refresh-all-profiles/index.ts` | Write score_history from the final profile score, not a separate calculation |

Two targeted fixes. No UI layout changes, no new dependencies.

