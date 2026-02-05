
# Phase 0 Data Infrastructure: Clear Dummy Data and Align with Real Backend

## 1. Baseline Understanding

### Current Implementation (What Exists Today)

| Layer | File | What It Does |
|-------|------|--------------|
| **Mock Data Store** | `src/data/mockData.ts` | Exports hardcoded arrays: `programs` (10 items), `ecosystemStats`, `recentEvents`, `upgradeChartData`, `mockVerifiedProfiles` |
| **Type Definitions** | `src/types/index.ts` | Full TypeScript interfaces for `Program`, `GitHubData`, `ClaimedProfile`, etc. |
| **Scoring Logic** | `src/lib/scoring.ts` | Weighted average formula (40% Liveness, 30% Originality, 30% Assurance) - **does not match spec** |
| **GitHub Utilities** | `src/lib/github.ts` | Mock `fetchGitHubData()` that generates pseudo-random data from URL hash |

### Files Consuming Mock Data (7 Total)

| File | Import Used | Purpose |
|------|-------------|---------|
| `Explorer.tsx` | `programs` | Leaderboard listing |
| `ProgramDetail.tsx` | `getProgramById`, `mockVerifiedProfiles` | Program lookup + verified profile fallback |
| `ClaimProfile.tsx` | `programs` | Validate Program ID during claim |
| `EcosystemStats.tsx` | `ecosystemStats` | Dashboard stats cards |
| `UpgradeChart.tsx` | `upgradeChartData` | Recharts line/bar chart |
| `RecentEvents.tsx` | `recentEvents` | Activity timeline |
| `StakingForm.tsx` | `programs` | Program verification in staking flow |

### What Works Well (Must Remain Untouched)
- All UI components are polished and functional
- 5-step claim profile flow with X auth, wallet connect, GitHub OAuth simulation
- Staking 3-step form with slider lockup selection
- Verified profile "Heartbeat Dashboard" rendering (media gallery, timeline, social pulse)
- Responsive layouts across all pages

### Fragile/Tightly Coupled Areas
- `getProgramById(id)` uses internal `id` field (1-10), not `programId` (on-chain address)
- `localStorage` is used for claim profile persistence (temporary)
- Scoring algorithm in `lib/scoring.ts` doesn't match the spec's exponential decay formula

---

## 2. Use Cases

### Must-Have (Phase 0)
1. **Replace mock arrays with Supabase queries** - Explorer, ProgramDetail, StakingForm
2. **Align scoring algorithm** with exponential decay formula: `R(P,t) = (O x I) x e^(-lambda * t) + S`
3. **Add missing GitHubData fields** - `isFork`, `commitsLast30Days`, `topContributors`, `language`
4. **Create Supabase schema** matching the spec (projects, score_history, bonds tables)
5. **Implement real GitHub API integration** with token-based auth

### Nice-to-Have (Phase 0.5)
1. Real-time Supabase subscriptions for leaderboard updates
2. Daily cron job for score recalculation
3. Score history charting from `score_history` table

### Out-of-Scope (Phase 1+)
1. On-chain staking smart contracts
2. Bytecode fingerprinting and fork detection
3. Multisig authority verification via Solana RPC

---

## 3. Edge Cases and Stress Scenarios

| Scenario | Current Behavior | Ideal Behavior |
|----------|------------------|----------------|
| No projects in database | UI shows empty array | Show "No programs indexed yet" empty state |
| GitHub API rate limit | N/A (mock data) | Cache responses, show stale data with warning |
| Program ID not found | Returns `undefined` | Show "Program not in registry" with claim CTA |
| Stale GitHub data (>24h) | N/A | Badge: "Data last updated X hours ago" |
| User abandons claim flow | Data in `localStorage` | Same - persist draft, resume later |
| Concurrent score updates | N/A | Use Supabase `updated_at` timestamps |

---

## 4. Touchpoints and System Interactions

