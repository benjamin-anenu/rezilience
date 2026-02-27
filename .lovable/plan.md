

# Complete Fix and Bounty Board Implementation Plan

## Current State Summary

After auditing every file in the accountability flow, there are **3 blocking bugs** that make the feature dead, plus several strategic improvements needed before the Bounty Board (Phase 2) can be scaffolded.

---

## Part 1: Blocking Bug Fixes (Mandatory)

### Fix 1: `update-profile` Edge Function — Missing `realms_dao_address` in EDITABLE_FIELDS

**File**: `supabase/functions/update-profile/index.ts`

The `EDITABLE_FIELDS` whitelist on line 62-72 does not include `realms_dao_address`. When SettingsTab sends this field, it is silently filtered out and never saved.

**Change**: Add `"realms_dao_address"` to the `EDITABLE_FIELDS` array.

Also update the `milestones` type interface (lines 31-45) to include `deliveryEvidence` and the full status union (`dao_approved`, `dao_rejected`), since the edge function currently strips those fields during type narrowing.

### Fix 2: SettingsTab Change Detection Bug

**File**: `src/components/profile/tabs/SettingsTab.tsx`

Line 33 compares `realmsDaoAddress` against `(profile as any).realmsDaoAddress` but the initialization on line 21 checks `(profile as any).realms_dao_address || (profile as any).realmsDaoAddress`. These are inconsistent. The change detection comparison should match the initialization logic.

**Change**: Use the same dual-check in the `useEffect` change detection:
```typescript
realmsDaoAddress !== ((profile as any).realms_dao_address || (profile as any).realmsDaoAddress || '')
```

### Fix 3: Milestone Status Type in Edge Function

**File**: `supabase/functions/update-profile/index.ts`

The milestone status type (line 42) only allows `"upcoming" | "completed" | "overdue"`. The frontend types include `"dao_approved" | "dao_rejected"`. If these statuses are ever set, the edge function's type interface would cause issues.

**Change**: Update the status union to match the frontend types, and add `deliveryEvidence` to the milestone sub-type.

---

## Part 2: End-to-End Testability

### Problem
Zero rows exist with `realms_dao_address`. You cannot test the accountability dashboard without at least one project having a Realm DAO address.

### Solution: Two paths to populate data

**Path A — Via Claim Flow (already wired)**
1. Go to `/claim-profile`
2. Authenticate with X
3. On Step 2 (Core Identity), select any category
4. Enter a valid Realm DAO address (e.g., `7vrFDrK9GRNX7YZXbo7N3kvta7Pbn6W1hCXQ6C7WBxG9`)
5. Complete the rest of the flow
6. The `claim-profile` edge function uses `...rest` spread and WILL save `realms_dao_address`
7. Navigate to `/accountability` — the project should appear

**Path B — Via SettingsTab (currently broken, fixed in Fix 1)**
1. Go to `/profile/:id` as the profile owner
2. Settings tab -> enter Realm DAO address
3. Save -> After Fix 1, this will actually persist

**Path C — Quick database insert for testing**
If needed, we can manually set a `realms_dao_address` on an existing profile via the database to validate the UI immediately.

---

## Part 3: Bounty Board (Phase 2 Scaffold)

The Bounty Board is intentionally Phase 2 (future). The current plan is to build the **UI scaffold with disabled/coming-soon state** so the feature shape is visible and the waitlist captures interest properly.

### 3a: Persistent Waitlist (Fix the "NOTIFY ME" button)

**Current Problem**: `PhaseTimeline.tsx` line 10-14 shows a toast but saves nothing.

**Solution**: Create a `bounty_waitlist` table and a small edge function to persist interest.

**Database Migration**:
```sql
CREATE TABLE public.bounty_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  wallet_address text,
  x_user_id text,
  x_username text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bounty_waitlist_unique_email UNIQUE (email)
);

ALTER TABLE public.bounty_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (public waitlist)
CREATE POLICY "Anyone can join waitlist"
  ON public.bounty_waitlist FOR INSERT
  WITH CHECK (true);

-- No public reads (admin only)
CREATE POLICY "No public reads"
  ON public.bounty_waitlist FOR SELECT
  USING (false);
```

**Edge Function**: `supabase/functions/join-bounty-waitlist/index.ts`
- Accepts `{ email?, wallet_address?, x_user_id?, x_username? }`
- Upserts into `bounty_waitlist`
- Returns success/already-registered

