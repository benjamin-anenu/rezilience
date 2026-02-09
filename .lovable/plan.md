
# Fix Plan: Eye Toggle Performance Issues

## Problem Summary

The Explorer page is hanging due to three compounding issues:
1. Missing React key on Fragment wrapper causing inefficient DOM reconciliation
2. Real-time subscription firing too frequently, causing constant re-renders
3. Each re-render rebuilds the entire table including expanded state

---

## Fix 1: Add Key to React Fragment

**File: `src/components/explorer/ProgramLeaderboard.tsx`**

Change the bare Fragment to a keyed Fragment:

```typescript
// Line 248-249: Change from
return (
  <>
    <TableRow key={project.id} ...>

// To
return (
  <React.Fragment key={project.id}>
    <TableRow ...>
```

And update the closing tag at line 432:
```typescript
// From
</>

// To
</React.Fragment>
```

Also add `React` to imports or use the short syntax with explicit key.

---

## Fix 2: Debounce Real-time Updates

**File: `src/hooks/useExplorerProjects.ts`**

The real-time subscription is triggering immediate query invalidation on every database change. With the cron jobs running frequently, this causes excessive re-renders.

Add debouncing to the real-time handler:

```typescript
import { useRef } from 'react';

// Inside useExplorerProjects:
const debounceRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  const channel = supabase
    .channel('explorer-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'claimed_profiles' },
      (payload) => {
        console.log('Explorer: Detected claimed_profiles change', payload.eventType);
        
        // Debounce: Only invalidate after 2 seconds of no changes
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['explorer-projects'] });
        }, 2000);
      }
    )
    .subscribe();

  return () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    supabase.removeChannel(channel);
  };
}, [queryClient]);
```

---

## Fix 3: Memoize Table Rows (Optional Enhancement)

**File: `src/components/explorer/ProgramLeaderboard.tsx`**

Wrap the row rendering in `React.memo` or `useMemo` to prevent unnecessary re-renders when other rows change:

```typescript
const MemoizedTableRow = React.memo(({ project, index, ... }) => {
  // Row content
});
```

This prevents all 50+ rows from re-rendering when only one row's expansion state changes.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/explorer/ProgramLeaderboard.tsx` | Add key to Fragment, fix row wrapper |
| `src/hooks/useExplorerProjects.ts` | Add 2-second debounce to realtime handler |

---

## Summary of Changes

1. **Fragment Key**: Fixes React reconciliation by properly keying the Fragment that wraps each row + expanded details
2. **Debounced Realtime**: Prevents cascade re-renders by waiting 2 seconds after the last database change before refreshing
3. The combination of these fixes will eliminate the UI freeze while maintaining real-time updates

---

## Technical Notes

- The Badge ref warning is cosmetic and doesn't cause the hang
- The real issue is the combination of: frequent DB updates + missing Fragment key + expanded rows requiring expensive DOM operations
- After these fixes, the eye toggle should work smoothly without system lag
