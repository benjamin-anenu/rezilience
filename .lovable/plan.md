

# Separate Bytecode & GitHub Originality - Dual Track Implementation

## Problem Statement

The current `MetricCards` component conflates two distinct originality concepts:

| Concept | Source | What It Measures |
|---------|--------|------------------|
| **Bytecode Originality** | On-chain (Solana) | Cryptographic fingerprint of deployed program bytecode vs known database |
| **GitHub Originality** | Off-chain (GitHub) | Whether the source code repository is a fork of another project |

These provide different trust signals and should be tracked separately:
- A project could have **original bytecode** but be a **forked repo** (modified fork)
- A project could have **forked bytecode** but **original repo** (copied on-chain code)

---

## Current Data Available

| Field | Table | Description | Status |
|-------|-------|-------------|--------|
| `is_fork` | `projects` | GitHub fork status | Available |
| `github_is_fork` | `claimed_profiles` | GitHub fork status | Available (false in test data) |
| `originality_score` | `projects` | Bytecode originality (0-1) | Placeholder (always 1.0) |
| `originalityStatus` | Component prop | Derived from `is_fork` + `verified` | Currently mixed |

---

## Implementation Plan

### Phase 1: Update MetricCards to Show 4 Cards

Expand from 3 to 4 metric cards to properly separate concerns:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           METRIC CARDS (4 total)                            │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────┤
│  BYTECODE       │  GITHUB CODE    │   STAKED        │   ADMIN             │
│  ORIGINALITY    │  ORIGINALITY    │   ASSURANCE     │   CONSTRAINTS       │
│  (On-Chain)     │  (Off-Chain)    │                 │                     │
├─────────────────┼─────────────────┼─────────────────┼─────────────────────┤
│  Fingerprint    │  Original Repo  │  200K SOL       │  Multisig           │
│  Verified       │  OR Fork of X   │  Staked         │  Required           │
├─────────────────┼─────────────────┼─────────────────┼─────────────────────┤
│  ████████ 100%  │  ████████ 100%  │  ████████ 66%   │  ████████ 85%       │
├─────────────────┼─────────────────┼─────────────────┼─────────────────────┤
│  Cryptographic  │  Source code    │  Economic       │  Upgrade auth       │
│  comparison     │  provenance     │  security       │  controls           │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────┘
```

### Phase 2: Add GitHub Fork Info to Props

Update the `MetricCards` component to accept additional props:

```typescript
interface MetricCardsProps {
  program: Program;
  githubIsFork?: boolean;        // From claimed_profiles.github_is_fork
  githubForkParent?: string;     // Future: parent repo if forked
}
```

### Phase 3: Update ProgramDetail to Pass Fork Data

Modify `ProgramDetail.tsx` to pass the `github_is_fork` value from `claimedProfile.githubAnalytics` to `MetricCards`.

---

## Card Definitions

### 1. BYTECODE ORIGINALITY (On-Chain)

| Property | Value |
|----------|-------|
| Icon | `Fingerprint` |
| Title | BYTECODE ORIGINALITY |
| Subtitle | Based on `project.originalityStatus`: "Verified Original" / "Known Fork" / "Unverified" |
| Progress | 100% (verified), 45% (fork), 60% (unverified) |
| Description | "Cryptographic fingerprint comparison against known program database." |
| Color | Positive if verified |

### 2. GITHUB CODE ORIGINALITY (Off-Chain) - NEW

| Property | Value |
|----------|-------|
| Icon | `GitBranch` or `Code2` |
| Title | GITHUB ORIGINALITY |
| Subtitle | "Original Repository" (if not fork) / "Forked Repository" (if fork) |
| Progress | 100% (original), 30% (fork) |
| Description | "Source code provenance verification via GitHub metadata." |
| Color | Green if original, Amber/Orange if fork |

### 3. STAKED ASSURANCE (Unchanged)

Remains the same as current implementation.

### 4. ADMIN CONSTRAINTS (Unchanged)

Remains the same as current implementation.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/program/MetricCards.tsx` | Add GitHub Originality card, update props interface |
| `src/pages/ProgramDetail.tsx` | Pass `githubIsFork` prop from `claimedProfile.githubAnalytics` |
| `src/types/index.ts` | Update `Program` interface if needed |

---

## Technical Implementation

### MetricCards Enhancement

```typescript
interface MetricCardsProps {
  program: Program;
  githubIsFork?: boolean;
}

export function MetricCards({ program, githubIsFork }: MetricCardsProps) {
  const metrics = [
    // 1. Bytecode Originality (On-Chain)
    {
      icon: Fingerprint,
      title: 'BYTECODE ORIGINALITY',
      subtitle: program.originalityStatus === 'verified' ? 'Verified Original' : 
                program.originalityStatus === 'fork' ? 'Known Fork' : 'Unverified',
      value: program.originalityStatus === 'verified' ? 100 : 
             program.originalityStatus === 'fork' ? 45 : 60,
      description: 'Cryptographic fingerprint comparison against known program database.',
      isPositive: program.originalityStatus === 'verified',
    },
    // 2. GitHub Code Originality (Off-Chain) - NEW
    {
      icon: GitBranch, // or Code2
      title: 'GITHUB ORIGINALITY',
      subtitle: githubIsFork === undefined ? 'Not Analyzed' :
                githubIsFork ? 'Forked Repository' : 'Original Repository',
      value: githubIsFork === undefined ? 50 :
             githubIsFork ? 30 : 100,
      description: 'Source code provenance verification via GitHub metadata.',
      isPositive: githubIsFork === false,
      isWarning: githubIsFork === true,
    },
    // 3. Staked Assurance
    { ...existingStakedCard },
    // 4. Admin Constraints  
    { ...existingAdminCard },
  ];
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Render all 4 cards */}
    </div>
  );
}
```

### ProgramDetail Update

```typescript
<MetricCards 
  program={programForComponents} 
  githubIsFork={claimedProfile?.githubAnalytics?.github_is_fork}
/>
```

---

## Layout Considerations

With 4 cards instead of 3:
- **Desktop (lg+)**: 4 columns (`lg:grid-cols-4`)
- **Tablet (md)**: 2 columns (`md:grid-cols-2`)
- **Mobile**: 1 column (stacked)

This maintains visual balance and ensures all trust signals are visible at a glance.

---

## Future Enhancements

1. **Fork Parent Display**: If GitHub repo is a fork, show "Fork of [parent-repo]" with link
2. **Bytecode Verification**: Actual on-chain bytecode fingerprinting (Phase 2)
3. **Verification Badges**: Add checkmarks for each originality type that passes

