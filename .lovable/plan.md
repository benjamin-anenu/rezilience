
# Full-Spectrum Resilience Intelligence - Implementation Plan

## Executive Summary

This plan implements a multi-dimensional "Full-Spectrum" Resilience scoring system that extends beyond GitHub commits to measure the true persistence of a Solana project across five dimensions: **Code (GitHub)**, **Supply Chain (Crates.io)**, **Economic Impact (DeFiLlama TVL)**, **Governance (Squads/Realms)**, and **Program Activity (On-Chain)**.

The philosophy is correct: **A 48-hour-old project SHOULD score 15-30 points.** Resilience cannot be faked - it must be earned through sustained, multi-dimensional proof of work.

---

## Architecture Overview

```text
+------------------+     +---------------------+     +------------------+
|   Frontend UI    | --> | Edge Functions      | --> | External APIs    |
|                  |     |                     |     |                  |
| DevelopmentTab   |     | analyze-dependencies|     | Crates.io        |
| ResilienceCard   |     | analyze-tvl         |     | DeFiLlama        |
| HealthDashboard  |     | analyze-governance  |     | Solana RPC       |
+------------------+     +---------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +---------------------+
|  claimed_profiles|     | score_history       |
|  (new columns)   |     | (breakdown JSONB)   |
+------------------+     +---------------------+
```

---

## Phase 1: Database Schema Extension

Add new columns to `claimed_profiles` table:

| Column                     | Type      | Purpose                                      |
|---------------------------|-----------|----------------------------------------------|
| `dependency_health_score` | INTEGER   | 0-100 score from Crates.io analysis          |
| `dependency_outdated_count` | INTEGER | Number of outdated dependencies              |
| `dependency_critical_count` | INTEGER | Dependencies 6+ months behind                |
| `dependency_analyzed_at`  | TIMESTAMP | Last analysis timestamp                      |
| `tvl_usd`                 | NUMERIC   | Total Value Locked from DeFiLlama            |
| `tvl_market_share`        | NUMERIC   | % of Solana TVL                              |
| `tvl_risk_ratio`          | NUMERIC   | TVL-to-commit ratio (risk metric)            |
| `tvl_analyzed_at`         | TIMESTAMP | Last TVL sync                                |
| `governance_address`      | TEXT      | Squads/Realms address if applicable          |
| `governance_tx_30d`       | INTEGER   | Governance transactions in last 30 days      |
| `governance_analyzed_at`  | TIMESTAMP | Last governance check                        |
| `integrated_score`        | NUMERIC   | Multi-dimensional weighted score             |
| `score_breakdown`         | JSONB     | Detailed breakdown by dimension              |

---

## Phase 2: Edge Functions

### Function 1: `analyze-dependencies`

**Purpose**: Fetch Cargo.toml from GitHub, parse dependencies, check versions against Crates.io

**Flow**:
1. Fetch `Cargo.toml` from GitHub raw content
2. Parse `[dependencies]` section
3. For each Solana-related dependency, query Crates.io API
4. Calculate version gap and health score
5. Store results in `claimed_profiles`

**Key Dependencies to Track**:
- `anchor-lang` (Anchor framework)
- `solana-program` (Solana SDK)
- `solana-sdk` (Solana SDK)
- `spl-token` (Token program)

**Scoring Logic**:
- 100 points: All deps up-to-date
- -5 points: Per outdated minor version
- -15 points: Per major version behind
- -25 points: Critical deps (anchor/solana) > 6 months old

### Function 2: `analyze-tvl`

**Purpose**: Fetch TVL metrics from DeFiLlama API for DeFi protocols

**Flow**:
1. Query `https://api.llama.fi/protocol/{name}` 
2. Extract Solana-specific TVL
3. Get total Solana TVL for market share calculation
4. Calculate TVL-to-commit risk ratio
5. Store in `claimed_profiles`

**Risk Ratio Scoring**:
- TVL > $50M per commit/month = -15 (ZOMBIE TITAN)
- TVL > $10M per commit/month = -8 (HIGH RISK)
- TVL > $1M per commit/month = -2 (MODERATE)
- TVL < $100K per commit/month = +10 (HEALTHY)

### Function 3: `analyze-governance`

**Purpose**: Check Squads/Realms multisig activity via Solana RPC

**Flow**:
1. Use existing `multisig_address` from claimed_profiles
2. Query Solana RPC for recent transactions
3. Count transactions in last 30/90 days
4. Calculate governance health score

**Scoring Logic**:
- 10+ tx in 30d = +20 (VERY ACTIVE)
- 5-9 tx in 30d = +15 (ACTIVE)
- 1-4 tx in 30d = +10 (SOME ACTIVITY)
- 0 tx in 30d but active in 90d = +5
- No activity in 90d = -15 (DORMANT)
- No activity in 180d = -25 (BRAIN DEAD)

---

## Phase 3: Integrated Scoring Formula

### Weighted Score Calculation

```text
R = 0.40×GitHub + 0.25×Dependency + 0.20×Governance + 0.15×TVL
```

Where each component is normalized to 0-100:

