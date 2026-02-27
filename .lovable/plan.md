
# DAO Accountability Dashboard — Architecture Plan

## Executive Summary

Convert `/staking` from a dormant "Bond of Continuity" page into a **DAO Accountability Dashboard** — a read-heavy intelligence layer that tracks milestone commitments, delivery evidence, and governance vote status for projects with Realm DAO addresses. Voting and fund release happen ON Realms (not in our app). Our value is the **accountability overlay**: aggregating, scoring, and surfacing delivery evidence so DAO voters can make informed decisions.

---

## Critical Architecture Decision: Voting & Signing

**The Hard Truth**: You cannot trigger Realms governance votes or multisig signatures from a third-party web app. The `spl-governance` program requires:
- Wallet holders to sign transactions directly against the governance program
- Council/token holders to cast votes via Realms UI or CLI
- Multisig members to sign via Squads or native tooling

**Our Role (What We CAN Do)**:
1. **Read** proposal states, vote counts, and execution status from on-chain data (we already do this)
2. **Deep-link** users directly to the correct proposal on `app.realms.today`
3. **Display** real-time vote progress (for/against/abstain counts)
4. **Surface** delivery evidence (videos, metrics, descriptions) that voters review BEFORE going to Realms to vote
5. **Track** when a proposal passes and funds are released (post-facto detection)

**This is the simplest, most honest approach** — we are the intelligence layer, Realms is the execution layer.

---

## Phase Timeline (Preserved)

```text
Phase 0: REGISTRY (LIVE) — Join, claim, set milestones
Phase 1: ACCOUNTABILITY DASHBOARD (THIS PLAN) — DAO view, evidence, deep-links
Phase 2: BOUNTY BOARD (FUTURE) — Escrowed rewards, on-chain claim/submit/approve
```

---

## Page Architecture

### Route Changes

| Old Route | New Route | Purpose |
|-----------|-----------|---------|
| `/staking` | `/accountability` | DAO Accountability Dashboard (list of DAOs) |
| `/my-bonds` | `/accountability/:realmAddress` | Single DAO detail (projects + milestones) |
| Nav label | `STAKING` becomes `ACCOUNTABILITY` | |

### Page 1: `/accountability` — DAO Directory

A grid/list of all DAOs (Realms) that have projects registered in the Rezilience Registry.

**Data source**: Query `claimed_profiles` where `realms_dao_address IS NOT NULL`, grouped by `realms_dao_address`.

**Each DAO card shows**:
- Realm name (derived from on-chain or project metadata)
- Number of registered projects
- Average Rezilience Score across projects
- Total milestones committed vs completed
- Last governance activity date
- Deep-link button: "VIEW ON REALMS" (opens `app.realms.today/dao/{address}`)

**Phase banner**: Keep the Phase 0/1/2 timeline + "Join Waitlist" for Phase 2 bounty features.

### Page 2: `/accountability/:realmAddress` — DAO Detail

Shows all projects under a specific Realm DAO with their milestone accountability.

**Layout**:
- **Header**: DAO name, address (truncated), total projects, link to Realms
- **Project cards** (one per registered project):
  - Project name, logo, Rezilience Score badge
  - Milestone timeline (Phases -> Milestones with status)
  - Delivery evidence for completed milestones
  - Proposal status from Realms (vote counts, state)
  - "VIEW PROPOSAL ON REALMS" deep-link per milestone

---

## Builder Flow (End-to-End Touchpoints)

```text
1. Builder visits /claim-profile
2. Step 2 (Core Identity): Enters program ID, wallet address
3. Step 5 (Roadmap): Creates Phases + Milestones (EXISTING)
4. NEW — Step 5b: Enters Realm DAO Address (optional field)
5. Profile created -> appears in Registry + Accountability Dashboard
6. Builder ships milestone -> goes to /profile/:id -> Roadmap tab
7. Clicks "Mark Complete" -> NEW: Must provide:
   a. Detailed description of work done
   b. Metrics achieved (quantitative)
   c. Video evidence link (YouTube/X)
   d. Optional: GitHub PR/commit links
8. Completion evidence saved to claimed_profiles.milestones JSONB
9. DAO voters visit /accountability/:realm -> see evidence
10. Voters click "VOTE ON REALMS" -> deep-linked to correct proposal
11. Our system polls Realms on-chain data -> updates proposal status
12. When proposal passes -> milestone marked as "DAO APPROVED"
```

---

## Database Changes

### 1. Add `realms_dao_address` input to claim flow (already exists in DB)

The `realms_dao_address` column already exists on `claimed_profiles`. We just need to expose it in the claim form (Step 5 or Core Identity).

### 2. Enhance `PhaseMilestone` type with delivery evidence

