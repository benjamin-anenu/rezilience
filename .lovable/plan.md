

# Registry-Driven DAO Funding: Integrated Proposal and Milestone Release System

## Concept

Instead of a separate "Apply for Grant" page, the **existing registration flow** (Claim Profile) becomes the funding application. When a builder registers their project with a Realm DAO address and milestones, the system automatically creates a governance proposal on that Realm. The DAO community votes to accept or reject. If accepted, the milestones defined during registration become the escrow release schedule -- each milestone completion triggers a proportional SOL release governed by DAO votes.

This creates a powerful incentive loop: **register your project on Rezilience = get tracked + get funded**.

```text
BUILDER REGISTERS ON REZILIENCE
(with Realm DAO Address + Milestones + Requested SOL)
            |
            v
AUTO-CREATE GOVERNANCE PROPOSAL ON REALM
"Accept [Project Name] into the ecosystem for X SOL?"
            |
            v
    DAO COMMUNITY VOTES
    (Yes / No on Realms)
            |
     +------+------+
     |             |
  ACCEPTED      REJECTED
     |             |
     v             v
ESCROW FUNDED   Profile stays
(Total SOL      but unfunded
 locked in PDA)
     |
     v
MILESTONE 1 COMPLETED
(Builder submits evidence)
     |
     v
DAO VOTES ON MILESTONE 1 RELEASE
(Auto-created proposal: "Release X SOL for Milestone 1")
     |
     v
SOL RELEASED TO BUILDER
     |
     v
MILESTONE 2... (repeat)
```

## What Changes

### 1. Registration Flow Enhancement (ClaimProfile.tsx)

The existing Step 5 (Roadmap) gets enhanced with a **Funding Request** section:

- **Realm DAO Address** moves from optional to prominently featured (available for ALL categories, not just DAO/DeFi)
- New field: **Total Funding Requested** (SOL amount)
- New field: **SOL Allocation Per Milestone** -- builder assigns a SOL amount to each milestone within their phases
- The Roadmap step subtitle changes to: "Define your milestones. Each milestone can unlock a portion of your funding."
- A summary card shows: "Total requested: X SOL across Y milestones"

### 2. Auto-Proposal on Registration (claim-profile edge function)

When a profile is claimed/created AND has a `realms_dao_address` AND has `funding_requested_sol > 0`:

- The backend fires a **new edge function** (`create-funding-proposal`) that constructs a Realms governance proposal using `@solana/spl-governance`
- Proposal title: "Accept [Project Name] for [X] SOL funding"
- Proposal description: includes project description, milestone breakdown, GitHub link, Rezilience profile link
- The proposal address is stored in a new `funding_proposals` table linked to the profile

