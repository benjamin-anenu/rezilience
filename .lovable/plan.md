
# Sparkline Enhancement and Decay Column Implementation

## Problem Analysis

### Issue 1: Sparkline Not Updating
The sparkline charts aren't showing meaningful movement because:
- **Root Cause**: Most profiles were just seeded and only have 1-4 score snapshots captured over the last ~1 hour (data shows most profiles have snapshot_count of 3-5)
- The 30-minute cron job creates snapshots, but since scores are calculated from relatively static data (stars, contributors, commit history), the values barely change between snapshots
- When all values are nearly identical, the sparkline renders as a flat line

### Issue 2: Rigid Sparkline Appearance
The current SVG polyline uses sharp, angular joints between data points rather than smooth curves.

### Issue 3: Missing Decay Rate Column
There's no visibility into how fast a project's score is decaying - the decay factor (e^(-0.05 * months)) is calculated but not displayed.

---

## Implementation Plan

### Phase 1: Add Decay Rate Column
Insert a new "DECAY" column between LIVENESS and STATUS showing the daily decay percentage.

**Location**: Between columns at lines 183-184 in `ProgramLeaderboard.tsx`

**Data Source**: Calculate decay rate from `github_last_activity` timestamp:
- Formula: Daily decay = `1 - e^(-0.00167 * days)` expressed as percentage
- Example: 30 days inactive = ~4.9% decayed

**Visual Design**:
- Column header: "DECAY"
- Cell content: Percentage with color coding
  - Green (0-2%): Healthy, recent activity
  - Amber (2-10%): Moderate decay
  - Red (10%+): Severe decay

### Phase 2: Smooth Sparkline Curves
Replace the rigid `polyline` with a smooth `path` using cubic bezier curves.

**Changes to `Sparkline.tsx`**:
- Convert point-to-point rendering to use smooth curve interpolation
- Use `quadraticCurveTo` or `cubicBezierTo` SVG commands
- Apply `stroke-linecap: round` for softer endpoints

**Pseudo-code for smooth path generation**:
```text
M x0,y0
Q (x0+x1)/2,y0 (x0+x1)/2,(y0+y1)/2
T x1,(y0+y1)/2
... continue for each point
```

### Phase 3: Improve Sparkline Data Context
Add visual indicators when data is insufficient.

**Changes**:
1. Show "Building..." label when < 3 data points
2. Add subtle dot markers at each data point for clarity
3. Extend the query to fetch more historical points when available

---

## Technical Details

### New Files: None

### Modified Files:

**1. `src/components/explorer/ProgramLeaderboard.tsx`**
- Add TableHead for "DECAY" column (after LIVENESS)
- Add TableCell rendering decay percentage
- Add helper function `calculateDecayPercentage(lastActivityDate)`
- Add helper function `getDecayColor(percentage)`
- Extend `ExplorerProject` interface usage to include `github_last_activity`

**2. `src/components/explorer/Sparkline.tsx`**
- Replace `polyline` with `path` element
- Implement `generateSmoothPath()` function using bezier curves
- Add optional `showDots` prop to render point markers
- Add minimum data threshold check with fallback display

**3. `src/hooks/useExplorerProjects.ts`**
- Include `github_last_activity` field in the query select and mapping

**4. `src/components/explorer/MobileProgramCard.tsx`**
- Add decay rate display for mobile consistency

---

## Column Order After Implementation

```text
RANK | PROJECT | TYPE | PROGRAM ID | SCORE | TREND | LIVENESS | DECAY | STATUS | STAKED | LAST ACTIVITY
```

---

## Why Sparklines Appear Static (Context)

The sparkline visualizes score snapshots from `score_history`. Current data shows:
- Snapshots are captured every ~30 minutes
- Most profiles have only 3-5 snapshots over ~1 hour
- Score changes require actual GitHub activity changes (commits, stars, contributors)
- Without new commits/activity, the decay formula produces nearly identical scores between snapshots

**Expected Behavior**: Once profiles accumulate snapshots over days/weeks, the sparklines will show meaningful trends. The smoothing enhancement will make small variations more visible.
