

# My Registry Dashboard - Personalized Tabbed Experience

## Overview

Transform the current `/profile/:id` page into a sophisticated, personalized dashboard similar to the `/program/:id` page when the owner is viewing. The dashboard will feature a tabbed interface with granular editing capabilities:

- **About Tab**: View-only (project name, description, category are protected)
- **Settings Tab**: Editable fields (website URL, social links)
- **Media Tab**: Manage images and demo videos for the About section
- **Build In Public Tab**: Manage video updates with link, title, description, and upload date
- **Development Tab**: View GitHub analytics (read-only)

---

## Architecture

### New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/MyProfileDetail.tsx` | Owner-only dashboard with premium tabbed UI |
| `src/components/profile/ProfileTabs.tsx` | Tab navigation component (mirrors ProgramTabs) |
| `src/components/profile/tabs/AboutTab.tsx` | Read-only About section |
| `src/components/profile/tabs/SettingsTab.tsx` | Editable website, socials |
| `src/components/profile/tabs/MediaTab.tsx` | Manage media assets |
| `src/components/profile/tabs/BuildInPublicTab.tsx` | Manage video updates |
| `src/components/profile/tabs/DevelopmentTab.tsx` | GitHub analytics view |
| `src/components/profile/ProfileHeroBanner.tsx` | Owner-specific hero with edit indicators |
| `src/hooks/useUpdateProfile.ts` | Mutation hook for profile updates |
| `supabase/functions/update-profile/index.ts` | Edge function for secure updates |

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add route for `/my-profile/:id` |
| `src/pages/Dashboard.tsx` | Update card click to navigate to `/my-profile/:id` |
| `src/types/index.ts` | Add `BuildInPublicEntry` type with description field |

---

## Tab Structure

### 1. About Tab (View-Only)

Displays protected information that cannot be edited:
- Project name (locked)
- Description (locked, shows rich text)
- Category badge (locked)
- Verification status and date
- Current Resilience Score

Shows a subtle "Protected fields" indicator explaining these require review to change.

### 2. Settings Tab (Editable)

Editable fields with inline save:
- **Website URL** - Text input with validation
- **Discord URL** - Text input
- **Telegram URL** - Text input

Each field saves individually on blur or via explicit save button.

### 3. Media Tab (Editable)

Manage media assets for the About page gallery:
- Add images (URL input)
- Add YouTube videos (URL input)
- Add video files (URL input)
- Reorder with drag/arrows
- Delete existing items
- Limit: 5 assets

Re-uses logic from existing `MediaUploader` component but adapted for in-place editing.

### 4. Build In Public Tab (Editable)

Manage transparency updates via X/Twitter video links:

**Add New Entry Form:**
- Twitter/X Video Link URL (required)
- Title (required, max 100 chars)
- Description (optional, max 280 chars - tweet length)
- Auto-captures upload date when saved

**Existing Entries List:**
- Thumbnail preview (or X icon placeholder)
- Title and description
- Date uploaded
- "View on X" button
- Delete button

**X Encouragement Banner:**
"Post video updates on your official X account to build transparency. Link them here to showcase your Build In Public journey!"

### 5. Development Tab (View-Only)

Shows GitHub analytics (same as ProgramDetail DevelopmentTabContent):
- Repository stats (stars, forks, contributors)
- Commit velocity
- Recent activity events
- Language breakdown

---

## Data Flow

### Update Flow

```text
User edits field in Settings/Media/BuildInPublic
    ↓
Frontend validates input
    ↓
Calls useUpdateProfile mutation
    ↓
Mutation calls update-profile edge function
    ↓
Edge function:
  1. Verifies x_user_id ownership
  2. Validates field is editable
  3. Updates claimed_profiles table
  4. Returns updated profile
    ↓
Frontend updates local cache via react-query
```

### BuildInPublicEntry Type

```typescript
interface BuildInPublicEntry {
  id: string;
  url: string;          // X/Twitter video URL
  title: string;        // User-provided title
  description?: string; // Optional description
  uploadedAt: string;   // ISO date when added
  thumbnailUrl?: string; // Optional thumbnail
}
```

