

# DAO Tracker System Audit: Full Review

## 1. Intent vs Reality -- The Core Disconnect

### Original Intent (Reconstructed)
The DAO Tracker was designed to be the "Assurance Layer" bridging DAO funding to project execution. The intended user journey:

1. Builder registers via `/claim-profile`, links a Realm DAO address, requests funding with milestone-based allocations
2. A governance proposal is created on-chain for the DAO to vote on
3. Funded milestones are tracked, evidence submitted, escrow released via governance votes
4. The `/accountability` page shows all DAOs with their projects and delivery rates
5. The `/bounty-board` allows creating task bounties with configurable release modes

### What Actually Exists

**Database reality:**
- 231 registered profiles, but only **1** has a `realms_dao_address` set (VIBE60)
- **0** funding proposals exist
- **0** bounties exist
- **0** notifications exist

**This means the entire DAO Tracker ecosystem is operationally empty.** The `/accountability` page shows 1 DAO card at best. No user has gone through the funding request flow. No bounties have been created.

---

## 2. Registration Flow -- Critical UX Gap

### The Realms DAO Address Field Is Buried and Unexplained

The `realms_dao_address` input lives in **Step 2 (Core Identity)** inside a section called "The Digital Office" marked as **OPTIONAL**. It has a single line of help text: "Link your Realms governance to track proposal delivery rates."

**Problems:**
- A non-technical builder has no idea what a "Realms DAO Address" is
- There is no validation that the address actually corresponds to a valid Realm on-chain
- There is no guidance on how to find their Realm address
- It is not connected to any visual payoff in Step 2 -- the user cannot see what benefit it provides
- The field is treated identically to a Discord URL -- zero ceremony for what is supposedly a core feature

### The Funding Request Form Only Appears on Step 5 AND Only If Milestones Exist AND DAO Address Is Set

The `FundingRequestForm` component has **three gatekeeping conditions**:
1. `realmsDaoAddress` must be non-empty (set in Step 2, three steps earlier)
2. There must be milestones in the `RoadmapForm` (Step 5)
3. The user must toggle the funding switch ON

**This is a discovery disaster.** A builder who does not know to enter a Realms address on Step 2 will never see the funding form on Step 5. There is no backlink, no prompt, no "hey, you could unlock DAO funding if you add your governance address."

---

## 3. Reverse-Engineered User Journey Failures

### Journey: "Builder wants DAO funding"

```text
Expected: Register -> Link DAO -> Request SOL -> Submit Proposal -> Get Funded
Actual:   Register -> Miss the DAO field (Step 2) -> Skip to GitHub (Step 3) 
          -> Skip Media (Step 4) -> See Roadmap but NO funding form (Step 5)
          -> Complete Registration -> No funding, no proposal, no DAO link
```

### Journey: "DAO member wants to track accountability"

```text
Expected: Visit /accountability -> See DAOs -> Drill into delivery rates
Actual:   Visit /accountability -> See 1 DAO card (VIBE60) -> No milestones, 
          no proposals, no delivery data -> Effectively empty page
```

### Journey: "Builder wants to create a bounty"

```text
Expected: Visit /bounty-board -> Create bounty with release mode
Actual:   Visit /bounty-board (NOT in navigation!) -> Must be authenticated 
          AND have a profile with realms_dao_address -> 0 users qualify 
          except VIBE60 owner -> Empty board
```

**Critical finding:** `/bounty-board` is NOT in the main navigation (`navLinks` array). It is only reachable from `/accountability` via a back-link in BountyBoard itself (which points TO accountability, not FROM). There is NO link FROM accountability TO bounty-board.

---

## 4. Technical Issues and Silent Failures

### 4a. `useAccountabilityData` Queries `claimed_profiles` Directly

The hook queries `claimed_profiles` (not the public view) with `as any` type casts. While RLS policies allow reading verified profiles, the `as any` casts bypass TypeScript safety entirely. If the table schema changes, this will silently fail.

### 4b. On-Chain Proposal Creation Is a Silent No-Op

`SubmitProposalDialog` attempts on-chain proposal creation via `useCreateFundingProposal`, but:
- If the wallet is not connected, it creates only a DB record and shows a toast
- If on-chain fails, it catches the error, logs a warning, and shows a toast saying "DB record created"
- The user has no way to retry the on-chain submission later
- `useFundingProposal` polls for proposal state, but if no `proposal_address` was ever stored (because on-chain failed), it polls nothing

### 4c. FundingStatusWidget Shows Hardcoded Zero Progress

