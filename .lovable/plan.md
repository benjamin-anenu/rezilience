

# Pre-Production Audit: Recent Changes

## 1. Intent vs Implementation Reconciliation

**Original user goals:**
- Fix slow refresh (110+ seconds hanging)
- Enable About tab editing (website, media) for profile owners
- Fix STALE status for active solo builders

**What was implemented:**
- Dependency analysis batched to 5-concurrent with 40-dep cap and reduced delays
- 60-second frontend timeout per dimension with partial-success toasts
- `SettingsTab` and `MediaTab` added to owner's About tab
- `hasMinContributors` threshold lowered from 3 to 1
- Username fallback added to `isOwner` check

**Scope assessment:** Implementation matches intent. No scope creep. However, several hidden failure modes and design weaknesses exist.

---

## 2. Critical Findings (Must Fix Before Production)

### CRITICAL: Owner Detection is a Security Vulnerability

The `isOwner` check on line 45-48 of `ProfileDetail.tsx`:

```tsx
const isOwner = user && profile && (
  (user.id && profile.xUserId && user.id === profile.xUserId) ||
  (user.username && profile.xUsername && 
   user.username.toLowerCase() === profile.xUsername.toLowerCase())
);
```

**The username fallback is exploitable.** X/Twitter usernames can be changed. If User A claims a profile as `@alice`, then changes their X handle to `@bob`, and User B takes the handle `@alice`, User B now sees the owner view for User A's profile.

However, the actual damage is limited because the `update-profile` edge function (line 114) validates ownership using `x_user_id`, not username:

```ts
if (profile.x_user_id !== x_user_id) { return 403; }
```

So the frontend would show edit controls, but saves would fail with 403. This creates a **confusing UX** (user sees edit forms, clicks save, gets error) but is not a data integrity breach.

**Verdict:** The username fallback is an "illusion of correctness" -- it shows the owner view to the wrong person. The backend correctly rejects writes, but the frontend experience is misleading.

**Recommendation:** Remove the username fallback entirely. If `user.id !== profile.xUserId`, the user is not the owner. If legitimate owners can't see their edit controls, the root cause is a data mismatch during claim that should be debugged directly, not papered over with a weaker check.

### CRITICAL: SettingsTab Rendered Twice in Owner View

`SettingsTab` appears in both the `about` tab (line 289) AND the `support` tab (line 343). This means:
- Duplicate save buttons for the same data
- Potential race conditions if user edits in both tabs simultaneously
- Confusing UX -- user may change website URL in About, navigate to Support, see the old value (stale local state), save, and overwrite their About changes

**Recommendation:** Remove `SettingsTab` from the `support` tab. It belongs exclusively in `about`.

---

## 3. High-Risk Issues (Fix Soon)

### Memory Leak in Refresh Timeout

The `withTimeout` function (line 59-63) creates a `setTimeout` that is never cleared:

```tsx
new Promise<T>((_, reject) => setTimeout(() => reject(...), 60000))
```

If the actual promise resolves in 5 seconds, the setTimeout still fires 55 seconds later. Since `Promise.race` already resolved, the rejection is swallowed -- but the timer reference persists. With `Promise.allSettled`, this happens for every dimension. If the user clicks refresh multiple times, dangling timers accumulate.

**Impact:** Low in practice (timers are lightweight), but it's a code smell.

**Fix:** Use `AbortController` or clear timeouts on resolution.

### No Idempotency Guard on Refresh

There is no debounce or guard preventing the user from clicking refresh while a refresh is already in progress. The `isRefreshing` state is set, but the button's disabled state depends on `HeroBanner` honoring `isRefreshing` -- which we haven't verified. If the button is clickable during refresh, the user can trigger 4+ concurrent edge function invocations for the same profile, all writing to the same database row.

**Impact:** Wasted API calls, potential GitHub rate limiting, and last-write-wins race on the database row.

### Dependency Analysis: Download Count Fetched Inside Batch (Double Network Call)

In `analyzeNpmDependencies` (line 960-987), each batch item fetches BOTH the version AND the download count sequentially inside the same async callback:

```ts
const latestVersion = await getNpmLatestVersion(name);
const downloads = await getNpmDownloads(name);
```

This means each item in a "parallel batch of 5" still makes 2 serial requests. For 40 deps, that's 80 requests across 8 batches (instead of 40). The download count is used only for `reverseDeps` display -- it doesn't affect the health score.

**Recommendation:** Fetch download counts in a separate, fire-and-forget pass after the main analysis, or remove them entirely since they're a vanity metric that doubles execution time.

### Same Issue for PyPI (Line 870-877)

