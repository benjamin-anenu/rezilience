

# Two Features: Profile Logo Upload + Ecosystem Trend Feed

## Advisory Council Assessment

### Problem Reframing

**Feature 1 - Logo Upload**: Profiles currently display a fallback letter initial (first character of project name) everywhere -- explorer table, mobile cards, program detail hero, and dashboard. The `logo_url` column exists in the database but there is zero mechanism for builders to upload an image. This is a basic identity gap that makes the registry look generic.

**Feature 2 - Trend Feed**: The ecosystem currently has no narrative layer. Events happen (claims, score changes, decay, library engagement) but they are invisible to casual visitors. There is no "pulse" that makes the ecosystem feel alive. The Builders In Public feed exists but is narrow -- only video posts from claimed profiles.

**Who this is for**:
- Logo Upload: Every project owner who wants visual identity
- Trend Feed: All visitors -- builds social proof and FOMO; admins who want to shape narrative

**What success looks like**:
- Every claimed profile has a recognizable logo in the explorer and profile pages
- Visitors landing on /explorer see evidence of ecosystem activity without clicking into individual profiles
- Admin can inject announcements to steer narrative

### Challenge to Scope

The trend feed concept is ambitious. A fully automated system that detects claims, score changes, decay events, library engagement, and public updates would require:
- Database triggers or cron jobs to generate events
- A new table for trend entries
- Complex aggregation logic
- Moderation controls

**Recommendation**: Start with a **hybrid approach** -- a single `ecosystem_trends` table that captures both automated events (written by edge functions that already run) and manual admin posts. The UI is a compact, non-intrusive ticker/feed. We avoid building complex detection logic now and instead piggyback on existing processes.

---

## Feature 1: Profile Logo Upload

### How It Works

1. Create a `project-logos` storage bucket (public)
2. Add a logo upload component to the **Settings tab** in the profile management page
3. Add logo upload to the **Claim Profile** flow (Step 2: Core Identity)
4. Update the `update-profile` edge function to accept `logo_url` as an editable field
5. Display logos in: Explorer leaderboard row, mobile cards, program detail hero (already wired -- just needs data)

### Technical Details

**Database**: No schema migration needed -- `logo_url` column already exists on `claimed_profiles`.

**Storage**: New bucket `project-logos` with public read access and RLS policy allowing authenticated uploads.

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('project-logos', 'project-logos', true);

CREATE POLICY "Anyone can read logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-logos');

CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-logos');

