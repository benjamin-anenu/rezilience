

# Phase G: Bounty Creation Wizard with Release Modes

## Overview

Replace the single-step `CreateBountyDialog` with a multi-step wizard inside a dialog. The wizard introduces **release mode selection**, letting bounty creators choose how SOL gets released to builders. The existing `manage-bounty` edge function gets a new `release_mode` field, and the `bounties` table gets a corresponding column.

## Database Change

Add a `release_mode` column to the `bounties` table:

```text
ALTER TABLE public.bounties
  ADD COLUMN release_mode text NOT NULL DEFAULT 'dao_governed';
```

A validation trigger ensures values are one of: `dao_governed`, `direct`, `multisig`.

## Wizard Steps

**Step 1 -- Release Mode** (new)
- Three cards the user picks from:
  - **DAO Governed** (default): Escrow funds released via Realms governance vote. Best for community-funded work.
  - **Direct Release**: Creator releases SOL directly after approving evidence. No on-chain vote required.
  - **Multi-sig**: Requires multiple signers (Squads) to release funds. Best for high-value bounties.
- Each card has an icon, title, and one-line description.

**Step 2 -- Bounty Details** (existing fields, restructured)
- Realm DAO selector (if multiple profiles)
- Title (required)
- Description (optional)
- Reward in SOL (required)

**Step 3 -- Milestones** (optional, new)
- Toggle: "Break into milestones?"
- If yes, add 1-5 milestones with title and SOL allocation
- Validation: milestone SOL allocations must sum to total reward
- Each milestone stored in a `milestones` JSONB field on the bounty

**Step 4 -- Review and Create**
- Summary card showing release mode, details, milestones, total SOL
- "Create Bounty" button

## File Changes

### New Files
- `src/components/bounty/CreateBountyWizard.tsx` -- The 4-step wizard component replacing `CreateBountyDialog`

### Modified Files
- `src/components/bounty/index.ts` -- Export `CreateBountyWizard` instead of (or alongside) `CreateBountyDialog`
- `src/pages/BountyBoard.tsx` -- Use `CreateBountyWizard` in place of `CreateBountyDialog`
- `src/hooks/useBounties.ts` -- Update `useCreateBounty` mutation params to include `release_mode` and optional `milestones`
- `src/components/bounty/BountyCard.tsx` -- Show release mode badge on each card
- `supabase/functions/manage-bounty/index.ts` -- Accept `release_mode` and `milestones` in the `create` action, store them on the bounty row

### Database Migration
- Add `release_mode` (text, default `'dao_governed'`) and `milestones` (jsonb, default `'[]'`) columns to `bounties`
- Add validation trigger for `release_mode` values

## Technical Details

- The wizard uses internal `step` state (1-4) with Next/Back navigation
- Step transitions validate required fields before advancing
- The milestone editor reuses the same SOL-allocation pattern from `FundingRequestForm`
- Release mode affects the bounty lifecycle: `direct` mode skips the escrow/voting steps; `multisig` mode will show a Squads integration prompt (placeholder for now, marked as "Coming Soon")
- The `BountyCard` shows a small badge indicating the release mode (e.g., "DAO", "Direct", "Multi-sig")

