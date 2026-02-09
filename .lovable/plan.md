

# Split STATUS into Two Columns: ORIG + STATUS

The current "STATUS" column is doing double duty — mixing originality (Fork/OK) with claim status (Unclaimed). This splits it into two distinct columns.

## Changes

### 1. Add ORIG column header (ProgramLeaderboard.tsx)

Insert a new `ORIG` column header before the existing `STATUS` header. Keep STATUS where it is.

### 2. Update badge logic (LeaderboardRow.tsx)

**Rename `getOriginalityBadge` to `getStatusBadge2`** (or create new functions):

- **New `getOriginalityBadge`** -- Shows code provenance:
  - `is_fork === true` --> Red "Forked" badge
  - `is_fork === false` --> Green "Owned" badge (with CheckCircle icon)

- **New `getClaimStatusBadge`** -- Shows claim state:
  - `claimStatus === 'unclaimed'` --> Amber "Unclaimed" badge (with AlertTriangle icon)
  - `claimStatus === 'claimed'` --> Primary/teal "Claimed" badge (with CheckCircle icon)

### 3. Add ORIG cell in LeaderboardRow

Insert a new `TableCell` for originality before the existing Status cell. The Status cell now calls the new claim status function.

### 4. Mobile cards (MobileProgramCard.tsx)

Update to show both badges if the mobile card currently uses `getOriginalityBadge`.

## Column Layout After Change (14 columns)

| # | PROJECT | TYPE | PROGRAM | SCORE | HEALTH | TREND | LIVE | DECAY | ORIG | STATUS | STAKED | ACTIVITY | Eye |

Both ORIG and STATUS will be `hidden lg:table-cell` to keep the compact layout.

## Files Modified
1. `src/components/explorer/ProgramLeaderboard.tsx` -- Add ORIG header
2. `src/components/explorer/LeaderboardRow.tsx` -- Split badge logic into two functions, add ORIG cell
3. `src/components/explorer/MobileProgramCard.tsx` -- Update to show both badges

