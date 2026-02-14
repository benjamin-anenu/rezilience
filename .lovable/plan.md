

# Pre-Production Audit: Onboarding, Claim, and Verification Flows

---

## 1. CRITICAL BUG: Redirect URL Mismatch (BLOCKS SHIP)

**Severity: SHIP-BLOCKER**

The `DevelopmentTab.tsx` "Verify GitHub" button redirects to `/github/callback` (line 70), but the route is registered as `/github-callback` (App.tsx line 64). The claim flow uses the correct `/github-callback` (ClaimProfile.tsx line 327).

**Result:** Clicking "Verify GitHub" from the profile page will land on a 404 page. The user's localStorage will be polluted with `verifyGithubProfileId` and `claimingProfile`, which will never get cleaned up until the user manually clears storage or signs out.

**Fix:** Change DevelopmentTab.tsx line 70 from `/github/callback` to `/github-callback`.

---

## 2. GitHub Re-Verification: Edge Function Does Not Handle Partial Data

**Severity: HIGH**

When "Verify GitHub" is triggered from the profile page, `claimingProfile` is set to a minimal object:

```
{ profile_id: profileId, github_url: githubUrl }
```

But the `github-oauth-callback` edge function expects `profile_data` with fields like `xUserId`, `xUsername`, `projectName`, `category`, etc. When it receives this minimal payload:

- `xUserId` is undefined, so the duplicate check (line 329-342) is skipped entirely
- `projectName` falls back to `githubUser.name || githubUser.login` -- overwriting the real project name
- A **new UUID is generated** (line 345: `crypto.randomUUID()`) because `profile_data.id` is not set and `xUserId` lookup fails
- The upsert on line 381 creates a **brand new profile** instead of updating the existing one
- The original profile's `github_username` remains null -- the verification effectively does nothing

**Impact:** The owner clicks "Verify GitHub," goes through the whole OAuth flow, and ends up with a duplicate orphaned profile. Their original profile remains unverified.

**Fix:** Either:
- (A) Pass the full profile data in `claimingProfile` when triggering from the profile page, including `xUserId`, `profile_id` as `id`, etc.
- (B) Create a dedicated lightweight edge function for re-verification that only updates `github_username` on an existing profile given a profile ID + GitHub code, rather than reusing the full claim-time function.

Option B is strongly recommended -- reusing the claim function for a fundamentally different operation is the root cause of this fragility.

---

## 3. Bytecode Re-Verification: Authority Proof is Collected but Discarded

**Severity: MEDIUM-HIGH**

In `DevelopmentTab.tsx`, `handleBytecodeVerificationComplete` receives the wallet signature and authority data from `AuthorityVerificationModal`, but then calls `verifyBytecode(programId, profileId, githubUrl)` which **does not pass any of the authority proof**. The `verify-bytecode` edge function performs an independent hash check against OtterSec -- it does not validate authority ownership at all.

This means:
- The authority verification modal collects a wallet signature (user experience implies cryptographic proof)
- The signature is immediately thrown away
- `verify-bytecode` runs a purely automated bytecode hash comparison
- The user's wallet connection was theatrics with no functional purpose in this context

**Question to resolve:** Is the intent that bytecode verification requires authority proof (the signature should be sent to the backend), or is the modal only gating who can *trigger* verification (and the signature is just an access check)? If the latter, the UX is misleading. If the former, the implementation is broken.

---

## 4. CSRF State Validation is Weak

**Severity: MEDIUM**

In `GitHubCallback.tsx` (line 49):
```
if (state && storedState && state !== storedState) {
```

This passes if either `state` or `storedState` is null/undefined. An attacker who strips the `state` parameter from the callback URL bypasses CSRF protection entirely. The check should fail-closed:

```
if (!state || !storedState || state !== storedState) {
  throw new Error('Invalid state parameter');
}
```

---

## 5. localStorage as Auth State: Spoofable Identity

**Severity: MEDIUM (architectural, not new)**

The entire auth system relies on `localStorage.x_user` for identity. Any user can open DevTools, set `x_user` to `{"id": "victim_id", "username": "victim"}`, and the system treats them as that user. The `isOwner` check (ProfileDetail.tsx line 44) compares `user.id` from localStorage against `profile.xUserId` from the database.

This means **anyone can see the owner view of any profile** and trigger verification actions. The only protection is that edge functions use service role keys and don't validate the caller's identity.

This is a known architectural constraint (custom X OAuth without Supabase Auth sessions), but the new verification buttons make it more dangerous because they can now trigger state changes (GitHub OAuth, bytecode verification) from a spoofed identity.

