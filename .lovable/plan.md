
# Comprehensive Onboarding Flow Audit

After a thorough review of the entire codebase, I've identified **11 critical issues** across the onboarding flow. These range from security vulnerabilities to UX problems that can cause confusion and frustration.

---

## Critical Issues Found

### 1. Dashboard Shows ALL Verified Profiles (CRITICAL BUG)

**Location:** `src/hooks/useClaimedProfiles.ts` (lines 182-201) + `src/pages/Dashboard.tsx`

**Problem:** The `useVerifiedProfiles()` hook fetches ALL verified profiles from the database without filtering by the current user's `x_user_id`. This means every authenticated user sees every registered protocol in their dashboard!

**Current Query:**
```typescript
.from('claimed_profiles')
.select('*')
.eq('verified', true)  // ← No user filter!
```

**Fix:** Create a new hook `useMyProfiles(xUserId)` that filters by the authenticated user's X ID:
```typescript
.from('claimed_profiles')
.eq('x_user_id', xUserId)
.eq('verified', true)
```

---

### 2. No "Already Registered" Detection on Return Visits

**Location:** `src/pages/ClaimProfile.tsx` + `src/pages/XCallback.tsx`

**Problem:** When an authenticated user who has already registered a protocol:
- Goes to `/claim-profile` → They see the full onboarding flow again
- Signs in via X → They're redirected to `/claim-profile`, not `/dashboard`

There's no check to see if the user already has a verified profile and redirect them appropriately.

**Fix:** On ClaimProfile mount and after X auth callback, query the database for existing profiles:
```typescript
// Check if user already has a profile
const { data: existingProfile } = await supabase
  .from('claimed_profiles')
  .select('id')
  .eq('x_user_id', user.id)
  .eq('verified', true)
  .maybeSingle();

if (existingProfile) {
  navigate('/dashboard'); // Or show "You already have a profile" message
}
```

---

### 3. Form Progress Not Cleared After Successful Registration

**Location:** `src/pages/ClaimProfile.tsx` + `src/pages/GitHubCallback.tsx`

**Problem:** `localStorage.removeItem('claimFormProgress')` is only called in one place - when clicking "VIEW MY PROFILE" button (line 589). If a user:
1. Completes registration
2. Navigates away before clicking that button
3. Returns to `/claim-profile`

They'll see old form data pre-filled, potentially causing confusion.

**Fix:** Clear form progress in GitHubCallback.tsx after successful profile creation:
```typescript
// After successful save in GitHubCallback
localStorage.removeItem('claimFormProgress');
localStorage.removeItem('claimingProfile');
```

---

### 4. Sign Out Doesn't Clear Form Progress

**Location:** `src/context/AuthContext.tsx` (lines 79-85)

**Problem:** When a user signs out, only X-related storage is cleared. Form progress remains:
```typescript
const signOut = () => {
  localStorage.removeItem('x_user');
  sessionStorage.removeItem('x_code_verifier');
  sessionStorage.removeItem('x_oauth_state');
  // ← Missing: claimFormProgress, verifiedProfileId
};
```

**Fix:** Add cleanup for all onboarding-related localStorage items.

---

### 5. GitHubCallback Redirect Loop Risk

**Location:** `src/pages/GitHubCallback.tsx` (lines 107-110)

**Problem:** After GitHub verification, the callback redirects to:
```typescript
navigate('/claim-profile?step=4&verified=true');
```

But the ClaimProfile page has logic that checks `isVerified` from URL params (line 31) and sets `githubVerified` state. If the user refreshes the page, the `?verified=true` param is still there but the `verifiedProfileId` may be missing from localStorage, causing inconsistent state.

**Fix:** Use a more robust approach - store verification status in the database and query it, rather than relying on URL params that persist across refreshes.

---

### 6. Missing Validation for Duplicate Registrations

**Location:** `supabase/functions/github-oauth-callback/index.ts`

**Problem:** There's no check to prevent the same X user from registering multiple profiles. The edge function uses `upsert` with `onConflict: "id"` (line 337-340), but the ID is randomly generated each time (`crypto.randomUUID()`), so upsert doesn't prevent duplicates.

A malicious or confused user could create multiple profiles.

**Fix:** Add unique constraint on `x_user_id` in the database OR check for existing profile before creating:
```typescript
// Check for existing profile by X user
const { data: existing } = await supabase
  .from('claimed_profiles')
  .select('id')
  .eq('x_user_id', profile_data?.xUserId)
  .maybeSingle();

if (existing) {
  // Update existing instead of creating new
}
```

---

### 7. Step Navigation Allows Skipping Required Steps

**Location:** `src/pages/ClaimProfile.tsx`

**Problem:** While there's validation for "can proceed from step" (`canProceedFromStep2`, `canProceedFromStep3`), users can manually navigate by:
1. Typing URL: `/claim-profile?step=5`
2. Manipulating localStorage `claimFormProgress.currentStep`

