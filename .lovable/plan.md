

# Fix GitHub OAuth Flow, Score Display, and Private Repo Access

## Issues Identified

### Issue 1: Disconnected Flow After GitHub OAuth
**Problem:** After connecting GitHub, you're redirected to `/profile/:id` (the ProfileDetail page) instead of returning to the onboarding flow. The "Back" button on ProfileDetail uses `navigate(-1)` which takes you back to GitHub (causing a re-auth loop).

**Root Cause:** The `GitHubCallback.tsx` component:
- Line 105-107: Redirects to `/profile/${id}?verified=true` after success
- This breaks the onboarding flow because you never complete Steps 4 (Media) and 5 (Roadmap)

**Solution:** After GitHub verification, redirect back to the ClaimProfile page at Step 4 (Media) instead of directly to the profile page. The profile should only be shown after completing all 5 steps.

---

### Issue 2: Resilience Score Shows 0
**Problem:** The profile displays `0/100` for Resilience Score.

**Root Cause #1 - Not Stored in Database:** The `claimed_profiles` table does NOT have a `score` or `resilience_score` column. The edge function calculates the score but only returns it in the response - it's never persisted.

**Root Cause #2 - Hardcoded Default:** The `useClaimedProfiles.ts` hook (line 55) returns:
```typescript
score: 0, // Will be populated from projects table if linked
```
But no logic exists to actually fetch the score from the `projects` table.

**Solution:** 
1. Store the calculated `resilience_score` and `liveness_status` in the `claimed_profiles` table
2. Update the transform function to read these values from the database

---

### Issue 3: Only One GitHub Profile / No Private Repos
**Problem:** When connecting GitHub, only one account appears and private repositories aren't accessible.

**Root Cause:** The current OAuth scopes are:
```typescript
scope: 'read:user read:org repo'
```

This configuration DOES include `repo` scope which grants access to private repositories. However:
1. **GitHub account selection:** GitHub only shows accounts where you've previously installed the OAuth App. New accounts require a fresh authorization.
2. **Private repo visibility:** The edge function fetches repos via `/user/repos` which includes private repos IF the token has `repo` scope. The issue may be that GitHub's Stats API (`/stats/commit_activity`) can return empty/cached data on first request.

**Solution:** 
- The scopes are correct for private repos
- Add retry logic for GitHub Stats API (it returns 202 while computing stats)
- The "only one profile" is GitHub's OAuth behavior - users see all accounts they have access to

---

## Implementation Plan

### Step 1: Add Score Columns to Database
Add `resilience_score` and `liveness_status` columns to `claimed_profiles` table.

```sql
ALTER TABLE claimed_profiles 
ADD COLUMN IF NOT EXISTS resilience_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS liveness_status text DEFAULT 'STALE';
```

### Step 2: Update Edge Function to Store Score
Modify `github-oauth-callback/index.ts` to include score in the upsert:

**Current (line 300-322):**
```typescript
const claimedProfile = {
  id: profileId,
  project_id: projectId,
  // ... other fields ...
  // score is NOT included
};
```

**Updated:**
```typescript
const claimedProfile = {
  id: profileId,
  project_id: projectId,
  // ... other fields ...
  resilience_score: resilienceScore,
  liveness_status: livenessStatus,
};
```

### Step 3: Update Frontend Hook to Read Score
Modify `useClaimedProfiles.ts` to read the stored score:

**Current (line 55-56):**
```typescript
score: 0, // Will be populated from projects table if linked
livenessStatus: 'active',
```

**Updated:**
```typescript
score: db.resilience_score ?? 0,
livenessStatus: (db.liveness_status?.toLowerCase() as 'active' | 'dormant' | 'degraded') || 'active',
```

### Step 4: Fix the Onboarding Flow
Modify `GitHubCallback.tsx` to return to onboarding instead of profile page:

**Current (lines 92-107):**
```typescript
// Clean up temp storage
localStorage.removeItem('claimingProfile');

// Redirect after brief success message
setTimeout(() => {
  navigate(`/profile/${data.profile?.id}?verified=true`);
}, 2000);
```

**Updated:**
```typescript
// Store verified profile ID for final step
localStorage.setItem('verifiedProfileId', data.profile?.id || '');

// Keep claimFormProgress to resume flow

// Redirect back to onboarding at Step 4 (Media)
setTimeout(() => {
  navigate('/claim-profile?step=4&verified=true');
}, 2000);
```

### Step 5: Update ClaimProfile to Handle Return from OAuth
Add URL parameter handling to resume at the correct step after OAuth:

1. Parse `?step=4&verified=true` from URL
2. Set `currentStep` to 4 if returning from OAuth
3. Add a "Finalize Profile" step after GitHub verification
4. Only redirect to profile page after completing all steps

### Step 6: Add GitHub Stats API Retry Logic
The Stats API returns `202 Accepted` when data is being computed. Add retry:

```typescript
// In github-oauth-callback edge function
let activityData = [];
for (let attempt = 0; attempt < 3; attempt++) {
  const activityRes = await fetch(/* ... */);
  if (activityRes.status === 200) {
    activityData = await activityRes.json();
    break;
  } else if (activityRes.status === 202) {
    await new Promise(r => setTimeout(r, 1000)); // Wait 1 second
  }
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `claimed_profiles` table | Add `resilience_score` and `liveness_status` columns |
| `supabase/functions/github-oauth-callback/index.ts` | Store score in DB, add Stats API retry logic |
| `src/hooks/useClaimedProfiles.ts` | Read score from database instead of hardcoding 0 |
| `src/pages/GitHubCallback.tsx` | Redirect to `/claim-profile?step=4` instead of `/profile/:id` |
| `src/pages/ClaimProfile.tsx` | Handle `?step` URL param, add Step 6 for final submission |

---

## Flow After Fix

```text
Step 1: X Auth → Step 2: Identity → Step 3: Socials
                                         ↓
                               [Connect GitHub button]
                                         ↓
                              GitHub OAuth → Callback
                                         ↓
                               Return to Step 4: Media
                                         ↓
                               Step 5: Roadmap
                                         ↓
                           Step 6: Review & Publish
                                         ↓
                            Navigate to /profile/:id
```

---

## About Private Repositories

The current OAuth scope (`repo`) DOES grant access to private repositories. If you're not seeing private repos:

1. **Check GitHub App permissions:** The OAuth App needs to be authorized for your organizations
2. **Re-authorize:** Try the OAuth flow again - GitHub may ask for additional permissions
3. **Organization access:** For org repos, you may need to request org approval

The scope `read:org` allows reading org membership, and `repo` grants full access to private repos.