**Frontend Change**: Update `PhaseTimeline.tsx` to:
- Show a small email input + "NOTIFY ME" button
- If user is authenticated (has X), auto-include their X info
- Call the edge function instead of just showing a toast
- Show "You're on the list!" confirmation state

### 3b: Bounty Board Page Scaffold

**New File**: `src/pages/BountyBoard.tsx`

A page at `/bounty-board` that shows:
- Phase 2 header with "COMING Q2 2026" badge
- Visual mockup/wireframe of what the Bounty Board will look like
- Feature list: Escrowed SOL rewards, on-chain claim/submit/approve, automated fund release, milestone-linked payouts
- A larger "JOIN WAITLIST" CTA with email capture
- Link back to the current Accountability Dashboard

**New Route**: Add `/bounty-board` to `App.tsx`

### 3c: Navigation Update

No new nav link needed (avoid clutter). The Bounty Board is accessed via the Phase 2 card on the Accountability page.

**Update `PhaseTimeline.tsx`**: Add a "LEARN MORE" link from the Phase 2 card to `/bounty-board`.

---

## Part 4: Additional Verification Fixes

### 4a: `claimed_profiles_public` View Missing Columns

The public view does NOT include `realms_dao_address`, `realms_delivery_rate`, `realms_proposals_total`, `realms_proposals_completed`. The accountability hook queries `claimed_profiles` directly (not the public view), so this works via RLS. However, for consistency and to avoid future breakage if someone refactors to use the public view:

**Database Migration**: Recreate the view to include the Realms columns.

### 4b: Variance Request Crash Guard

**File**: `src/components/profile/tabs/RoadmapManagement.tsx`

Line 324 already has `phase.milestones.length > 0` guard. This was fixed in the previous round. Verified.

### 4c: Legacy Route Redirects

**File**: `src/App.tsx`

The current code has:
```tsx
<Route path="/staking" element={<Accountability />} />
<Route path="/my-bonds" element={<Accountability />} />
```

These render the Accountability page directly (not a redirect). This works but doesn't update the URL bar. For SEO and UX, these should use `<Navigate to="/accountability" replace />` instead.

---

## Implementation Order

1. **Fix update-profile edge function** (add `realms_dao_address` to EDITABLE_FIELDS, update milestone types) and redeploy
2. **Fix SettingsTab change detection** consistency
3. **Fix legacy route redirects** to use `<Navigate>`
4. **Create `bounty_waitlist` table** via migration
5. **Create `join-bounty-waitlist` edge function**
6. **Update PhaseTimeline** with email capture and edge function call
7. **Create BountyBoard page** scaffold with coming-soon state
8. **Add `/bounty-board` route** to App.tsx
9. **Update `claimed_profiles_public` view** to include Realms columns

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/update-profile/index.ts` | Add `realms_dao_address` to EDITABLE_FIELDS, update milestone types |
| `src/components/profile/tabs/SettingsTab.tsx` | Fix change detection consistency |
| `src/App.tsx` | Add `/bounty-board` route, fix legacy redirects |
| `src/components/accountability/PhaseTimeline.tsx` | Add email capture, call waitlist edge function, link to Bounty Board |

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/join-bounty-waitlist/index.ts` | Persist waitlist interest |
| `src/pages/BountyBoard.tsx` | Phase 2 scaffold page with feature preview and waitlist CTA |

## Database Changes

| Change | Type |
|--------|------|
| Create `bounty_waitlist` table with RLS | Migration |
| Update `claimed_profiles_public` view to include Realms columns | Migration |

---

## Testing Checklist (End-to-End)

After implementation:

1. Register a new project via `/claim-profile` with Realm DAO address `7vrFDrK9GRNX7YZXbo7N3kvta7Pbn6W1hCXQ6C7WBxG9`
2. Verify it appears on `/accountability`
3. Click into the DAO detail page
4. Go to `/profile/:id` Settings tab, change Realm DAO address, save, verify it persists
5. Go to Roadmap tab, mark a milestone complete with evidence, verify evidence shows on accountability detail
6. Click "NOTIFY ME" on Phase 2 card, enter email, verify it saves to `bounty_waitlist`
7. Navigate to `/bounty-board`, verify the scaffold page renders
8. Visit `/staking` and `/my-bonds`, verify redirect to `/accountability`
9. Visit `/accountability/invalid-address`, verify graceful empty state

