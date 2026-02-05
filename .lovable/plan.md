

# Complete Claim Profile Flow: The Heartbeat Dashboard

## Overview
Implement the full 5-step claim profile journey with comprehensive metadata collection, social registry, media showcase, and roadmap milestones. The public profile ("Heartbeat Dashboard") will display all verified information.

---

## Complete User Flow

```text
Step 1: X Authentication (already implemented)
                    ↓
Step 2: Core Identity (Metadata)
   • Project Name & Description
   • Category Selection
   • Website URL with Live Preview
                    ↓
Step 3: Pulse Connection (GitHub & Socials)
   • GitHub Organization (Required)
   • X, Discord, Telegram links
   • Reputation Progress Bar
                    ↓
Step 4: Media & Proof of Work
   • Upload up to 5 assets (images/YouTube/videos)
   • Carousel with drag-and-drop reorder
                    ↓
Step 5: Roadmap (Tentative Timelines)
   • Milestone input with dates
   • Commitment Lock mechanism
                    ↓
      /profile/:id
   Heartbeat Dashboard (Public Profile)
```

---

## New Data to Collect

### Step 2: Core Identity
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| projectName | string | Yes | Display name |
| description | string | No | Short tagline (max 140 chars) |
| category | enum | Yes | DeFi, NFT, Infrastructure, etc. |
| websiteUrl | string | No | Project website |
| programId | string | No | Solana program address |
| walletAddress | string | No | Developer wallet |

### Step 3: Socials
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| githubOrg | string | Yes | GitHub organization/repo URL |
| xHandle | string | No | X/Twitter handle (auto-filled from auth) |
| discordUrl | string | No | Discord invite link |
| telegramUrl | string | No | Telegram group link |

### Step 4: Media
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mediaAssets | array | No | Up to 5 items |
| mediaAssets[].type | enum | - | 'image' | 'youtube' | 'video' |
| mediaAssets[].url | string | - | URL to asset |
| mediaAssets[].order | number | - | Display order (0-4) |

### Step 5: Roadmap
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| milestones | array | No | Project milestones |
| milestones[].title | string | - | Milestone name |
| milestones[].targetDate | string | - | Target completion date |
| milestones[].isLocked | boolean | - | Once set, locked = true |
| milestones[].status | enum | - | 'upcoming' | 'completed' | 'overdue' |

---

## Files to Modify

### 1. `src/types/index.ts`
Add comprehensive profile types:
```typescript
export interface MediaAsset {
  id: string;
  type: 'image' | 'youtube' | 'video';
  url: string;
  thumbnailUrl?: string;
  order: number;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  isLocked: boolean;
  status: 'upcoming' | 'completed' | 'overdue';
  varianceRequested?: boolean; // True if user requested date change
}

export interface SocialLinks {
  xHandle?: string;
  discordUrl?: string;
  telegramUrl?: string;
}

export interface ClaimedProfile {
  id: string;
  
  // Core Identity (Step 2)
  projectName: string;
  description?: string;
  category: string;
  websiteUrl?: string;
  logoUrl?: string;
  programId?: string;
  walletAddress?: string;
  
  // Auth (Step 1)
  xUserId: string;
  xUsername: string;
  
  // GitHub (Step 3)
  githubOrgUrl: string;
  githubUsername?: string;
  
  // Socials (Step 3)
  socials: SocialLinks;
  
  // Media (Step 4)
  mediaAssets: MediaAsset[];
  
  // Roadmap (Step 5)
  milestones: Milestone[];
  
  // Verification
  verified: boolean;
  verifiedAt: string;
  score: number;
  livenessStatus: 'active' | 'dormant' | 'degraded';
}
```

### 2. `src/pages/ClaimProfile.tsx`
Complete redesign with multi-step form:

**UI Structure:**
```text
┌─────────────────────────────────────────────────────────┐
│ CLAIM YOUR PROTOCOL                                     │
│ Step 2 of 5: Core Identity                              │
│ [═══════════░░░░░░░░░░░░░░░░░] 40%                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PROJECT INFORMATION                         [REQUIRED]  │
├─────────────────────────────────────────────────────────┤
│ Project Name*       [________________________]          │
│ Description         [________________________] 0/140    │
│ Category*           [Select category... ▼]              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ THE DIGITAL OFFICE                                      │
├─────────────────────────────────────────────────────────┤
│ Website URL         [https://...]                       │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 🖼️  Live Preview                    [Launch Site ↗]││
│ │     (Preview loads when URL is entered)             ││
│ └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘

┌─────────────────┐ ┌─────────────────┐
│ Program ID      │ │ Wallet          │
│ [OPTIONAL]      │ │ [OPTIONAL]      │
└─────────────────┘ └─────────────────┘

[← BACK]                                    [NEXT: SOCIALS →]
```

**Step Navigation:**
- Step 1: X Auth (auto-complete if authenticated)
- Step 2: Core Identity (project info, website)
- Step 3: Pulse Connection (GitHub + socials)
- Step 4: Media Showcase (upload assets)
- Step 5: Roadmap (milestones)

### 3. Create `src/components/claim/` directory
New components for the claim flow:

| Component | Purpose |
|-----------|---------|
| `StepIndicator.tsx` | Shows current step in 5-step flow |
| `CoreIdentityForm.tsx` | Step 2: Project info + website preview |
| `SocialsForm.tsx` | Step 3: GitHub (required) + social links |
| `MediaUploader.tsx` | Step 4: Media assets with drag-drop carousel |
| `RoadmapForm.tsx` | Step 5: Milestones with commitment lock |
| `WebsitePreview.tsx` | Iframe preview of website URL |
| `ReputationBar.tsx` | Progress bar showing linked socials |

### 4. Create `src/pages/ProfileDetail.tsx`
The "Heartbeat Dashboard" for viewing claimed profiles:

**Layout:**
```text
┌─────────────────────────────────────────────────────────┐
│ [← Back to Explorer]                                    │
│                                                         │
│ ┌─────────┐  PROJECT NAME             [VERIFIED TITAN] │
│ │  Logo   │  DeFi • @xhandle                           │
│ └─────────┘  ★★★★☆ 87/100 Resilience Score             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ MEDIA GALLERY                                           │
│ ┌───────────────────────────────────────────────────┐  │
│ │         [HD Carousel - Video/Images]              │  │
│ └───────────────────────────────────────────────────┘  │
│ [•] [○] [○] [○] [○] (carousel dots)                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────┐ ┌─────────────────────────────────────┐
│ WEBSITE SNIPPET │ │ SOCIAL PULSE                        │
│ ┌─────────────┐│ │ [𝕏] @handle  [Discord]  [Telegram] │
│ │   iframe    ││ │                                     │
│ │   preview   ││ ├─────────────────────────────────────┤
│ └─────────────┘│ │ VERIFIED TIMELINE                   │
│ [View Site ↗] │ │ ✓ Mainnet Launch      Jan 15, 2026  │
│                │ │ ○ V2 Release          Mar 01, 2026  │
│                │ │ ⚠ Audit Complete [OVERDUE]          │
└─────────────────┘ └─────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DEVELOPMENT STATS                                       │
│ Resilience Score │ Heartbeat Graph │ Survival Rate      │
│      87/100      │  [Graph]        │    94%             │
└─────────────────────────────────────────────────────────┘
```

### 5. `src/pages/GitHubCallback.tsx`
Update to handle all new profile data:
- Fetch stored claiming data for all 5 steps
- Generate unique profile ID
- Redirect to `/profile/:id`

### 6. `src/App.tsx`
Add new route:
```tsx
<Route path="/profile/:id" element={<ProfileDetail />} />
```

---

## Special Features