However, since creating an on-chain proposal requires a wallet signature (the builder's), this cannot be fully server-side. Instead:

- After successful registration, the builder is shown a **"Submit Funding Proposal"** dialog
- This dialog pre-fills all data and asks the builder to sign a single wallet transaction
- The transaction creates the proposal on-chain via spl-governance
- The proposal address is saved to the database

### 3. New Database Table: `funding_proposals`

```text
funding_proposals
  id                    uuid (PK)
  profile_id            uuid (FK -> claimed_profiles.id)
  realm_dao_address     text
  requested_sol         numeric
  milestone_allocations jsonb    -- [{milestone_id, phase_id, sol_amount}]
  proposal_address      text     -- on-chain Realms proposal
  proposal_tx           text     -- creation tx signature
  status                text     -- pending_signature, voting, accepted, rejected, funded, completed
  funded_at             timestamptz
  escrow_address        text
  created_at            timestamptz
  updated_at            timestamptz
```

### 4. New Column on `claimed_profiles`

- `funding_requested_sol` (numeric, nullable) -- total SOL the builder is requesting
- `funding_status` (text, nullable) -- 'pending' | 'voting' | 'accepted' | 'rejected' | 'funded' | 'completed'

### 5. Milestone-Based SOL Allocation in Roadmap

Each `PhaseMilestone` in the types gets a new optional field:

- `sol_allocation`: number -- how much SOL is allocated to this milestone
- When a milestone is marked complete and evidence is submitted, the system creates a per-milestone release proposal on Realms
- The escrow program is called once per milestone (each milestone creates its own escrow PDA using seeds `["escrow", profile_id_hex, milestone_index]`)

### 6. Post-Registration Flow

After registration with a Realm + funding request:

1. Builder lands on their profile page
2. A banner shows: **"Your funding proposal is ready. Sign to submit it to [DAO Name]."**
3. Builder clicks, wallet signs, proposal goes on-chain
4. Profile page shows proposal status (Voting / Accepted / Rejected)
5. If accepted, the DAO (or a designated funder) funds the total escrow
6. Builder works on milestones, marks them complete with evidence
7. For each completed milestone, the system creates a release proposal
8. DAO votes on each release
9. SOL is released per milestone

### 7. Profile Page Funding Widget

A new section on the profile/dashboard page:

- Shows funding status: Proposal Pending / Voting / Accepted / In Progress / Completed
- Shows milestone progress with SOL amounts: "Milestone 1: 5 SOL (Released) | Milestone 2: 10 SOL (In Progress) | Milestone 3: 15 SOL (Locked)"
- "View on Realms" link (secondary, not primary)
- If the viewer is a DAO member: "Vote" button (in-app via spl-governance SDK)

### 8. Notification Triggers

When integrated with a future notification system:
- Builder registers with funding request -> DAO members notified
- DAO votes to accept -> Builder notified
- Milestone evidence submitted -> DAO members notified
- Milestone SOL released -> Builder notified

## Technical Implementation

### New Files
- `src/components/claim/FundingRequestForm.tsx` -- SOL allocation per milestone UI
- `src/components/claim/SubmitProposalDialog.tsx` -- post-registration proposal signing
- `src/components/profile/FundingStatusWidget.tsx` -- profile page funding tracker
- `src/hooks/useCreateFundingProposal.ts` -- spl-governance proposal creation
- `src/hooks/useFundingProposal.ts` -- fetch/poll proposal status
- `src/hooks/useMilestoneRelease.ts` -- per-milestone escrow + release proposal

### Modified Files
- `src/pages/ClaimProfile.tsx` -- add FundingRequestForm to Step 5, post-submit proposal dialog
- `src/components/claim/CoreIdentityForm.tsx` -- make Realm DAO address visible for all categories
- `src/components/claim/RoadmapForm.tsx` -- add SOL allocation field per milestone
- `src/types/index.ts` -- add `sol_allocation` to PhaseMilestone
- `supabase/functions/claim-profile/index.ts` -- store funding_requested_sol, set funding_status
- `src/pages/ProfileDetail.tsx` -- add FundingStatusWidget
- `src/pages/Dashboard.tsx` -- show funding status summary

### Database Migration
- Create `funding_proposals` table with RLS (public read, service-role write)
- Add `funding_requested_sol` and `funding_status` columns to `claimed_profiles`
- Update `claimed_profiles_public` view to include new columns

### Dependencies
- `@solana/spl-governance` -- required for in-app proposal creation and vote casting

## Edge Cases and Considerations

1. **Builder must hold governance tokens**: To create a proposal on a Realm, the builder needs to be a token holder in that DAO. If they are not, the UI will show: "You need governance tokens in this DAO to submit a funding proposal. Contact the DAO to get started."

2. **DAO may not want to fund**: The proposal is just that -- a proposal. The DAO votes no, and the project still gets tracked on Rezilience (the maintenance tracking value remains). No funding obligation.

3. **Milestone SOL allocation must sum to total**: Validation ensures the per-milestone allocations equal the total requested amount.

4. **Who funds the escrow?**: After the DAO votes to accept, a DAO treasury manager or the governance PDA itself needs to fund the escrow. This could be:
   - Manual: A DAO admin clicks "Fund" and signs a treasury transfer
   - Automated: The acceptance proposal itself includes a treasury transfer instruction (advanced, Phase 2)

5. **Realm DAO address for ALL categories**: Currently the field only shows for DAO/DeFi categories. This will be changed to show for all categories since any project can seek DAO funding.

6. **Projects without Realm address**: Registration works exactly as before -- no funding flow, just maintenance tracking. The funding request is entirely optional.

7. **Multiple DAOs**: Initially, a project can only request funding from one DAO (the one linked during registration). Multi-DAO support can come later.

## Execution Order

1. Database migration (funding_proposals table, new columns on claimed_profiles)
2. Update types (PhaseMilestone.sol_allocation)
3. Update CoreIdentityForm (show Realm field for all categories)
4. Build FundingRequestForm (SOL allocation per milestone)
5. Update RoadmapForm (integrate SOL allocation)
6. Update claim-profile edge function (store funding data)
7. Build SubmitProposalDialog (wallet-signed proposal creation)
8. Build FundingStatusWidget (profile page tracker)
9. Build useMilestoneRelease hook (per-milestone escrow + release)
10. Wire everything into ClaimProfile and ProfileDetail pages

