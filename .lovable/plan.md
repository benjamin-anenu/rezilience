

# Fix About Tab Editing + STALE Status for Solo Builders

## Problem 1: Can't Edit Website or Add Media

The owner's About tab shows the read-only `AboutTabContent`. The website URL editor is buried inside the Support tab (under Settings). The `MediaTab` component exists in the codebase but is **never rendered** anywhere in the owner's profile view -- so there's literally no way to add images or videos.

### Fix

Add the `MediaTab` and `SettingsTab` (website/socials editor) directly below the read-only `AboutTabContent` in the owner's About tab, so owners can manage their project's About page content in one place.

**File: `src/pages/ProfileDetail.tsx`**

Change the owner's `about` tab from:
```tsx
about: (
  <AboutTabContent ... />
),
```
To:
```tsx
about: (
  <div className="space-y-6">
    <AboutTabContent ... />
    {/* Owner editing controls */}
    <SettingsTab profile={profile} xUserId={user!.id} />
    <MediaTab profile={profile} xUserId={user!.id} />
  </div>
),
```

Also add `MediaTab` to the imports.

---

## Problem 2: STALE Status Despite 299 Commits

The liveness check in `analyze-github-repo` edge function requires **3 or more contributors** to qualify as "ACTIVE":

```
if (daysSinceLastActivity <= 14 && hasMeaningfulActivity && hasMinContributors)
```

Your project has 1 contributor and 299 commits in 30 days. Because `hasMinContributors` (>=3) fails, it falls to the else branch and gets "STALE" (since last activity is within 45 days).

This is too punitive for solo builders and early-stage projects.

### Fix

Lower the minimum contributor threshold from 3 to 1. A solo builder with high commit activity should absolutely qualify as ACTIVE. The contributor diversity score (0-25 points) already penalizes solo projects in the score calculation -- there's no need to double-penalize via the status label.

**File: `supabase/functions/analyze-github-repo/index.ts`**

Change line 377:
```typescript
const hasMinContributors = contributorCount >= 3;
```
To:
```typescript
const hasMinContributors = contributorCount >= 1;
```

This means ACTIVE now requires: activity in last 14 days + 5 or more weighted events + at least 1 contributor. Solo builders with real commits will correctly show "ACTIVE".

---

## Summary

| File | Change |
|------|--------|
| `src/pages/ProfileDetail.tsx` | Add `SettingsTab` and `MediaTab` to owner's About tab |
| `supabase/functions/analyze-github-repo/index.ts` | Lower min contributors for ACTIVE status from 3 to 1 |

After deploying, you'll need to hit the "Refresh" button on your profile to re-analyze and update the status from STALE to ACTIVE.

