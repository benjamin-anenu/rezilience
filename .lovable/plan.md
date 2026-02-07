

# Implementation Plan: Embeddable Videos & Team Tab Feature

## Overview

This plan addresses two key feature requests:

1. **Embeddable Videos**: Make X/Twitter videos playable directly on the platform instead of just linking out
2. **New Team Tab**: Add a dedicated tab for team information with member profiles and a "Why Stake" pitch section

---

## Feature 1: Embeddable X/Twitter Videos

### Current Problem

The `BuildInPublicSection.tsx` component currently only shows thumbnails with links to X/Twitter. Users cannot watch videos inline on the platform.

### Solution

Install and integrate the `react-tweet` package from Vercel which renders X/Twitter posts natively in React without heavy iframes (16KB vs 560KB).

### Technical Changes

**1. Install package:**
```bash
npm install react-tweet
```

**2. Update `src/components/program/BuildInPublicSection.tsx`:**
- Import the `Tweet` component from `react-tweet`
- Replace the thumbnail/link cards with actual embedded tweets
- Keep the carousel structure but render full tweet embeds

The video cards will transform from clickable thumbnails to fully interactive embedded X posts with video playback capability.

---

## Feature 2: New Team Tab

### Data Model

**New TypeScript interfaces in `src/types/index.ts`:**

```typescript
// Team Member Role Options
export type TeamMemberRole = 'developer' | 'founder' | 'other';

// Individual Team Member
export interface TeamMember {
  id: string;
  imageUrl?: string;        // URL or uploaded image
  name: string;             // Full name
  nickname?: string;        // Optional nickname
  jobTitle: string;         // Job description/title
  whyFit: string;           // Sell yourself (max ~200 chars)
  role: TeamMemberRole;     // Developer, Founder, Other
  customRole?: string;      // If role is 'other', specify
  order: number;            // Display order
}

// Team Section Data
export interface TeamSection {
  members: TeamMember[];
  stakingPitch: string;     // "Why stake on this project?" (max 500 chars)
}
```

### Database Changes

Add new JSONB columns to `claimed_profiles` table:

| Column | Type | Description |
|--------|------|-------------|
| `team_members` | JSONB | Array of TeamMember objects |
| `staking_pitch` | TEXT | Brief pitch for why public should stake |

### Component Structure

**New Files:**

| File | Purpose |
|------|---------|
| `src/components/program/tabs/TeamTabContent.tsx` | Public read-only team view |
| `src/components/profile/tabs/TeamManagement.tsx` | Owner editable team management |

### ProgramTabs Update

**Update `src/components/program/ProgramTabs.tsx`:**

Add new tab config:
```typescript
const tabConfig = [
  { value: 'about', label: 'About', icon: BookOpen },
  { value: 'development', label: 'Development', icon: Code },
  { value: 'team', label: 'Team', icon: Users2 },  // NEW - Using Users2 icon
  { value: 'community', label: 'Community', icon: Users },
  { value: 'roadmap', label: 'Roadmap', icon: Map },
  { value: 'support', label: 'Support', icon: Heart },
];
```

Update children prop interface:
```typescript
interface ProgramTabsProps {
  children: {
    about: React.ReactNode;
    development: React.ReactNode;
    team: React.ReactNode;      // NEW
    community: React.ReactNode;
    roadmap: React.ReactNode;
    support: React.ReactNode;
  };
}
```

### Team Tab Content (Public View)

**`TeamTabContent.tsx` structure:**