**Fix:** Add step validation that checks all previous steps are complete:
```typescript
const stepFromUrl = searchParams.get('step');
if (stepFromUrl) {
  const step = parseInt(stepFromUrl, 10);
  // Validate previous steps are complete
  if (step >= 3 && !canProceedFromStep2) return 2;
  if (step >= 4 && !canProceedFromStep3) return 3;
  // etc.
}
```

---

### 8. Orphaned localStorage Keys on Error

**Location:** `src/pages/GitHubCallback.tsx` (lines 93-98)

**Problem:** On successful verification, several localStorage keys are removed. But on error (lines 112-116), they're NOT removed. If a user experiences an error and tries again, old stale data could cause issues.

**Fix:** Clear temporary OAuth-related storage on both success and error paths.

---

### 9. Missing Loading State for Existing Profile Check

**Location:** `src/pages/Dashboard.tsx`

**Problem:** The Dashboard checks `isAuthenticated` before rendering but doesn't show any transition state. If a user is authenticated but has no profiles, the redirect logic (line 27-29) could cause a flash of content.

**Fix:** Add a more comprehensive loading state that waits for both auth AND profile fetch to complete.

---

### 10. Inconsistent Profile ID Storage

**Location:** Multiple files

**Problem:** There are multiple ways profile IDs are stored and retrieved:
- `localStorage.setItem('verifiedProfileId', data.profile?.id || '')`
- Form progress stores step but not profile ID
- GitHubCallback uses `profileFormData.id` if present

This creates confusion about which ID is "canonical."

**Fix:** Use a single, consistent storage key and location for the profile ID throughout the flow.

---

### 11. No Rate Limiting on Repository Analysis

**Location:** `supabase/functions/analyze-github-repo/index.ts`

**Problem:** The GitHub analysis endpoint can be called repeatedly without any rate limiting. A user could:
1. Spam the "ANALYZE" button
2. Exhaust GitHub API rate limits
3. Potentially cause abuse

**Fix:** Add client-side debouncing AND server-side rate limiting per IP/user.

---

## Priority Order for Fixes

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 P0 | #1 Dashboard shows all profiles | Security/Privacy | Medium |
| 🔴 P0 | #6 Duplicate registrations | Data integrity | Medium |
| 🟠 P1 | #2 No "already registered" check | UX confusion | Low |
| 🟠 P1 | #4 Sign out doesn't clear form | Data leakage | Low |
| 🟠 P1 | #3 Form not cleared after success | UX confusion | Low |
| 🟡 P2 | #5 GitHubCallback redirect loop | UX confusion | Medium |
| 🟡 P2 | #7 Step skipping possible | Flow integrity | Low |
| 🟡 P2 | #8 Orphaned localStorage on error | Data cleanup | Low |
| 🟢 P3 | #9 Missing loading state | Polish | Low |
| 🟢 P3 | #10 Inconsistent ID storage | Code quality | Medium |
| 🟢 P3 | #11 No rate limiting | Abuse prevention | Medium |

---

## Implementation Plan

### Phase 1: Critical Fixes (P0)

**File: `src/hooks/useClaimedProfiles.ts`**
- Create new hook `useMyVerifiedProfiles(xUserId: string)`
- Filter by `x_user_id` to only show user's own profiles

**File: `src/pages/Dashboard.tsx`**
- Use the new `useMyVerifiedProfiles` hook instead of `useVerifiedProfiles`
- Pass `user?.id` to the hook

**File: `supabase/functions/github-oauth-callback/index.ts`**
- Add check for existing profile by `x_user_id`
- If exists, update instead of create (or return error)

### Phase 2: UX Fixes (P1)

**File: `src/pages/ClaimProfile.tsx`**
- Add useEffect to check for existing verified profile on mount
- If found, show message + redirect option to Dashboard

**File: `src/pages/XCallback.tsx`**
- After successful auth, check if user has existing profile
- Redirect to Dashboard if yes, ClaimProfile if no

**File: `src/context/AuthContext.tsx`**
- Extend signOut to clear all onboarding localStorage keys

**File: `src/pages/GitHubCallback.tsx`**
- Move `localStorage.removeItem('claimFormProgress')` to success path

### Phase 3: Robustness (P2)

**File: `src/pages/ClaimProfile.tsx`**
- Add step validation to prevent skipping
- Handle `?verified=true` param more robustly

**File: `src/pages/GitHubCallback.tsx`**
- Clear temporary storage on error path as well

### Phase 4: Polish (P3)

**File: `src/pages/Dashboard.tsx`**
- Add comprehensive loading state

**Various Files:**
- Consolidate profile ID storage pattern

---

## Summary

The most critical issue is **#1 (Dashboard shows all profiles)** - this is a privacy violation where users can see other users' registered protocols. This should be fixed immediately.

The second critical issue is **#2 (no existing profile check)** - this is causing the specific problem you mentioned about returning to onboarding after registration.

Both of these can be fixed with relatively small code changes but have significant impact on the user experience and data privacy.
