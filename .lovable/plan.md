

# Roadmap Management Feature for About Tab

## Overview

Add milestone management capabilities to the About tab in the owner dashboard (`/my-profile/:id`), allowing protocol owners to:

1. **Mark milestones as complete** - Update milestone status from "upcoming" to "completed"
2. **Request timeline variances** - Flag a milestone's date change, which triggers a public "TIMELINE VARIANCE" badge on the profile

These actions require updating the `milestones` JSONB array in the database and will be handled via the existing `update-profile` edge function.

---

## Current State

The About tab currently displays milestones as **read-only** with visual indicators:
- Completed milestones (green checkmark)
- Overdue milestones (red alert)
- Variance requested (yellow badge)
- Locked milestones (lock icon)

**Missing**: Action buttons for owners to change milestone status.

---

## Implementation

### 1. Update Edge Function: Add `milestones` to Editable Fields

Modify `supabase/functions/update-profile/index.ts` to allow milestone updates:

```typescript
const EDITABLE_FIELDS = [
  "website_url",
  "discord_url",
  "telegram_url",
  "media_assets",
  "build_in_public_videos",
  "milestones",  // ADD THIS
];
```

Also update the TypeScript interface to include milestones in the request type.

---

### 2. Create RoadmapManagement Component

Create a new component `src/components/profile/tabs/RoadmapManagement.tsx` that provides:

**For each milestone:**
- Display title and target date
- **"Mark Complete" button** - Changes status to "completed" with completion date
- **"Request Update" button** - Sets `varianceRequested: true` and allows date change
- Visual feedback for each state

**UI Layout:**
```text
+------------------------------------------+
| Milestone: Mainnet V2 Launch             |
| Target: Mar 15, 2025                     |
| Status: UPCOMING                         |
| [Mark Complete] [Request Timeline Update]|
+------------------------------------------+
```

---

### 3. Update AboutTab Component

Modify `src/components/profile/tabs/AboutTab.tsx` to:
- Accept `xUserId` prop (for mutation)
- Replace read-only milestone display with interactive `RoadmapManagement` component
- Show action buttons only for the owner (already enforced by route)

---

### 4. Update MyProfileDetail to Pass xUserId to AboutTab

Currently AboutTab only receives `profile`. Update to also pass `xUserId`:

```tsx
// Before
<AboutTab profile={profile} />

// After
<AboutTab profile={profile} xUserId={user!.id} />
```

---

## Component: RoadmapManagement

### Props
```typescript
interface RoadmapManagementProps {
  profile: ClaimedProfile;
  xUserId: string;
}
```

### Features

1. **Mark Complete**
   - Shows confirmation dialog
   - Updates milestone: `{ status: 'completed', completedAt: ISO date }`
   - Uses `useUpdateProfile` mutation with full milestones array

2. **Request Timeline Update**
   - Sets `varianceRequested: true`
   - Opens date picker for new target date
   - Public profile will show "TIMELINE VARIANCE" badge

3. **Add New Milestone**
   - Optional: Allow adding new milestones with title + date
   - New milestones are unlocked until explicitly locked

4. **Lock Milestones**
   - "Commitment Lock" button to lock all unlocked milestones
   - Once locked, dates can only change via variance request

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/update-profile/index.ts` | Add `milestones` to EDITABLE_FIELDS |
| `src/components/profile/tabs/AboutTab.tsx` | Accept xUserId prop, integrate RoadmapManagement |
| `src/pages/MyProfileDetail.tsx` | Pass xUserId to AboutTab |
| `src/types/index.ts` | Add `completedAt` field to Milestone type |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/components/profile/tabs/RoadmapManagement.tsx` | Interactive milestone management UI |

---

## Milestone Type Update

Add `completedAt` field to track when milestones were completed:

```typescript
export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  isLocked: boolean;
  status: 'upcoming' | 'completed' | 'overdue';
  varianceRequested?: boolean;
  completedAt?: string;      // ADD: ISO date when marked complete
  originalTargetDate?: string; // ADD: Track original date for variance
}
```

---

## UI/UX Considerations

1. **Confirmation dialogs** for destructive actions (marking complete is permanent)
2. **Loading states** during mutation
3. **Toast notifications** on success/failure
4. **Visual hierarchy** - completed items should feel "done"
5. **Empty state** - Encourage adding milestones if none exist

---

## Security

- Ownership verified server-side via `x_user_id` match
- Only the profile owner can see the `/my-profile/:id` route
- Edge function rejects updates from non-owners

---

## Summary

This feature adds interactive roadmap management to the owner's About tab, enabling:

1. One-click milestone completion with timestamp
2. Timeline variance requests with date update
3. New milestone creation (optional)
4. Commitment locking for public accountability

All changes flow through the existing `update-profile` edge function with proper ownership verification.