```text
+------------------+     +------------------+     +------------------+
|   React Pages    |---->|  Data Layer      |---->|   Supabase       |
|                  |     |  (hooks/queries) |     |   (PostgreSQL)   |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
| Explorer.tsx     |     | useProjects()    |     | projects table   |
| ProgramDetail    |     | useProgram(id)   |     | score_history    |
| ClaimProfile     |     | useEcosystem()   |     | bonds table      |
| StakingForm      |     | useScoreHistory()|     +------------------+
+------------------+     +------------------+              |
                                 |                         v
                                 |              +------------------+
                                 +------------->| Edge Functions   |
                                                | - updateScores() |
                                                | - fetchGitHub()  |
                                                +------------------+
```

### Ripple Effects
- Changing `Program` interface affects 7 files
- Scoring formula change affects `ProgramDetail` score display, `BondSummary` projections
- Database schema change requires RLS policies for security

---

## 5. User Experience Assessment

| User Type | Current Pain Points | Proposed Improvements |
|-----------|---------------------|----------------------|
| First-time visitor | Sees fake data, no indication it's demo | Add "PHASE 0 - DEMO DATA" badges initially, remove when real |
| Power user (developer) | Cannot verify their actual program | Enable real Program ID lookup via Supabase |
| Staker | Mock wallet balance, no real transactions | Phase 1 - out of scope |

### Cognitive Load Reduction
- Loading states during Supabase queries (skeleton loaders)
- Error boundaries with retry buttons
- Empty states with actionable CTAs

---

## 6. Benefits and Trade-offs

| Change | User Benefit | Business Benefit | Technical Benefit | Trade-off |
|--------|--------------|------------------|-------------------|-----------|
| Replace mock data | Real transparency | Credibility | Scalability | Requires backend setup |
| Align scoring formula | Accurate decay visibility | Differentiated product | Math matches spec | More complex calculation |
| Add GitHub fields | Better fork detection | Originality metrics | Type safety | API rate limits |
| Supabase schema | Persistent data | Analytics capability | Query flexibility | Infrastructure cost |

---

## 7. Scalability and Future-Proofing

### Current Design Limitations
- Mock data caps at 10 programs
- No pagination in leaderboard
- Scoring calculated client-side (CPU bound)

### Extension Paths (Additive, Not Destructive)
1. **Pagination hook**: `useProjects({ limit, offset })` - add without breaking
2. **Server-side scoring**: Edge Function runs daily, stores result
3. **Feature flags**: `ENABLE_REAL_DATA=true` to toggle mock/real
4. **Versioned schema**: Use migrations, never destructive DDL

---

## 8. Safe Evolution Strategy

### Non-Breaking Migration Plan

```text
Phase 0.1: Create Supabase Tables (Parallel to Mock)
  - Deploy schema
  - Keep mock data as fallback
  - Add feature flag: USE_SUPABASE_DATA

Phase 0.2: Create Data Hooks
  - useProjects() -> queries Supabase or returns mock
  - useProgram(id) -> same pattern
  - Components unchanged

Phase 0.3: Switch Flag
  - Set USE_SUPABASE_DATA=true
  - Mock data still exists (rollback safety)

Phase 0.4: Cleanup
  - Remove mock data exports
  - Delete unused code
```

