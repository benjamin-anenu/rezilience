
# Automated Real-Time GitHub Analytics

## Problem Summary

1. **Public repo registrations work correctly** - data is saved during the claim flow via `handleDirectSubmit`
2. **Current refresh is only daily** - the cron job runs once at 6 AM UTC
3. **Manual refresh button is burden** - owners and public viewers shouldn't need to click anything

## Solution: Smart Auto-Refresh System

Implement a "stale data detection" system that automatically refreshes analytics when viewed, eliminating manual intervention.

---

## Architecture

```text
User Views Profile Page
         │
         ▼
┌─────────────────────────┐
│ Check last refresh time │
│ (github_analyzed_at)    │
└──────────┬──────────────┘
           │
           ▼
    ┌──────────────┐
    │ Data stale?  │──── No ───▶ Display cached data
    │ (> 30 mins)  │
    └──────┬───────┘
           │ Yes
           ▼
┌─────────────────────────┐
│ Trigger background      │
│ refresh (non-blocking)  │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Update cache + UI when  │
│ refresh completes       │
└─────────────────────────┘
```

---

## Changes Required

### 1. Update Cron Job Frequency (30-min interval)

**Database**: Update existing cron job

```sql
SELECT cron.unschedule('daily-refresh-profiles');

SELECT cron.schedule(
  'refresh-profiles-30min',
  '*/30 * * * *',  -- Every 30 minutes
  $$
  SELECT net.http_post(
    url:='https://gsphlwjoowqkqhgthxtp.supabase.co/functions/v1/refresh-all-profiles',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ..."}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

### 2. Add Auto-Refresh on Profile View

**File: `src/hooks/useClaimedProfiles.ts`**

| Change | Description |
|--------|-------------|
| Add `useAutoRefreshProfile` hook | Detects stale data and triggers background refresh |
| Check `github_analyzed_at` timestamp | If older than 30 minutes, initiate refresh |
| Non-blocking background refresh | User sees cached data immediately, then updates when fresh |

### 3. Integrate Auto-Refresh into Program Detail Page

**File: `src/pages/ProgramDetail.tsx`**

| Change | Description |
|--------|-------------|
| Import and use `useAutoRefreshProfile` | Pass profile ID and GitHub URL |
| Background refresh with query invalidation | Data updates automatically without page reload |

### 4. Remove Manual Refresh Button (or Make Optional)

**File: `src/components/program/tabs/DevelopmentTabContent.tsx`**

| Change | Description |
|--------|-------------|
| Hide refresh button by default | Since auto-refresh handles updates |
| Optional: Show "Last synced X min ago" | Transparency without requiring action |

---

## Technical Implementation

### New Hook: useAutoRefreshProfile

```typescript
// src/hooks/useAutoRefreshProfile.ts

export function useAutoRefreshProfile(
  profileId: string | undefined,
  githubUrl: string | undefined,
  lastAnalyzedAt: string | undefined
) {
  const queryClient = useQueryClient();
  const { analyzeRepository } = useGitHubAnalysis();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Only run if we have required data
    if (!profileId || !githubUrl) return;

    // Check if data is stale (> 30 minutes old)
    const isStale = !lastAnalyzedAt || 
      (Date.now() - new Date(lastAnalyzedAt).getTime()) > 30 * 60 * 1000;

    if (isStale && !isRefreshing) {
      setIsRefreshing(true);
      
      // Background refresh - non-blocking
      analyzeRepository(githubUrl, profileId)
        .then((result) => {
          if (result) {
            // Invalidate queries to refresh UI with new data
            queryClient.invalidateQueries({ queryKey: ['claimed-profile', profileId] });
          }
        })
        .finally(() => setIsRefreshing(false));
    }
  }, [profileId, githubUrl, lastAnalyzedAt]);

  return { isRefreshing };
}
```

### Integration in ProgramDetail

```typescript
// In ProgramDetail.tsx

import { useAutoRefreshProfile } from '@/hooks/useAutoRefreshProfile';

// After fetching claimedProfile
const { isRefreshing } = useAutoRefreshProfile(
  claimedProfile?.id,
  claimedProfile?.githubOrgUrl,
  claimedProfile?.githubAnalytics?.github_analyzed_at
);

// Optional: Show subtle indicator when refreshing
{isRefreshing && (
  <div className="text-xs text-muted-foreground animate-pulse">
    Updating metrics...
  </div>
)}
```

---

## Benefits

| Feature | Impact |
|---------|--------|
| Zero manual intervention | Public users see fresh data automatically |
| Background refresh | No loading spinners, instant page load |
| 30-min cron backup | Ensures all profiles stay fresh even without views |
| Stale detection | Only refreshes when actually needed |
| Non-blocking UX | Users see cached data immediately, updates flow in |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useAutoRefreshProfile.ts` | **New file** - Auto-refresh logic hook |
| `src/pages/ProgramDetail.tsx` | Integrate auto-refresh hook |
| `src/components/program/tabs/DevelopmentTabContent.tsx` | Remove/hide manual refresh button |
| Database (cron.job) | Update schedule from daily to every 30 minutes |

---

## Summary

- **Public repos already work** - data saves correctly during registration
- **Problem is refresh frequency** - daily cron is too infrequent
- **Solution is auto-refresh on view** - stale data triggers background update
- **30-min cron as backup** - ensures coverage for profiles not actively viewed

This approach means:
- **Developers/founders**: No extra work, analytics update automatically
- **Public users**: Always see reasonably fresh data (max 30 min old)
- **GitHub API**: Rate-limited responsibly (only refreshes stale profiles)