```text
┌─────────────────────────────────────────────────────────────┐
│  TEAM                                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                │
│  │  [Photo]  │  │  [Photo]  │  │  [Photo]  │                │
│  │  Name     │  │  Name     │  │  Name     │                │
│  │  @nick    │  │  @nick    │  │  @nick    │                │
│  │  FOUNDER  │  │  DEV      │  │  DESIGNER │                │
│  │  ───────  │  │  ───────  │  │  ───────  │                │
│  │  Job desc │  │  Job desc │  │  Job desc │                │
│  │           │  │           │  │           │                │
│  │  "Why I   │  │  "Why I   │  │  "Why I   │                │
│  │   fit..." │  │   fit..." │  │   fit..." │                │
│  └───────────┘  └───────────┘  └───────────┘                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  WHY STAKE ON THIS PROJECT?                                  │
│  ──────────────────────────                                  │
│  "Brief compelling pitch about why the public should         │
│   support this project..."                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Team Management (Owner View)

**`TeamManagement.tsx` features:**

1. **Add Team Member Form:**
   - Image URL input (or image upload via URL)
   - Name (required, max 50 chars)
   - Nickname (optional, max 20 chars)
   - Job Title (required, max 100 chars)
   - "Why I'm a Fit" textarea (max 200 chars)
   - Role dropdown: Developer | Founder | Other
   - If "Other" selected: text input for custom role

2. **Existing Member Cards:**
   - Edit/Delete buttons
   - Drag to reorder (optional - can skip for MVP)

3. **Staking Pitch Section:**
   - Rich textarea (500 char limit)
   - Auto-save on blur

### Backend Updates

**Update `supabase/functions/update-profile/index.ts`:**

Add to EDITABLE_FIELDS:
```typescript
const EDITABLE_FIELDS = [
  "website_url",
  "discord_url",
  "telegram_url",
  "media_assets",
  "build_in_public_videos",
  "milestones",
  "team_members",      // NEW
  "staking_pitch",     // NEW
];
```

Add interface types for validation:
```typescript
team_members?: Array<{
  id: string;
  imageUrl?: string;
  name: string;
  nickname?: string;
  jobTitle: string;
  whyFit: string;
  role: 'developer' | 'founder' | 'other';
  customRole?: string;
  order: number;
}>;
staking_pitch?: string;
```

### ProfileDetail & ProgramDetail Updates

Both pages need to pass the new `team` child to `ProgramTabs`:

**Owner View (`ProfileDetail.tsx`):**
```tsx
team: <TeamManagement profile={profile} xUserId={user!.id} />,
```

**Public View (`ProfileDetail.tsx` and `ProgramDetail.tsx`):**
```tsx
team: (
  <TeamTabContent 
    teamMembers={profile.teamMembers} 
    stakingPitch={profile.stakingPitch}
    isVerified={profile.verified}
  />
),
```

### Types Update

**Update `src/types/index.ts` ClaimedProfile interface:**

```typescript
export interface ClaimedProfile {
  // ... existing fields ...
  
  // Team Section (new)
  teamMembers?: TeamMember[];
  stakingPitch?: string;
}
```

---

## File Changes Summary

| File | Action | Priority |
|------|--------|----------|
| **Package Installation** | Add `react-tweet` | HIGH |
| `src/components/program/BuildInPublicSection.tsx` | Embed tweets inline | HIGH |
| `src/types/index.ts` | Add TeamMember, TeamSection types | HIGH |
| **Database Migration** | Add team_members, staking_pitch columns | HIGH |
| `src/components/program/ProgramTabs.tsx` | Add Team tab | HIGH |
| `src/components/program/tabs/TeamTabContent.tsx` | NEW - Public view | HIGH |
| `src/components/profile/tabs/TeamManagement.tsx` | NEW - Owner editor | HIGH |
| `supabase/functions/update-profile/index.ts` | Add team fields | HIGH |
| `src/hooks/useUpdateProfile.ts` | Add team types | MEDIUM |
| `src/pages/ProfileDetail.tsx` | Wire up Team tab | HIGH |
| `src/pages/ProgramDetail.tsx` | Wire up Team tab (if exists) | HIGH |
| `src/components/program/tabs/index.ts` | Export TeamTabContent | MEDIUM |
| `src/components/profile/tabs/index.ts` | Export TeamManagement | MEDIUM |
| `src/hooks/useClaimedProfiles.ts` | Map new fields | MEDIUM |

---

## Implementation Order

1. **Database Migration** - Add team_members (JSONB) and staking_pitch (TEXT) columns
2. **Types** - Add TeamMember interface and update ClaimedProfile
3. **Install react-tweet** - Enable embeddable tweets
4. **BuildInPublicSection** - Convert to inline tweet embeds
5. **ProgramTabs** - Add Team tab to navigation
6. **TeamTabContent** - Create public team display component
7. **TeamManagement** - Create owner team editor
8. **Update Edge Function** - Allow team field updates
9. **Wire up ProfileDetail** - Connect Team tab for owner/public
10. **Update useClaimedProfiles** - Map new database fields

---

## Design Notes

- Team member cards follow the existing "Institutional Bloomberg Terminal" aesthetic
- Role badges use the same pill styling as category badges
- Character limits prevent verbose entries that could bore the public
- The "Why Stake" pitch is kept brief (500 chars) for impact
- Mobile responsive: cards stack vertically on small screens

