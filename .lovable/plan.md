

## Fix Score History Pipeline + Redesign Analytics Chart

### Problem 1: Score History Not Capturing (Critical Bug)

The `refresh-all-profiles` edge function is failing to write score history snapshots with this error:

```
"there is no unique or exclusion constraint matching the ON CONFLICT specification"
```

**Root cause:** The upsert uses `onConflict: "claimed_profile_id,snapshot_date"` but the actual unique index is a **function-based index**: `UNIQUE (claimed_profile_id, snapshot_date_day(snapshot_date))`. The Supabase JS client cannot target function-based indexes with `onConflict` -- it only works with raw column names.

This means **no new score history snapshots have been recorded** since this index was created. The 2 existing rows (Feb 14 and Feb 15) were inserted before the index was added.

**Fix:** Replace the upsert with a delete-then-insert pattern:
1. DELETE any existing row for today's date for this profile
2. INSERT the new snapshot

This sidesteps the function-based index limitation entirely.

### Problem 2: Analytics Chart Redesign

The current chart is a dual-axis ComposedChart (bars for velocity + line for score) crammed into a tab. With only 2 stale data points, it looks broken.

**Proposed new design -- a clean "Score Trend" card:**
- Replace the ComposedChart with a single-axis AreaChart showing score over time (gradient fill under the line)
- Add a prominent current score badge at the top-left (e.g., "63/100") with a delta indicator (up/down/stable arrow + point change)
- Show commit velocity as a subtle secondary stat below the chart rather than a competing axis
- Keep the "Last synced" indicator but move it inline with the card header
- Use a smooth monotone curve with a gradient fill from primary color to transparent

### Technical Changes

**1. Database migration -- add simple unique constraint**

```sql
-- Drop the function-based index that JS client can't target
DROP INDEX IF EXISTS idx_score_history_profile_day;

-- Add a date column for clean deduplication
ALTER TABLE score_history ADD COLUMN IF NOT EXISTS snapshot_day date 
  GENERATED ALWAYS AS ((snapshot_date AT TIME ZONE 'UTC')::date) STORED;

-- Create unique constraint on the generated column (JS client can target this)
CREATE UNIQUE INDEX idx_score_history_profile_day 
  ON score_history (claimed_profile_id, snapshot_day) 
  WHERE claimed_profile_id IS NOT NULL;
```

**2. `supabase/functions/refresh-all-profiles/index.ts`**

Replace the upsert block (lines 359-368) with a delete-then-insert approach:

```typescript
// Delete existing snapshot for today (if any)
const todayStart = `${today}T00:00:00Z`;
const todayEnd = `${today}T23:59:59Z`;
await supabase
  .from("score_history")
  .delete()
  .eq("claimed_profile_id", profile.id)
  .gte("snapshot_date", todayStart)
  .lte("snapshot_date", todayEnd);

// Insert fresh snapshot
const { error: historyError } = await supabase
  .from("score_history")
  .insert({
    claimed_profile_id: profile.id,
    score: finalScore,
    commit_velocity: actualVelocity,
    days_last_commit: daysSinceLastCommit,
    snapshot_date: new Date().toISOString(),
    breakdown: scoreBreakdown,
  });
```

**3. `src/components/program/AnalyticsCharts.tsx` -- Redesigned ScoreHistoryChart**

Replace the ComposedChart with:
- A header row showing: current score (large text), delta badge (e.g. "+16"), and synced timestamp
- A clean AreaChart with gradient fill (single Y-axis, 0-100 range for score)
- A small stat row below: "Avg velocity: X.XX commits/day" and "Data points: N"
- Use `linearGradient` defs for the area fill (primary color fading to transparent)

**4. `src/components/program/UpgradeChart.tsx` -- Same redesign**

Mirror the same AreaChart design for consistency across both the public profile and dashboard views.

**5. `src/hooks/useScoreHistory.ts` -- Add delta calculation**

Add a `scoreDelta` field to the chart hook return:
- Compare latest score to previous score
- Return `{ value: number, direction: 'up' | 'down' | 'stable' }`

### Expected Outcome

- Score history snapshots resume recording on every refresh cycle (every 30 minutes)
- The chart shows a clean area gradient with the score trend line
- Current score and change delta are prominently displayed
- Stale data is immediately obvious from the "Last synced" indicator
