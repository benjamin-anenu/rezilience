

# Pitch Deck Overhaul: Grant-Ready with Budget, Roadmap, Traction, and PoH Differentiation

## Overview

This plan addresses all raised concerns across 5 slides in `src/components/pitch/slides.tsx` plus adds a new 12th slide. The goal: make this deck grant-ready with a specific $75K USDC ask, realistic phase budgets, honest competitive framing, early traction proof, and a clear technical differentiation from Proof of History.

---

## Changes by Slide

### 1. Roadmap Slide (Slide 9) -- Mirror README Phases with Budget Breakdown

Replace the current sparse 4-card grid with detailed phase cards that match the README's content and include USDC allocation per phase.

**Budget Breakdown:**

| Phase | Timeline | Allocation |
|-------|----------|------------|
| Phase 1: Resilience Registry | Months 1-1.5 | $30,000 |
| Phase 2: Economic Commitment Layer | Months 2-4 | $20,000 |
| Phase 3: Ecosystem Integration | Months 5-8 | $15,000 |
| Phase 4: AEGIS Supply Chain | Months 9-12 | $10,000 |
| **Total** | **12 months** | **$75,000 USDC** |

**Phase 1 Line Items (shown as sub-items):**
- Senior Anchor Engineer (1 month full-time) -- Review/refactor prototype, build on-chain program, optimize data pipeline, security + documentation
- Frontend Engineer (1.5 months full-time) -- Decouple from Lovable, code review to meet standards, optimize frontend, documentation
- Infrastructure and DevOps (1 month) -- Production deployment, database optimization, monitoring/alerting, RPC node setup
- Web3 Strategist (Advisor, part-time) -- Ecosystem positioning, partnership conversations, community engagement
- QA, Security and Contingency -- Testing, basic security review, unexpected costs buffer

Each phase card will show: phase number, title, timeline, budget, key deliverables (from README), and status badge.

---

### 2. Ask Slide (Slide 11) -- Specific $75K Request

Replace the vague "Seeking a grant" language with:
- **Headline**: "75,000 USDC Across Four Phases"
- **Subtitle**: "Milestone-based delivery. Each phase unlocked on completion of the previous."
- A compact 4-column summary: Phase name, timeline, amount, key deliverable
- Keep the existing CTA links (Live Product, Explorer, Grants Directory)

---

### 3. Traction Slide (Slide 6) -- Add Waitlist/QA Context

Below the existing 6 stat boxes, add a callout box explaining:
- "30+ builders waiting to claim profiles"
- Claims paused for end-to-end QA/vetting
- Need to ensure code meets Solana standards
- On-chain protocol must be built first
- Builders will sign with a SOL transaction to confirm originality
- This positions builders for Phase 2 where the public can stake on their projects as they build in public

Styled as a bordered info card with an amber/primary accent.

---

### 4. Competition Slide (Slide 8) -- Add PoH Differentiation + Anchor Verified Builds

**Add two sections:**

**A) "Resilience vs. Proof of History" differentiation strip** below the comparison table:
- Three compact columns:
  - "PoH is a Clock" -- Validators use it to order transactions. It does not care what the events are.
  - "Resilience is a Performance Review" -- Tracks whether developers update code, respond to bugs, stick to promises.
  - "Partners, Not Competitors" -- Resilience uses PoH timestamps to measure how often programs are updated. Raw Time becomes Useful Intelligence.
- Closing line: "PoH makes Solana fast. Resilience makes Solana reliable."

**B) Add Anchor Verified Builds** as a 5th competitor in the table:
- Name: "Anchor Verify"
- Scores: no, no, yes, no, no, no, no, partial
- This adds honesty -- Anchor's verified builds exist and should be acknowledged

**C) Mark unbuilt Resilience features honestly:**
- Change "Economic staking" from "yes" to "planned" (new state)
- Add a "Planned" legend item with a dashed border indicator

---

### 5. Founder Slide (Slide 10) -- No changes needed

Title already updated to "Product Visionary / Technical Project Manager / AI Product Strategist" in previous iteration. No further changes.

---

## Technical Details

### File Modified
`src/components/pitch/slides.tsx` -- Five edits:

1. **RoadmapSlide**: Full rewrite with README-aligned phases, USDC budget per phase, Phase 1 line items
2. **AskSlide**: Rewrite with specific $75K ask, 4-phase budget summary table, milestone-based framing
3. **TractionSlide**: Add waitlist/QA callout below stat boxes
4. **CompetitionSlide**: 
   - Add "Anchor Verify" competitor row
   - Add "planned" Score type with dashed border render
   - Change Resilience "Economic staking" to "planned"
   - Add PoH differentiation strip below table
   - Add "Planned" to legend
5. **Imports**: Add `Clock` icon from lucide-react if not already present

### No other files change
- README stays as-is (pitch mirrors it, not the other way around)
- Same 11-slide structure in PitchDeck.tsx (no new slides needed -- PoH section fits inside Competition slide)

