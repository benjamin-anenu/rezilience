

# Bounty Board: Full Build + End-to-End Flow Audit

## Flow Diagram

The complete user journey from registration to SOL release on devnet:

```text
+-------------------+     +-------------------+     +-------------------+
|  1. SIGN IN VIA X |---->|  2. CORE IDENTITY |---->|  3. GITHUB + SOC  |
|  (Auth)           |     |  Name, Category,  |     |  Repo URL, Socials|
|                   |     |  Realm DAO Addr   |     |                   |
| [AVAILABLE]       |     | [AVAILABLE]       |     | [AVAILABLE]       |
+-------------------+     +-------------------+     +-------------------+
                                                            |
                          +-------------------+     +-------------------+
                          |  5. ROADMAP       |<----|  4. MEDIA         |
                          |  Add Phases &     |     |  Videos, Images   |
                          |  Milestones       |     |                   |
                          | [AVAILABLE]       |     | [AVAILABLE]       |
                          +-------------------+     +-------------------+
                                  |
                                  v
                          +-------------------+
                          |  6. SUBMIT        |
                          |  claim-profile EF |
                          |  saves to DB      |
                          | [AVAILABLE]       |
                          +-------------------+
                                  |
          +-----------------------+-----------------------+
          v                                               v
+-------------------+                           +-------------------+
|  7. DAO TRACKER   |                           |  8. PROFILE MGT   |
|  /accountability  |                           |  /profile/:id     |
|  Groups by Realm  |                           |  Settings, Roadmap|
| [AVAILABLE]       |                           | [AVAILABLE]       |
+-------------------+                           +-------------------+
          |                                               |
          v                                               v
+-------------------+                           +-------------------+
|  9. DAO DETAIL    |                           | 10. MARK COMPLETE |
|  /accountability/ |                           |  Submit delivery  |
|  :realmAddress    |                           |  evidence         |
| [AVAILABLE]       |                           | [AVAILABLE]       |
+-------------------+                           +-------------------+
          |                                               |
          v                                               v
+-------------------+                           +-------------------+
| 11. VIEW ON REALMS|                           | 12. CREATE REALMS |
|  Deep-link to     |                           |  PROPOSAL         |
|  app.realms.today |                           |  For milestone    |
| [AVAILABLE]       |                           |  approval         |
+-------------------+                           | [NOT BUILT]       |
                                                +-------------------+
                                                          |
                                                          v
+-------------------+     +-------------------+     +-------------------+
| 15. SOL RELEASE   |<----| 14. BOUNTY BOARD  |<----| 13. DAO VOTE      |
|  Escrow releases  |     |  Claim bounties,  |     |  Community votes  |
|  SOL to builder   |     |  submit work,     |     |  on proposal via  |
|                   |     |  track payouts    |     |  Realms           |
| [NOT BUILT]       |     | [NOT BUILT -      |     | [NOT BUILT]       |
|  Needs Solana     |     |  SCAFFOLD ONLY]   |     |  Needs Realms     |
|  program          |     |                   |     |  integration      |
+-------------------+     +-------------------+     +-------------------+
```

