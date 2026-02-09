

# README Page: Expandable Dimension Cards + Updated Overview Description

## Change 1: Make "Four Dimensions of Trust" Cards Expandable

Currently the 4 `DimensionCard` components (Brain, Nervous System, Heart, Limbs) at lines 186-214 are static cards with brief descriptions. These will be converted to expandable cards using the existing Collapsible component (or Accordion), with a chevron icon indicating expandability.

### What changes:

**Modify the `DimensionCard` component** (lines 577-612) to accept an `expandedContent` prop (array of bullet points + a question line) and use `Collapsible` from Radix to toggle visibility. Add a `ChevronDown` icon that rotates when expanded.

**Update the 4 `DimensionCard` usages** (lines 186-214) to pass the detailed content:

- **Brain (40%):** Question: "Is development continuously happening?" Bullets: GitHub commits, Pull requests, Release frequency, Contributor consistency, Days since last commit
- **Nervous System (25%):** Question: "Is the dependency supply chain being continuously maintained?" Bullets: Crates.io version freshness, Security advisory tracking, Maintenance lag, Vulnerability response
- **Heart (20%):** Question: "Is governance continuously participating?" Bullets: Multisig/DAO transaction frequency, Last governance action, Decentralization level, Governance participation rate
- **Limbs (15%):** Question: "Is there sustained economic commitment?" Bullets: TVL, Risk ratio, Market share, User activity

### Visual behavior:
- Cards show the existing icon, title, subtitle, weight badge, and short description by default
- A small chevron icon (rotating on open) signals expandability
- Clicking anywhere on the card toggles the expanded content below the description
- Expanded content shows the guiding question in primary color, followed by bullet points

## Change 2: Update Overview Description

Replace the text at lines 121-125 from the current description to:

**New text:**
> **Resilience** is a decentralized assurance layer and indexing service that combines off-chain development signals (GitHub, dependencies, bytecode) with on-chain infrastructure activity to create immutable, verifiable proof-of-maintenance and continuity for Solana projects.

The heading "Resilience: Decentralized Assurance Layer for Solana" won't be added as a separate heading since the Overview section already has a section header. Only the paragraph content will be updated.

## Technical Details

### Files modified:
1. **`src/pages/Readme.tsx`** -- Update `DimensionCard` component to support collapsible content, update the 4 card usages with expanded data, and update the overview paragraph text.

### No new dependencies needed -- uses existing `Collapsible` from `@radix-ui/react-collapsible` and `ChevronDown` from `lucide-react` (both already imported/available).

