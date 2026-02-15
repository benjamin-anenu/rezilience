

# Fix Team Tab Black Screen + Sync with Public Layout

## Root Cause

The owner's Team tab renders `TeamManagement`, a completely separate component from the public `TeamTabContent`. `TeamManagement` uses `useBlocker()` from react-router-dom, which conflicts with tab switching (which uses `setSearchParams`). Despite the memoization and mount guard fixes, `useBlocker` still intercepts the search-param navigation that occurs when switching tabs, causing the black screen/glitch.

The Development tab was fixed by replacing the custom owner component with the shared `DevelopmentTabContent`. The Team tab needs the same treatment.

## Solution

Render the public `TeamTabContent` as the base display for owners too, then add an edit overlay/controls on top. Remove `useBlocker` entirely -- it's the source of the glitch.

## Implementation

### File: `src/pages/ProfileDetail.tsx`

**Replace the owner's team tab content** (line 279-281):

Change from:
```tsx
team: (
  <TeamManagement profile={profile} xUserId={user!.id} />
),
```

To:
```tsx
team: (
  <div className="space-y-6">
    {/* Public-facing team display (same as visitor view) */}
    <TeamTabContent
      teamMembers={profile.teamMembers}
      stakingPitch={profile.stakingPitch}
      isVerified={profile.verified}
      claimStatus={claimStatus}
      ownerUsername={profile.xUsername}
      ownerLogoUrl={profile.logoUrl}
      ownerProjectName={profile.projectName}
      ownerAvatarUrl={profile.xAvatarUrl}
      ownerDisplayName={profile.xDisplayName}
    />
    {/* Owner-only: Team & Pitch editor below */}
    <TeamManagement profile={profile} xUserId={user!.id} />
  </div>
),
```

### File: `src/components/profile/tabs/TeamManagement.tsx`

**Remove `useBlocker` entirely** to eliminate the glitch source:

1. Remove `useBlocker` import from react-router-dom
2. Remove the `isMounted` state and effect (mount guard)
3. Remove the `shouldBlock` callback and `useBlocker` call
4. Remove the `AlertDialog` for the navigation blocker at the bottom of the component
5. Keep `beforeunload` handler (covers browser close/refresh)
6. Keep `hasChanges` memoization and the fixed save bar

This removes the only code path that causes the black screen. The `beforeunload` event still protects against accidental data loss when closing the browser tab.

## Summary of Changes

| File | Change |
|------|--------|
| `src/pages/ProfileDetail.tsx` | Owner team tab shows `TeamTabContent` (public display) + `TeamManagement` (edit controls) |
| `src/components/profile/tabs/TeamManagement.tsx` | Remove `useBlocker` and related AlertDialog, mount guard, and callback |

