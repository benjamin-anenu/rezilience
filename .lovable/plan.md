

# Intelligence Dashboard in Explorer Eye Popover

## The Problem

You have 7 data services feeding real-time intelligence into every project, but the Explorer's Eye popover -- the most-used quick-glance tool -- shows almost none of it. A user clicking the Eye icon sees: GitHub public/private, website link, contributor count, X handle, and a dependency tree link. That's metadata, not intelligence.

The actual intelligence (dependency health, governance activity, TVL, vulnerability count, OpenSSF score, bytecode status, continuity decay) is only visible after clicking through to the full Program Detail page and navigating to the Development tab. This creates a 3-click journey to answer the question: "Is this project healthy?"

## The Solution: Intelligence-Rich Eye Popover

Transform the Eye popover from a metadata card into a compact intelligence dashboard that surfaces the output of every connected service in one glance. No new pages, no new tabs -- just enrich what already exists.

## What Each Service Shows (Mapped to UI)

| Service | Data Point | Display Format |
|---------|-----------|----------------|
| GitHub API | Health status + commit velocity | Status badge (ACTIVE/STALE/DECAYING) + velocity bar |
| Crates.io | Dependency health score + outdated count | Score pill + "3 outdated, 1 critical" text |
| Solana RPC | Governance tx count (30d) | "12 tx (30d)" or "No governance" |
| DeFiLlama | TVL in USD | "$4.2M TVL" or hidden if zero |
| OSV.dev | Vulnerability count | "0 CVEs" (green) or "3 CVEs" (red) |
| OpenSSF | Scorecard rating | "7.2/10" with color coding |
| Bytecode | Originality status | "Original" / "Fork" / "Not On-Chain" badge |

## Technical Changes

### 1. Expand `ExplorerProject` type (`src/hooks/useExplorerProjects.ts`)

Add fields already available in the `claimed_profiles` table but not currently fetched:

- `vulnerability_count` (number)
- `openssf_score` (number or null)
- `bytecode_match_status` (string or null)
- `github_commit_velocity` (number)
- `github_commits_30d` (number)
- `liveness_status` (already present)

These columns already exist in the database -- no schema changes needed. Just expand the SELECT and mapping.

### 2. Redesign Eye Popover (`src/components/explorer/LeaderboardRow.tsx`)

Replace the current simple list with a structured intelligence card containing 3 sections:

**Section A: Identity** (keep existing)
- GitHub status, website, X handle

**Section B: Intelligence Grid** (new -- the core addition)
- A compact 2x3 grid of service-sourced metrics:
  - GitHub velocity (commits/day bar)
  - Dependency health (score + outdated count)
  - Governance (tx count badge)
  - TVL (formatted USD, hidden if zero)
  - Vulnerabilities (CVE count with severity color)
  - OpenSSF (score out of 10)

**Section C: Trust Signals** (new)
- Bytecode originality badge
- Continuity decay percentage
- "Last analyzed" timestamp

**Section D: Actions** (keep existing)
- View Dependency Tree link

### 3. Create `IntelligenceGrid` component (`src/components/explorer/IntelligenceGrid.tsx`)

A new reusable component that renders the 2x3 metrics grid. This keeps the LeaderboardRow clean and allows reuse in MobileProgramCard.

Props:
- `dependencyScore`, `outdatedCount`
- `governanceTx30d`
- `tvlUsd`
- `vulnerabilityCount`
- `openssfScore`
- `commitVelocity`
- `bytecodeStatus`
- `decayPercentage`

Each metric cell: icon + label + value, color-coded by health thresholds. Null/zero values show gracefully as "N/A" or are hidden (TVL hidden when zero, governance shows "None detected").

### 4. Update `MobileProgramCard` (`src/components/explorer/MobileProgramCard.tsx`)

Add the same `IntelligenceGrid` to the mobile card's expandable section so mobile users get the same intelligence density.

### 5. Data Freshness Footer

Add a single "Last synced: 5m ago" line at the bottom of the popover using the `github_analyzed_at` timestamp (already fetched). This establishes data provenance -- critical for trust.

## Edge Cases Handled

- **No vulnerability data**: Show "Not scanned" in muted text instead of "0 CVEs" (prevents false negatives)
- **No OpenSSF data**: Show "Not indexed" -- some repos aren't in the OpenSSF database
- **No governance address**: Show "No governance" with muted styling, not an error
- **TVL is zero**: Hide the TVL row entirely (most projects aren't DeFi)
- **Private/unclaimed repos**: Show lock icons for intelligence metrics (current pattern preserved)
- **Bytecode not deployed**: Show "Off-chain" badge (already handled in current code)

## What This Does NOT Change

- No new database queries -- all data already fetched by `useExplorerProjects` (just needs 4-5 more columns selected)
- No new edge functions or API calls
- No changes to the Development tab or Program Detail page
- No changes to scoring logic
- No breaking changes to existing LeaderboardRow columns

## Performance Consideration

The `claimed_profiles` SELECT already fetches `*` (all columns). The hook transforms a subset into `ExplorerProject`. We're simply mapping additional already-fetched columns. Zero additional database load.

## User Story Flow

1. User opens Explorer, sees leaderboard
2. Clicks Eye icon on any project row
3. Popover shows: identity info at top, then a compact intelligence grid with all 7 service outputs, then trust signals, then action links
4. User instantly knows: "This project has a 72 dependency health, 0 CVEs, 12 governance transactions, 7.2 OpenSSF score, and 2% decay"
5. Decision made in 3 seconds without leaving the Explorer

## Files Modified

1. `src/hooks/useExplorerProjects.ts` -- Add 4-5 fields to ExplorerProject interface and mapping
2. `src/components/explorer/IntelligenceGrid.tsx` -- New component (compact metrics grid)
3. `src/components/explorer/LeaderboardRow.tsx` -- Redesign Eye popover content
4. `src/components/explorer/MobileProgramCard.tsx` -- Add IntelligenceGrid to mobile view
5. `src/components/explorer/index.ts` -- Export new component

