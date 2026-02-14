

# Fix: Persist GitHub Analysis + Full Draft Save/Resume

## Two Problems, One Fix

**Problem 1 — GitHub OAuth fires at final stage**: The `githubAnalysisResult` (score, repo URL, metrics from Step 3) is NOT saved to localStorage. If the component re-renders or state is lost, Step 5 falls into Case 3 (GitHub OAuth) instead of Case 2 (direct submit), triggering a second scan on the wrong repo and producing a different score.

**Problem 2 — No draft persistence across sessions**: If the user signs out or closes the browser, all form progress is lost. The user wants to resume exactly where they left off after signing back in.

## Changes — Single File: `src/pages/ClaimProfile.tsx`

### 1. Persist `githubAnalysisResult` to localStorage

Add `githubAnalysisResult` to the save effect (line 164) alongside all other form fields:

```
githubAnalysisResult,
```

Add it to the dependency array of that effect (line 179).

### 2. Persist additional state that is currently lost

Also add these fields to the save/restore cycle so the full draft is complete:
- `logoUrl` — project logo chosen in Step 2
- `authorityData` — SIWS verification result
- `authorityVerified` — boolean flag
- `programVerified` — boolean flag
- `githubVerified` — boolean flag (if came back from OAuth previously)

### 3. Restore all persisted fields on mount

In the restore effect (lines 182-202), add restore logic for each new field:

```typescript
if (data.githubAnalysisResult) setGithubAnalysisResult(data.githubAnalysisResult);
if (data.logoUrl) setLogoUrl(data.logoUrl);
if (data.authorityData) setAuthorityData(data.authorityData);
if (data.authorityVerified) setAuthorityVerified(data.authorityVerified);
if (data.programVerified) setProgramVerified(data.programVerified);
if (data.githubVerified) setGithubVerified(data.githubVerified);
```

### 4. Add "Draft saved" indicator (optional UX touch)

Show a subtle "Draft saved" label near the step indicator so the user knows their progress is being auto-saved and will be there when they return.

### 5. Clear draft on successful submission (already done)

Line 425 already calls `localStorage.removeItem('claimFormProgress')` on success — no change needed here.

## What This Fixes

- **No more GitHub OAuth at Step 5**: The `githubAnalysisResult` is always available, so Step 5 always renders Case 2 ("COMPLETE REGISTRATION") with the original score.
- **Full session resume**: User can sign out after Step 4, sign back in days later, and all fields (project name, description, GitHub analysis score, logo, milestones, media, authority data) are restored. They land on the exact step they left off.
- **No score drop**: The original analysis result (score 35) is preserved — no second scan ever runs.

## No Other Files Change

The save/restore logic is entirely within `ClaimProfile.tsx`. The edge function, components, and other pages are unaffected.

