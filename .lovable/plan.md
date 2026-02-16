

## Fix: GitHub Score Undervalues Solo Builders with High Activity

### Problem
The GitHub dimension score (0-100) caps around 35 for solo developers with no releases/stars, even with maximum commit activity. This makes the score misleading for early-stage projects where a single builder is highly active.

### Root Cause
The scoring allocates only 30/100 points to activity. The remaining 70 points require:
- Multiple contributors (25 pts) -- solo dev gets only 5
- Releases (20 pts) -- no tagged releases = 0
- Stars (15 pts) -- new project = 0
- Project age (10 pts) -- young project = 0-5

### Proposed Fix: Rebalance the GitHub Scoring Formula

Shift weight toward **activity quality** and add a **solo builder bonus** so that high-velocity solo work is rewarded fairly, while still incentivizing healthy project practices.

**New point allocation:**

| Dimension | Old Max | New Max | Change |
|-----------|---------|---------|--------|
| Weighted Activity | 30 | **40** | +10 (reward sustained effort) |
| Contributor Diversity | 25 | **20** | -5 (less penalty for solo) |
| Releases | 20 | **15** | -5 (still rewarded but less punishing) |
| Stars/Popularity | 15 | **10** | -5 (vanity metric, less weight) |
| Project Age | 10 | **10** | unchanged |
| Commit Consistency Bonus | 0 | **5** | NEW: bonus for committing on 20+ of last 30 days |

Additionally, adjust contributor thresholds so solo devs with high activity get 8 points instead of 5.

### Technical Changes

1. **`supabase/functions/analyze-github-repo/index.ts`**
   - Rebalance point allocations as described above
   - Add commit consistency bonus (5 pts) for projects with commits on 20+ of last 30 days
   - Adjust contributor tier: 1 active contributor with high activity = 8 pts (up from 5)
   - Add more granular activity tiers for the 0-40 range

2. **`supabase/functions/refresh-all-profiles/index.ts`**
   - No changes needed -- it already reads the GitHub score from analyze-github-repo correctly

3. **No frontend changes needed** -- the tooltip already displays whatever score the backend produces

### Expected Impact
With 299 push events, 1 contributor, 0 releases, 0 stars, young project:
- **Before**: 30 + 5 + 0 + 0 + 0 = **35**/100
- **After**: 40 + 8 + 0 + 0 + 5 (consistency) + 5 (age ~1mo) = **~58**/100

This better reflects the reality that a solo builder shipping 550 commits in 30 days is demonstrably resilient.

### Important Note on "+26"
The "+26" display next to Dependency Health is correct behavior -- it shows the **weighted contribution** (64 x 0.40 = 25.6, rounded to 26), not the raw score. The raw 64/100 is shown on the progress bar. No fix needed here, but we could add a small "(64/100)" label next to the contribution for clarity if desired.

