

## Investigation Results: Scoring System Disconnections

### Bug 1 (CRITICAL): Dependency Score Shows "+0" in Breakdown Tooltip

**Root Cause: Field name mismatch between backend and frontend**

The backend (`refresh-all-profiles`) writes the score breakdown to the database with the key `dependencies` (plural):
```
scoreBreakdown = { github: 38, dependencies: 25, ... }
```

But the frontend `ScoreBreakdownTooltip` component and the `ScoreBreakdown` TypeScript interface expect the key `dependency` (singular):
```
interface ScoreBreakdown {
  github: number;
  dependency: number;   // <-- SINGULAR
  ...
}
```

When the component reads `scores.dependency`, it gets `undefined` (because the DB has `scores.dependencies`), which falls back to `0`. So even though your dependency health is 64/100, the tooltip shows `+0`.

**Fix:**
- In `ScoreBreakdownTooltip.tsx`: read from both `breakdown.dependencies` and `breakdown.dependency` for backward compatibility
- In `src/types/index.ts`: update `ScoreBreakdown` interface to use `dependencies` (matching DB)
- In `src/types/database.ts`: update `DBScoreHistory.breakdown` to also use `dependencies`

---

### Bug 2: Two Incompatible Score History Breakdown Formats

The `score_history` table contains TWO different breakdown schemas depending on which code path wrote the record:

**Format A** (from `refresh-all-profiles` -- integrated scoring):
```json
{ "github": 38, "dependencies": 25, "governance": null, "tvl": null, "baseScore": 33, "continuityDecay": 0, "weights": {...} }
```

**Format B** (from `analyze-github-repo` -- GitHub-only scoring):
```json
{ "stars": 216, "commits_30d": 0, "contributors": 10, "activity": 0, "age": 1122, ... }
```

Most records are Format B (the old GitHub-only breakdown). The chart currently only displays `score` and `commit_velocity`, so this doesn't break the chart visually, but it means the breakdown data in `score_history` is inconsistent and unreliable for any future tooltip or detail view.

**Fix:** Ensure `analyze-github-repo` does NOT write its own score_history entries (only `refresh-all-profiles` should, as the single source of truth for the integrated score).

---

### Bug 3: `analyze-github-repo` Writes a Separate `resilience_score` That Gets Overwritten

The `analyze-github-repo` function computes its own `resilienceScore` (GitHub-only, 0-100) and writes it directly to `claimed_profiles.resilience_score`. Then `refresh-all-profiles` reads that value as `githubScore` and uses it as the GitHub dimension input to the weighted formula.

This creates a race condition: if `analyze-github-repo` runs independently (e.g., from the claim pipeline), it overwrites `resilience_score` with a GitHub-only number. The next refresh cycle then reads that as the GitHub dimension, computes the integrated score, and overwrites it again. Between refreshes, the displayed score could be the raw GitHub score rather than the integrated one.

**Fix:** `analyze-github-repo` should write to a dedicated column (e.g., `github_resilience_score`) or the refresh pipeline should re-derive the GitHub dimension score from raw metrics rather than trusting `resilience_score`.

---

### Bug 4: Score History Chart Shows Stale/Confusing Data

The chart only has data for days when `refresh-all-profiles` ran. With a 1-day unique constraint, you see at most one point per day. If the cron hasn't run recently, the chart appears frozen. The "Last synced" indicator helps, but there's no visual indication that data points may be days apart.

Additionally, `commit_velocity` in the chart is the raw value (commits per day, e.g., 0.93) while the Y-axis label says "Velocity" with no scale context. Values like 0.03 and 0.93 compress the bar chart making it nearly invisible for low-activity projects.

---

### Summary of Fixes

| Issue | Component | Fix |
|-------|-----------|-----|
| Dependency shows +0 | `ScoreBreakdownTooltip.tsx`, `types/index.ts` | Change `dependency` to `dependencies` (with fallback) |
| Inconsistent history breakdowns | `analyze-github-repo/index.ts` | Stop writing score_history from GitHub-only analysis |
| Race condition on resilience_score | `analyze-github-repo/index.ts` | Don't overwrite `resilience_score` directly; let `refresh-all-profiles` be canonical |
| Chart velocity scale | `AnalyticsCharts.tsx` | Improve Y-axis domain and labeling for small values |

### Technical Changes

1. **`src/types/index.ts`** -- Change `ScoreBreakdown.dependency` to `dependencies`
2. **`src/types/database.ts`** -- Update `DBScoreHistory.breakdown` to use `dependencies` key
3. **`src/components/program/ScoreBreakdownTooltip.tsx`** -- Read `breakdown.dependencies` (with fallback to `breakdown.dependency`)
4. **`supabase/functions/analyze-github-repo/index.ts`** -- Remove direct writes to `resilience_score` and `score_history`; only write GitHub-specific columns
5. **`src/components/program/AnalyticsCharts.tsx`** -- Fix velocity axis to handle small fractional values (auto domain with minimum visible bar height)

