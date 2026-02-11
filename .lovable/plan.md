

# Problem Slide Rewrite + Founder Title Fix + "What This Unlocks" Section

## Changes to `src/components/pitch/slides.tsx`

### 1. Founder Title (FounderSlide)
Replace "Founder & CEO / Technical Product Strategist / & AI Systems Architect" with:
- **Product Visionary**
- **Technical Project Manager**
- **& AI Product Strategist**

### 2. Problem Slide -- Complete Rewrite

**Tag**: THE OPPORTUNITY (replaces "THE PROBLEM")

**Headline**: "The Maintenance Visibility Gap"

**Intro**: "While working closely with builders across pre-Colosseum, Colosseum, and post-Colosseum hackathons, and observing recently funded Solana projects, consistent gaps became clear. Solana makes it incredibly easy to ship. What is still hard is understanding what is actually being maintained over time."

**Six observation cards** in a 3x2 grid (blue/constructive icons instead of red/destructive):

1. **On-Chain Activity Alone Doesn't Tell the Full Story** -- Deployment metrics hint at usage, but a quiet program might be stable, paused, or abandoned -- today it is difficult to tell the difference.
2. **No Universal Verification Registry** -- Unlike Ethereum's Sourcify, Solana lacks a single decentralized service that pulls source, rebuilds deterministically, and publishes verification status.
3. **Verifiable Builds Exist, Adoption Is Inconsistent** -- Some teams don't generate them, others don't publish metadata -- coverage remains partial.
4. **Provenance Does Not Equal Maintenance** -- A source-to-binary match at deployment proves origin at one point in time, not ongoing health.
5. **Closed Programs Remain Hard to Reason About** -- Without published source, reverse engineering helps surface risk but is not a substitute for verification.
6. **Maintainer Identity Is Fragmented** -- GitHub, X, wallets, Discord -- rarely bound together cryptographically.

**Closing line**: "Resilience is designed to close this gap -- bottom-up, using real signals builders already generate, and turning them into shared, verifiable infrastructure."

**Visual shift**: All icon backgrounds change from `bg-destructive/15` + `text-destructive` to `bg-primary/15` + `text-primary` (constructive, not critical).

### 3. Problem Slide -- "What This Unlocks" Footer

Below the 6 observation cards and closing line, add a compact horizontal strip with three forward-looking items that connect the gap to the bigger vision. This ensures the audience sees where this leads without waiting for later slides:

```text
[Coins icon] SOL Continuity Bonds
The community stakes SOL on projects
they believe in -- backed by verifiable
data, not hype.

[Shield icon] AEGIS Supply Chain Auditing
Real-time dependency and vulnerability
monitoring across the ecosystem's
nervous system.

[Globe icon] Public Good, No Gatekeeping
Every tool, every score, every metric --
open access for builders and the public.
No subscriptions. No walls.
```

These three items appear as a single row of compact cards at the bottom of the slide, styled with a subtle `border-primary/20` border and `bg-primary/5` background to visually separate them from the observation grid above. Each card has an icon, a bold title, and a one-line description.

---

## Technical Details

### File Modified
- `src/components/pitch/slides.tsx` -- Three edits:
  1. `ProblemSlide` component: Full rewrite with 6 cards + 3 "What This Unlocks" items + constructive styling
  2. `FounderSlide` component: Title text replacement (3 lines)
  3. Add `Globe` to the lucide-react import if not already present

### No other files change

