

# Fix EcosystemStats Data Source

## Problem
The `EcosystemStats` component shows "0" or "—" values because the `useEcosystemStats` hook queries the **empty `projects` table** instead of the active `claimed_profiles` table.

## Root Cause
The platform architecture shifted to use `claimed_profiles` as the single source of truth, but the ecosystem stats hook was never updated to reflect this change.

## Solution
Update the `useEcosystemStats` hook to query `claimed_profiles` (verified entries only) instead of `projects`.

---

## Changes Required

| File | Change |
|------|--------|
| `src/hooks/useProjects.ts` | Update `useEcosystemStats` to query `claimed_profiles` table |

---

## Updated Query Logic

```typescript
export function useEcosystemStats() {
  return useQuery({
    queryKey: ['ecosystem-stats'],
    queryFn: async (): Promise<DBEcosystemStats> => {
      const { data, error } = await supabase
        .from('claimed_profiles')  // Changed from 'projects'
        .select('resilience_score, liveness_status')
        .eq('verified', true);     // Only count verified protocols

      if (error) {
        console.error('Error fetching ecosystem stats:', error);
        throw error;
      }

      const profiles = data || [];
      const programsIndexed = profiles.length;
      const totalStaked = 0; // Phase 2 feature - no staking data yet
      const averageScore = programsIndexed > 0
        ? profiles.reduce((sum, p) => sum + (p.resilience_score || 0), 0) / programsIndexed
        : 0;
      const activePrograms = profiles.filter(p => p.liveness_status === 'ACTIVE').length;

      return {
        programsIndexed,
        averageScore: Math.round(averageScore * 10) / 10,
        totalStaked,
        activePrograms,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
```

---

## Expected Results After Fix

Based on the current database data (1 verified protocol with score 30, status ACTIVE):

| Stat | Before | After |
|------|--------|-------|
| Initial Registry | 0 | 1 |
| Beta Benchmark | — | 30.0 |
| Projected TVL | $0K | $0K (Phase 2) |
| Verified Active | 0 | 1 |