Note: This extends the existing `BuildInPublicVideo` type with `description` and `uploadedAt`.

---

## UI Components

### ProfileHeroBanner

Similar to HeroBanner but personalized for owner:
- "Your Protocol" badge
- Score ring (same as ProgramDetail)
- Quick action buttons (View Public Page, Refresh Metrics)
- Last updated timestamp

### ProfileTabs

Five tabs with icons:
1. **About** (BookOpen) - View protected info
2. **Settings** (Settings) - Edit website/socials
3. **Media** (Image) - Manage gallery
4. **Build In Public** (Video) - Manage updates
5. **Development** (Code) - GitHub stats

Tab state synced with URL query param (`?tab=settings`).

---

## Edge Function: update-profile

### Endpoint
`POST /functions/v1/update-profile`

### Request Body
```json
{
  "profile_id": "uuid",
  "x_user_id": "user's X id for ownership verification",
  "updates": {
    "website_url": "https://...",
    "discord_url": "https://...",
    "telegram_url": "https://...",
    "media_assets": [...],
    "build_in_public_videos": [...]
  }
}
```

### Response
```json
{
  "success": true,
  "profile": { ...updated profile data }
}
```

### Security
- Verifies `x_user_id` matches profile's `x_user_id` column
- Rejects updates to protected fields (project_name, description, category)
- Uses service role key for database write

---

## Route Changes

| Route | Component | Access |
|-------|-----------|--------|
| `/profile/:id` | ProfileDetail | Public (read-only) |
| `/my-profile/:id` | MyProfileDetail | Owner only (authenticated) |
| `/program/:id` | ProgramDetail | Public (read-only) |

Dashboard cards now navigate to `/my-profile/:id` instead of `/profile/:id`.

---

## Technical Details

### useUpdateProfile Hook

```typescript
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ profileId, xUserId, updates }) => {
      const response = await supabase.functions.invoke('update-profile', {
        body: { profile_id: profileId, x_user_id: xUserId, updates }
      });
      
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['claimed-profile', variables.profileId]);
      queryClient.invalidateQueries(['my-verified-profiles']);
    }
  });
}
```

### BuildInPublicTab Key Features

1. **Add Video Form**
   - X/Twitter URL input with validation (must be x.com or twitter.com)
   - Title input (required)
   - Description textarea (optional, 280 char limit)
   - Auto-generates ID and uploadedAt on save

2. **Video List**
   - Card layout showing thumbnail/placeholder
   - Title and description preview
   - "Added [date]" timestamp
   - "View on X" external link button
   - Delete button with confirmation

3. **Encouragement Banner**
   - X brand styling (black background)
   - Messaging: "Share your progress on X with video updates. Build trust by building in public!"
   - Links to user's X profile

---

## File Structure

```text
src/
├── pages/
│   └── MyProfileDetail.tsx          # New owner dashboard
├── components/
│   └── profile/
│       ├── ProfileTabs.tsx          # Tab navigation
│       ├── ProfileHeroBanner.tsx    # Owner-specific hero
│       └── tabs/
│           ├── AboutTab.tsx         # View-only about
│           ├── SettingsTab.tsx      # Edit website/socials
│           ├── MediaTab.tsx         # Edit media gallery
│           ├── BuildInPublicTab.tsx # Edit video updates
│           └── DevelopmentTab.tsx   # GitHub analytics
├── hooks/
│   └── useUpdateProfile.ts          # Update mutation
└── types/
    └── index.ts                     # Add BuildInPublicEntry

supabase/
└── functions/
    └── update-profile/
        └── index.ts                 # Secure update endpoint
```

---

## Summary

This implementation creates a personalized, premium dashboard experience for protocol owners that:

1. Mirrors the visual sophistication of the public ProgramDetail page
2. Clearly separates editable from protected content
3. Provides intuitive media and video management
4. Encourages Build In Public transparency via X integration
5. Maintains security through server-side ownership verification
6. Uses the established design system (card-premium, card-lift, etc.)