**Legend:**
- AVAILABLE = Implemented and functional
- NOT BUILT = Requires Solana program development (outside Lovable's scope)
- SCAFFOLD ONLY = UI exists but no on-chain logic

---

## Honest Assessment: What CAN and CANNOT Be Built Here

### What Lovable CAN build (this plan):
1. A fully interactive Bounty Board UI with real bounty data from the database
2. CRUD operations for bounties (create, claim, submit evidence, view)
3. Status tracking and filtering
4. Integration with existing milestone/evidence system
5. Wallet connection for builder identification
6. Database-backed bounty lifecycle (created -> claimed -> submitted -> approved/rejected)

### What Lovable CANNOT build:
1. **Solana escrow program** - Requires Rust/Anchor smart contract deployment
2. **Automated SOL release** - Requires on-chain program instruction
3. **On-chain proposal creation** - Requires Realms SDK integration with transaction signing
4. **DAO vote tallying** - Requires polling spl-governance accounts in real time

**The SOL release flow (steps 12-15) requires a custom Solana program.** No amount of frontend code can escrow SOL or release it trustlessly. This is a Solana Anchor program that would need to be built separately, deployed on devnet, and then integrated via wallet adapter transactions.

---

## What We WILL Build: Full Bounty Board with Database-Backed Lifecycle

Instead of a static scaffold, we build a **real bounty management system** backed by the database, with the on-chain escrow/release as a clearly marked "Phase 3" upgrade path.

### Architecture

```text
bounty_boards (table)
  |-- id, realm_dao_address, name, created_by
  |
bounties (table)
  |-- id, board_id, title, description, reward_sol
  |-- status: open | claimed | submitted | approved | rejected | paid
  |-- creator_x_user_id, claimer_x_user_id, claimer_wallet
  |-- evidence_summary, evidence_links
  |-- milestone_id (optional link to existing milestone)
  |-- created_at, claimed_at, submitted_at, resolved_at
```

---

## Bugs and Issues Found During Audit

### Bug 1: `update-profile` CORS Headers Are Incomplete
**File:** `supabase/functions/update-profile/index.ts` line 4
The CORS headers only include `authorization, x-client-info, apikey, content-type` but are missing `x-supabase-client-platform`, `x-supabase-client-platform-version`, `x-supabase-client-runtime`, `x-supabase-client-runtime-version`. This can cause CORS preflight failures in some browsers/environments.
**Fix:** Update to match the standard CORS headers used by other edge functions.

### Bug 2: `deliveryEvidence` Type Mismatch in Edge Function
**File:** `supabase/functions/update-profile/index.ts` lines 43-46
The TypeScript interface defines `deliveryEvidence` with `{ description, links, submittedAt }` but the frontend sends `{ summary, metricsAchieved, videoUrl, githubLinks, submittedAt }`. The data flows correctly because the interface is not enforced at runtime (milestones are stored as JSONB), but the type is misleading and would cause issues if anyone adds runtime validation.
**Fix:** Update the interface to match the actual `DeliveryEvidence` type from the frontend.

### Bug 3: No Rate Limiting on Bounty Waitlist
The `bounty_waitlist` table has no rate limiting trigger, unlike `project_subscribers` which has `check_subscriber_rate_limit`. A bad actor could spam thousands of entries.
**Fix:** Add a rate limit trigger (5 signups per email per hour).

---

## Implementation Plan

### Step 1: Fix Edge Function Bugs
- Update `update-profile` CORS headers to include all required Supabase client headers
- Fix the `deliveryEvidence` type interface to match the frontend shape
- Add rate limiting trigger to `bounty_waitlist` table

### Step 2: Create Bounty Database Schema
New migration to create:
- `bounties` table with columns: id, realm_dao_address, title, description, reward_sol, status, creator_profile_id, creator_x_user_id, claimer_profile_id, claimer_x_user_id, claimer_wallet, evidence_summary, evidence_links (jsonb), linked_milestone_id, created_at, claimed_at, submitted_at, resolved_at
- RLS: Public read for all bounties, insert/update only via edge functions (deny-all for direct writes)

### Step 3: Create Bounty Management Edge Function
New edge function `manage-bounty` handling:
- `POST /create` - DAO owner creates a bounty (requires x_user_id ownership of a profile with matching realm_dao_address)
- `POST /claim` - Builder claims an open bounty (requires x_user_id, wallet address)
- `POST /submit` - Builder submits evidence (requires claimer match)
- `POST /approve` or `POST /reject` - DAO owner approves/rejects (requires creator match)

### Step 4: Rebuild Bounty Board Page
Replace the current scaffold with a full interactive page:
- **Header section:** Board title, realm info, total bounties, total SOL allocated
- **Filter bar:** Status filter (All, Open, Claimed, Submitted, Approved), search
- **Bounty cards grid:** Each card shows title, reward, status, claimer (if claimed), evidence (if submitted)
- **Create Bounty dialog:** For DAO owners (authenticated users with a profile that has a realm_dao_address)
- **Claim flow:** Connect wallet -> claim bounty -> see it in "My Bounties"
- **Submit Evidence dialog:** Summary, metrics, links (reuses existing evidence pattern)
- **Approve/Reject actions:** For the bounty creator

### Step 5: Bounty Detail View
New route `/bounty-board/:bountyId` showing:
- Full bounty details, description, reward
- Timeline of status changes
- Evidence submission (if claimed by current user)
- Approve/reject buttons (if owned by current user)
- "Escrow coming soon" badge where SOL release would happen

### Step 6: Wire Bounty Board into DAO Tracker
- Add a "BOUNTIES" tab or section on `/accountability/:realmAddress`
- Show bounties associated with that realm's DAO address
- "Create Bounty" button for profile owners

### Step 7: Navigation and Routing
- Keep existing `/bounty-board` route but make it the browsable bounty listing
- Add `/bounty-board/:id` for individual bounty detail
- Keep "LEARN MORE" link from PhaseTimeline

---

## End-to-End Testing Steps

### Prerequisites
You need an X (Twitter) account and a browser with Phantom wallet extension installed.

### Flow A: Register a Project with Realm DAO Address
1. Go to `/claim-profile`
2. Click "Sign in with X" and authenticate
3. On Step 2 (Core Identity), fill in: Project Name, Category, Country
4. In "The Digital Office" section, enter a Realm DAO address: `7vrFDrK9GRNX7YZXbo7N3kvta7Pbn6W1hCXQ6C7WBxG9`
5. Proceed to Step 3, enter a public GitHub repo URL, wait for analysis
6. Skip Step 4 (Media) or add optional media
7. On Step 5 (Roadmap), add a Phase with at least one Milestone with a target date
8. Lock the phase
9. Submit the profile
10. **Verify:** Navigate to `/accountability` -- your project should appear grouped under the DAO address

### Flow B: Update Realm Address via Settings
1. Go to `/profile/<your-profile-id>`
2. Click the Settings tab
3. Enter or change the Realm DAO Address field
4. Click Save Changes
5. **Verify:** Navigate to `/accountability` -- the updated address should be reflected

### Flow C: Submit Delivery Evidence
1. Go to `/profile/<your-profile-id>`
2. Click the Roadmap tab
3. Find a milestone and click "Complete"
4. Fill in: Summary of Work Done, Metrics Achieved, optional Video URL and GitHub PRs
5. Submit
6. **Verify:** Navigate to `/accountability/<realm-address>` -- the milestone should show "COMPLETED" with evidence visible

### Flow D: Bounty Board (after implementation)
1. Navigate to `/bounty-board`
2. If you own a profile with a Realm DAO address, click "Create Bounty"
3. Fill in title, description, reward amount
4. Submit -- bounty appears as "OPEN"
5. (As a different user or same user for testing) Click "Claim" on the bounty
6. Connect wallet -- bounty moves to "CLAIMED"
7. Click "Submit Evidence" -- fill in summary, links
8. Submit -- bounty moves to "SUBMITTED"
9. (As the creator) Click "Approve" -- bounty moves to "APPROVED"
10. **The "Release SOL" step shows a "Coming Soon - Requires On-Chain Program" indicator**

### Flow E: Bounty Waitlist
1. On `/bounty-board`, scroll to the waitlist CTA
2. Enter an email and click "Notify Me"
3. **Verify:** Check `bounty_waitlist` table for the entry

### Flow F: Legacy Redirects
1. Visit `/staking` -- should redirect to `/accountability`
2. Visit `/my-bonds` -- should redirect to `/accountability`

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/update-profile/index.ts` | Fix CORS headers, fix deliveryEvidence type |
| `src/pages/BountyBoard.tsx` | Complete rewrite: full bounty management UI |

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/manage-bounty/index.ts` | Bounty CRUD edge function |
| `src/hooks/useBounties.ts` | React Query hooks for bounty data |
| `src/components/bounty/BountyCard.tsx` | Individual bounty card component |
| `src/components/bounty/CreateBountyDialog.tsx` | Dialog to create a new bounty |
| `src/components/bounty/ClaimBountyDialog.tsx` | Dialog to claim a bounty |
| `src/components/bounty/SubmitEvidenceDialog.tsx` | Dialog to submit work evidence |
| `src/components/bounty/BountyFilters.tsx` | Status filter and search bar |
| `src/components/bounty/index.ts` | Barrel exports |

## Database Changes

| Change | Type |
|--------|------|
| Create `bounties` table with status lifecycle | Migration |
| Add rate limit trigger to `bounty_waitlist` | Migration |
| Add `verify_jwt = false` for `manage-bounty` in config.toml | Config (auto-managed) |

## Technical Notes

- The `bounties` table uses deny-all RLS for writes (all mutations go through the `manage-bounty` edge function with service role)
- Public SELECT is allowed so any visitor can browse bounties
- Bounty ownership is validated server-side by matching `creator_x_user_id` against the profile's `x_user_id` that owns the realm
- The "Paid" status exists in the schema for future on-chain integration but cannot be set until a Solana escrow program is deployed
- The waitlist CTA remains on the page for users interested in the on-chain escrow features (Phase 3)

