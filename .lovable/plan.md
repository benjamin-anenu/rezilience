

# Airdrop & Token Launch Calendar

## Overview
A new page at `/airdrops` under the EXPLORE menu, following the same pattern as the Grants page — a curated, static data file with real, verified Solana ecosystem airdrops and TGE events, rendered in a calendar-style card layout.

## Data Source Strategy
Since airdrop data changes frequently and there's no reliable free API, we'll use a **curated static data file** (like `solana-grants.ts`) with real, verified events sourced from current research. Each entry includes source URLs so users can verify. A "last updated" timestamp and disclaimer make it clear this is editable/community-driven data.

### Real Airdrop Data (verified from research)
Events will include both **completed** (for credibility) and **ongoing/upcoming** entries:

**Completed (historical reference):**
- Jupiter (JUP) — Jan 2024, 1B tokens to 955K wallets
- Jito (JTO) — Dec 2023, to stakers
- Kamino (KMNO) — Apr 2024
- Tensor (TNSR) — Apr 2024
- Drift (DRIFT) — May 2024
- Sanctum (CLOUD) — Jul 2024
- Solana Mobile SKR — Jan 2026, 30% of 10B supply

**Ongoing / Upcoming (farmable):**
- trade.fun — Volume-based trading tiers + referral
- Starpower — DePIN, link smart devices / StarQuests
- Velvet — AI-DeFi, farm "Gems"
- Solstice — Social tasks + LP provision
- Aster — Volume perp trading
- PiggyBank — DeFi yield vault, ends March 2026
- Gradient Network — $10M backed by Pantera/Multicoin

## Files to Create/Modify

### 1. `src/data/solana-airdrops.ts`
- Type definitions: `SolanaAirdrop` with fields: name, project, category, status (completed/ongoing/upcoming/speculated), date/dateRange, eligibility, howToQualify, estimatedValue, sourceUrl, projectUrl, chain
- Array of ~14 verified entries
- `lastUpdated` export

### 2. `src/pages/AirdropCalendar.tsx`
- Layout with hero section matching Grants page style
- Filter tabs: All / Ongoing / Upcoming / Completed
- Category filter chips: DeFi, DePIN, Trading, AI, Infrastructure
- Card grid showing each airdrop with: status badge, project name, category, eligibility criteria, "How to qualify" steps, estimated value, source link
- Timeline visual for date-based events
- Disclaimer banner about DYOR

### 3. `src/App.tsx`
- Add route `/airdrops` → `AirdropCalendar`

### 4. `src/components/layout/Navigation.tsx`
- Add entry under EXPLORE: `{ href: '/airdrops', label: 'Airdrops', description: 'Token launches & airdrop calendar', icon: Gift }`

