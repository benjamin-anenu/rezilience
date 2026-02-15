

## Fix Build In Public Grid — 4 Posts Per Row

### Problem
The grid maxes out at 3 columns (`lg:grid-cols-3`), making each card tall and narrow on wide screens.

### Fix
Update the grid classes in `BuildersInPublicFeed.tsx` to support 4 columns on larger screens:

**Current:** `grid gap-5 sm:grid-cols-2 lg:grid-cols-3`
**New:** `grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

This applies to two places in the file:
1. The skeleton loading grid (line 28)
2. The actual post grid (line 101)

Also bumps skeleton count from 6 to 8 to fill the 4-column layout during loading.

### Files Changed

| File | Change |
|------|--------|
| `src/components/explorer/BuildersInPublicFeed.tsx` | Add `xl:grid-cols-4` to both grids, reduce gap to `gap-4`, update skeleton count to 8 |

