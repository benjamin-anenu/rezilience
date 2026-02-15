
## Strengthen Hero Section — AEGIS Supply Chain Framing

### Problem
The current hero paragraph is passive and generic: "The Solana Ecosystem needs projects built for the long haul..." It doesn't communicate **what Rezilience actually does** or **why it matters urgently**. A Solana Foundation reviewer scanning this page in 10 seconds would not understand the supply chain intelligence angle.

### Changes

**File:** `src/components/landing/HeroSection.tsx`

#### 1. Add a "promise" tagline between the headline and paragraph (new element)
Insert a secondary headline after "REPUTATION CAN'T BE FORKED." that bridges the hook to the explanation:

```
SECURE THE ECOSYSTEM. GET REWARDED FOR LONGEVITY.
```

Styled in Space Grotesk semibold, uppercase, tracking-wide, with "REWARDED" in teal — as documented in the hero messaging strategy memory.

#### 2. Replace the paragraph text (line 73)

**Current:**
> "The Solana Ecosystem needs projects built for the long haul. Join the Resilience Registry to establish an undeniable, off-chain & on-chain reputation for maintaining your code. Secure your spot today in anticipation of public SOL staking driven by proven project health."

**New:**
> "Rezilience indexes every Solana project's dependencies, maps supply chain risk, and detects vulnerabilities before they cascade. We score real-time project health across 8 dimensions so broken crates never silently take down the ecosystem. Claim your spot in the Registry, build an on-chain reputation, and stake on proven resilience."

**Why this is stronger:**
- Opens with action verbs (indexes, maps, detects) — not passive needs
- Names the threat directly (broken crates, cascade, supply chain risk)
- References the 8 dimensions visible in the hero visual on the right
- Ends with the three-part CTA (Claim, Build, Stake) matching the existing buttons
- Keeps the same paragraph length — no layout changes needed

#### 3. Fix the typo in the badge (line 65)
"lAYER" has a lowercase L — change to "LAYER".

### Technical scope
- Single file edit: `src/components/landing/HeroSection.tsx`
- Lines 65, 68-75 — text-only changes plus one new `<p>` element for the promise tagline
- No structural, styling, or dependency changes