### What Should NOT Be Changed
- Component UI/UX (already polished)
- Type interfaces (extend, don't modify)
- Route structure
- Auth flow (X, wallet)

---

## 9. Risk and Regression Guardrails

| Risk Area | Guardrail |
|-----------|-----------|
| Empty leaderboard | Add `projects.length === 0` empty state |
| Supabase connection fail | Fallback to cached data, toast error |
| Score calculation NaN | Clamp values, validate inputs |
| Type mismatches | Keep mock data types as source of truth during migration |

### Tests to Add
- `scoring.test.ts`: Verify decay formula with known inputs
- `useProjects.test.ts`: Mock Supabase, verify query structure
- Integration: E2E test Explorer page loads

### Rollback Strategy
- Feature flag `USE_SUPABASE_DATA` can be toggled per environment
- Mock data remains until Phase 0.4 cleanup

---

## 10. Implementation Plan

### Step 1: Create Supabase Schema (Database)

Create tables matching the spec:

```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  program_id VARCHAR(44) NOT NULL UNIQUE,
  program_name VARCHAR(255),
  github_url VARCHAR(500),
  description TEXT,
  verified BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP,
  
  -- GitHub data (cached)
  github_stars INT,
  github_forks INT,
  github_contributors INT,
  github_last_commit TIMESTAMP,
  github_commit_velocity DECIMAL,
  is_fork BOOLEAN DEFAULT FALSE,
  
  -- Resilience Score
  resilience_score DECIMAL,
  liveness_status VARCHAR(50),
  originality_score DECIMAL,
  
  -- Staking
  total_staked DECIMAL DEFAULT 0
);

-- Score history
CREATE TABLE score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  score DECIMAL,
  snapshot_date TIMESTAMP DEFAULT NOW(),
  commit_velocity DECIMAL,
  days_last_commit INT
);

-- Bonds (Phase 1 prep)
CREATE TABLE bonds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  user_wallet VARCHAR(44),
  staked_amount DECIMAL,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 2: Update Type Definitions

Extend `src/types/index.ts`:

```typescript
// Add to GitHubData interface
export interface GitHubData {
  // ... existing fields
  isFork: boolean;
  commitsLast30Days: number;
  topContributors: string[];
  language: string;
}

// Add database-aligned Program type
export interface DBProgram {
  id: string; // UUID
  program_id: string;
  program_name: string;
  github_url: string | null;
  description: string | null;
  verified: boolean;
  resilience_score: number;
  liveness_status: 'ACTIVE' | 'STALE' | 'DECAYING';
  total_staked: number;
  github_last_commit: string | null;
  github_contributors: number | null;
  is_fork: boolean;
  last_updated: string;
}
```

### Step 3: Align Scoring Algorithm

Replace `src/lib/scoring.ts` with exponential decay formula:

```typescript
export function calculateResilienceScore(
  githubData: GitHubData,
  onchainData: { stakedSOL: number }
): ScoringResult {
  // O = Originality (0.3 for forks, 1.0 for original)
  const O = githubData.isFork ? 0.3 : 1.0;
  
  // I = Impact (log10 of contributors + stars)
  const I = Math.log10(Math.max(githubData.activeContributors + githubData.stars, 1));
  
  // Decay = e^(-lambda * months)
  const monthsSinceLastCommit = daysSinceLastCommit / 30;
  const lambda = 0.05;
  const decayFactor = Math.exp(-lambda * monthsSinceLastCommit);
  
  // S = Stake bonus
  const S = onchainData.stakedSOL / 1000;
  
  // R(P,t) = (O x I) x decay + S
  const baseScore = (O * I) * decayFactor;
  const finalScore = baseScore + S;
  
  // Normalize to 0-100
  return Math.min((finalScore / 4) * 100, 100);
}
```

### Step 4: Create Data Hooks

New file `src/hooks/useProjects.ts`:

```typescript
export function useProjects() {
  // Query Supabase with React Query
  // Fallback to mock data if feature flag disabled
}

export function useProgram(programId: string) {
  // Single program lookup
}

export function useEcosystemStats() {
  // Aggregate stats from projects table
}
```

### Step 5: Migrate Components

Update each consumer to use hooks instead of direct imports:

| Component | Before | After |
|-----------|--------|-------|
| Explorer.tsx | `import { programs }` | `const { data: programs } = useProjects()` |
| ProgramDetail.tsx | `getProgramById(id)` | `useProgram(id)` |
| EcosystemStats.tsx | `import { ecosystemStats }` | `useEcosystemStats()` |

### Step 6: Seed Initial Data

Create seed script to populate initial cohort:
- Jupiter Exchange
- Marinade Finance
- Raydium AMM
- Orca Whirlpool
- Drift Protocol

---

## Summary

| Action | Priority | Status |
|--------|----------|--------|
| Create Supabase schema | NOW | To implement |
| Update type definitions | NOW | To implement |
| Align scoring formula | NOW | To implement |
| Create data hooks | NOW | To implement |
| Migrate components | NOW | To implement |
| Remove mock data | LATER (Phase 0.4) | Deferred |
| Real GitHub API | Phase 0.5 | Deferred |
| On-chain staking | Phase 1 | Out of scope |

### What to Avoid
- Modifying component UI/UX
- Breaking the claim profile flow
- Removing mock data before hooks are stable
- Deploying without feature flag protection