Update the `milestones` JSONB structure (no schema migration needed — it's JSONB):

```typescript
export interface PhaseMilestone {
  id: string;
  title: string;
  description: string;
  targetDate?: string;
  status: 'upcoming' | 'completed' | 'overdue' | 'dao_approved' | 'dao_rejected';
  completedAt?: string;
  // NEW: Delivery Evidence
  deliveryEvidence?: {
    summary: string;           // What was built/achieved
    metricsAchieved: string;   // Quantitative results
    videoUrl?: string;         // YouTube or X video link
    githubLinks?: string[];    // PR/commit URLs
    submittedAt: string;       // When evidence was submitted
  };
  // NEW: Realms Proposal Link
  realmsProposalAddress?: string;  // On-chain proposal address
  realmsProposalState?: string;    // Current state from on-chain
  realmsVotesFor?: number;
  realmsVotesAgainst?: number;
}
```

No database migration required — this is stored in the existing `milestones` JSONB column.

---

## File Changes

### New Files

1. **`src/pages/Accountability.tsx`** — DAO directory page (replaces Staking)
2. **`src/pages/AccountabilityDetail.tsx`** — Single DAO detail page (replaces MyBonds)
3. **`src/components/accountability/DAOCard.tsx`** — Card for each DAO in the directory
4. **`src/components/accountability/ProjectMilestoneCard.tsx`** — Project + milestones view
5. **`src/components/accountability/DeliveryEvidenceModal.tsx`** — Modal for submitting evidence
6. **`src/components/accountability/MilestoneTimeline.tsx`** — Visual timeline with status
7. **`src/components/accountability/index.ts`** — Barrel export
8. **`src/hooks/useAccountabilityData.ts`** — Fetch DAOs and projects grouped by realm

### Modified Files

1. **`src/App.tsx`** — Replace `/staking` and `/my-bonds` routes with `/accountability` and `/accountability/:realmAddress`
2. **`src/components/layout/Navigation.tsx`** — Change nav label from `STAKING` to `ACCOUNTABILITY`
3. **`src/types/index.ts`** — Add `deliveryEvidence` fields to `PhaseMilestone`
4. **`src/components/profile/tabs/RoadmapManagement.tsx`** — Enhance "Mark Complete" dialog to require evidence fields (summary, metrics, video URL)
5. **`src/components/claim/CoreIdentityForm.tsx`** or **`RoadmapForm.tsx`** — Add optional `realms_dao_address` input field
6. **`src/components/staking/ComingSoonOverlay.tsx`** — Repurpose for Phase 2 Bounty Board messaging

### Deleted/Deprecated Files

- `src/pages/Staking.tsx` — Replaced by Accountability.tsx
- `src/pages/MyBonds.tsx` — Replaced by AccountabilityDetail.tsx
- `src/components/staking/StakingForm.tsx` — No longer needed
- `src/components/staking/BondSummary.tsx` — No longer needed

---

## UI Design (Key Screens)

### Accountability Dashboard (`/accountability`)

```text
+--------------------------------------------------+
| PHASE 2 BANNER: Bounty Board coming soon [WAIT]  |
+--------------------------------------------------+
| DAO ACCOUNTABILITY DASHBOARD                      |
| Track milestone delivery across Solana DAOs       |
+--------------------------------------------------+
| [DAO Card 1]        | [DAO Card 2]               |
| Marinade DAO        | Mango DAO                  |
| 3 projects          | 2 projects                 |
| Avg Score: 72       | Avg Score: 65              |
| 8/12 milestones     | 3/7 milestones             |
| VIEW ->             | VIEW ->                    |
+--------------------------------------------------+
```

### DAO Detail (`/accountability/:realmAddress`)

```text
+--------------------------------------------------+
| < Back to Dashboard    MARINADE DAO               |
| 7vrF...BxG9  [VIEW ON REALMS]                    |
+--------------------------------------------------+
| PROJECT: Marinade Finance                         |
| Score: 82 | Status: ACTIVE                        |
|                                                   |
| Phase 1: Foundation          [DAO APPROVED]       |
|   MS 1: MVP Launch           [COMPLETED]          |
|     Evidence: "Built core staking..."             |
|     Video: youtube.com/...                        |
|     Metrics: 1000 users, $2M TVL                  |
|     [VIEW PROPOSAL ON REALMS]                     |
|                                                   |
|   MS 2: Security Audit       [IN PROGRESS]        |
|     [AWAITING EVIDENCE]                           |
|                                                   |
| Phase 2: Growth              [LOCKED]             |
|   MS 3: Mainnet Deploy       [UPCOMING]           |
+--------------------------------------------------+
```

---

## Edge Cases and Safeguards

1. **No Realm address**: Projects without `realms_dao_address` don't appear on the dashboard — they still use the standard roadmap view on their profile page
2. **Invalid Realm address**: Validated client-side (base58 check) and server-side (RPC lookup confirms it's a valid governance realm)
3. **Multiple projects per DAO**: Grouped correctly by `realms_dao_address`
4. **Evidence tampering**: Evidence is timestamped and publicly visible — any changes create a new `submittedAt` timestamp (audit trail via `updated_at` on the profile)
5. **Proposal not found on Realms**: Graceful fallback — show "No linked proposal" with helper text
6. **DAO with zero projects**: Not shown in the directory
7. **Stale proposal data**: Realms data refreshed via existing `refresh-governance-hourly` cron job
8. **Phase 2 features (Bounty Board)**: Clearly marked with overlay — no functional smart contract calls until audited

## What This Does NOT Do (Phase 2 Scope)

- Does NOT escrow funds
- Does NOT execute on-chain transactions
- Does NOT create governance proposals programmatically
- Does NOT handle fund release — that happens on Realms
- These are all Phase 2 (Bounty Board) features requiring smart contract development and audit

---

## Implementation Order

1. Update types (PhaseMilestone with deliveryEvidence)
2. Add Realm DAO address field to claim flow
3. Enhance "Mark Complete" dialog with evidence fields
4. Build Accountability Dashboard page + components
5. Build DAO Detail page
6. Update routes and navigation
7. Clean up deprecated staking files
