

# Pitch Deck Overhaul: Readme-Aligned, Founder-Focused

## What Changes

The current pitch deck is disconnected from the actual product scope documented in the README. It frames Resilience as on-chain only, ignores the Off-chain project tracking, misses the dual-audience model (Fish/Eagles), and has placeholder team content. This overhaul rewrites all 10 slides to align with the README's full vision and incorporates your founder profile and the ecosystem illustration.

---

## Asset Integration

- **Image 1** (your photo with Solana x Resilience branding): Copy to `src/assets/founder-benjamin.png` -- used on the Team slide as your profile image
- **Image 2** (ecosystem illustration showing Code, Liveness, Originality, Governance, Dependencies, Economics, Assurance with Builders and Public): Copy to `src/assets/resilience-ecosystem.png` -- used as a full visual on a new **Vision slide** inserted after the Title slide

---

## Revised Slide Structure (10 slides)

### Slide 1: TITLE (revised)
- Tag: "SOLANA FOUNDATION GRANT APPLICATION"
- Headline: "Reputation Can't Be Forked."
- Subtitle updated: "Decentralized Assurance Layer for Solana. Multi-dimensional Proof-of-Life for every project -- on-chain and off-chain." (adds off-chain)
- Live stats remain (Registry, Active, Avg Score)

### Slide 2: THE VISION (NEW -- replaces old Problem slide position)
- Full-width ecosystem illustration image (`resilience-ecosystem.png`)
- Minimal text overlay: "The Assurance Layer of Solana"
- Subtext: "Bridging Builders and the Public through transparent, verifiable project health data."
- This is a visual-impact slide -- the image does the talking

### Slide 3: THE PROBLEM (revised)
- Headline: "The Transparency Gap"
- Updated problems to reflect README's full scope:
  1. "No way to track project milestones or commitments in real-time"
  2. "No bridge for the community to back projects based on verifiable data"
  3. "Forks and clones erode integrity -- reputation can't be copied"
  4. "Billions in TVL with zero continuous health telemetry"
- Subtitle: "Solana mastered speed. Now it's time to master transparency and accountability."

### Slide 4: THE SOLUTION (revised)
- Same formula and 4-dimension cards
- Add subtitle mentioning both audiences from README:
  - "The Public (The Fish)" -- Data-backed transparency before integrating or investing
  - "Builders (The Eagles)" -- Proving work through immutable trust scores
- Clarify this covers on-chain programs AND off-chain projects

### Slide 5: HOW IT WORKS (revised)
- Same 3-step pipeline (Index, Verify, Commit)
- Update descriptions to mention both on-chain and off-chain verification paths:
  - INDEX: "...every registered Solana project -- on-chain programs and off-chain tools alike"
  - VERIFY: "On-chain: authority wallet SIWS. Off-chain: GitHub ownership proof. Bytecode originality + dependency health."
  - COMMIT: Same (Commitment Locks / staking)

### Slide 6: OPENING NEW POSSIBILITIES (revised from Public Good)
- Headline: "Opening New Possibilities"
- Items updated to match your vision statement:
  1. Public Milestone Tracking -- "Community sees the heartbeat of project progress"
  2. Economic Alignment -- "Continuity Bonds let the public stake trust in proven builders"
  3. Supply Chain Auditing -- "Map the ecosystem's nervous system, trace dependent services"
  4. Grants Directory -- "Curated funding resource -- public good, no gatekeeping"
  5. Score Oracle -- "Composable on-chain data for protocol-level integrations"

### Slide 7: COMPETITIVE LANDSCAPE (unchanged)
- Same comparison table -- it's accurate and effective

### Slide 8: ROADMAP (unchanged)
- Same 4-phase layout -- already aligned with README

### Slide 9: THE FOUNDER (revised from Team)
- Headline: "Solo Founder. AI-Augmented."
- Single centered card (not 3 placeholders) with:
  - Your photo from `founder-benjamin.png` (circular, large)
  - Name: "Benjamin Omoata Anenu"
  - Title: "Founder and CEO -- Technical Product Strategist and AI Systems Architect"
  - Vision quote block: "Solana has already mastered the art of speed and deployment. Now, it is time to master the art of Transparency and Accountability."
  - Second paragraph: Working closely with founders who received grants and those building in the trenches, it became clear a massive opportunity is being missed -- no real-time milestone tracking, no community-backed continuity bonds, no verifiable data bridge.
  - Closing: "We aren't here to point out where the ecosystem is quiet. We are here to provide the megaphone for those who are consistently building, and the map for those who need to know which projects are truly resilient."
  - Small note: "Building with AI as a force multiplier -- this grant will fund the team needed to take Resilience to the next level."

### Slide 10: THE ASK (revised)
- Same structure but remove TODO placeholders
- Subtitle: "Seeking a Solana Foundation grant to fund the team and infrastructure needed to scale Resilience from Phase 1 into ecosystem-wide integration."
- Keep Live Product, Explorer, Grants Directory links
- Add: "Institutional capital and retail users will navigate Solana with absolute confidence."

---

## Technical Details

### Files Modified
- **`src/components/pitch/slides.tsx`** -- Complete rewrite of all 10 slide components with the revised content above

### Files Created
- **`src/assets/founder-benjamin.png`** -- Copied from user upload (Image 1)
- **`src/assets/resilience-ecosystem.png`** -- Copied from user upload (Image 2)

### No Other Changes
- `PitchDeck.tsx` (the shell/navigation) stays the same -- still 10 slides, same keyboard nav, same transitions
- `App.tsx` routing unchanged
- No database or edge function changes

