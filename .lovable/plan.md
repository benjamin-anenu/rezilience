

# Adaptive Scoring Weights by Category

## The Problem

The current fixed-weight formula unfairly penalizes projects where certain dimensions are irrelevant:
- **Governance (20%)** defaults to 0 for any project without a multisig or DAO category -- that's ~80% of the registry
- **TVL (15%)** defaults to 50 for non-DeFi, which is less punishing but still arbitrary
- A perfect Infrastructure project can never score above ~72

## The Solution: Category-Aware Weight Redistribution

When a dimension doesn't apply to a project, redistribute its weight proportionally to the remaining dimensions instead of scoring it as 0 or a neutral value.

### Weight Table

```text
+---------------------+--------+------+------+-----+
| Category            | GitHub | Deps | Gov  | TVL |
+---------------------+--------+------+------+-----+
| DeFi + DAO/Multisig | 0.40   | 0.25 | 0.20 | 0.15|  (full formula)
| DeFi (no governance)| 0.50   | 0.30 | --   | 0.20|  (gov weight redistributed)
| DAO (no TVL)        | 0.50   | 0.30 | 0.20 | --  |  (tvl weight redistributed -- wait, DAO could have TVL)
| Everything else     | 0.60   | 0.40 | --   | --  |  (both redistributed)
+---------------------+--------+------+------+-----+
```

The logic:
- **Has governance address/DAO?** Include Gov dimension
- **Is DeFi?** Include TVL dimension
- If a dimension is excluded, its weight is redistributed proportionally to the remaining dimensions

### Example Outcomes

**Infrastructure project (e.g., Helius) with GitHub=85, Deps=70:**
- Current: (85x0.40 + 70x0.25 + 0x0.20 + 50x0.15) = 34 + 17.5 + 0 + 7.5 = **59**
- New: (85x0.60 + 70x0.40) = 51 + 28 = **79**

**DeFi project (e.g., Marinade) with GitHub=80, Deps=65, TVL=90:**
- Current: (80x0.40 + 65x0.25 + 0x0.20 + 90x0.15) = 32 + 16.25 + 0 + 13.5 = **61.75**
- New (no governance): (80x0.50 + 65x0.30 + 90x0.20) = 40 + 19.5 + 18 = **77.5**

## Technical Changes

### 1. Update `refresh-all-profiles/index.ts`

Replace the fixed weight block (around line 250-270) with adaptive weight logic:

```typescript
// Determine applicable dimensions
const hasGovernance = !!(profile.multisig_address) || profile.category === 'dao';
const hasTvl = profile.category === 'defi' || (profile.category || '').toLowerCase().includes('defi');

let weights: { github: number; dependencies: number; governance: number; tvl: number };

if (hasGovernance && hasTvl) {
  weights = { github: 0.40, dependencies: 0.25, governance: 0.20, tvl: 0.15 };
} else if (hasGovernance && !hasTvl) {
  weights = { github: 0.45, dependencies: 0.30, governance: 0.25, tvl: 0 };
} else if (!hasGovernance && hasTvl) {
  weights = { github: 0.50, dependencies: 0.30, governance: 0, tvl: 0.20 };
} else {
  weights = { github: 0.60, dependencies: 0.40, governance: 0, tvl: 0 };
}

const baseScore = Math.round(
  (githubScore * weights.github) +
  (depsScore * weights.dependencies) +
  (govScore * weights.governance) +
  (tvlScore * weights.tvl)
);
```

When a dimension has weight 0, its score is simply not factored in -- no penalty, no arbitrary neutral value.

### 2. Update `score_breakdown` JSONB

Store the actual weights used so the UI can show transparency:

```typescript
const scoreBreakdown = {
  github: Math.round(githubScore),
  dependencies: Math.round(depsScore),
  governance: hasGovernance ? Math.round(govScore) : null,
  tvl: hasTvl ? Math.round(tvlScore) : null,
  baseScore,
  continuityDecay: Math.round(continuityDecay * 100),
  finalScore,
  weights, // now dynamic per project
  applicableDimensions: [
    'github', 'dependencies',
    ...(hasGovernance ? ['governance'] : []),
    ...(hasTvl ? ['tvl'] : []),
  ],
};
```

### 3. Update the `ScoreBreakdownTooltip` component

Modify `src/components/program/ScoreBreakdownTooltip.tsx` to:
- Only show dimensions that are in `applicableDimensions`
- Display "N/A" or hide rows for inapplicable dimensions
- Show the actual weights used (e.g., "GitHub 60%" instead of always "40%")

### 4. Update the README methodology section

Update `src/components/readme/ScoringMethodology.tsx` to explain the adaptive weighting system so users understand why different project types have different weight distributions.

### 5. Category normalization (bonus)

The database currently has ~100+ different category strings (e.g., "DeFi/Privacy", "defi", "DeFi / DEX"). The DeFi check should use a case-insensitive substring match:

```typescript
const categoryLower = (profile.category || '').toLowerCase();
const hasTvl = categoryLower.includes('defi');
const hasGovernance = !!(profile.multisig_address) || 
  categoryLower === 'dao' || 
  categoryLower.includes('governance');
```

This ensures "DeFi/Lending", "DeFi / DEX", "DePIN/DeFi" etc. all get TVL analysis, and "Governance / Futarchy" gets governance analysis.

### Files to modify

1. `supabase/functions/refresh-all-profiles/index.ts` -- adaptive weights + updated score_breakdown
2. `src/components/program/ScoreBreakdownTooltip.tsx` -- conditional dimension display
3. `src/components/readme/ScoringMethodology.tsx` -- document the adaptive system

### Post-deployment

After deploying, trigger a full registry refresh to recalculate all scores with adaptive weights. Projects like Infrastructure tools should see significant score increases reflecting their actual maintenance quality.
