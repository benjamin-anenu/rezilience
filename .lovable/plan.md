

# Registration Flow Fixes - Two Critical Issues

## Overview

Fix two bugs in the "Secure My Standing" registration flow:
1. **Public repos incorrectly require GitHub OAuth** - Users who analyze a public repository should NOT need to connect their GitHub account to complete registration
2. **X Auth doesn't auto-advance to Step 2** - After X authentication callback, users must manually refresh to proceed

---

## Issue 1: Public Repo Analysis Should Complete Without GitHub OAuth

### Current Behavior
- User enters public GitHub URL in Step 3
- `GitHubUrlAnalyzer` successfully fetches all metrics via `analyze-github-repo` edge function
- User proceeds to Step 4 (Media) and Step 5 (Roadmap)
- In Step 5, the "COMPLETE VERIFICATION" button still triggers `handleGitHubConnect()` which starts OAuth flow
- This is unnecessary - we already have all the data we need from the public analysis

### Root Cause
In `ClaimProfile.tsx` (lines 616-628), the final submit in Step 5 always calls `handleGitHubConnect()` regardless of whether public repo analysis was successful:

```tsx
// Current code - always requires GitHub OAuth
{!githubVerified && (
  <>
    <p className="mb-4 ...">Ready to verify?...</p>
    <Button onClick={handleGitHubConnect} ...>
      COMPLETE VERIFICATION
    </Button>
  </>
)}
```

### Solution
Add a new function `handleDirectSubmit()` that saves the profile directly to `claimed_profiles` using the data from `githubAnalysisResult`. In Step 5, show this option when public analysis is complete:

1. **Create `handleDirectSubmit` function** - Submits profile data directly to Supabase without OAuth
2. **Update Step 5 UI** - Show different button based on whether `githubAnalysisResult` exists:
   - If `githubAnalysisResult` exists → "COMPLETE REGISTRATION" (direct submit)
   - If no analysis → "CONNECT GITHUB & COMPLETE" (OAuth flow for private repos)

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ClaimProfile.tsx` | Add `handleDirectSubmit()` function; Update Step 5 conditional rendering |

### New Logic Flow

```text
Step 5 Final Action:
├── githubAnalysisResult exists? (public repo analyzed)
│   └── YES → Show "COMPLETE REGISTRATION" → handleDirectSubmit()
│             Saves profile directly to claimed_profiles table
│             Redirects to /profile/:id
└── NO → Show "CONNECT GITHUB & COMPLETE" → handleGitHubConnect()
         OAuth flow for private repos
         Callback saves profile + redirects
```

---

## Issue 2: X Authentication Doesn't Auto-Advance to Step 2

### Current Behavior
1. User clicks "SIGN IN WITH X" on Step 1
2. Redirected to X OAuth
3. X redirects back to `/x-callback`
4. `XCallback.tsx` successfully authenticates and stores user in localStorage
5. Navigates to `/claim-profile`
6. User sees Step 1 again instead of Step 2 - must refresh manually

### Root Cause
Race condition between navigation and auth state synchronization:

1. `XCallback.tsx` stores user in localStorage THEN navigates
2. `ClaimProfile.tsx` mounts and checks auth state
3. The `currentStep` initial calculation (lines 46-69) runs synchronously on mount
4. But `AuthContext`'s `useEffect` that reads localStorage hasn't triggered a state update yet
5. So `isAuthenticated` is still `false` when the step is calculated

The existing `useEffect` (lines 111-117) should fix this:
```tsx
useEffect(() => {
  if (isAuthenticated && currentStep === 1) {
    setCurrentStep(2);
  } else if (!isAuthenticated && currentStep > 1) {
    setCurrentStep(1);
  }
}, [isAuthenticated, currentStep]);
```

But the issue is that `ClaimProfile` may render BEFORE `AuthContext` has updated because localStorage reads in `AuthContext` happen in a `useEffect`.

### Solution
Add a query parameter to the navigation in `XCallback.tsx` that signals "fresh auth" and use it to force Step 2:

1. **Modify XCallback navigation** - Add `?auth=fresh` parameter
2. **Modify ClaimProfile step initialization** - Check for this parameter and force Step 2 if present
3. **Clear the parameter** - Remove from URL after processing to prevent issues on refresh

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/XCallback.tsx` | Change navigate to include `?auth=fresh` param |
| `src/pages/ClaimProfile.tsx` | Check for `auth=fresh` param in step initialization; Clear param after use |

### New Flow

