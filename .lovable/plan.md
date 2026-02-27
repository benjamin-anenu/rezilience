
# DAO Accountability Dashboard — Pre-Production Audit

## 1. Intent vs. Implementation Reconciliation

**Original Intent**: Convert staking into a DAO Accountability Dashboard that tracks milestone delivery, surfaces delivery evidence, and deep-links to Realms for voting. End-to-end touchpoints from registry join to DAO voter review.

**Critical Misalignment Found**:

The claim flow (`ClaimProfile.tsx`) **never passes `realmsDaoAddress` or `setRealmsDaoAddress` to `CoreIdentityForm`**. The props exist on the component but are never wired. This means:
- No project can ever get a `realms_dao_address` during registration
- The Accountability Dashboard will **always be empty**
- The entire feature is unreachable through the intended user flow

The only path to set `realms_dao_address` is via `SettingsTab.tsx` (post-registration edit), which is a secondary, undiscoverable path.

**Database confirms**: Zero rows have `realms_dao_address` set. The feature is currently dead.

---

## 2. Blocking Issues (Must Fix Before Release)

### B1: Claim flow does not wire Realms DAO Address
- `ClaimProfile.tsx` lines 595-608 render `CoreIdentityForm` without `realmsDaoAddress` / `setRealmsDaoAddress` props
- `handleDirectSubmit` (line 380-458) never sends `realms_dao_address` to the edge function
- `claim-profile` edge function uses `...rest` spread, so it would accept the field — but the frontend never sends it
- **Fix**: Add state variable, pass props to CoreIdentityForm, include in submission payload

### B2: Realms field only shows for `dao` or `defi` categories
- `CoreIdentityForm.tsx` line 51: `const isRealmsRelevant = category === 'dao' || category === 'defi';`
- An infrastructure project with a Realm DAO would never see this field
- **Fix**: Show the field for all categories (or at minimum add `infrastructure` and `other`), since any project type can have governance

### B3: SettingsTab uses wrong property path for initialization
- `SettingsTab.tsx` line 21: `useState((profile as any).realmsDaoAddress || '')`
- The `ClaimedProfile` type doesn't have `realmsDaoAddress` — the DB column is `realms_dao_address`
- The profile object from the API would have it as a snake_case or camelCase mapped field, but `(profile as any).realmsDaoAddress` is likely `undefined` always
- **Fix**: Verify the actual key name in the deserialized profile object and use the correct one

### B4: `useAccountabilityData` uses `as any` to bypass type safety
- Lines 37-38 cast the Supabase query as `any`, hiding potential runtime errors
- The `claimed_profiles_public` view (used for public reads) does NOT include `realms_dao_address`, `realms_delivery_rate`, `realms_proposals_total`, or `realms_proposals_completed`
- The hook queries `claimed_profiles` directly, but RLS policies restrict reads to `claimer_wallet IS NOT NULL` OR `verified = true` OR `claim_status = 'unclaimed'`
- For DAO voters (unauthenticated visitors), they can only see profiles where `verified = true` — this works, but the `as any` hides whether the columns actually return

### B5: No error state on Accountability pages
- `Accountability.tsx` and `AccountabilityDetail.tsx` never check `isError` from the query hook
- If the query fails (RLS denial, network error), the user sees the loading skeleton forever
- **Fix**: Add `isError` handling with a retry-able error state

---

## 3. Edge Cases and Failure Modes

### E1: DAO name derivation is wrong
- `AccountabilityDetail.tsx` line 25: `const realmName = projects[0]?.projectName`
- This shows the first PROJECT's name as the DAO name, which is misleading. If Marinade DAO has 3 projects, the DAO name shows as the first project's name, not the actual Realm name
- Same issue in `useAccountabilityData.ts` line 87: `realmName: projects[0]?.projectName || addr.slice(0, 8)`

### E2: Milestone status count mismatch between dashboard and detail
- `DAOCard` counts milestones with `status === 'completed' || status === 'dao_approved'`
- `RoadmapManagement` only sets status to `'completed'` — never `'dao_approved'`
- No mechanism exists to transition a milestone from `completed` to `dao_approved`
- The `dao_approved` and `dao_rejected` statuses in the type definition are aspirational — no code path sets them

### E3: Delivery evidence is modifiable after submission
- A builder can re-click "Complete" on an already-completed milestone (button hidden for completed, but they can modify milestones JSONB directly via update-profile)
- No immutability enforcement on submitted evidence
- Evidence `submittedAt` timestamp is client-generated (trivially falsifiable)

