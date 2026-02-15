

# 1. Add Sign In Button to Mobile Drawer

In the mobile drawer's bottom actions section (Navigation.tsx lines 230-255), the unauthenticated state only shows "JOIN THE REGISTRY". A "SIGN IN" button needs to be added above it with black background and cyan border styling, matching the desktop version.

**File: `src/components/layout/Navigation.tsx`**

In the `!isAuthenticated` branch of the bottom actions (lines 242-254), add a Sign In button before the Join the Registry button:

```tsx
// Bottom Actions - unauthenticated state
<DrawerClose asChild>
  <Button
    variant="outline"
    onClick={signInWithX}
    className="w-full min-h-[48px] font-display font-semibold uppercase tracking-wider bg-background border-primary text-foreground hover:bg-primary/10 touch-feedback"
  >
    SIGN IN
  </Button>
</DrawerClose>
<DrawerClose asChild>
  <Button asChild className="w-full min-h-[48px] ...">
    <Link to="/claim-profile">JOIN THE REGISTRY</Link>
  </Button>
</DrawerClose>
```

---

# 2. Fix Team Tab Black Screen / Glitch on Owner's Profile

## Root Cause Analysis

The owner's Team tab renders `TeamManagement`, which uses `useBlocker()` from react-router-dom (line 234). Here's the problem chain:

1. **Tab switching uses `setSearchParams`** (in ProgramTabs.tsx line 31), which triggers a React Router navigation
2. **Radix TabsContent conditionally mounts/unmounts** content (no `forceMount`), so when you click the Team tab, `TeamManagement` mounts fresh
3. **`useBlocker` registers during an active navigation** -- the search-param change that triggered the tab switch is still in progress when the component mounts
4. **The blocker function captures stale/unstable state** because `hasChanges` is computed inline on every render using `JSON.stringify` comparisons, creating a new function reference each time
5. This causes `useBlocker` to re-subscribe on every render, which can trigger **re-render loops** -- manifesting as the black screen (AlertDialog overlay flashing) and glitching

The `AlertDialog open={blocker.state === 'blocked'}` renders a dark overlay across the full screen. If the blocker state rapidly toggles between 'blocked' and 'idle', you get a flashing black screen.

## Fix

**File: `src/components/profile/tabs/TeamManagement.tsx`**

Three changes:

**A. Memoize `hasChanges` with `useMemo`** to prevent recalculation on every render:
```tsx
const hasChanges = useMemo(() =>
  JSON.stringify(teamMembers) !== JSON.stringify(profile.teamMembers || []) ||
  stakingPitch !== (profile.stakingPitch || ''),
  [teamMembers, profile.teamMembers, stakingPitch, profile.stakingPitch]
);
```

**B. Wrap the blocker function in `useCallback`** so `useBlocker` gets a stable reference:
```tsx
const shouldBlock = useCallback(
  ({ currentLocation, nextLocation }) =>
    hasChanges && currentLocation.pathname !== nextLocation.pathname,
  [hasChanges]
);
const blocker = useBlocker(shouldBlock);
```

**C. Add a mount guard** -- defer blocker activation by one tick to avoid intercepting the tab-switch navigation that caused the mount:
```tsx
const [isMounted, setIsMounted] = useState(false);
useEffect(() => {
  const timer = setTimeout(() => setIsMounted(true), 100);
  return () => clearTimeout(timer);
}, []);

const shouldBlock = useCallback(
  ({ currentLocation, nextLocation }) =>
    isMounted && hasChanges && currentLocation.pathname !== nextLocation.pathname,
  [isMounted, hasChanges]
);
```

This prevents `useBlocker` from interfering with the search-param navigation that triggers when the Team tab is first opened.

## Summary of Changes
- **`src/components/layout/Navigation.tsx`** -- Add Sign In button to mobile drawer (unauthenticated state)
- **`src/components/profile/tabs/TeamManagement.tsx`** -- Fix `useBlocker` render loop causing black screen glitch (memoize, stabilize callback, add mount guard)
