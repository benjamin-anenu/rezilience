

# Scoring Consolidation: Single Source of Truth

## The Problem (Worse Than Expected)

There are actually **THREE** competing scoring systems, not two:

| System | Formula | Writes To | Called By |
|--------|---------|-----------|-----------|
| Anti-Gaming Points | Weighted activity buckets (0-100) | `resilience_score` | `analyze-github-repo` (the refresh cycle's GitHub step) |
| Exponential Decay | `(O x I) x e^(-lambda*t) + S` | `resilience_score` | `fetch-github`, `github-oauth-callback` (claim flow) |
| Weighted Linear | `0.40*G + 0.25*D + 0.20*Gov + 0.15*TVL` | `integrated_score` | `refresh-all-profiles` (orchestrator) |

Additionally, two frontend files (`src/lib/scoring.ts` and `src/lib/resilience-scoring.ts`) contain scoring functions that are **never imported anywhere** -- pure dead code.

The refresh cycle works like this: `refresh-all-profiles` calls `analyze-github-repo`, which writes the anti-gaming score to `resilience_score`. Then `refresh-all-profiles` reads that `resilience_score` back as `githubScore` and feeds it into the weighted linear formula to produce `integrated_score`. So `resilience_score` is actually just the **GitHub dimension** (0-100), not the "resilience score." The naming is deeply misleading.

Meanwhile, the claim flow (`github-oauth-callback`) writes an exponential decay score to the same `resilience_score` column -- a completely different formula. The next refresh cycle overwrites it with the anti-gaming score. So for the first 30 minutes after claiming, a project shows a decay-based score, then switches to the anti-gaming score.

## The Solution: Hybrid Model (as you specified)

Consolidate into ONE formula used EVERYWHERE:

```text
R = (0.40 x GitHub + 0.25 x Deps + 0.20 x Gov + 0.15 x TVL) x ContinuityDecay
```

Where `ContinuityDecay = e^(-0.00167 x days_since_last_commit)` applies as a multiplicative penalty on the weighted base score.

### Key Design Decisions

1. **`resilience_score` becomes the canonical column** -- it's what the Explorer, leaderboard, and all UI already reads. `integrated_score` becomes a legacy column (kept for backward compatibility but no longer primary).
2. **The anti-gaming GitHub score (0-100) stays as-is** in `analyze-github-repo` -- it's a good per-dimension score. It just needs to be clearly labeled as the "GitHub dimension" and stored in a dedicated column.
3. **Continuity decay is applied at the final scoring step**, not inside any individual dimension.
4. **The claim flow writes a provisional score** using the same hybrid formula (with default dimension baselines for deps/gov/tvl until the first full refresh runs).

## Files to Change

### 1. `supabase/functions/refresh-all-profiles/index.ts`
- After calculating `githubScore`, `depsScore`, `govScore`, `tvlScore` (all 0-100)
- Calculate `baseScore = 0.40*G + 0.25*D + 0.20*Gov + 0.15*TVL`
- Calculate `daysSinceLastCommit` from the profile's `github_last_commit`
- Apply `continuityDecay = 1 - e^(-0.00167 * days)`
- `finalScore = baseScore * (1 - continuityDecay)`
- Write `finalScore` to **`resilience_score`** (the canonical column)
- Write `finalScore` to `integrated_score` as well (backward compat)
- Include `continuity_decay` percentage in `score_breakdown`
- Store the per-dimension sub-scores (`github_score`, `deps_score`, etc.) for breakdown tooltip

### 2. `supabase/functions/github-oauth-callback/index.ts`
- Replace the inline exponential decay `calculateResilienceScore` function
- After GitHub analysis, calculate only the **GitHub dimension score** (0-100) using the same anti-gaming buckets as `analyze-github-repo`
- Write a provisional `resilience_score` using: `GitHub * 0.40 + 50 * 0.25 + 0 * 0.20 + 50 * 0.15` (default baselines for dimensions not yet analyzed)
- Apply continuity decay
- This gives new claims a reasonable starting score that the first full refresh will correct

### 3. `supabase/functions/fetch-github/index.ts`
- Same treatment: replace inline exponential decay with provisional weighted score
- This function is called for manual GitHub re-analysis

### 4. Delete dead code
- Delete `src/lib/scoring.ts` (never imported)
- Delete `src/lib/resilience-scoring.ts` (never imported)

### 5. `src/hooks/useExplorerProjects.ts`
- Sort by `resilience_score` (which is now the unified hybrid score)
- Remove `integrated_score` sorting since `resilience_score` IS the integrated score now

### 6. `src/components/program/ScoreBreakdownTooltip.tsx`
- Add a "Continuity Decay" row showing the decay percentage penalty
- Update formula display: `R = (0.40xGitHub + 0.25xDeps + 0.20xGov + 0.15xTVL) x Continuity`

### 7. `src/components/readme/` (README page)
- Update the formula display to show the hybrid model with continuity decay
- This is what grant reviewers will read

### 8. `supabase/functions/chat-gpt/index.ts`
- Update the system prompt formula reference to match the hybrid model
- GPT should explain the unified formula when asked

### 9. Ecosystem snapshot in `refresh-all-profiles`
- Already aggregates from `resilience_score` -- no change needed since that column now contains the correct unified score

## Score Breakdown stored in DB

The `score_breakdown` JSONB column will contain:

```text
{
  "github": 72,
  "dependencies": 65,
  "governance": 40,
  "tvl": 50,
  "baseScore": 58,
  "continuityDecay": 3,
  "finalScore": 56,
  "weights": { "github": 0.40, "dependencies": 0.25, "governance": 0.20, "tvl": 0.15 }
}
```

## What This Achieves

- ONE formula, ONE column (`resilience_score`), used EVERYWHERE
- Transparent 4-dimension breakdown + continuity decay visible in tooltip
- Grant reviewers see a clean, auditable formula
- Builders understand exactly why their score is what it is
- No more "which score is real?" confusion
- The decay model's mathematical elegance is preserved as a modifier, not the core formula

## Deployment Sequence

1. Update `refresh-all-profiles` with hybrid formula (writes to both `resilience_score` and `integrated_score`)
2. Update `github-oauth-callback` and `fetch-github` with provisional scoring
3. Delete dead frontend scoring files
4. Update Explorer sort, tooltip, and README
5. Deploy all edge functions
6. Trigger one full refresh cycle to recalculate all 196 profiles with the unified formula

