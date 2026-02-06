

# Investigation Results: Explorer & Score Issues

## Issues Found

### Issue 1: Explorer Not Fetching Real-Time Data

**Root Cause:** The Explorer uses `useExplorerProjects()` which is a standard React Query hook with `staleTime: undefined` (defaults to 0, but no refetch triggers). The data is only fetched on mount or manual invalidation.

**There is NO real-time subscription** to the `claimed_profiles` table. The code uses:
```typescript
return useQuery({
  queryKey: ['explorer-projects'],
  queryFn: async () => { /* fetch from claimed_profiles */ }
});
```

This is a one-time fetch that only updates when:
- The component mounts
- Manual query invalidation occurs
- User navigates away and back

**Solution:** Add Supabase Realtime subscription to `claimed_profiles` table changes, then invalidate the query when updates occur.

---

### Issue 2: Score History Chart Not Showing

**Root Cause:** The `score_history` table is **EMPTY** (query returned `[]`).

The `analyze-github-repo` edge function **does NOT insert into `score_history`**. Looking at the code:
- It updates `claimed_profiles` with the new score (lines 326-354)
- But there's **no `score_history.insert()` call**

The `fetch-github` edge function DOES insert into `score_history`, but that's for the `projects` table, not `claimed_profiles`.

**Your profile is in `claimed_profiles`, NOT `projects`.** The score history hook queries:
```typescript
.from('score_history')
.eq('project_id', projectId)  // Uses claimed_profiles.id but score_history is empty
```

**Solution:** Add `score_history` insert in `analyze-github-repo` after updating the profile.

---

### Issue 3: Activity Recorded as "Low" Despite Active Work

**Root Cause (ALREADY FIXED):** Looking at the edge function logs, your profile now correctly shows:
```
Multi-signal activity: pushes=20, PRs=0, issues=0, ... totalActivity=40, status=ACTIVE
```

The **database has the correct data**:
- `liveness_status: ACTIVE`
- `github_push_events_30d: 20`
- `github_commits_30d: 20`
- `github_last_activity: 2026-02-06 20:37:23` (today!)

**Why UI might show "Low":** The velocity bar shows "Low Activity" because it's calculated as:
```typescript
const v = velocity || 0;  // 0.67 commits/day
const percent = Math.min(v * 20, 100);  // 13.3%
// percent <= 30 = "Low"
```

A velocity of 0.67 commits/day maps to 13% on the bar, which is labeled "Low" (threshold is >30% for "Moderate").

This is a **threshold calibration issue**, not a data issue. 20 commits in 30 days = 0.67/day is actually reasonable for many projects.

---

### Issue 4: GitHub Metrics Labeled "STALE"

**Root Cause:** I need to check the UI display. According to the database:
```
liveness_status: ACTIVE  ← Database says ACTIVE
```

But the `PublicGitHubMetrics` component **re-calculates** the status locally:
```typescript
const healthStatus = getHealthStatus(
  extendedAnalytics?.github_last_activity || analytics?.github_last_commit,
  ...
);
```

**The issue:** The `githubAnalytics` object in `transformToClaimedProfile()` is **missing the multi-signal fields**:

```typescript
// Lines 76-92 of useClaimedProfiles.ts
githubAnalytics: {
  github_org_url: db.github_org_url || undefined,
  github_stars: db.github_stars ?? undefined,
  // ... other fields
  github_is_fork: db.github_is_fork ?? undefined,
  // MISSING: github_push_events_30d, github_pr_events_30d, github_issue_events_30d, github_last_activity
}
```

The new multi-signal fields added in the database migration are **NOT being transformed** to the frontend! The UI falls back to `github_last_commit` which may be older than `github_last_activity`.

---

## Summary of Root Causes

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Explorer not real-time | No Supabase Realtime subscription | Add realtime listener that invalidates query |
| Score History empty | `analyze-github-repo` doesn't insert to `score_history` | Add score_history insert after profile update |
| Activity "Low" label | Velocity thresholds too aggressive (0.67/day = "Low") | Adjust velocity bar thresholds |
| Metrics "STALE" | Multi-signal fields not mapped in `transformToClaimedProfile()` | Add missing fields to DB→Frontend transform |

---

## Implementation Plan

### 1. Fix Missing Multi-Signal Fields Transform
**File:** `src/hooks/useClaimedProfiles.ts`

Add the new database columns to `DBClaimedProfile` interface and `transformToClaimedProfile()`:
```typescript
interface DBClaimedProfile {
  // ... existing fields
  github_push_events_30d: number | null;
  github_pr_events_30d: number | null;
  github_issue_events_30d: number | null;
  github_last_activity: string | null;
}

// In transformToClaimedProfile():
githubAnalytics: {
  // ... existing fields
  github_push_events_30d: db.github_push_events_30d ?? undefined,
  github_pr_events_30d: db.github_pr_events_30d ?? undefined,
  github_issue_events_30d: db.github_issue_events_30d ?? undefined,
  github_last_activity: db.github_last_activity || undefined,
}
```

**File:** `src/types/index.ts`

Update `GitHubAnalytics` interface:
```typescript
export interface GitHubAnalytics {
  // ... existing fields
  github_push_events_30d?: number;
  github_pr_events_30d?: number;
  github_issue_events_30d?: number;
  github_last_activity?: string;
}
```

### 2. Add Score History Insert
**File:** `supabase/functions/analyze-github-repo/index.ts`

After updating `claimed_profiles`, insert into `score_history`:
```typescript
// After the claimed_profiles update (around line 354)
await supabase.from("score_history").insert({
  project_id: profile_id,
  score: result.resilienceScore,
  commit_velocity: result.commitVelocity,
  days_last_commit: result.daysSinceLastCommit,
  breakdown: {
    activity: totalActivity,
    contributors: contributorCount,
    stars: result.stars,
    releases: result.releasesLast30Days,
    age: daysActive,
  },
});
```

### 3. Add Realtime Subscription for Explorer
**File:** `src/hooks/useExplorerProjects.ts`

Add Supabase Realtime subscription:
```typescript
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useExplorerProjects() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('explorer-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'claimed_profiles', filter: 'verified=eq.true' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['explorer-projects'] });
        }
      )
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);
  
  return useQuery({ /* existing */ });
}
```

**Database:** Enable realtime for `claimed_profiles`:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.claimed_profiles;
```

### 4. Adjust Velocity Thresholds
**File:** `src/components/program/PublicGitHubMetrics.tsx`

Adjust `getVelocityInfo()` thresholds:
```typescript
const getVelocityInfo = (velocity?: number): { percent: number; label: string; color: string } => {
  const v = velocity || 0;
  // Normalize: 2 commits/day = 100% (more realistic for solo/small team)
  const percent = Math.min(v * 50, 100);
  
  if (percent > 50) return { percent, label: 'High', color: 'bg-primary' };
  if (percent > 20) return { percent, label: 'Moderate', color: 'bg-yellow-500' };
  if (percent > 0) return { percent, label: 'Active', color: 'bg-green-500' };  // Changed from "Low"
  return { percent: 0, label: 'None', color: 'bg-muted' };
};
```

---

## Technical Notes

- The database already has the correct data (ACTIVE status, 20 push events)
- The problem is the **data pipeline** from DB → Frontend is incomplete for new fields
- Realtime requires enabling the publication on the table first
- Score history needs to be inserted for the chart to populate over time

