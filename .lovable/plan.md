

# Remove "Unclaimed" Status from Titan Watch

## What Changes

The "Unclaimed" health status will be removed from the heatmap. Unclaimed projects will now be classified by their actual score (Healthy/Evolving/Under Observation) just like claimed projects -- no special treatment. The "Locked" status remains for private repos with no GitHub data.

## Files to Update

### `src/components/explorer/EcosystemHeatmap.tsx`
- Remove `'unclaimed'` from the `HealthStatus` type (keeping `'healthy' | 'stale' | 'decaying' | 'locked'`)
- Update `getHealthStatus()`: remove the `if (project.claimStatus === 'unclaimed') return 'unclaimed'` check -- unclaimed projects now fall through to score-based classification (healthy/stale/decaying)
- Remove `getHealthColor()` case for `'unclaimed'`
- Remove `getStatusLabel()` case for `'unclaimed'`
- Remove the "Unclaimed" legend entry
- Remove the "Unclaimed" option from the status filter dropdown
- Remove `stats.unclaimed` count
- Remove the `'unclaimed'` rendering branch in the heatmap cell (the dash character)
- Remove the unclaimed badge variant in the tooltip

## What stays unchanged
- "Locked" status remains for private/inaccessible repos (`claimStatus === 'unclaimed' && !github_analyzed_at`)
- Healthy, Evolving, Under Observation -- all unchanged
- All colors, scoring logic, thresholds unchanged

