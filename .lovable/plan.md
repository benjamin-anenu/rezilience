

# Fix: Team Member Data Not Persisting

## Root Cause Analysis

After investigating the code and testing the edge function, I found that:

1. **The backend works correctly** - The `update-profile` edge function successfully saves team members when called with valid data
2. **The hook and mapping work correctly** - `useUpdateProfile` and `useClaimedProfiles` properly handle team data
3. **The issue is UX-related** - Users are likely adding team members but navigating away before clicking "Save Team & Pitch"

The current flow requires an explicit save action, but:
- The save button only appears at the bottom when changes exist
- No warning when leaving with unsaved changes
- Toast message "click Save to persist" is easy to miss

---

## Solution: Improve Save Visibility & Add Unsaved Changes Warning

### 1. Add Unsaved Changes Warning

Add a `beforeunload` event listener to warn users when navigating away with unsaved changes. Also add a React Router navigation blocker.

**File: `src/components/profile/tabs/TeamManagement.tsx`**

Add effect to warn before browser close/refresh:
```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasChanges]);
```

Add React Router blocker for in-app navigation:
```typescript
import { useBlocker } from 'react-router-dom';

// Inside component
const blocker = useBlocker(
  ({ currentLocation, nextLocation }) =>
    hasChanges && currentLocation.pathname !== nextLocation.pathname
);
```

Add confirmation dialog when blocker is triggered.

### 2. Make Save Button More Prominent

Move the save button to a fixed position at the bottom of the viewport when there are unsaved changes, with a more visible warning style.

**Changes:**
```typescript
{hasChanges && (
  <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
    <div className="container mx-auto max-w-5xl flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-amber-500">
        <AlertCircle className="h-4 w-4" />
        <span>You have unsaved changes</span>
      </div>
      <Button 
        onClick={handleSave} 
        disabled={isSaving}
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        {isSaving ? 'Saving...' : 'Save Team & Pitch'}
      </Button>
    </div>
  </div>
)}
```

### 3. Add Navigation Blocker Dialog

Create a confirmation dialog that appears when the user tries to navigate away with unsaved changes.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/profile/tabs/TeamManagement.tsx` | Add beforeunload handler, useBlocker, confirmation dialog, improve save button visibility |

---

## Implementation Details

### TeamManagement.tsx Changes

1. **Import additions:**
   - `useEffect` (already imported)
   - `useBlocker` from react-router-dom
   - `AlertCircle` from lucide-react
   - `AlertDialog` components for confirmation

2. **Add beforeunload effect** (lines ~60-70):
   ```typescript
   useEffect(() => {
     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
       if (hasChanges) {
         e.preventDefault();
         e.returnValue = '';
       }
     };
     
     window.addEventListener('beforeunload', handleBeforeUnload);
     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
   }, [hasChanges]);
   ```

3. **Add React Router blocker** (after the hasChanges calculation):
   ```typescript
   const blocker = useBlocker(
     ({ currentLocation, nextLocation }) =>
       hasChanges && currentLocation.pathname !== nextLocation.pathname
   );
   ```

4. **Add confirmation dialog** (before closing `</div>`):
   ```typescript
   <AlertDialog open={blocker.state === 'blocked'}>
     <AlertDialogContent>
       <AlertDialogHeader>
         <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
         <AlertDialogDescription>
           You have unsaved team changes. Are you sure you want to leave? Your changes will be lost.
         </AlertDialogDescription>
       </AlertDialogHeader>
       <AlertDialogFooter>
         <AlertDialogCancel onClick={() => blocker.reset?.()}>
           Stay on Page
         </AlertDialogCancel>
         <AlertDialogAction onClick={() => blocker.proceed?.()}>
           Leave Without Saving
         </AlertDialogAction>
       </AlertDialogFooter>
     </AlertDialogContent>
   </AlertDialog>
   ```

5. **Improve save button visibility** (replace existing save button section):
   - Make it fixed at bottom with warning icon
   - Add amber warning text "You have unsaved changes"

---

## Summary

| Change | Purpose |
|--------|---------|
| `beforeunload` event | Warn when closing/refreshing browser tab with unsaved changes |
| `useBlocker` hook | Intercept in-app navigation when unsaved changes exist |
| Confirmation dialog | Give users option to save or discard changes before leaving |
| Fixed save bar | Make save button impossible to miss with warning indicator |

This ensures users never accidentally lose their team member data by navigating away before saving.

