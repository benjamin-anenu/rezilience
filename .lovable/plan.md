
# Dependency Tree Organization and Explorer Improvements

## Overview

This plan addresses four issues:
1. **Stale test data** - The 121 forks and npm dependencies are from the `sindresorhus/is` test URL, not your actual project
2. **Dependency tree layout** - The current vertical list looks cluttered with many dependencies
3. **Table pagination** - Reduce from 100 to 60 items per page
4. **Table columns** - Consolidate columns to prevent horizontal scrolling

---

## Issue 1: Stale Test Data (121 Forks)

**What happened:** When you tested with `sindresorhus/is`, the analyzer stored 14 npm dependencies and the profile picked up `github_forks: 121` from that popular repo. When we restored your URL, the forks count wasn't refreshed.

**Solution:** 
- Clear the test dependency data from the database
- Trigger a fresh analysis of your actual `benjamin-anenu/resilience` repository
- The forks count will update correctly during the next GitHub refresh

**Requires:** Database update to clear stale data and re-run analysis

---

## Issue 2: Dependency Tree Layout Redesign

**Current:** All dependencies stack vertically on the left with edges crossing. With 14+ nodes it looks cluttered.

**Proposed:** Use a tiered radial/hierarchical layout:

```text
                    ┌─────────────┐
                    │ CRITICAL    │  (Top row - red border)
                    └─────────────┘
                          │
    ┌───────┬───────┬─────┴─────┬───────┬───────┐
    │ dep   │ dep   │  PROJECT  │ dep   │ dep   │
    └───────┴───────┴───────────┴───────┴───────┘
                          │
    ┌───────┬───────┬─────┴─────┬───────┬───────┐
    │ dep   │ dep   │ dep       │ dep   │ dep   │
    └───────┴───────┴───────────┴───────┴───────┘
                    
                    ┌─────────────┐
                    │ GitHub      │  (Right side - forks)
                    │ Forks       │
                    └─────────────┘
```

**Changes to `DependencyTreeCanvas.tsx`:**
- Project node at center
- Critical dependencies in a row above the project
- Outdated dependencies (red/amber) in columns left of project
- Up-to-date dependencies in columns right of project
- Forks node below or to the right
- Use `dagre` layout algorithm for automatic positioning

---

## Issue 3: Reduce Pagination to 60 Items

**File:** `src/pages/Explorer.tsx`

**Change:** 
```typescript
// Line 17: Change from
const ITEMS_PER_PAGE = 100;
// to
const ITEMS_PER_PAGE = 60;
```

---

## Issue 4: Table Column Consolidation

**Current columns (13 total):**
1. RANK
2. PROJECT  
3. TYPE (hidden lg)
4. PROGRAM ID (hidden lg)
5. SCORE
6. HEALTH (hidden xl)
7. TREND (hidden xl)
8. LIVENESS (hidden md)
9. DECAY (hidden xl)
10. STATUS (hidden lg)
11. STAKED (hidden md)
12. LAST ACTIVITY (hidden lg)
13. EYE toggle

**Proposed consolidation (9 columns):**

| Column | Content | Visibility |
|--------|---------|------------|
| RANK | # + movement arrow | Always |
| PROJECT | Name + verified badge | Always |
| SCORE | Score number + health dots (D/G/T) | Always |
| TREND | Sparkline | Always |
| LIVENESS | Badge | md+ |
| STATUS | Verified/Unclaimed badge | lg+ |
| STAKED | Amount | lg+ |
| ACTIVITY | Date or "Claim" button | xl+ |
| EYE | Popover toggle | Always |

**Key consolidations:**
- Merge HEALTH dots into SCORE column (compact)
- Remove DECAY (redundant with LIVENESS) - keep in popover
- Remove TYPE (available in popover)
- Remove PROGRAM ID (available in popover)
- Move TREND to always-visible (important signal)

---

## Technical Implementation

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Explorer.tsx` | Change `ITEMS_PER_PAGE` to 60 |
| `src/components/explorer/ProgramLeaderboard.tsx` | Remove TYPE, PROGRAM ID, DECAY columns; move HEALTH into SCORE |
| `src/components/explorer/LeaderboardRow.tsx` | Consolidate cells; show health dots inline with score |
| `src/components/dependency-tree/DependencyTreeCanvas.tsx` | Implement tiered horizontal layout with critical deps on top |

### Database Cleanup (One-time)

```sql
-- Clear test dependency data
DELETE FROM dependency_graph 
WHERE source_profile_id = '553dd0d0-2f62-4891-9b09-e1358c5dc541';

-- Reset forks count (will be refreshed on next sync)
UPDATE claimed_profiles 
SET github_forks = NULL 
WHERE id = '553dd0d0-2f62-4891-9b09-e1358c5dc541';
```

Then trigger the `analyze-dependencies` function to re-analyze your actual repo.

---

## RLS Policy Gap (Info)

The dependency tree is already publicly accessible. The current RLS policies allow:
- Unclaimed profiles: Public read
- Verified profiles: Public read
- Dependency graph: Full public read

There is a minor gap: **claimed but unverified** profiles may not be visible to the public. If needed, we can add a policy for "claimed profiles are publicly readable" to cover this edge case.