---

## 6. Duplicate Profile Creation Vectors

**Severity: MEDIUM**

Two code paths create profiles:
1. `claim-profile` edge function (used by direct submit / public repo path)
2. `github-oauth-callback` edge function (used by OAuth path)

Both have duplicate-prevention logic but with different strategies:
- `claim-profile` checks `x_user_id` + `claim_status = 'claimed'`
- `github-oauth-callback` checks `x_user_id` via `.maybeSingle()`

Race condition: If a user opens two tabs and submits through different paths simultaneously, both can pass the duplicate check before either insert completes.

Additionally, the re-verification flow (Issue #2) can create entirely new profiles, further compounding the duplication risk.

---

## 7. localStorage Cleanup on Error Paths

**Severity: LOW-MEDIUM**

When the "Verify GitHub" flow fails at the OAuth provider level (user denies access, GitHub is down), the `GitHubCallback` error handler clears `verifyGithubProfileId` and `claimingProfile` (lines 122-124). Good.

However, if the user navigates away from the GitHub auth page (closes tab, uses browser back), the localStorage values persist indefinitely. The next time they use the normal claim flow, `verifyGithubProfileId` is still set, and `GitHubCallback` will try to redirect to a profile page instead of completing the claim. This creates a silent, confusing failure for the claim flow.

**Fix:** Clear `verifyGithubProfileId` at the start of the claim flow and at the start of any new GitHub OAuth initiation from `ClaimProfile.tsx`.

---

## 8. Off-Chain Projects: `hasProgramId` Logic

**Severity: LOW**

`DevelopmentTab.tsx` line 33:
```
const hasProgramId = !!(programId && programId !== profileId);
```

This works for registry UUIDs but would fail if someone entered a program ID that happened to collide with their profile UUID. While astronomically unlikely, the semantic intent would be clearer as a dedicated `is_on_chain` boolean column in the database rather than an inferred comparison.

---

## 9. UX: Verification Buttons on Public Program View (Missing)

**Severity: MEDIUM (experiential)**

The `ProgramDetail.tsx` (public view, `/program/:id`) uses `DevelopmentTabContent` which has a bytecode refresh button but no GitHub verification button and no authority modal. The `ProfileDetail.tsx` (owner view, `/profile/:id`) uses `DevelopmentTab` which has both buttons.

If an owner navigates to their project via the Explorer (which links to `/program/:id`), they see the public view with no verification actions. They must know to go to "My Registry" -> Dashboard -> Profile to find the buttons. There is no signpost or redirect.

---

## 10. Spaghetti Touchpoint Map

The same conceptual operation ("verify GitHub originality") has **4 different code paths**:

| Path | File | Trigger |
|------|------|---------|
| Claim (OAuth) | ClaimProfile.tsx -> GitHubCallback -> github-oauth-callback | Initial registration with private repo |
| Claim (Direct) | ClaimProfile.tsx -> handleDirectSubmit -> claim-profile | Initial registration with public repo |
| Re-verify (Profile) | DevelopmentTab.tsx -> GitHubCallback -> github-oauth-callback | Post-claim verification from profile page |
| Display only | DevelopmentTabContent.tsx, MetricCards.tsx | Public view display |

Each has subtly different data contracts, redirect behaviors, and cleanup logic. The github-oauth-callback function serves both "create new profile" and "update existing profile" but only the first use case was designed for.

---

## Readiness Verdict: NOT READY

The redirect URL mismatch (#1) and the edge function data contract mismatch (#2) mean the "Verify GitHub" feature **does not work at all** in its current state. Users will hit a 404 or silently create duplicate profiles.

### Mandatory Fixes (before release)

1. **Fix redirect URL**: `/github/callback` -> `/github-callback` in DevelopmentTab.tsx
2. **Fix re-verification data contract**: Either pass full profile data or create a dedicated re-verification edge function that updates `github_username` on an existing profile by ID
3. **Fix CSRF validation**: Fail-closed when state is missing
4. **Clear `verifyGithubProfileId`** at the start of claim flow to prevent cross-contamination

### Strategic Improvements (soon)

5. Create a dedicated `verify-github-ownership` edge function instead of reusing the claim function
6. Decide whether bytecode authority proof should be validated server-side or is just a client-side gate
7. Add `verifyGithubProfileId` cleanup on sign-out (already partially done) and on any new claim flow start

### Optional Polish (later)

8. Add a redirect or banner on `/program/:id` for owners to find their management view
9. Consider a dedicated `is_on_chain` database column instead of inferring from programId comparison
10. Add idempotency keys to prevent race-condition duplicate profiles

