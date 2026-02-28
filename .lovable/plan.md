
# Bounty Board: Implementation Status

## Flow Diagram

```text
+-------------------+     +-------------------+     +-------------------+
|  1. SIGN IN VIA X |---->|  2. CORE IDENTITY |---->|  3. GITHUB + SOC  |
| [AVAILABLE]       |     | [AVAILABLE]       |     | [AVAILABLE]       |
+-------------------+     +-------------------+     +-------------------+
                                                            |
                          +-------------------+     +-------------------+
                          |  5. ROADMAP       |<----|  4. MEDIA         |
                          | [AVAILABLE]       |     | [AVAILABLE]       |
                          +-------------------+     +-------------------+
                                  |
                          +-------------------+
                          |  6. SUBMIT        |
                          | [AVAILABLE]       |
                          +-------------------+
                                  |
          +-----------------------+-----------------------+
          v                                               v
+-------------------+                           +-------------------+
|  7. DAO TRACKER   |                           |  8. PROFILE MGT   |
| [AVAILABLE]       |                           | [AVAILABLE]       |
+-------------------+                           +-------------------+
          |                                               |
          v                                               v
+-------------------+                           +-------------------+
| 9. DAO DETAIL     |                           | 10. MARK COMPLETE |
| [AVAILABLE]       |                           | [AVAILABLE]       |
+-------------------+                           +-------------------+
          |                                               |
          v                                               v
+-------------------+                           +-------------------+
| 11. REALMS LINK   |                           | 12. REALMS        |
| [AVAILABLE]       |                           |  PROPOSAL         |
+-------------------+                           | [LINK-BASED MVP]  |
                                                +-------------------+
                                                          |
+-------------------+     +-------------------+     +-------------------+
| 15. SOL RELEASE   |<----| 14. BOUNTY BOARD  |<----| 13. DAO VOTE      |
| [ESCROW ON DEVNET]|     | [AVAILABLE -      |     | [VIA REALMS UI]   |
|  Program:         |     |  Full Escrow      |     |  Users vote on    |
|  GzZ9chKwr4wQ...  |     |  Lifecycle]       |     |  app.realms.today |
+-------------------+     +-------------------+     +-------------------+
```

## What's Built
- `bounties` table with full lifecycle (open→claimed→submitted→approved→funded→voting→paid)
- `manage-bounty` edge function with 9 actions: create, claim, submit, approve, reject, fund, set_voting, mark_paid, cancel_escrow
- Bounty Board UI: filters, search, create/claim/submit/approve/reject flows
- Wallet connection for claiming bounties
- Rate limiting on bounty_waitlist
- **Escrow Program** deployed on Devnet: `GzZ9chKwr4wQD6cQcxNYZpwgumE3dX5tVt4a5McenDMz`
- `useEscrowProgram` hook: fund escrow (create_escrow) and cancel escrow (cancel_escrow)
- `useRealmsProposal` hook: link Realms proposals, mark bounties as paid
- `LinkProposalDialog`: paste Realms proposal address to move bounty to "voting"
- `MarkPaidDialog`: paste release tx signature to confirm payment
- Explorer links for escrow PDA and proposal addresses on bounty cards
- Escrow columns: escrow_address, escrow_tx_signature, release_tx_signature, proposal_address, governance_pda, funded_at, paid_at

## What's NOT Built (future phases)
- Programmatic Realms proposal creation (currently deep-links to app.realms.today)
- Automated proposal state polling (manual mark-paid flow for now)
- Mainnet deployment (currently devnet only)
