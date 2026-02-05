

# Resilience Landing Page - Pixel-Perfect Redesign

## The Problem

The current implementation doesn't match your Figma design in several key areas:

1. **Logo** - Using a green box with "R" instead of your actual geometric logo
2. **Navigation** - Shows "STAKING" and wallet button instead of "Launch App" button
3. **Hero section** - Different layout, text, and illustration style
4. **Problem/Solution section** - Different visual approach (list-based vs icon-based comparison)
5. **How It Works** - Missing the pipeline diagram with code snippet
6. **Pillars section** - Different card design with shield icons
7. **Use Cases section** - Different layout and styling

---

## Changes to Make

### 1. Add Your Logo

Copy your logo image to the project and use it in Navigation and Footer:
- Add logo file to `src/assets/resilience-logo.png`
- Update Navigation to show the logo image
- Update Footer to show the logo image
- Navigation button changes from wallet multi-button to "Launch App" teal button

---

### 2. Navigation Redesign

**Current:**
- Logo: Green box with "R"
- Links: DOCS, EXPLORER, GRANTS, STAKING
- Right side: Wallet connect button

**Target (from Figma):**
- Logo: Your geometric R logo + "RESILIENCE" text
- Links: Docs, Explorer, Grants (normal case, not uppercase)
- Right side: "Launch App" teal button (links to /staking or /explorer)

---

### 3. Hero Section Redesign

**Current:**
- Badge: "ON-CHAIN ASSURANCE"
- Headline: "MAINTENANCE IS RESILIENCE"
- Subtitle: Different text
- Buttons: "EXPLORE PROGRAMS" + "STAKE NOW"
- Stats row below buttons
- Right side: Simple connected boxes with icons

**Target (from Figma):**
- Headline: "MAINTENANCE IS RESILIENCE." (with period)
- Subtitle: "The objective, immutable credit bureau for Solana code. Verify liveness, originality, and economic stake."
- Button: "EXPLORE LIVENESS DATA" (single teal button)
- Right side: Network visualization with glowing nodes, connecting lines, and gradient mesh background

---

### 4. Problem/Solution Section Redesign

**Current:**
- Title: "THE TRUST GAP"
- Two cards with bullet point lists
- Red Ocean / Blue Ocean comparison

**Target (from Figma):**
- Title: "THE PROBLEM: VANITY METRICS FAIL."
- Side-by-side panels:
  - **Left (Red Ocean):** GitHub Stars icon, TVL icon, "DECAY DETECTED" orange badge
  - **Right (Blue Ocean: RESILIENCE):** Liveness Score, Originality Index, Staked Assurance icons, "VERIFIED ACTIVE" teal badge

---

### 5. How It Works Section Redesign

**Current:**
- Title: "HOW IT WORKS"
- Three steps with icons: INGEST, ANALYZE, ASSURE

**Target (from Figma):**
- Title: "HOW IT WORKS: THE TRUTH ENGINE"
- Pipeline diagram showing data flow:
  - Solana Mainnet (Geyser) --> Ingestion Engine (Rust) --> Bytecode Analyzer (SSDeep) --> Resilience Score API
- Arrows connecting boxes
- Code snippet box showing `struct ProgramHealth` with fields:
  - `pub program_id: Pubkey`
  - `pub last_maintenance: i64`
  - `pub originality_score: u8`
  - `pub staked_sol: u64`

---

### 6. Pillars Section Redesign

**Current:**
- Title: "THREE PILLARS OF TRUST"
- Three cards with metrics

**Target (from Figma):**
- Three cards in a row:
  - **Liveness Indexer** - Network/signal icon, "Tracks real-time upgrades and admin actions directly from the ledger."
  - **Bytecode Originality** - Shield/fingerprint icon, "Cryptographically distinguishes novel code from low-effort forks."
  - **Staked Assurance** - Lock/shield icon, "Economic guarantees for maintenance. Skin-in-the-game for developers."

---

### 7. Use Cases Section Redesign

**Current:**
- Title: "USE CASES"
- Three cards with icons and CTAs

**Target (from Figma):**
- Title: "USE CASES: INSTITUTIONAL GRADE."
- Three horizontal cards with teal accent line on left:
  - **PROTOCOL RISK** - "Eliminates high attribution to protocol risk via real-time upgrades and incorline aumnaomenial reports."
  - **DAO DILIGENCE** - "Acaliable comproaclinmens & Diligency amunational into compilians, tincce-anlory sceneres and complance."
  - **COMPLIANCE REPORTING** - "Compliance reporting sonfident prevenos of evaluators, chain and contous data to present otion and DAO silalice."

---

### 8. Footer Redesign

**Current:**
- Logo + tagline on left
- Documentation, GitHub, Twitter links

**Target (from Figma):**
- Logo + "RESILIENCE" on left
- Links on right: Documentation, GitHub, Twitter
- Copyright: "2022 Resilience, Inc. - Steel"

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/assets/resilience-logo.png` | Add your logo image |
| `src/components/layout/Navigation.tsx` | Use logo image, change nav style, replace wallet button with "Launch App" |
| `src/components/layout/Footer.tsx` | Use logo image, update copyright |
| `src/components/landing/HeroSection.tsx` | New layout with network visualization graphic |
| `src/components/landing/ProblemSolutionSection.tsx` | Icon-based comparison with badges |
| `src/components/landing/HowItWorksSection.tsx` | Pipeline diagram with code snippet |
| `src/components/landing/PillarsSection.tsx` | Simplified cards with icons |
| `src/components/landing/UseCasesSection.tsx` | Horizontal cards with teal accent |

---

## Visual Reference Summary

The design follows these key patterns from your Figma:
- Dark terminal aesthetic with `#0F1216` background
- Teal accent color `#00C2B6` for highlights
- Network/mesh visualizations on the hero
- Code snippets showing Rust structs
- Pipeline diagrams for data flow
- Badge indicators ("VERIFIED ACTIVE", "DECAY DETECTED")
- Sharp, institutional feel with high information density

