

# Fix Row Click Navigation to Match Heatmap Behavior

## Problem
The leaderboard row click navigates using `program_id` (on-chain address like `worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth`) when available, but this results in a "does not exist" error for some projects. The heatmap works correctly because it always uses `project.id` (the database UUID).

## Fix

**File: `src/components/explorer/LeaderboardRow.tsx`**

Simplify `handleRowClick` to always navigate using `project.id` (the database UUID), matching the heatmap pattern:

```typescript
// Before (broken):
const routeId = project.program_id && project.program_id !== project.id 
  ? project.program_id 
  : project.id;
navigate(`/program/${routeId}`);

// After (matches heatmap):
navigate(`/program/${project.id}`);
```

This is a one-line change that aligns the table row navigation with the working heatmap navigation.
