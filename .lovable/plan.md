

# Builders In Public -- Explorer Feed + Email Subscription Collection

## Overview

Add a 4th tab ("Builders In Public") to the Explorer page that aggregates all Build In Public posts from claimed profiles into a public feed. Visitors can subscribe to individual projects by entering their email, which is stored in a new database table. No email sending yet -- just intent capture.

---

## What Gets Built

### 1. New Database Table: `project_subscribers`

Stores email subscriptions per project. No authentication required to subscribe (public action).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, auto-generated |
| profile_id | uuid | FK concept to claimed_profiles.id |
| email | text | Subscriber's email, validated |
| subscribed_at | timestamptz | Default now() |
| unsubscribed_at | timestamptz | Nullable, for future opt-out |

**Unique constraint** on `(profile_id, email)` to prevent duplicate subscriptions.

**RLS Policies:**
- Public INSERT (anyone can subscribe) with check that email is not empty
- No SELECT/UPDATE/DELETE from anon -- subscribers cannot browse the list
- Service role has full access for future email sending

### 2. New Explorer Tab: "Builders In Public"

A 4th tab added to the Explorer page `TabsList`, positioned after "Ecosystem Pulse".

**UI Layout:**
- Grid of post cards (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)
- Each card shows:
  - Project logo + name + category badge (links to `/program/:id`)
  - Embedded tweet via `react-tweet` (reusing existing `BuildInPublicSection` pattern)
  - Post title if provided
  - Timestamp
  - "Subscribe" button that opens an email input popover
- Empty state when no builders have posted yet: "No builders are posting yet. Claim your project to start building in public."
- Data fetched via a new hook that queries `claimed_profiles` where `build_in_public_videos` is not empty

### 3. Subscribe Flow

When a user clicks "Subscribe" on a project card:
1. A popover opens with an email input field + "Subscribe" button
2. Client-side validation (valid email format, max 255 chars)
3. On submit: INSERT into `project_subscribers` via Supabase client
4. Success toast: "Subscribed! You'll be notified when [Project] posts updates."
5. If duplicate (unique constraint violation): toast "You're already subscribed to this project."
6. Button changes to "Subscribed" with a checkmark for that session

### 4. Data Fetching Hook

New hook `useBuildersFeed` that:
- Queries `claimed_profiles` selecting `id, project_name, logo_url, category, x_username, build_in_public_videos, claim_status`
- Filters: `claim_status = 'claimed'` AND `build_in_public_videos` is not null/empty
- Flattens all videos across projects into a single feed sorted by timestamp (newest first)
- Returns `{ posts, isLoading, error }`

---

## What Is NOT Built (Deferred to V2)

| Feature | Why |
|---------|-----|
| Email sending | Requires Resend API key + verified domain |
| Likes / reactions | Anonymous likes are abuse-prone without auth |
| Unsubscribe flow | Build when email sending is wired up |
| Subscriber count display | Privacy concern -- don't show counts publicly yet |
| Pagination of feed | Not needed until content volume justifies it |

---

## Edge Cases and Guardrails

| Scenario | Behavior |
|----------|----------|
| Zero BIP content exists | Empty state card with CTA to claim a project |
| Bot email spam on subscribe | Unique constraint prevents duplicates; rate limiting can be added later |
| Invalid email format | Client-side zod validation before INSERT |
| User subscribes then wants to unsubscribe | V2 -- for now the `unsubscribed_at` column exists for future use |
| Builder deletes a BIP post | Feed auto-updates on next load (reads live data) |

---

## Technical Details

### Database Migration
- Create `project_subscribers` table with RLS
- Public INSERT policy (email collection is a public action)
- No public SELECT (subscriber lists are private)

### Files Created
1. `src/components/explorer/BuildersInPublicFeed.tsx` -- Feed component with post cards grid
2. `src/components/explorer/BuilderPostCard.tsx` -- Individual post card with tweet embed + subscribe button
3. `src/components/explorer/SubscribePopover.tsx` -- Email input popover for subscribing
4. `src/hooks/useBuildersFeed.ts` -- Data fetching hook for BIP content across all profiles
5. `src/hooks/useProjectSubscribe.ts` -- Mutation hook for subscribing to a project

### Files Modified
1. `src/pages/Explorer.tsx` -- Add 4th tab "Builders In Public" after Ecosystem Pulse
2. `src/components/explorer/index.ts` -- Export new components

### No new dependencies needed
- `react-tweet` already installed
- `zod` already installed for validation
- Supabase client already configured