PyPI analysis has the same double-fetch pattern: `getPypiLatestVersion` then `getPypiDownloads` in series within each batch item.

---

## 4. Edge Cases and Failure Modes

| Scenario | Current Behavior | Risk |
|----------|-----------------|------|
| User changes X username after claiming | Username fallback grants owner view to new handle holder | Medium -- backend blocks writes but UX is broken |
| Profile has no `githubOrgUrl` | Refresh button shows toast "No GitHub URL configured" | Correct |
| Edge function returns HTTP 200 with `{ success: false }` | `supabase.functions.invoke` resolves as fulfilled, counted as success | **Silent failure** -- partial success toast says "4/4" when data wasn't actually updated |
| User clicks refresh, navigates away, comes back | `isRefreshing` resets to false (component unmounted and remounted), stale data may show until query cache expires | Low friction |
| `user!.id` assertion when `user` could theoretically be null | Inside `isOwner` guard so `user` is truthy, but TypeScript non-null assertion `user!.id` is fragile if guard changes | Low |
| Crates.io rate limit exceeded during batch | `getLatestCrateVersion` returns `null`, dependency skipped silently | Acceptable degradation |
| GitHub token rate limit hit | `analyze-github-repo` returns 403, refresh shows "GitHub timed out or failed" | Acceptable |

### Silent Failure: `supabase.functions.invoke` Success vs Data Error

`supabase.functions.invoke` returns `{ data, error }`. If the HTTP response is 200 but the body is `{ success: false, error: "..." }`, the invoke resolves successfully. The refresh handler counts it as "fulfilled" in `Promise.allSettled`. The user sees "Full refresh complete (4/4)" when a dimension actually failed.

**Recommendation:** Check the response data for `success: false` and throw to trigger the rejected path.

---

## 5. Frontend Experience Audit

| State | Current UX | Assessment |
|-------|-----------|------------|
| Refreshing | Banner shows "Refreshing all dimensions..." with spinner | Acceptable but no per-dimension progress |
| Partial success | Toast: "Refresh partially complete (3/4) -- GitHub timed out" | Good |
| Full success | Toast: "Full refresh complete" | Good |
| Owner detection fails | User sees visitor view with no explanation | **Confusing** -- user doesn't know why they can't edit |
| MediaTab URL validation | No URL validation on media asset URLs | User can add broken URLs; image `onError` hides it silently |
| SettingsTab save feedback | Button shows "Saved" after success | Good, but resets on re-render if user switches tabs |

### Missing: Owner Debug Signal

When a logged-in user views their own profile but `isOwner` is false, there is zero indication why. They see the visitor view and have no idea the system doesn't recognize them as the owner. A console.log or subtle debug badge would save significant debugging time.

---

## 6. Backend Integrity

### update-profile Edge Function is Correctly Secured

- Validates `x_user_id` matches `profile.x_user_id` in the database (line 114)
- Whitelist of editable fields prevents arbitrary column updates (line 62-72)
- Uses service role key for writes (bypasses RLS correctly)

### analyze-dependencies: Correct Batching

- 5-concurrent batches with 100ms (npm/pypi) and 200ms (crates) delays between batches
- 40-dep cap prevents runaway execution
- Critical deps prioritized

### Potential Issue: `storeDependencyGraph` Deletes Then Inserts

Line 1239-1265: The function first DELETEs all existing dependencies, then INSERTs new ones. If the insert fails partway through, the profile loses its dependency graph entirely with no rollback.

**Impact:** Low probability but data loss on failure.

---

## 7. Readiness Verdict: Conditionally Ready

### Mandatory Fixes (Before Production)

1. **Remove username fallback from `isOwner`** -- It's a security UX bug that shows edit controls to wrong users. If the real owner can't see their controls, debug the `x_user_id` data flow instead.
2. **Remove duplicate `SettingsTab` from support tab** -- Prevents race conditions and user confusion.
3. **Check edge function response `success` field** in refresh handler -- Prevent silent failures from being reported as successes.

### Strategic Improvements (Soon)

4. **Remove download count fetches from batch** (npm and pypi) -- Cuts network calls in half, doesn't affect health score.
5. **Add console.log for owner detection** -- Log `user.id`, `profile.xUserId`, and match result to aid debugging.
6. **Add URL validation to MediaTab** -- Validate URLs before saving.

### Optional Polish (Later)

7. Clear timeout timers in `withTimeout` to avoid dangling references.
8. Add per-dimension progress indicators during refresh.
9. Consider wrapping `storeDependencyGraph` in a transaction or at minimum log the partial failure state.

