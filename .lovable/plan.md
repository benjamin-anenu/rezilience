

# Enriched Trend Sparkline -- Multi-Signal Visualization

## Problem

The TREND sparkline in the Explorer leaderboard currently plots only the integrated Resilience Score from `score_history`. This creates flat lines for projects where the final score doesn't change between snapshots, even when real activity (commits, governance, TVL, contributors) is happening underneath. It gives a false impression of stagnation.

## Solution

Enrich the sparkline data source to use **commit velocity** (the most dynamic metric) as the primary trend signal, while keeping the score available as a tooltip overlay. This gives the sparkline actual movement that reflects real builder activity.

### Why Commit Velocity?

| Signal | Volatility | Data Availability | Reflects "Things Happening" |
|--------|-----------|-------------------|----------------------------|
| Resilience Score | Low (weighted formula smooths changes) | Requires snapshots | Indirectly |
| Commit Velocity | High (changes daily) | Already in score_history | Directly |
| TVL | Medium | Only for DeFi projects | Partially |
| Governance | Low-Medium | Only for DAOs | Partially |

Commit velocity is the most universally available, highest-frequency signal that directly answers "is something happening in this project?"

---

## Technical Changes

### 1. Update `useRankMovement.ts`

Currently fetches only `score` from `score_history`. Change to also fetch `commit_velocity`:

```
.select('claimed_profile_id, score, commit_velocity, snapshot_date')
```

Return both score history and velocity history per profile:

```typescript
scoreHistories: Record<string, number[]>;
velocityHistories: Record<string, number[]>;
```

### 2. Update `Sparkline.tsx`

Add support for a **dual-signal mode**:
- Primary line: commit velocity (shows activity happening)
- Optional secondary faint line: score (shows score trajectory)

Or, simpler approach: just switch the sparkline to plot velocity values instead of score values. The score is already displayed in the SCORE column -- the TREND column should show *activity*.

### 3. Update `LeaderboardRow.tsx`

Pass velocity history to the Sparkline instead of (or alongside) score history:

```tsx
<Sparkline values={velocityHistory} width={50} height={16} />
```

### 4. Update `ProgramLeaderboard.tsx`

Pass the new velocity history data from `rankData` to each `LeaderboardRow`.

### 5. Update `MobileProgramCard.tsx`

Same change for mobile view consistency.

---

## Sparkline Behavior After Change

| Scenario | Before (Score Only) | After (Velocity) |
|----------|-------------------|------------------|
| Active project, stable score | Flat line | Rising/dynamic line showing commit bursts |
| Project slowing down | Flat or barely moving | Visible downward trend in velocity |
| Score jumps from 40 to 55 | Step up visible | Velocity spike that caused the jump is visible |
| Inactive project | Flat line at same score | Flat line at zero (accurate -- nothing is happening) |

---

## Tooltip Enhancement

Add a hover tooltip to the sparkline showing:
- "7-day commit trend" label
- Min/max velocity values
- Current score for context

---

## Files Modified

1. **`src/hooks/useRankMovement.ts`** -- Fetch `commit_velocity` alongside `score`, return `velocityHistories`
2. **`src/components/explorer/Sparkline.tsx`** -- Add tooltip on hover, keep existing smooth curve logic
3. **`src/components/explorer/LeaderboardRow.tsx`** -- Pass velocity data to Sparkline
4. **`src/components/explorer/ProgramLeaderboard.tsx`** -- Pass velocity histories to rows
5. **`src/components/explorer/MobileProgramCard.tsx`** -- Same velocity data for mobile

## Fallback

If a project has no `commit_velocity` data in `score_history`, fall back to the existing score-based sparkline. This ensures no visual regression for projects with sparse data.

