

# Align Owner Dashboard (`/profile/:id`) with Public Page Design

## Problem

The owner page at `/profile/:id` uses different components that don't match the premium design of the public page at `/program/:id`:

| Current | Public (`/program/:id`) | Owner (`/profile/:id`) |
|---------|-------------------------|------------------------|
| Hero | `HeroBanner` (premium) | `ProfileHeroBanner` (different design) |
| Stats Bar | `QuickStats` | Missing |
| Tabs | `ProgramTabs` | `ProfileTabs` (different structure) |

Your spec requires the owner page to **mirror the visual sophistication** of the public page, with the same layout and components but with owner-specific capabilities.

---

## Solution

Refactor `ProfileDetail.tsx` to use the **same components** as `ProgramDetail.tsx`:
- `HeroBanner` with new `isOwner` prop
- `QuickStats`
- `ProgramTabs` with owner-enhanced tab content

---

## Implementation

### 1. Update `HeroBanner.tsx` - Add Owner Mode

Add props for owner-specific rendering:

```typescript
interface HeroBannerProps {
  // ...existing props
  isOwner?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}
```

When `isOwner={true}`:
- Show "YOUR PROTOCOL" badge instead of "VERIFIED TITAN"
- Show "Back to Dashboard" link
- Show "Refresh Metrics" button
- Show "View Public Page" button linking to `/program/:id`

### 2. Update `ProfileDetail.tsx` - Use Public Page Components

Replace the owner view section to use:

```typescript
// Replace ProfileHeroBanner + ProfileTabs with:
<HeroBanner
  program={programForComponents}
  isOwner={true}
  onRefresh={handleRefresh}
  isRefreshing={isRefreshing}
  // ...same props as ProgramDetail
/>

<QuickStats analytics={profile.githubAnalytics} />

<ProgramTabs>
  {{
    about: <AboutTabContent 
      // read-only About content
      description={profile.description}
      category={profile.category}
      // ...
    />,
    development: <DevelopmentTabContent 
      // read-only GitHub analytics
    />,
    community: <OwnerCommunityTab 
      // Editable Build In Public + Community links
    />,
    roadmap: <RoadmapManagement 
      // Owner can mark complete, request variance
    />,
    support: <OwnerSettingsTab 
      // Editable website, discord, telegram
    />,
  }}
</ProgramTabs>
```

### 3. Create Owner-Enhanced Tab Components

Map the 5 tabs from your spec to the existing `ProgramTabs` structure:

| Your Spec Tab | Maps To | Content |
|---------------|---------|---------|
| About | `about` | `AboutTabContent` (read-only, protected fields notice) |
| Settings | `support` | `SettingsTab` (editable website, socials) |
| Media | Part of `about` | `MediaTab` integrated into About section |
| Build In Public | `community` | `BuildInPublicTab` (editable) + community links |
| Development | `development` | `DevelopmentTabContent` (read-only) |
| Roadmap | `roadmap` | `RoadmapManagement` (owner actions) |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/program/HeroBanner.tsx` | Add `isOwner`, `onRefresh`, `isRefreshing` props; conditionally render owner badge and actions |
| `src/pages/ProfileDetail.tsx` | Replace `ProfileHeroBanner` + `ProfileTabs` with `HeroBanner` + `QuickStats` + `ProgramTabs` |
| `src/components/program/tabs/SupportTabContent.tsx` | Accept optional `SettingsEditor` component for owner mode |

## Files to Potentially Remove (Cleanup)

| File | Reason |
|------|--------|
| `src/components/profile/ProfileHeroBanner.tsx` | Replaced by enhanced `HeroBanner` |
| `src/components/profile/ProfileTabs.tsx` | Using `ProgramTabs` instead |

---

## Owner View Structure (After Fix)

```text
/profile/:id (Owner Dashboard)
├── Back to Dashboard link
├── HeroBanner (with isOwner=true)
│   ├── Logo + Name
│   ├── "YOUR PROTOCOL" badge (gold/amber)
│   ├── Status badges (ACTIVE, VERIFIED)
│   ├── Animated Score Ring (same as public)
│   └── Actions: [View Public Page] [Refresh Metrics]
├── QuickStats bar (GitHub stats)
└── ProgramTabs (same 5-tab structure)
    ├── About (description + category + media gallery - READ-ONLY)
    │   └── Protected Fields notice
    ├── Development (GitHub analytics - READ-ONLY)
    ├── Community → Build In Public (EDITABLE videos + X links)
    ├── Roadmap (EDITABLE - mark complete, request variance)
    └── Support → Settings (EDITABLE - website, discord, telegram)
```

---

## HeroBanner Owner Mode Changes

```typescript
// In HeroBanner.tsx
{isOwner ? (
  // Owner badge
  <Badge className="bg-chart-5/20 text-chart-5 border-chart-5/40">
    <Shield className="h-3.5 w-3.5 mr-1.5" />
    YOUR PROTOCOL
  </Badge>
) : isVerified ? (
  // Public verified badge
  <Badge className="bg-primary/20 text-primary">
    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
    VERIFIED TITAN
  </Badge>
) : null}

// Owner actions
{isOwner && (
  <div className="flex gap-2">
    <Button asChild>
      <Link to={`/program/${program.id}`}>
        <Eye className="mr-2 h-4 w-4" />
        View Public Page
      </Link>
    </Button>
    <Button onClick={onRefresh} disabled={isRefreshing}>
      <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
      Refresh Metrics
    </Button>
  </div>
)}
```

---

## Tab Content Mapping

**About Tab (Read-Only):**
- Uses existing `AboutTabContent` from ProgramDetail
- Add "Protected Fields" notice card at top for owner

**Development Tab (Read-Only):**
- Uses existing `DevelopmentTabContent` from ProgramDetail
- Same GitHub analytics display

**Community Tab (Editable for Owner):**
- For owner: Wraps `BuildInPublicTab` (editable videos)
- For public: Uses existing `CommunityTabContent` (read-only)

**Roadmap Tab (Editable for Owner):**
- For owner: Uses `RoadmapManagement` (mark complete, request variance)
- For public: Uses existing `RoadmapTabContent` (read-only)

**Support Tab becomes Settings Tab (Editable for Owner):**
- For owner: Uses `SettingsTab` (editable website, socials)
- For public: Uses existing `SupportTabContent`

---

## Summary

This refactor ensures:

1. **Visual Consistency**: Owner page uses exact same premium components as public page
2. **Same Layout**: HeroBanner + QuickStats + ProgramTabs structure
3. **Owner Badge**: "YOUR PROTOCOL" clearly identifies ownership
4. **Animated Score Ring**: Same premium visual as public
5. **5 Tabs**: About, Development, Community, Roadmap, Support/Settings
6. **Editable Content**: Community, Roadmap, and Support tabs have owner editing
7. **Protected Fields**: About tab shows read-only notice for locked fields

The owner will see the exact same premium "Heartbeat Dashboard" design as the public, with management controls seamlessly integrated into the appropriate tabs.

