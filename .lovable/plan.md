
# Open Health Column for Private Repos

## Current Issue

Private repos (unclaimed with `github_analyzed_at = NULL`) show a Lock icon for the entire Health column, hiding valuable on-chain data:

```text
Current State:
| Project     | Score | Health | Trend |
|-------------|-------|--------|-------|
| BlazeStake  | 🔒    | 🔒     | 🔒    |  <-- Has $89M TVL!
```

## Why This Makes Sense

The Health column displays **3 dimensions**:

| Dimension | Data Source | Requires GitHub? |
|-----------|-------------|------------------|
| **D** (Dependencies) | Cargo.toml parsing | Yes |
| **G** (Governance) | Solana RPC (Squads/Realms) | No |
| **T** (TVL) | DeFiLlama API | No |

**2 of 3 health indicators are independent of GitHub access.**

Real data from the database shows private repos with significant on-chain health:
- **BlazeStake**: $89.8M TVL (healthy)
- **Solayer**: $16.9M TVL (healthy)
- **Dual Finance**: $436K TVL (warning)

---

## Implementation

### File to Modify

`src/components/explorer/LeaderboardRow.tsx`

### Change

Remove the private repo lock for the Health column:

```typescript
// Before (line ~278-285)
<TableCell className="hidden xl:table-cell">
  {isPrivate ? (
    <Lock className="h-4 w-4 text-muted-foreground mx-auto" />
  ) : (
    <DimensionHealthIndicators ... />
  )}
</TableCell>

// After - Always show health indicators
<TableCell className="hidden xl:table-cell">
  <DimensionHealthIndicators
    dependencyScore={project.dependency_health_score}
    governanceTx30d={project.governance_tx_30d}
    tvlUsd={project.tvl_usd}
  />
</TableCell>
```

---

## Result

```text
After Change:
| Project     | Score | Health  | Trend |
|-------------|-------|---------|-------|
| BlazeStake  | 🔒    | ⚫🟢🟢 | 🔒    |  <-- TVL visible!
```

- **D dot** will show gray (unknown) for private repos since `dependency_health_score` defaults to 50
- **G dot** will show real governance health if they have DAO/multisig activity
- **T dot** will show real TVL health from DeFiLlama

This gives visitors valuable on-chain intelligence even for unclaimed/private projects.