### E4: PhaseTimeline "Join Waitlist" button does nothing persistent
- `PhaseTimeline.tsx` line 11: shows a toast but doesn't save the email/interest anywhere
- Creates false confidence — user thinks they signed up but no data was captured

### E5: Variance request on locked phase with no milestones crashes
- `RoadmapManagement.tsx` line 330: `setSelectedMilestone({ phaseId: phase.id, milestone: phase.milestones[0] })`
- If a locked phase has 0 milestones, `phase.milestones[0]` is `undefined`, causing downstream errors

### E6: URL routing vulnerability
- `/accountability/:realmAddress` accepts any string as realmAddress
- No validation that it's a valid base58 address
- Malformed addresses will silently query the DB and return no results (harmless but poor UX)

---

## 4. Touchpoints and Coupling

### Missing link: claim-profile edge function
- The `claim-profile` edge function uses `...rest` spread for additional fields, so `realms_dao_address` would be accepted IF sent — but nothing in the frontend sends it during claim
- The `update-profile` edge function presumably handles updates from SettingsTab — this path works but is undiscoverable

### Broken link: `claimed_profiles_public` view
- The public view does not expose `realms_dao_address`, `realms_delivery_rate`, `realms_proposals_total`, `realms_proposals_completed`
- The accountability hook queries `claimed_profiles` directly (not the public view), which works only because of RLS allowing reads on verified/unclaimed profiles
- If RLS policies change, accountability breaks silently

### Orphaned routes
- `/staking` and `/my-bonds` routes were removed from App.tsx but old links may exist in:
  - External documentation, bookmarks, or indexed pages
  - No redirect from old routes to new ones — users get 404

---

## 5. Frontend Experience Audit

### Loading states: Adequate
- Both pages show skeletons during load

### Error states: Missing
- No error handling on either page
- No retry mechanism

### Empty state: Adequate but misleading
- The empty state says "Projects need to link their Realm DAO address during registration" but registration doesn't actually offer this field (see B1)

### Cognitive load issue: "ACCOUNTABILITY" in nav
- This is abstract jargon for most users. "DAO Tracker" or "Governance" would be clearer
- The nav label is long and takes significant horizontal space

### Trust erosion: Phase 2 banner
- The "BOUNTY BOARD COMING SOON" banner with "Q2 2026" is the first thing users see
- Leading with unavailable features before showing actual value erodes confidence
- Should be below the content, not above it

---

## 6. Backend Integrity

### Validation gaps
- No server-side validation of `realms_dao_address` format in `update-profile` or `claim-profile`
- A builder could save `"hello"` as their Realm address and it would appear on the dashboard

### Data integrity
- Milestones JSONB has no schema enforcement — any shape can be saved
- `deliveryEvidence.submittedAt` is client-generated, not server-generated
- Evidence can be overwritten without audit trail (only `updated_at` on the row changes)

### RLS is adequate
- Reads work for verified profiles
- Writes go through edge functions with service role

---

## 7. Readiness Verdict

**NOT READY** — The primary user flow (claim -> set DAO address -> appear on dashboard) is broken. The feature is architecturally sound but has a wiring gap that makes the entire dashboard unreachable through normal user journeys.

---

## Required Actions

### Mandatory (Blocking)
1. **Wire `realmsDaoAddress` in ClaimProfile.tsx** — add state, pass to CoreIdentityForm, include in submission payload to claim-profile edge function
2. **Show Realms field for ALL categories** (not just dao/defi) — or at minimum add a broader set
3. **Fix SettingsTab property access** — verify the correct key for `realms_dao_address` in the deserialized profile
4. **Add error states** to Accountability and AccountabilityDetail pages
5. **Add redirects** from `/staking` and `/my-bonds` to `/accountability`

### Strategic (Soon)
6. **Add server-side validation** of `realms_dao_address` format in edge functions
7. **Generate `submittedAt` server-side** in update-profile edge function
8. **Fix DAO name derivation** — use on-chain Realm name or allow builders to set a DAO display name
9. **Fix variance request crash** when phase has no milestones
10. **Move Phase 2 banner below content** to lead with value

### Polish (Later)
11. Rename nav label to something more accessible
12. Add `dao_approved` status transition mechanism (poll Realms proposals and auto-update)
13. Make the "Join Waitlist" button actually persist interest
14. Add URL validation for realmAddress route parameter
