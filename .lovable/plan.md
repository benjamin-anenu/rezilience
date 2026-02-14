

# Fix Analytics Tracking + Add Visitor Geo-Location

## Problem Summary

### Tracking Gaps
- **Clicks**: The dashboard counts them but nothing in the app ever fires a `click` event -- always shows 0
- **Tab changes**: Explorer tracks these but the dashboard ignores the `tab_change` event type -- data is lost
- **Searches**: Only Explorer search is tracked; Library search is not
- **Feature uses**: Only one place (Library level selector) fires `feature_use`; dozens of interactive features are untracked
- **Key pages** like ProgramDetail, ClaimProfile, Dashboard, ResilienceGPT, Staking have zero tracking beyond page views

### Missing Geo-Location
- No IP-based location tracking exists
- Cannot see which countries/cities are actively visiting

---

## Plan

### 1. Add Geo-Location Tracking via Edge Function

Since the browser cannot reliably determine a visitor's location from IP, we capture it server-side.

**New edge function: `supabase/functions/track-analytics/index.ts`**
- Receives a batch of analytics events from the frontend
- Reads the visitor's IP from the request headers (`x-forwarded-for` or Deno's `remoteAddr`)
- Calls a free IP geolocation API (ip-api.com, no key needed, or Cloudflare headers already available on Supabase Edge) to resolve country/city
- Attaches `country` and `city` fields to each event before inserting into `admin_analytics`

**Database migration:**
- Add two nullable columns to `admin_analytics`:
  - `country TEXT`
  - `city TEXT`

**Update `useAnalyticsTracker.ts`:**
- Change the flush function to POST batched events to the new edge function instead of inserting directly via the Supabase client
- The edge function handles the insert with geo data appended

### 2. Add Click + Feature Tracking Across Key Pages

Add `trackEvent` calls to the most important interactive elements:

| Page/Component | Event Type | Target | What It Tracks |
|---|---|---|---|
| `ProgramDetail` | `click` | `program_view` | Viewing a specific project |
| `ClaimProfile` (each step) | `feature_use` | `claim_step_N` | Progress through claim funnel |
| `ResilienceGPT` send | `feature_use` | `gpt_message_send` | GPT usage |
| `Staking` page CTA | `click` | `staking_cta` | Interest in staking |
| `Navigation` links | `click` | link target | Nav bar clicks |
| `LibrarySearchBar` | `search` | query text | Library searches |
| `ProgramLeaderboard` row | `click` | program ID | Which projects get clicked |
| `RoomCard` (Library) | `click` | room name | Which library rooms are entered |
| `ProfileDetail` | `click` | `profile_view` | Dashboard profile views |
| `SubscribePopover` | `feature_use` | `subscribe` | Subscription interest |

### 3. Fix `tab_change` Event in Dashboard

Update `AdminEngagementPage.tsx` to include `tab_change` in the daily activity breakdown (count it under "features" or add its own line), so Explorer tab switches show up in the chart.

### 4. Add Geo Visualization to Engagement Dashboard

Add a new panel to `AdminEngagementPage.tsx`:

- **"Visitor Locations"** -- a horizontal bar chart showing top 10 countries by event count
- Pull `country` from `admin_analytics` and aggregate
- Uses the same `glass-chart` styling as existing panels

---

## Files Changed

| File | Action |
|---|---|
| `supabase/functions/track-analytics/index.ts` | **New** -- edge function for geo-enriched event ingestion |
| `src/hooks/useAnalyticsTracker.ts` | **Edit** -- flush to edge function instead of direct insert |
| `src/pages/admin/AdminEngagementPage.tsx` | **Edit** -- add geo chart + fix `tab_change` counting |
| `src/components/layout/Navigation.tsx` | **Edit** -- add click tracking to nav links |
| `src/components/library/LibrarySearchBar.tsx` | **Edit** -- add search tracking |
| `src/components/library/RoomCard.tsx` | **Edit** -- add click tracking |
| `src/components/explorer/ProgramLeaderboard.tsx` or `LeaderboardRow.tsx` | **Edit** -- add click tracking on row |
| `src/pages/ProgramDetail.tsx` | **Edit** -- add view tracking |
| `src/pages/ClaimProfile.tsx` | **Edit** -- add step tracking |
| `src/pages/ResilienceGPT.tsx` | **Edit** -- add message send tracking |
| `src/pages/Staking.tsx` | **Edit** -- add CTA click tracking |
| **Database migration** | Add `country TEXT`, `city TEXT` columns to `admin_analytics` |

