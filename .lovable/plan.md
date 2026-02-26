

# Demo Page Rebuild: Full DAO Accountability Lifecycle

## What's Missing

The current demo jumps from "Join the Registry" directly to "Commitment Lock (scoring formula)." It skips the actual human lifecycle:

1. How builders define milestones on their Realm
2. How the community funds the DAO treasury (donate SOL, get governance tokens)
3. How token holders vote on milestone proposals
4. How multisig/DAO releases funds to the builder per milestone
5. How Rezilience closes the loop by tracking delivery

## New Story Arc (10 Sections)

```text
HERO -> PROBLEM -> JOIN REGISTRY -> CREATE YOUR REALM -> LOCK MILESTONES ->
COMMUNITY FUNDING -> DAO VOTE & RELEASE -> BUILDER DELIVERS -> COMMITMENT LOCK (SCORING) ->
LIVE ANALYSIS -> CTA
```

### Sections to ADD (4 new sections between Registry and Commitment Lock):

**Section 4: "Set Up Your Realm" (NEW)**
- Explains that builders need a Realm on the Realms platform
- Shows 3 simple steps: Create Realm on realms.today -> Configure governance rules -> Link address in Rezilience claim flow
- Clarifies: "Already have a Realm? Just paste the address."
- Visual: 3 step cards with Realms logo reference

**Section 5: "Lock Your Milestones" (NEW)**
- Builder creates proposals on their Realm defining each milestone/deliverable
- Each proposal = a phase (e.g., "Phase 1: MVP", "Phase 2: Audit", "Phase 3: Mainnet")
- Visual: A vertical timeline showing 4 example milestones with SOL amounts attached
- Caption: "Each milestone becomes a trackable, on-chain commitment"

**Section 6: "Community Backs the Build" (NEW)**
- The public donates SOL to the DAO treasury
- In return, supporters receive governance tokens proportional to their contribution
- Largest token holders have the most voting weight
- Visual: A funding flow diagram showing SOL flowing in, governance tokens flowing out, and a "Top Supporters" mini-leaderboard
- Caption: "Your community doesn't just fund you — they hold you accountable"

**Section 7: "DAO Votes to Release Funds" (NEW)**
- When a builder completes a milestone, they submit evidence (GitHub commits, demo, etc.)
- Token holders vote on whether the milestone was delivered
- If approved, the multisig/DAO treasury releases the allocated SOL to the builder
- Builder can then proceed to the next phase
- Visual: A flow showing Milestone Complete -> Proposal Vote -> Multisig Signs -> SOL Released -> Next Phase
- If rejected, funds stay locked and the builder must re-deliver
- Caption: "No delivery, no release. The DAO decides."

### Existing sections REORDERED:

- **Section 8**: Commitment Lock (scoring) -- EXISTING, moved down, now contextually makes sense after the lifecycle
- **Section 9**: Mock Dashboard -- EXISTING, kept as-is
- **Section 10**: Live Analysis -- EXISTING, kept as-is
- **Section 11**: CTA -- EXISTING, kept as-is

## Files Changed

| File | Action |
|------|--------|
| `src/components/demo/RealmSetupSection.tsx` | NEW -- "Set Up Your Realm" section |
| `src/components/demo/MilestoneLockSection.tsx` | NEW -- "Lock Your Milestones" timeline |
| `src/components/demo/CommunityFundingSection.tsx` | NEW -- Community SOL funding flow |
| `src/components/demo/DAOVoteReleaseSection.tsx` | NEW -- Vote, multisig sign, fund release |
| `src/components/demo/index.ts` | UPDATE -- export new sections |
| `src/pages/HackathonDemo.tsx` | UPDATE -- add new sections in correct order |

## Section Details

### RealmSetupSection
- Header: "Set Up Your Realm"
- Subheader: "Every accountable project starts with a governance home"
- 3 cards in a row:
  1. "Create a Realm" -- Go to realms.today and create your DAO governance space (icon: Building)
  2. "Configure Rules" -- Set voting thresholds, council members, and treasury parameters (icon: Settings)
  3. "Link to Rezilience" -- Paste your Realm address during the claim flow to connect accountability (icon: Link)
- Bottom note: "Already have a Realm? Skip straight to linking it in your Rezilience profile."

### MilestoneLockSection
- Header: "Lock Your Milestones"
- Subheader: "Define what you'll deliver -- each milestone becomes an on-chain commitment"
- Visual: Vertical timeline with 4 phases:
  - Phase 1: MVP Launch -- 500 SOL
  - Phase 2: Security Audit -- 300 SOL
  - Phase 3: Mainnet Deploy -- 400 SOL
  - Phase 4: Growth & Maintenance -- 300 SOL
- Each phase shows: title, SOL allocation, status badge (Locked/Pending/Released)
- Total at bottom: "1,500 SOL total commitment"
- Caption: "Milestones are created as governance proposals on your Realm -- publicly visible, on-chain, immutable."

### CommunityFundingSection
- Header: "The Community Backs the Build"
- Subheader: "Supporters donate SOL to your DAO treasury and earn governance power"
- 3 column layout:
  - Left: "Fund" card -- SOL flows into treasury, shows example amounts
  - Center: Arrow flow showing SOL -> Governance Tokens
  - Right: "Vote" card -- Top token holders become voters
- Mini leaderboard showing 3 mock supporters with SOL amounts and voting weight percentages
- Caption: "Your backers aren't just donors -- they're your accountability board"

### DAOVoteReleaseSection
- Header: "DAO Votes. Funds Release."
- Subheader: "When you deliver a milestone, your community decides if you've earned the next tranche"
- Horizontal flow (5 connected steps):
  1. Builder ships milestone (icon: Rocket)
  2. Submits delivery evidence (icon: FileCheck)
  3. Token holders vote (icon: Vote)
  4. Multisig signs release (icon: KeyRound)
  5. SOL released to builder (icon: Coins)
- Below: Two outcome cards side by side:
  - APPROVED (green): "Funds released. Builder proceeds to next phase."
  - REJECTED (red): "Funds stay locked. Builder must re-deliver or renegotiate."
- Caption: "No delivery, no release. This is trustless accountability."

## Design Patterns
- All new sections use the existing `StorySection` wrapper for consistent animation
- Bloomberg terminal aesthetic maintained (font-mono data, font-display headers, teal accents)
- Framer Motion staggered animations for cards and timeline items
- Mobile responsive: horizontal flows stack vertically on small screens
- No new dependencies needed

## No Backend Changes
This is purely UI storytelling. No new edge functions or database changes.

