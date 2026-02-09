
# Diagnostic Report and Implementation Plan

## Issue 1: GitHub Metrics Stuck at 20 Commits / 0.7 velocity

**Root Cause Identified**: The GitHub Events API has a **critical limitation**:
- The Events API only returns the **most recent 300 events** AND events **older than 90 days** are excluded
- More importantly, **events expire quickly** - the API only shows events from the **last ~7-10 days** of activity
- When I checked the logs, your profile was last analyzed at `2026-02-09 03:02:01` with:
  - `github_commits_30d: 20`
  - `github_push_events_30d: 20` 
  - `github_commit_velocity: 0.67` (20 commits / 30 days)

**The Problem**: The edge function fetches commits from the Commits API (`/commits?since=30daysAgo`) which only counts **default branch commits**. Then it uses Events API for push events. But the Events API has a **hard limit of 20 events per page** (line 111 in analyze-github-repo):

```typescript
eventsResponse = await fetchWithAuth(`...events?per_page=20`, githubToken)
```

This means if you have 50 push events, we only see the **20 most recent** - severely undercounting your activity!

**Fix Required**:
1. Increase `per_page=100` for events endpoint
2. Paginate through events to capture full 30-day window
3. Use the **Statistics API** (`/repos/{owner}/{repo}/stats/commit_activity`) which provides accurate weekly commit counts maintained by GitHub

---

## Issue 2: New Scoring System Not Taking Effect

**Root Cause**: The `integrated_score` and `score_breakdown` fields are **empty** in the database:
- `integrated_score: 0`
- `score_breakdown: {}` (empty object)

**Why?**: The `analyze-github-repo` function doesn't calculate the integrated score - it only updates `resilience_score` based on GitHub metrics alone. The multi-dimensional scoring (deps + TVL + governance) needs to be calculated **after** all dimension analyses complete.

**Fix Required**: Update `refresh-all-profiles` to:
1. Run all dimension analyzers
2. Calculate the weighted integrated score: `R = 0.40×GitHub + 0.25×Deps + 0.20×Gov + 0.15×TVL`
3. Store the result in `integrated_score` and `score_breakdown`

---

## Issue 3: Where is the TVL/Jupiter Data?

**Location**: The TVL card is in the **Development tab** (DevelopmentTabContent.tsx), but it **only shows for DeFi protocols** (line 260):

```typescript
{(category === 'defi' || tvlUsd > 0) && (
  <TVLMetricsCard ... />
)}
```

**The Issue**: Your profile's category is likely not set to 'defi', so the TVL card is hidden. Also, the TVL data is `0` because:
- `analyze-tvl` queries DeFiLlama using `protocol_name`
- Your project "Resilience" is not a DeFi protocol listed on DeFiLlama
- TVL is only relevant for protocols that hold user funds (DEXes, lending, etc.)

**For Jupiter/major protocols**: They would need to be registered in claimed_profiles with `category: 'defi'` and their DeFiLlama slug matching their project name.

---

## Implementation Plan

### Phase 1: Fix GitHub Event Counting (Critical)

Update `analyze-github-repo` to properly count commits:

1. **Increase events per_page** from 20 to 100
2. **Add pagination** to fetch up to 300 events (3 pages)
3. **Add Statistics API** as authoritative source for commit counts:
   - Query `/repos/{owner}/{repo}/stats/commit_activity`
   - This gives exact weekly commit counts for the last 52 weeks
4. **Use the higher of**: Statistics API vs Events API commit counts

### Phase 2: Fix Integrated Score Calculation

Update `refresh-all-profiles` to calculate and store the integrated score:

1. After all dimension analyses complete, compute:
   ```
   github_normalized = (github_score / 100) * 100  // Already 0-100
   deps_normalized = dependency_health_score       // Already 0-100
   gov_normalized = calculateGovScore(governance_tx_30d)  // 0-100
   tvl_normalized = calculateTvlScore(tvl_risk_ratio)     // 0-100
   
   integrated = 0.40*github + 0.25*deps + 0.20*gov + 0.15*tvl
   ```
2. Store breakdown in `score_breakdown` JSONB field
3. Store final in `integrated_score`

### Phase 3: Add Mini Dimension Indicators to Leaderboard

Add small icons to the Explorer leaderboard showing health status for each dimension:

**Visual Design**:
```text
PROJECT          SCORE   [D][G][T]   TREND
Resilience         17    🟢 ⚫ ⚫     ↑
Jupiter            85    🟢 🟢 🟢     →
```

Where:
- **D** = Dependency Health (🟢 healthy, 🟡 warning, 🔴 critical)
- **G** = Governance (🟢 active, 🟡 dormant, ⚫ none)
- **T** = TVL (🟢 healthy ratio, 🟡 risky, ⚫ N/A)

**Implementation**:
1. Extend `useExplorerProjects` to fetch dimension scores
2. Add new TableHead "HEALTH" column after SCORE
3. Render mini indicators with tooltips

---

## Technical Changes

### Modified Files:

**1. `supabase/functions/analyze-github-repo/index.ts`**
- Change `per_page=20` to `per_page=100` for events
- Add pagination loop to fetch up to 300 events
- Add Statistics API call for accurate commit counts
- Use Math.max() to pick highest commit count from all sources

**2. `supabase/functions/refresh-all-profiles/index.ts`**
- After running all analyzers, calculate integrated_score
- Store score_breakdown with dimension values
- Update claimed_profiles with both fields

**3. `src/hooks/useExplorerProjects.ts`**
- Add `dependency_health_score`, `governance_tx_30d`, `tvl_usd` to query

**4. `src/components/explorer/ProgramLeaderboard.tsx`**
- Add "HEALTH" column with mini dimension indicators
- Add helper functions to determine indicator colors
- Add tooltips explaining each dimension status

**5. `src/components/explorer/MobileProgramCard.tsx`**
- Add dimension health row for mobile consistency

---

## Why Your Commits Show as 20

Looking at the code flow:
1. Events API returns max 20 events (due to `per_page=20`)
2. Each PushEvent is counted as having `payload.size` commits
3. But if you have 20 push events with 1 commit each = 20 commits
4. The Commits API counts default branch commits, which may also be ~20

**The fix** increases visibility from 20 to 300 events, capturing your full 30-day activity window.

---

## Expected Outcomes After Fix

1. **Your commit count** will reflect actual 30-day commits (likely 50-100+ based on your activity description)
2. **Commit velocity** will update to accurate commits/day (likely 1.5-3.0)
3. **Resilience score** will increase due to higher weighted activity
4. **Integrated score** will show the multi-dimensional breakdown
5. **Leaderboard** will show mini health indicators for quick assessment
