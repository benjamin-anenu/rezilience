

## Fix Score History Chart Accuracy

The chart currently has three accuracy problems that make it unreliable:

### Problem 1: Duplicate snapshots (dozens per day)

The refresh cycle runs every 30 minutes and inserts a new `score_history` row each time. With `limit(12)`, the chart shows 12 data points all from the same day labeled "Feb" -- making it useless for trend visualization.

**Fix:** Use UPSERT with a unique constraint on `(claimed_profile_id, snapshot_date::date)` so only one snapshot per project per day exists. The `snapshot_date` in `refresh-all-profiles` already uses `today` (date-only string), but legacy rows from `fetch-github` use full timestamps. Additionally, deduplicate in the hook query.

| Step | Detail |
|------|--------|
| Database migration | Add a unique index on `(claimed_profile_id, snapshot_date::date)` or change the insert to an upsert |
| `refresh-all-profiles` | Change `.insert()` to `.upsert()` with `onConflict: 'claimed_profile_id,snapshot_date'` so re-runs on the same day update rather than duplicate |
| `fetch-github` | Remove the `score_history` insert at line 206 (it still writes with the old GitHub-only score) |
| `useScoreHistoryChart` | Deduplicate entries by date, keeping only the latest per day |

### Problem 2: `fetch-github` still writes stale snapshots

`supabase/functions/fetch-github/index.ts` line 206 still inserts into `score_history` with its own independently calculated score -- bypassing the unified scoring in `refresh-all-profiles`. This creates conflicting rows.

**Fix:** Remove the `score_history` insert from `fetch-github`, matching what was already done for `analyze-github-repo`.

### Problem 3: `commit_velocity` stores wrong data

Line 363 in `refresh-all-profiles` writes `commit_velocity: scoreBreakdown.github` (the GitHub dimension score, 0-100) instead of the actual commit velocity (commits/day, typically 0-3). The chart Y-axis says "Velocity" with domain [0, 20] but gets values like 45 or 29.

**Fix:** Store the actual `commit_velocity` value from the profile's `github_commits_30d / 30` calculation instead of the GitHub dimension score.

### Problem 4: Chart X-axis labels are meaningless

All 12 points show "Feb" because they're all from the same month. The chart should show dates (e.g., "Feb 10", "Feb 11") for daily granularity.

**Fix:** Update the date format in `useScoreHistoryChart` to include the day: `{ month: 'short', day: 'numeric' }`.

---

### Technical changes

**1. Database migration** -- Add unique constraint to prevent duplicate snapshots:
```sql
-- Remove duplicate rows first (keep the latest per profile per day)
DELETE FROM score_history a USING score_history b
WHERE a.id < b.id
  AND a.claimed_profile_id = b.claimed_profile_id
  AND a.snapshot_date::date = b.snapshot_date::date;

-- Add unique index
CREATE UNIQUE INDEX idx_score_history_profile_day
  ON score_history (claimed_profile_id, (snapshot_date::date));
```

**2. `supabase/functions/refresh-all-profiles/index.ts`**
- Change `.insert()` to `.upsert()` for score_history
- Fix `commit_velocity` to use actual velocity: `(profile.github_commits_30d || 0) / 30`

**3. `supabase/functions/fetch-github/index.ts`**
- Remove the `score_history` insert block (lines ~204-210)

**4. `src/hooks/useScoreHistory.ts`**
- Add client-side deduplication by date (keep latest per day)
- Change month format to include day number: `{ month: 'short', day: 'numeric' }` so labels read "Feb 10", "Feb 11" etc.

**5. `src/components/program/AnalyticsCharts.tsx` and `UpgradeChart.tsx`**
- Update Y-axis domain for velocity from `[0, 20]` to `[0, 'auto']` since actual velocity values are typically 0-3

These fixes ensure the chart accurately reflects the unified scoring mechanism with one data point per day, correct velocity values, and readable date labels.

