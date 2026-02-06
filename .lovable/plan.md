

# Onboarding Flow Bug Fixes

## Summary
This plan addresses three issues in the claim profile onboarding flow:
1. X sign-in requiring two attempts before progressing to the Identity step
2. Wallet connection disrupting the active tab instead of opening externally  
3. General review of the entire onboarding flow for additional bugs

---

## Issue 1: X Sign-in Requires Two Attempts

### Root Cause Analysis
The issue stems from a race condition between the AuthContext's initial state and the ClaimProfile component's step logic:

1. When the user returns from X OAuth callback, the `XCallback.tsx` page stores the user in `localStorage` and redirects to `/claim-profile`
2. On `/claim-profile`, the `AuthContext` loads with `loading: true` initially
3. The `useEffect` in ClaimProfile (lines 59-63) checks `isAuthenticated && currentStep === 1` to advance the step
4. However, `currentStep` is initialized to `1` on every mount, regardless of authentication status

**The Bug:** When a user is already authenticated (returning from callback), the page still starts at step 1, then the `useEffect` fires and advances to step 2. But if the React render happens before the `useEffect` runs, the user momentarily sees the "Sign in with X" button.

### Fix
Initialize `currentStep` based on the current authentication state rather than always starting at 1:

**File:** `src/pages/ClaimProfile.tsx`

```typescript
// Current (line 32):
const [currentStep, setCurrentStep] = useState(1);

// Fixed:
const [currentStep, setCurrentStep] = useState(() => {
  // Check if user is already authenticated on mount
  const storedUser = localStorage.getItem('x_user');
  return storedUser ? 2 : 1;
});
```

Also update the `useEffect` to handle edge cases more robustly:

```typescript
// Current (lines 59-63):
useEffect(() => {
  if (isAuthenticated && currentStep === 1) {
    setCurrentStep(2);
  }
}, [isAuthenticated, currentStep]);

// Fixed - add early return if already on correct step:
useEffect(() => {
  if (isAuthenticated && currentStep === 1) {
    setCurrentStep(2);
  } else if (!isAuthenticated && currentStep > 1) {
    // Reset to step 1 if user logs out
    setCurrentStep(1);
  }
}, [isAuthenticated, currentStep]);
```

---

## Issue 2: Wallet Connection Disrupting Active Tab

### Root Cause Analysis
The `WalletMultiButton` from `@solana/wallet-adapter-react-ui` uses a modal dialog that can redirect the page when connecting to certain wallet providers (like Phantom browser extension).

When the wallet adapter connects, some wallets may:
- Trigger a deep link to their mobile app
- Navigate to the extension popup in a way that affects the current page state

### Fix Options

**Option A (Recommended): Add informational guidance**
Add a tooltip or note explaining that wallet connection may briefly redirect, but the form state will be preserved since React state persists:

```typescript
// Add below the WalletMultiButton
<p className="text-[10px] text-muted-foreground mt-2 text-center">
  Wallet popup may briefly redirect. Your form data is preserved.
</p>
```

**Option B: Defer wallet connection to a separate step**
Move wallet connection to an optional post-registration flow to avoid any disruption.

**Option C: Save form state to localStorage before wallet connection**
This ensures data is preserved even if the page reloads:

```typescript
// Before wallet connect, save form state
const saveFormProgress = () => {
  const formData = {
    projectName,
    description,
    category,
    websiteUrl,
    programId,
    // ... other fields
  };
  localStorage.setItem('claimFormProgress', JSON.stringify(formData));
};

// On mount, restore form state if exists
useEffect(() => {
  const saved = localStorage.getItem('claimFormProgress');
  if (saved) {
    const data = JSON.parse(saved);
    setProjectName(data.projectName || '');
    // ... restore other fields
  }
}, []);
```

---

## Issue 3: General Onboarding Flow Review

### Bug 1: StepIndicator ref warning
Console shows: "Function components cannot be given refs"

**File:** `src/components/claim/StepIndicator.tsx`

**Fix:** Wrap with `React.forwardRef`:

```typescript
import { forwardRef } from 'react';

export const StepIndicator = forwardRef<HTMLDivElement, StepIndicatorProps>(
  ({ steps, className }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-4', className)}>
        {/* ... existing content */}
      </div>
    );
  }
);

StepIndicator.displayName = 'StepIndicator';
```

### Bug 2: Step 5 shows "isComplete: false" always
The roadmap step never shows as complete in the step indicator.

**File:** `src/pages/ClaimProfile.tsx` (line 73)

```typescript
// Current:
{ number: 5, label: 'Roadmap', isComplete: false, isCurrent: currentStep === 5 },

// Fix - mark complete when on step 5 and form is ready:
{ number: 5, label: 'Roadmap', isComplete: currentStep === 5, isCurrent: currentStep === 5 },
```

### Bug 3: handleBack allows going to step 1
Users can click "Back" to step 2, but the condition allows going to step 1 where they'd just see the already-completed X auth.

**File:** `src/pages/ClaimProfile.tsx` (line 162-166)

```typescript
// Current:
const handleBack = () => {
  if (currentStep > 2) {
    setCurrentStep(currentStep - 1);
  }
};

// This is actually correct - keeping users at step 2 minimum. No change needed.
```

### Bug 4: Missing form validation feedback
When required fields are empty, the "Next" button is disabled but there's no visual indication of what's missing.

**Recommended Enhancement:** Add visual indicators for required fields:

```typescript
// In CoreIdentityForm, add error state styling:
<Input
  id="projectName"
  placeholder="My Awesome Protocol"
  value={projectName}
  onChange={(e) => setProjectName(e.target.value)}
  className={cn("font-mono", !projectName.trim() && "border-destructive/50")}
/>
```

### Bug 5: GitHub connect triggers before navigation
On Step 3, clicking "CONNECT GITHUB" immediately redirects without completing the step flow. This is expected behavior for OAuth, but the navigation says "NEXT: MEDIA" which is confusing.

**Recommended Enhancement:** Clarify the flow:
- Change "NEXT: MEDIA" button to be disabled until GitHub is connected
- Or add text explaining that GitHub connect will redirect and return them to the flow

---

## Technical Implementation Summary

| File | Changes |
|------|---------|
| `src/pages/ClaimProfile.tsx` | Initialize step from localStorage, add form state persistence, fix step 5 completion |
| `src/components/claim/StepIndicator.tsx` | Wrap with forwardRef to fix ref warning |

---

## Files Modified

1. **src/pages/ClaimProfile.tsx**
   - Initialize `currentStep` from localStorage to avoid flash
   - Add form state persistence to localStorage on changes
   - Restore form state on mount
   - Fix step 5 completion status
   - Add UX note about wallet connection

2. **src/components/claim/StepIndicator.tsx**
   - Add `forwardRef` wrapper to eliminate console warning

