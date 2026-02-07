

# Fix: Resilience Score and GitHub Data Showing Zero

## Root Cause Analysis

The database record for this profile shows:
- `resilience_score: 0`
- `github_commits_30d: 0`
- `github_contributors: 0`
- All other metrics: `0` or `null`

**Why this happened:** When the profile was created via GitHub OAuth:

1. The `github-oauth-callback` function only fetches **basic repository data** (stars, forks, is_fork)
2. It calculates a simple resilience score but does **NOT** call the comprehensive `analyze-github-repo` function
3. The extended analytics fields (`github_commits_30d`, `github_top_contributors`, `github_recent_events`, etc.) are never populated

The `analyze-github-repo` function contains all the logic to fetch commits, events, contributors, and calculate proper scores - but it's only called by:
- Daily cron job (may not have run yet)
- Manual refresh from Dashboard's profile edit page

---

## Solution: Two-Part Fix

### Part 1: Add Refresh Button to Public Program Detail Page

Add a "Refresh Data" button on the Development tab so owners can manually trigger a data refresh.

**File: `src/components/program/tabs/DevelopmentTabContent.tsx`**

Add a refresh button next to the GitHub Metrics section header that calls the `analyze-github-repo` function.

### Part 2: Auto-Fetch Full Analytics on Profile Creation

Modify `github-oauth-callback` to call `analyze-github-repo` after creating a profile to ensure all data is populated immediately.

**File: `supabase/functions/github-oauth-callback/index.ts`**

After saving the profile, make an internal call to `analyze-github-repo` to populate complete metrics.

---

## Technical Implementation

### DevelopmentTabContent.tsx Changes

Add refresh functionality to the Development tab:

```tsx
// Add imports
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGitHubAnalysis } from '@/hooks/useGitHubAnalysis';
import { useQueryClient } from '@tanstack/react-query';

// Inside component - add refresh handler
const { analyzeRepository, isAnalyzing } = useGitHubAnalysis();
const queryClient = useQueryClient();

const handleRefresh = async () => {
  if (!githubUrl || !projectId) return;
  
  const result = await analyzeRepository(githubUrl, projectId);
  if (result) {
    // Invalidate queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ['claimed-profile', projectId] });
    toast({ title: 'Data Refreshed', description: `Score: ${result.resilienceScore}/100` });
  }
};

// Add button to UI near PublicGitHubMetrics
<Button 
  variant="outline" 
  size="sm" 
  onClick={handleRefresh}
  disabled={isAnalyzing}
>
  <RefreshCw className={`mr-2 h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
  Refresh Data
</Button>
```

### github-oauth-callback/index.ts Changes

After successfully saving the profile, call `analyze-github-repo` to populate full metrics:

```typescript
// After line 356 (after saving profile)

// Trigger full analytics fetch to populate all fields
if (githubOrgUrl && savedProfile?.id) {
  try {
    const analyzeUrl = `${supabaseUrl}/functions/v1/analyze-github-repo`;
    await fetch(analyzeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        github_url: githubOrgUrl,
        profile_id: savedProfile.id,
      }),
    });
    console.log("Triggered full analytics fetch for new profile");
  } catch (err) {
    console.error("Failed to trigger analytics fetch:", err);
    // Non-blocking - profile was still created successfully
  }
}
```

---

## Immediate Fix for Existing Profile

To fix the current profile immediately, we can manually call the analyze function. This will populate all the missing data.

The edge function test I ran shows the repo **does have data**:
- Commits in 30 days: 20
- Push Events: 20
- Contributors: 1
- Resilience Score: 30 (calculated correctly)
- Liveness Status: ACTIVE

Once the code changes are implemented, clicking "Refresh Data" will populate all these values.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/program/tabs/DevelopmentTabContent.tsx` | Add Refresh Data button with `useGitHubAnalysis` hook |
| `supabase/functions/github-oauth-callback/index.ts` | Call `analyze-github-repo` after profile creation |

---

## Summary

| Issue | Solution |
|-------|----------|
| Zero data on new profiles | Auto-call `analyze-github-repo` on profile creation |
| Can't refresh data on public page | Add "Refresh Data" button to Development tab |
| Missing extended metrics | Both solutions populate all fields via `analyze-github-repo` |

