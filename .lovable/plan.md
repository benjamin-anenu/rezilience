
# Restructure: Add LAST COMMIT Column + Merge Claim & Eye into ACTION Column

## Current Layout (14 columns)
`# | PROJECT | TYPE | PROGRAM | SCORE | HEALTH | TREND | LIVE | DECAY | ORIG | STATUS | STAKED | ACTIVITY | Eye`

The ACTIVITY column currently shows either a "Claim" button (unclaimed) or a last commit date (claimed). The Eye popover is a separate column. This merges those two into one ACTION column and extracts the last commit date into its own dedicated column.

## New Layout (14 columns -- same count)
`# | PROJECT | TYPE | PROGRAM | SCORE | HEALTH | TREND | LIVE | DECAY | ORIG | STATUS | STAKED | COMMIT | ACTION`

## Changes

### 1. ProgramLeaderboard.tsx -- Update headers
- Rename `ACTIVITY` header to `COMMIT`
- Rename the Eye icon header to `ACTION` (text, not icon)

### 2. LeaderboardRow.tsx -- Restructure cells

**COMMIT column** (replaces old ACTIVITY position):
- Always shows the formatted last commit date (`formatDate(project.github_last_commit)`)
- Lock icon for private repos

**ACTION column** (replaces old Eye column):
- Contains both the Claim button (for unclaimed projects) and the Eye popover, side by side in a `flex` row
- For claimed projects: just the Eye popover button
- For unclaimed projects: Claim button + Eye popover button

### Files Modified
1. `src/components/explorer/ProgramLeaderboard.tsx` -- Update 2 header labels
2. `src/components/explorer/LeaderboardRow.tsx` -- Restructure last 2 TableCells