| Component    | Weight | What It Measures                           |
|-------------|--------|-------------------------------------------|
| GitHub      | 40%    | Code activity, contributors, releases      |
| Dependency  | 25%    | Technical debt, maintenance hygiene        |
| Governance  | 20%    | Decentralization, DAO health               |
| TVL Risk    | 15%    | Economic responsibility                    |

### "Bootstrap" Score Profile (New Projects)

A 48-hour-old project:
- **GitHub (40%)**: ~20/100 (active but no history) = 8 points
- **Dependency (25%)**: ~95/100 (using latest) = 23.75 points
- **Governance (20%)**: ~0/100 (no multisig yet) = 0 points
- **TVL (15%)**: ~0/100 (no liquidity) = 0 points
- **TOTAL**: ~32 points

This is intentional - **reputation must be earned**.

---

## Phase 4: UI Updates

### 4.1 DevelopmentTabContent Enhancement

Add new cards to the Development tab:

1. **DEPENDENCY HEALTH** card
   - Health score progress bar
   - Outdated count / Critical count
   - List of critical dependencies with versions
   - "Analyze Now" button to trigger refresh

2. **GOVERNANCE HEALTH** card (if multisig exists)
   - Recent transaction count
   - Last activity date
   - Link to Squads/Realms dashboard

3. **TVL METRICS** card (for DeFi protocols)
   - Current TVL
   - Market share percentage
   - Risk ratio indicator

### 4.2 Score Breakdown Tooltip

Add a hover tooltip to the Resilience Score showing the weighted breakdown:
```text
GitHub Activity:     32/40
Dependency Health:   20/25
Governance:          15/20
TVL Risk:            10/15
─────────────────────
TOTAL:               77/100
```

---

## Phase 5: Integration with Refresh Cycle

Modify `refresh-all-profiles` to:
1. Call `analyze-github-repo` (existing)
2. Call `analyze-dependencies` (new)
3. Call `analyze-governance` if `multisig_address` exists (new)
4. Call `analyze-tvl` if `category = 'defi'` (new)
5. Calculate integrated score from all dimensions
6. Store snapshot in `score_history` with full breakdown

---

## Implementation Order

### Step 1: Database Migration
Add new columns to `claimed_profiles` table

### Step 2: Create `analyze-dependencies` Edge Function
- Fetch Cargo.toml from GitHub
- Parse and check against Crates.io
- Calculate dependency health score

### Step 3: Create `analyze-tvl` Edge Function
- Query DeFiLlama API
- Calculate TVL metrics and risk ratio

### Step 4: Create `analyze-governance` Edge Function
- Query Solana RPC for multisig transactions
- Calculate governance health score

### Step 5: Update `analyze-github-repo`
- Integrate dependency analysis call
- Calculate weighted integrated score
- Store comprehensive breakdown in score_history

### Step 6: Update Frontend Components
- Add DependencyHealthCard component
- Add GovernanceHealthCard component
- Add TVLMetricsCard component
- Add score breakdown tooltip to HeroBanner

### Step 7: Update Types
- Extend ClaimedProfile interface
- Add new card component types

---

## Risk Mitigation

### API Rate Limits
- **Crates.io**: 1 request/second limit - add delays
- **DeFiLlama**: No auth required, generous limits
- **GitHub**: Use existing token, already rate-limited

### Data Freshness
- Dependencies: Refresh daily (low change frequency)
- TVL: Refresh every 6 hours (price volatility)
- Governance: Refresh every 30 minutes with GitHub

### Graceful Degradation
- If any dimension fails to analyze, use last known value
- Display "N/A" with explanation if no data available
- Don't block score calculation if one dimension fails

---

## Success Metrics

1. **Zero Credit Projects**: Should score 15-30 (proves formula works)
2. **Established Projects**: Should score 70-85 (validates earned reputation)
3. **Zombie Titans**: High TVL + Low Activity = LOW score (exposes risk)
4. **Healthy DeFi**: High TVL + High Activity = HIGH score (rewards diligence)

---

## Files to Create/Modify

### New Files
- `supabase/functions/analyze-dependencies/index.ts`
- `supabase/functions/analyze-tvl/index.ts`
- `supabase/functions/analyze-governance/index.ts`
- `src/components/program/DependencyHealthCard.tsx`
- `src/components/program/GovernanceHealthCard.tsx`
- `src/components/program/TVLMetricsCard.tsx`
- `src/components/program/ScoreBreakdownTooltip.tsx`
- `src/hooks/useDependencyAnalysis.ts`
- `src/hooks/useTVLAnalysis.ts`
- `src/hooks/useGovernanceAnalysis.ts`

### Modified Files
- `src/types/index.ts` - Add new interfaces
- `src/types/database.ts` - Add new DB types
- `src/components/program/tabs/DevelopmentTabContent.tsx` - Add new cards
- `src/components/program/HeroBanner.tsx` - Add score breakdown
- `supabase/functions/analyze-github-repo/index.ts` - Integrate new dimensions
- `supabase/functions/refresh-all-profiles/index.ts` - Call new functions
- `supabase/config.toml` - Register new functions
