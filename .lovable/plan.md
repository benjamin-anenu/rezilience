

# Next Iteration: In-App Governance, Milestone Escrow, and Notifications

## What Has Been Built
- Database infrastructure (funding_proposals table, claimed_profiles funding columns)
- Registration flow with FundingRequestForm and SOL allocation per milestone
- SubmitProposalDialog (creates DB record only, no on-chain transaction)
- FundingStatusWidget on profile page (reads from DB)
- manage-funding-proposal edge function (create + update_status actions)
- Escrow program hooks for bounties (useEscrowProgram, useRealmsProposal)

## What Remains (Prioritized)

### Phase A: In-App Governance Hooks (Core Priority)

**1. `useCreateFundingProposal` hook**
- Uses `@solana/spl-governance` to build a Realms proposal transaction on-chain
- Derives governance PDA, checks TokenOwnerRecord, creates proposal with release_escrow instruction embedded
- Stores resulting proposal address via manage-funding-proposal `update_status` action
- Graceful fallback: if the builder lacks governance tokens, show clear error message and offer the Realms deep link as secondary option

**2. `useFundingProposal` hook**
- Polls the on-chain proposal account via RPC to get real-time vote state
- Returns: status (Voting/Succeeded/Defeated), yesVotes, noVotes, quorum progress, voting end time
- Updates DB status when proposal state changes (accepted/rejected)

**3. `useCastVote` hook**
- Constructs `castVote` instruction via spl-governance for DAO token holders
- Supports Yes/No vote types
- Updates local cache on success

**4. `useExecuteProposal` hook**
- When proposal reaches Succeeded state, builds `executeTransaction` instruction
- This triggers the `release_escrow` CPI, releasing SOL to the builder
- Auto-updates DB to `funded` or `completed` status

### Phase B: Enhanced SubmitProposalDialog

Update the existing `SubmitProposalDialog` to:
- Use `useCreateFundingProposal` for on-chain proposal creation (wallet signs one transaction)
- Show a "Creating proposal on-chain..." loading state
- On success, store proposal address in DB and show confirmation
- Keep "View on Realms" as a secondary link

### Phase C: In-App Voting UI

**1. `ProposalStatusBadge` component**
- Displays live proposal state with vote counts
- Shows quorum progress bar
- Countdown timer for voting period

**2. `VotePanel` component**
- "Vote Yes" and "Vote No" buttons for governance token holders
- Shows current user's vote if already cast
- Disabled states when user lacks tokens or already voted

**3. Wire into FundingStatusWidget**
- Replace static status display with live on-chain polling
- Add VotePanel for DAO members viewing a project's profile
- Add "Execute Release" button when vote succeeds

### Phase D: Milestone-Based Escrow

**1. `useMilestoneRelease` hook**
- Creates per-milestone escrow PDAs using seeds `["escrow", profile_id_hex, milestone_index_str]`
- Each milestone completion triggers a new governance proposal for that milestone's SOL allocation
- Tracks released vs. locked amounts per milestone

**2. Enhanced FundingStatusWidget**
- Per-milestone status indicators: Locked / Voting / Released
- Released amount tracking (currently hardcoded to 0)
- "Submit Milestone Evidence" button for builders
- "Create Release Proposal" button per completed milestone

### Phase E: Notification System

**1. Database migration**
- New `notifications` table: id, recipient_x_user_id, type, title, body, bounty_id, profile_id, read, created_at
- RLS: users can only read their own notifications
- Index on recipient_x_user_id + read for fast unread counts

**2. `useNotifications` hook**
- Fetches notifications for current user
- Marks notifications as read
- Returns unread count

**3. `NotificationBell` component in Navigation**
- Bell icon with unread badge count
- Opens NotificationPanel (slide-out sheet)

**4. `NotificationPanel` component**
- List of notifications grouped by date
- Click notification to navigate to relevant bounty/profile
- "Mark all as read" button

**5. Trigger notifications from edge functions**
- manage-funding-proposal: notify DAO members on new proposal, notify builder on vote result
- manage-bounty: notify on claim, evidence, approval, payment
- claim-profile: notify linked DAO on new registration with funding request

### Phase F: Dashboard Funding Summary

- Add funding status card to Dashboard page showing active proposals, total requested, total released
- Quick links to profile funding widget

### Phase G: Bounty Creation Wizard with Release Modes

- Replace CreateBountyDialog with a multi-step wizard
- Step 1: Release Mode selection (DAO Governed / Direct Release / Multi-sig)
- Step 2: Bounty details (title, description, reward)
- Step 3: Milestone breakdown (optional)
- Step 4: Review and create
- Each mode configures the escrow authority differently

## Technical Considerations

1. **spl-governance SDK**: Need to install `@solana/spl-governance` package. This is a heavy dependency (~150KB); should be lazy-loaded on governance-related routes only.

2. **TokenOwnerRecord requirement**: Users must have deposited governance tokens into the Realm to create proposals or vote. The UI must detect this and show a clear message if tokens are missing.

3. **Governance program version**: Realms uses spl-governance v3. The SDK version must match. Need to verify compatibility before building hooks.

4. **Per-milestone escrow PDA seeds**: The existing escrow program uses `["escrow", bounty_id]` seeds. For milestone-based releases, we will use `["escrow", profile_id_hex_milestone_index]` -- concatenating the profile ID and milestone index into a single 32-char bounty_id string that the program accepts.

5. **Notification delivery**: Initially in-app only (DB polling via React Query). Email/push can be added later. Realtime subscriptions on the notifications table would reduce polling overhead.

6. **Bundle size management**: spl-governance + Anchor together add ~350KB. Use React.lazy() and route-based code splitting for the bounty board and profile pages.

## Recommended Execution Order

1. Phase A (governance hooks) -- foundational, everything else depends on it
2. Phase B (enhanced proposal dialog) -- immediate UX improvement
3. Phase C (voting UI) -- makes the app self-contained for governance
4. Phase D (milestone escrow) -- the core value proposition
5. Phase E (notifications) -- keeps users engaged
6. Phase F (dashboard summary) -- visibility
7. Phase G (creation wizard) -- polished onboarding for funders

## New Dependencies
- `@solana/spl-governance` (for in-app proposal creation, voting, and execution)

## New Files
- `src/hooks/useCreateFundingProposal.ts`
- `src/hooks/useFundingProposal.ts`
- `src/hooks/useCastVote.ts`
- `src/hooks/useExecuteProposal.ts`
- `src/hooks/useMilestoneRelease.ts`
- `src/hooks/useNotifications.ts`
- `src/components/bounty/ProposalStatusBadge.tsx`
- `src/components/bounty/VotePanel.tsx`
- `src/components/bounty/MilestoneTracker.tsx`
- `src/components/bounty/CreateBountyWizard.tsx`
- `src/components/notifications/NotificationBell.tsx`
- `src/components/notifications/NotificationPanel.tsx`

## Modified Files
- `src/components/claim/SubmitProposalDialog.tsx` -- use on-chain proposal hook
- `src/components/profile/FundingStatusWidget.tsx` -- live status, vote panel, milestone tracker
- `src/components/bounty/BountyCard.tsx` -- proposal status badge, vote buttons
- `src/pages/Dashboard.tsx` -- funding summary card
- `src/components/layout/Navigation.tsx` -- notification bell
- `supabase/functions/manage-funding-proposal/index.ts` -- notification triggers
- `supabase/functions/manage-bounty/index.ts` -- notification triggers

## Database Migrations
- New table: `notifications` (with RLS for user-specific reads)
- Enable realtime on `notifications` table

