

# Roadmap Phase Updates + Dynamic Impact Stats

## Change 1: Phase 1 Status -- IN PROGRESS (not COMPLETE)

Update the Phase 1 badge from `COMPLETE` (green) to `IN PROGRESS` with a yellow/amber style.

- Change the badge text and color to: `bg-yellow-500/20 text-yellow-500 border-yellow-500/30`
- Replace the first "Ships" item from `'Automated scoring for 2,847+ protocols'` to `'Automated scoring for 500+ Solana projects'`
- Replace the `CheckCircle2` icon on that first item with a `Loader2` (spinning) or `Clock` icon in yellow to indicate "ongoing" instead of complete. The remaining items keep their green checkmarks.

## Change 2: Phase 2 Status -- PLANNED (not IN PROGRESS)

Update the Phase 2 badge from `IN PROGRESS` (primary/teal) to `PLANNED` (outline style, matching Phase 3/4).

- Change badge to: `<Badge variant="outline" className="font-mono text-xs">PLANNED</Badge>`
- Update the checklist icons from `text-primary` to `text-muted-foreground/50` (matching Phase 3/4 planned items)

## Change 3: Dynamic Impact Stats from Database

Replace the hardcoded Impact section (500+, 5000+, 50+, $200K) with real data fetched from the database. Use the existing `useHeroStats` pattern to query `claimed_profiles`.

**New impact metrics (4 cards):**

| Metric | Source | Current DB Value |
|---|---|---|
| Verified Scores | Count of profiles with `resilience_score > 0` | 79 |
| Monthly Visitors | Keep as placeholder "---" or omit (no analytics table) | --- |
| Claimed Profiles | Count where `claimer_wallet IS NOT NULL` | 1 |
| Unclaimed Profiles | Count where `claimer_wallet IS NULL` | 166 |

Since we can't track monthly visitors from the DB, the 4 stats will be: **Scored Projects**, **Claimed Profiles**, **Unclaimed Profiles**, and **Solana Grant** (changed to "Application Ongoing").

A small `useRoadmapStats` hook will query `claimed_profiles` for these counts.

## Change 4: Grant Text Update

Replace `$200K` / `Solana Grant` with `Application Ongoing` / `Solana Grant` in amber/yellow text to indicate it's not yet awarded.

## Technical Details

### Files modified:
1. **`src/pages/Readme.tsx`** -- Update Phase 1 badge, Phase 2 badge, replace hardcoded impact stats with dynamic query, update grant text
2. **`src/hooks/useRoadmapStats.ts`** (new file) -- Small hook to fetch scored/claimed/unclaimed counts from `claimed_profiles`

### No new dependencies needed.

