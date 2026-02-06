

# Fix Bytecode Originality Display for Non-On-Chain Projects

## Problem Identified

You're absolutely right! The current display is inaccurate:

| Card | Current Display | Actual Data | Correct Display |
|------|----------------|-------------|-----------------|
| **Bytecode Originality** | "Verified Original" (100%) | No `program_id` - not on-chain | **"N/A"** or "Not Deployed" |
| **GitHub Originality** | "Original Repository" (100%) | `github_is_fork: false` | ✅ **Correct!** |

The GitHub API confirms `"fork": false` for this repository, so that card is accurate. However, the Bytecode Originality card shows "Verified Original" which is wrong because:
- `program_id` is `null` (no Solana program deployed)
- There's no bytecode to verify since the project isn't on-chain

---

## Root Cause

In `ProgramDetail.tsx` line 113:
```typescript
originalityStatus: project?.is_fork ? 'fork' : isVerified ? 'verified' : 'unverified'
```

This incorrectly derives bytecode status from `isVerified` (GitHub verification), not actual on-chain deployment status.

---

## Solution

### 1. Add "N/A" State for Bytecode Originality

Update `MetricCards.tsx` to handle a new `'not-deployed'` status:

| Status | Subtitle | Progress | Color |
|--------|----------|----------|-------|
| `verified` | "Verified Original" | 100% | Green |
| `fork` | "Known Fork" | 45% | Amber |
| `unverified` | "Unverified" | 60% | Muted |
| `not-deployed` | "Not On-Chain" | 0% | Muted/Gray |

### 2. Update ProgramDetail.tsx Logic

Determine bytecode status based on whether a valid Solana program ID exists:

```typescript
// Check if project has a valid on-chain program ID
const hasOnChainProgram = displayProgramId && 
  displayProgramId.length >= 32 && 
  displayProgramId !== id; // Not just the UUID

const getBytecodeStatus = () => {
  if (!hasOnChainProgram) return 'not-deployed';
  if (project?.is_fork) return 'fork';
  if (isVerified) return 'verified';
  return 'unverified';
};
```

### 3. Update Types

Add `'not-deployed'` to the `originalityStatus` union type in `Program` interface.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add `'not-deployed'` to `originalityStatus` type |
| `src/pages/ProgramDetail.tsx` | Add logic to detect if program is on-chain |
| `src/components/program/MetricCards.tsx` | Handle `'not-deployed'` state with N/A display |

---

## Visual Result

After the fix, the Metric Cards will show:

```text
┌─────────────────────┬─────────────────────┬──────────────────┬──────────────────┐
│ BYTECODE ORIGINALITY│ GITHUB ORIGINALITY  │ STAKED ASSURANCE │ ADMIN CONSTRAINTS│
├─────────────────────┼─────────────────────┼──────────────────┼──────────────────┤
│ Not On-Chain        │ Original Repository │ 0K SOL Staked    │ Multisig Required│
│ (gray/muted)        │ (green ✓)           │                  │                  │
├─────────────────────┼─────────────────────┼──────────────────┼──────────────────┤
│ ░░░░░░░░░░░░ 0%     │ ████████████ 100%   │ ░░░░░░░░░░░░ 0%  │ ████████░░░░ 85% │
└─────────────────────┴─────────────────────┴──────────────────┴──────────────────┘
```

---

## Implementation Details

### MetricCards Update

```typescript
const getBytecodeInfo = () => {
  switch (program.originalityStatus) {
    case 'verified':
      return { subtitle: 'Verified Original', value: 100, isPositive: true };
    case 'fork':
      return { subtitle: 'Known Fork', value: 45, isPositive: false, isWarning: true };
    case 'not-deployed':
      return { subtitle: 'Not On-Chain', value: 0, isPositive: false, isNA: true };
    default:
      return { subtitle: 'Unverified', value: 60, isPositive: false };
  }
};
```

### ProgramDetail Logic

```typescript
// Determine if this is an on-chain Solana program
const isValidSolanaProgramId = (id: string) => {
  // Solana addresses are base58 encoded, typically 32-44 characters
  // UUIDs have dashes and are exactly 36 characters
  return id && id.length >= 32 && !id.includes('-');
};

const hasOnChainProgram = isValidSolanaProgramId(displayProgramId);

const programForComponents = {
  // ...existing fields
  originalityStatus: hasOnChainProgram 
    ? (project?.is_fork ? 'fork' : isVerified ? 'verified' : 'unverified')
    : 'not-deployed',
};
```

This ensures Bytecode Originality accurately reflects whether the project has on-chain presence, while GitHub Originality correctly shows the repository fork status.