### Website Live Preview
When user enters a website URL:
1. Show iframe preview (sandboxed)
2. "Launch External Site" button opens in new tab
3. Handle loading/error states gracefully

```tsx
<WebsitePreview url={websiteUrl}>
  {url && (
    <iframe 
      src={url} 
      className="h-48 w-full border rounded"
      sandbox="allow-scripts allow-same-origin"
    />
  )}
  <Button variant="outline" onClick={() => window.open(url, '_blank')}>
    <ExternalLink className="mr-2 h-4 w-4" />
    Launch External Site
  </Button>
</WebsitePreview>
```

### Reputation Progress Bar
Shows completion based on linked socials:
- 0%: No socials linked
- 25%: GitHub connected
- 50%: GitHub + 1 social
- 75%: GitHub + 2 socials
- 100%: GitHub + all 3 socials (X, Discord, Telegram)

### Media Carousel with Drag-and-Drop
Using `embla-carousel-react` (already installed):
- Accept: Images, YouTube URLs, video URLs
- Max 5 assets
- Drag to reorder
- Preview thumbnails

### Milestone Commitment Lock
Once milestones are submitted:
1. Dates are "locked" (cannot be changed directly)
2. To change, user must click "Request Update"
3. This triggers a "Timeline Variance" badge on public profile
4. Shows transparency about changed deadlines

```tsx
const handleRequestUpdate = (milestoneId: string) => {
  // Mark milestone as having variance requested
  setMilestones(prev => prev.map(m => 
    m.id === milestoneId ? { ...m, varianceRequested: true } : m
  ));
  // Show edit modal
  setEditingMilestone(milestoneId);
};
```

---

## Category Options

```typescript
const categories = [
  { value: 'defi', label: 'DeFi' },
  { value: 'nft', label: 'NFT / Digital Collectibles' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'social', label: 'Social' },
  { value: 'dao', label: 'DAO / Governance' },
  { value: 'payments', label: 'Payments' },
  { value: 'developer-tools', label: 'Developer Tools' },
  { value: 'other', label: 'Other' },
];
```

---

## Implementation Order

1. **Types** - Add all new interfaces to `src/types/index.ts`
2. **Claim Components** - Create `src/components/claim/` with step forms
3. **ClaimProfile Redesign** - Multi-step wizard with all 5 steps
4. **ProfileDetail Page** - Create Heartbeat Dashboard layout
5. **GitHubCallback Update** - Handle new profile data
6. **App Routes** - Add `/profile/:id` route
7. **ProgramDetail Update** - Link to ProfileDetail for verified programs

---

## Technical Notes

### Storing Claiming Data (Phase 0)
Since we're using localStorage for Phase 0:
```typescript
// Store all claiming data before GitHub redirect
localStorage.setItem('claimingProfile', JSON.stringify({
  projectName,
  description,
  category,
  websiteUrl,
  programId,
  walletAddress,
  socials: { xHandle, discordUrl, telegramUrl },
  mediaAssets,
  milestones,
}));
```

### Media Asset Handling (Phase 0)
For Phase 0 without backend storage:
- Accept URLs only (no file uploads yet)
- Image URLs, YouTube embed URLs, video URLs
- Store as URL strings in localStorage

### Fixing `/program/undefined` Bug
The current issue: When no programId exists, `internalId` is undefined.

Fix in `GitHubCallback.tsx`:
```typescript
// Generate unique profile ID
const profileId = `profile_${Date.now()}_${xUserId}`;

// Always redirect to profile page (not program page)
navigate(`/profile/${profileId}?verified=true`);
```

---

## Design Consistency

All components follow Bloomberg Terminal aesthetic:
- Cards: `border-border bg-card`
- Headers: `font-display uppercase tracking-tight`
- Required badges: `bg-primary/20 text-primary`
- Optional badges: `bg-muted text-muted-foreground`
- Overdue milestones: `text-destructive` (Terminal Red)
- Progress bars: `bg-primary` fill on `bg-muted` track

