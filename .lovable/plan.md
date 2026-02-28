


# Next Iteration: In-App Governance, Milestone Escrow, and Notifications

## What Has Been Built

### Previously Completed
- Database infrastructure (funding_proposals table, claimed_profiles funding columns)
- Registration flow with FundingRequestForm and SOL allocation per milestone
- SubmitProposalDialog (creates DB record only, no on-chain transaction)
- FundingStatusWidget on profile page (reads from DB)
- manage-funding-proposal edge function (create + update_status actions)
- Escrow program hooks for bounties (useEscrowProgram, useRealmsProposal)

### Completed This Iteration
- **Phase A**: All four governance hooks implemented:
  - `useCreateFundingProposal` — on-chain proposal creation via spl-governance
  - `useFundingProposal` — live on-chain vote state polling with DB sync
  - `useCastVote` — in-app Yes/No voting for governance token holders
  - `useExecuteProposal` — execute succeeded proposals
- **Phase B**: Enhanced `SubmitProposalDialog` with on-chain proposal creation (wallet signs), graceful fallback for off-chain only
- **Phase C**: In-app voting UI:
  - `ProposalStatusBadge` — live state, vote counts, quorum bar, countdown
  - `VotePanel` — Yes/No vote buttons for DAO token holders
  - Wired into `FundingStatusWidget` with live polling, vote panel, execute button
- **Phase D**: `useMilestoneRelease` hook for per-milestone escrow PDAs
- **Phase E**: Full notification system:
  - `notifications` table with RLS and realtime enabled
  - `manage-notifications` edge function (list, unread_count, mark_read, create)
  - `useNotifications`, `useUnreadCount`, `useMarkNotificationsRead` hooks
  - `NotificationBell` component in Navigation with unread badge
  - `NotificationPanel` slide-out sheet with grouped notifications
- **Phase F**: Dashboard funding summary card showing active proposals and SOL amounts

## What Remains

### Phase G: Bounty Creation Wizard with Release Modes
- Replace CreateBountyDialog with a multi-step wizard
- Step 1: Release Mode selection (DAO Governed / Direct Release / Multi-sig)
- Step 2: Bounty details (title, description, reward)
- Step 3: Milestone breakdown (optional)
- Step 4: Review and create

### Enhancements
- Wire notification triggers into manage-funding-proposal and manage-bounty edge functions
- Add per-milestone status tracking (Locked/Voting/Released) in FundingStatusWidget
- Track released amounts from on-chain escrow state
- Bundle size optimization with React.lazy() for governance routes