Line 59: `const releasedAmount = 0; // TODO: track released per milestone via on-chain escrow state`

The progress bar will always show 0/X SOL released. This is "illusion of correctness" -- the UI looks functional but is literally hardcoded.

### 4d. Notifications Are Fully Wired But Never Triggered

The notification system (manage-notifications edge function, NotificationBell, NotificationPanel) is deployed and integrated into Navigation. But NO code path actually creates notifications. The bounty lifecycle, funding proposals, and profile events do not invoke the notification creation endpoint.

### 4e. Bounty Board RLS Blocks Everything

The bounties table has:
- INSERT: `false` (only service role can insert)
- UPDATE: `false` (only service role can update)

The `manage-bounty` edge function uses the service role key, which is correct. But there is no validation that the `creator_x_user_id` in the edge function actually matches the authenticated caller. Any authenticated user could create bounties impersonating another user's X ID.

---

## 5. Design and Cognitive Load Issues

### 5a. The Registration Flow Has No DAO-Specific Path

Every builder sees the same 5-step flow regardless of whether they want DAO funding or not. There is no branching logic, no "I want DAO funding" selection that would surface the relevant fields. The DAO features are scattered across steps (address in Step 2, milestones in Step 5, funding form in Step 5) with no coherent narrative.

### 5b. Accountability Page Has No Onboarding

When `/accountability` is empty (the current state for nearly all users), it shows: "Projects need to link their Realm DAO address during registration to appear here." But it does not explain what a Realm DAO address is, why a builder would want to link one, or how the system works. Zero educational context.

### 5c. Bounty Board is Orphaned

No navigation link, no cross-reference from accountability, no breadcrumb from the main flow. The "Back to DAO Tracker" link in BountyBoard goes TO accountability but nothing goes FROM accountability TO bounty-board.

---

## 6. Backend Integrity Issues

### 6a. `claim-profile` Edge Function Fire-and-Forget Pattern

Lines 104-141 of `claim-profile/index.ts` fire off 5 background analysis calls (dependencies, governance, TVL, bytecode, security) with `.catch(() => {})`. These silently swallow all errors. If the GitHub token is invalid, if the RPC node is down, if the function times out -- nothing is logged, nothing is retried, no one knows.

### 6b. No Realm Address Validation

The `realmsDaoAddress` field accepts any base58-looking string. There is no on-chain verification that it corresponds to an actual Realm governance account. A user could enter a random wallet address and it would be stored and displayed in the DAO Tracker.

### 6c. Milestone Data Model Confusion

The `claimed_profiles.milestones` column uses a `Phase[]` type (phases containing milestones). The `bounties.milestones` column uses a flat `{title, sol}[]` structure. The `funding_proposals.milestone_allocations` uses yet another format `{milestone_id, phase_title, milestone_title, sol_amount}[]`. Three different milestone schemas in one system.

---

## 7. Readiness Verdict: NOT READY

The DAO Tracker system is **not ready for users**. It is architecturally complete but experientially broken.

### Mandatory Fixes (Before Release)

1. **Add navigation link to Bounty Board** from Accountability page
2. **Surface the DAO address field prominently** -- either as a separate step or with visual emphasis and education explaining what it is and why to add it
3. **Add a "Request DAO Funding" CTA** on Step 5 that tells the user to go back and add a Realm address if they haven't
4. **Wire notification triggers** into bounty lifecycle and funding proposal events
5. **Fix the hardcoded `releasedAmount = 0`** in FundingStatusWidget or remove the progress bar
6. **Validate Realm addresses on-chain** before storing them
7. **Authenticate bounty creators** -- verify the `creator_x_user_id` matches the calling user in the edge function

### Strategic Improvements (Soon)

1. **Create a "DAO Funding" branch** in the registration flow -- if a user indicates they want DAO funding, present a dedicated path that guarantees they fill in the Realm address AND milestones before completing registration
2. **Add educational content** to the Accountability page explaining the DAO-to-builder pipeline
3. **Unify milestone data models** into a single schema used across profiles, bounties, and funding proposals
4. **Add retry logic** for failed on-chain proposal creation
5. **Seed example/demo DAO data** so the accountability page is not empty on first visit

### Optional Polish (Later)

1. Remove `as any` type casts in useAccountabilityData
2. Add loading/error states to the FundingStatusWidget when on-chain polling fails
3. Add a "Coming Soon" indicator for the Multi-sig release mode rather than just greying it out
4. Consider making the Demo (/demo) walkthrough accessible from the DAO Tracker page