CREATE POLICY "Users can update their own logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-logos');
```

**Edge Function Change**: Add `logo_url` to `EDITABLE_FIELDS` array in `update-profile/index.ts`.

**New Component**: `src/components/profile/LogoUploader.tsx` -- a compact image upload widget with:
- Click-to-upload or drag-and-drop
- Client-side image preview
- Max file size: 2MB
- Accepted formats: PNG, JPG, WEBP, SVG
- Uploads to `project-logos/{profile_id}.{ext}`
- Shows current logo with "Change" overlay

**Settings Tab Update**: Add LogoUploader at the top of SettingsTab.

**Claim Flow Update**: Add LogoUploader to CoreIdentityForm (Step 2).

**Explorer Display**: Update `LeaderboardRow.tsx` and `MobileProgramCard.tsx` to show `logo_url` image instead of the letter fallback when available.

### File Changes

| File | Change |
|---|---|
| `src/components/profile/LogoUploader.tsx` | New -- image upload widget |
| `src/components/profile/tabs/SettingsTab.tsx` | Add LogoUploader at top |
| `src/components/claim/CoreIdentityForm.tsx` | Add LogoUploader (optional) |
| `src/pages/ClaimProfile.tsx` | Pass logo state to CoreIdentityForm, include in submit |
| `src/components/explorer/LeaderboardRow.tsx` | Show logo_url image in project cell |
| `src/components/explorer/MobileProgramCard.tsx` | Show logo_url image in identity section |
| `supabase/functions/update-profile/index.ts` | Add `logo_url` to EDITABLE_FIELDS |
| Migration SQL | Create storage bucket + RLS policies |

---

## Feature 2: Ecosystem Trend Feed

### Design Decision: Placement

After considering multiple options:

- **Option A**: Dedicated /trends page -- too isolated, low discovery
- **Option B**: Sidebar on explorer -- takes real estate from the data table
- **Option C (Recommended)**: Compact horizontal ticker/banner above the explorer tabs, plus a collapsible "Trend Feed" panel accessible from a tab or button

**Final placement**: A **compact trend banner** between EcosystemStats and the view toggle tabs on `/explorer`. It shows the latest 1-2 trends as a scrolling ticker. Clicking "View All" opens a slide-out panel or expands into a feed section. This is non-intrusive, always visible, and builds FOMO without stealing attention from the data.

### Data Model

New table: `ecosystem_trends`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| event_type | text | 'claim', 'score_milestone', 'decay_alert', 'ecosystem_stat', 'admin_announcement', 'library_update' |
| title | text | Short headline (max 120 chars) |
| description | text | Optional longer text |
| profile_id | uuid | Optional -- links to related profile |
| metadata | jsonb | Flexible data (old_score, new_score, etc.) |
| priority | text | 'normal', 'highlight' -- highlight gets accent styling |
| created_at | timestamptz | Auto |
| expires_at | timestamptz | Optional -- auto-hide old trends |
| created_by | text | 'system' or admin email |

RLS: Public read, admin-only insert/update/delete.

### Automated Trend Generation

Rather than building new cron jobs, we hook into existing processes:

1. **Profile claimed**: The `ClaimProfile.tsx` direct submit and `GitHubCallback.tsx` already write to `claimed_profiles`. After successful insert, we also insert a trend row via the same Supabase client call.

2. **Score changes**: The existing `admin-recalibrate` function and `refresh-all-profiles` function can insert trends when scores cross thresholds (e.g., a profile crosses 70 or drops below 30).

3. **Admin announcements**: Dedicated admin UI to post trends manually.

For v1, we implement:
- Automated: claim events (frontend-triggered)
- Manual: admin announcements (admin UI)
- Everything else deferred to v2

### Admin Trend Management

New admin page: `/admin/trends`

Features:
- Form to create announcement: title, description, priority, optional expiry
- List of recent trends with delete capability
- Preview of how it appears in the ticker

### Explorer Trend Ticker

A slim banner component showing the latest trends:
- Horizontal scrolling or cycling animation (one trend at a time, auto-rotate every 5s)
- Icon per event type (megaphone for announcements, user-plus for claims, trending-up for milestones)
- Accent color for "highlight" priority
- "View All" link that expands a feed panel below

### File Changes

| File | Change |
|---|---|
| Migration SQL | Create `ecosystem_trends` table with RLS |
| `src/hooks/useEcosystemTrends.ts` | New -- fetch trends from public view |
| `src/components/explorer/TrendTicker.tsx` | New -- compact trend banner component |
| `src/components/explorer/TrendFeed.tsx` | New -- expanded feed panel |
| `src/pages/Explorer.tsx` | Add TrendTicker between stats and tabs |
| `src/pages/admin/AdminTrendsPage.tsx` | New -- admin trend management |
| `src/components/admin/AdminSidebar.tsx` | Add "Trends" nav item |
| `src/App.tsx` | Add /admin/trends route |
| `src/pages/ClaimProfile.tsx` | Insert trend on successful claim |

---

## Risk Analysis

**Logo upload risks**:
- Inappropriate images: Mitigated by file type restriction (no GIFs) and admin visibility. Not a launch blocker for a Web3 dev registry.
- Oversized files: Client-side 2MB limit + storage policy.
- Broken images: Already handled -- HeroBanner has onError fallback to letter initial.

**Trend feed risks**:
- Stale content: Expiry field ensures old trends auto-hide. Admin can clean up.
- Spam: Only system and admin can write. No user-generated trends in v1.
- Performance: Simple SELECT with LIMIT, no joins needed.

## Implementation Order

1. Storage bucket + RLS (migration)
2. Logo upload component + Settings tab integration
3. Logo display in explorer rows
4. Logo in claim flow
5. Ecosystem trends table (migration)
6. Trend ticker on explorer
7. Admin trends page
8. Auto-trend on claim events

