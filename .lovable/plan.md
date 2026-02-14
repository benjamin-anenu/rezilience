
# Fix: Eliminate Misleading Default Scores on Fresh Profiles

## The Problem

When you register a new off-chain project and land on your dashboard for the first time, you see:
- **Bytecode Originality: "Verified Original" at 100%** (wrong -- your app is off-chain)
- **Dependency Health: 50** (fabricated -- no analysis has run yet)
- **GitHub Originality: "Not Analyzed" at 50%** (misleading bar fill)
- No indication that data is being fetched in the background

This happens because the code uses optimistic defaults instead of showing "Awaiting Analysis" states.

## Root Causes

1. **ProfileDetail.tsx line 149**: Hardcodes `originalityStatus: 'verified'` for all profiles, regardless of whether bytecode verification has actually run.
2. **DevelopmentTabContent.tsx line 66**: Defaults `dependencyHealthScore = 50` when no data exists.
3. **No "pending analysis" skeleton/loading state**: Fresh profiles with no data look identical to fully-analyzed ones.

## Changes

### 1. Fix `originalityStatus` in ProfileDetail.tsx

Change line 149 from:
```
originalityStatus: 'verified' as const,
```
to a conditional that checks whether the profile has a real program ID (on-chain) or not:
```
originalityStatus: (profile.programId && profile.programId !== profile.id)
  ? 'unverified' as const
  : 'not-deployed' as const,
```

This ensures:
- Off-chain projects show "Not On-Chain" (correct)
- On-chain projects without bytecode verification show "Unverified" (honest) until the verify-bytecode function runs

### 2. Fix default values in DevelopmentTabContent.tsx

Change the destructured defaults from fabricated numbers to explicit "no data" signals:

| Prop | Current Default | New Default |
|---|---|---|
| `dependencyHealthScore` | `50` | `0` |
| `dependencyOutdatedCount` | `0` | `0` (keep) |
| `dependencyCriticalCount` | `0` | `0` (keep) |
| `governanceTx30d` | `0` | `0` (keep) |
| `tvlUsd` | `0` | `0` (keep) |

### 3. Add "Awaiting Analysis" states to health cards

Update `DependencyHealthCard`, `GovernanceHealthCard`, and originality metrics to detect when no analysis has ever run (`analyzedAt` is null/undefined) and render a clear "Awaiting first analysis" message instead of showing default numbers.

For `DependencyHealthCard`: When `analyzedAt` is falsy, show "Awaiting Analysis" with a muted skeleton-style card instead of a score bar at 50.

For bytecode/GitHub originality in `DevelopmentTabContent`: When `bytecodeMatchStatus` is null AND `program.originalityStatus` is `'not-deployed'`, show "Not On-Chain" at value 0 (already handled by the fix in step 1). When it's `'unverified'`, show "Awaiting Verification" instead of "Unverified" with 60%.

### 4. Add loading indicator on ProfileDetail for fresh profiles

When the profile has just been created (no `github_analyzed_at`, no `dependency_analyzed_at`, etc.), show a subtle banner at the top:

```
"First analysis in progress -- metrics will appear shortly."
```

This uses the existing `isRefreshing` state or checks for the absence of any `*_analyzed_at` timestamps.

## Technical Details

### Files Modified

1. **src/pages/ProfileDetail.tsx** -- Fix `originalityStatus` from hardcoded `'verified'` to conditional based on programId. Add "First analysis in progress" banner for fresh profiles.

2. **src/components/program/tabs/DevelopmentTabContent.tsx** -- Change `dependencyHealthScore` default from `50` to `0`. Update bytecode fallback logic to use `'not-deployed'` label correctly.

3. **src/components/program/DependencyHealthCard.tsx** -- Add "Awaiting Analysis" state when `analyzedAt` is null, rendering a muted placeholder instead of a fake score.

4. **src/components/program/GovernanceHealthCard.tsx** -- Same "Awaiting Analysis" treatment when `analyzedAt` is null.

5. **src/components/program/MetricCards.tsx** -- Fix the fallback for `originalityStatus: 'verified'` to not show 100% when no actual bytecode data exists. The fix in ProfileDetail.tsx prevents this path from being hit incorrectly.

### What This Fixes

- Off-chain projects correctly show "Not On-Chain" for bytecode (value 0, grayed out)
- On-chain projects without verification show "Awaiting Verification" instead of "Verified Original"
- Dependency health shows "Awaiting Analysis" instead of a fake 50 score
- Users see a clear "First analysis in progress" message on fresh profiles
- No misleading data on first landing -- only honest states
