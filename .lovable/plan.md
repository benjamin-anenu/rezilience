

# Option B: Merge Owner Dashboard into `/profile/:id`

## Problem Understood

You want **one URL** (`/profile/:id`) that shows:
- **NEW tabbed UI** when the owner is viewing
- **OLD public view** when a visitor is viewing

Currently there are two separate routes which is confusing:
- `/profile/:id` (ProfileDetail) - shows old public UI for everyone
- `/my-profile/:id` (MyProfileDetail) - shows new tabbed UI (but you never land here)

## Solution

Replace `ProfileDetail.tsx` with the logic from `MyProfileDetail.tsx` that checks ownership and conditionally renders the appropriate UI.

---

## Changes

### 1. Update `src/pages/ProfileDetail.tsx`

Replace the entire file to:
1. Check if current user is the owner (`user.id === profile.xUserId`)
2. If owner: Show the new tabbed UI (ProfileHeroBanner + ProfileTabs)
3. If visitor: Show the existing public view

### 2. Update `src/pages/Dashboard.tsx`

Change navigation from `/my-profile/:id` back to `/profile/:id` since that's now the smart route:

```typescript
// Line 162: Change from
onClick={() => navigate(`/my-profile/${project.id}`)}

// To
onClick={() => navigate(`/profile/${project.id}`)}
```

### 3. Optional Cleanup

- Remove `/my-profile/:id` route from `App.tsx`
- Delete `src/pages/MyProfileDetail.tsx` (no longer needed)

---

## Technical Details

### ProfileDetail.tsx Structure

```text
ProfileDetail Component:
├── Loading state (skeleton)
├── Error state (not found)
├── Check ownership: user.id === profile.xUserId
│   ├── If OWNER:
│   │   ├── ProfileHeroBanner (with "YOUR PROTOCOL" badge)
│   │   └── ProfileTabs (About, Settings, Media, Build In Public, Development)
│   └── If VISITOR:
│       └── Current public view (existing code)
```

### Imports to Add

```typescript
import { ProfileHeroBanner } from '@/components/profile/ProfileHeroBanner';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { AboutTab, SettingsTab, MediaTab, BuildInPublicTab, DevelopmentTab } from '@/components/profile/tabs';
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/ProfileDetail.tsx` | Add ownership check, conditionally render owner UI vs public UI |
| `src/pages/Dashboard.tsx` | Change navigation to `/profile/:id` |
| `src/App.tsx` | Remove `/my-profile/:id` route |
| `src/pages/MyProfileDetail.tsx` | Delete (optional cleanup) |

---

## Result

After this change:
- `/profile/abc123` as **owner** → NEW tabbed UI with editing
- `/profile/abc123` as **visitor** → Public read-only view
- Dashboard click → Goes to `/profile/:id` (shows owner UI)
- Explorer click → Goes to `/profile/:id` (shows public UI)

One URL, two experiences based on who's viewing.