```text
XCallback.tsx:
  After successful auth:
  └── navigate('/claim-profile?auth=fresh')

ClaimProfile.tsx (step initialization):
  const authFresh = searchParams.get('auth') === 'fresh';
  if (authFresh) {
    // Force step 2 regardless of current auth state (it will sync soon)
    return 2;
  }
  // ... existing logic

ClaimProfile.tsx (useEffect):
  // Clear the auth param to prevent issues on manual refresh
  if (authFresh && isAuthenticated) {
    setSearchParams({}, { replace: true });
  }
```

---

## Technical Implementation Details

### handleDirectSubmit Function

```tsx
const handleDirectSubmit = async () => {
  if (!githubAnalysisResult || !user) return;
  
  setIsSubmitting(true);
  
  try {
    const profileId = crypto.randomUUID();
    
    const profileData = {
      id: profileId,
      project_name: projectName,
      description: description || null,
      category: category || null,
      website_url: websiteUrl || null,
      program_id: programId || null,
      claimer_wallet: connected && publicKey ? publicKey.toBase58() : null,
      github_org_url: githubAnalysisResult.htmlUrl,
      x_user_id: user.id,
      x_username: user.username,
      discord_url: discordUrl || null,
      telegram_url: telegramUrl || null,
      media_assets: mediaAssets,
      milestones: milestones,
      verified: true,
      verified_at: new Date().toISOString(),
      resilience_score: githubAnalysisResult.resilienceScore,
      liveness_status: githubAnalysisResult.livenessStatus,
      github_stars: githubAnalysisResult.stars,
      github_forks: githubAnalysisResult.forks,
      github_contributors: githubAnalysisResult.contributors,
      // ... other GitHub fields from analysis
    };
    
    const { error } = await supabase
      .from('claimed_profiles')
      .upsert(profileData, { onConflict: 'id' });
    
    if (error) throw error;
    
    localStorage.removeItem('claimFormProgress');
    localStorage.setItem('verifiedProfileId', profileId);
    
    toast({ title: 'Profile Created!', description: 'Your protocol is now registered.' });
    navigate(`/profile/${profileId}`);
    
  } catch (err) {
    toast({ title: 'Error', description: err.message, variant: 'destructive' });
  } finally {
    setIsSubmitting(false);
  }
};
```

### Updated Step 5 UI

```tsx
{/* In Step 5 Final Submit */}
{githubAnalysisResult ? (
  // Public repo was analyzed - submit directly
  <>
    <div className="mb-4 flex items-center justify-center gap-2 text-primary">
      <CheckCircle className="h-5 w-5" />
      <span className="font-display text-sm uppercase">
        Repository Analyzed • Score: {githubAnalysisResult.resilienceScore}
      </span>
    </div>
    <p className="mb-4 text-center text-sm text-muted-foreground">
      Your public repository has been verified. Click below to complete your registration.
    </p>
    <Button
      onClick={handleDirectSubmit}
      disabled={isSubmitting}
      className="w-full font-display font-semibold uppercase tracking-wider"
      size="lg"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          REGISTERING...
        </>
      ) : (
        'COMPLETE REGISTRATION'
      )}
    </Button>
  </>
) : githubVerified ? (
  // GitHub OAuth was used
  // ... existing verified UI
) : (
  // No analysis yet - require GitHub OAuth (for private repos)
  <>
    <p className="mb-4 text-center text-sm text-muted-foreground">
      Connect your GitHub to verify a private repository and complete registration.
    </p>
    <Button onClick={handleGitHubConnect} ...>
      CONNECT GITHUB & COMPLETE
    </Button>
  </>
)}
```

---

## Summary of Changes

| Issue | File | Change |
|-------|------|--------|
| Public repo bypass | `ClaimProfile.tsx` | Add `handleDirectSubmit()` function |
| Public repo bypass | `ClaimProfile.tsx` | Add `isSubmitting` state |
| Public repo bypass | `ClaimProfile.tsx` | Update Step 5 UI with conditional rendering |
| X auth auto-advance | `XCallback.tsx` | Add `?auth=fresh` to navigate URL |
| X auth auto-advance | `ClaimProfile.tsx` | Check for `auth=fresh` in step init |
| X auth auto-advance | `ClaimProfile.tsx` | Clear `auth` param after processing |

---

## Preserved Functionality

All existing functionality remains intact:
- GitHub OAuth flow still works for private repos
- Form data persistence in localStorage
- Existing profile redirect check
- Wallet connection (optional)
- Program ID verification (optional)
- Media upload and roadmap steps
- All validation logic

