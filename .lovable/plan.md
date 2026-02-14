

## Fix: GitHub Originality Should Require OAuth Verification

### Problem
The GitHub Originality card shows a full green bar ("Original Repository" at 100%) even when the project owner has NOT connected via GitHub OAuth. This happens because the public URL analysis (during claim) already sets `github_is_fork: false`, and the current logic only checks whether that value is defined -- not whether the owner actually proved GitHub ownership.

### Root Cause
- During the claim flow, submitting a public GitHub URL triggers `analyze-github-repo`, which writes `github_is_fork` to the database.
- The originality check (`githubIsFork === undefined`) passes because the field is `false`, not `undefined`.
- There is no check for GitHub OAuth status (`github_username` is only set after OAuth).

### Solution
Add a `githubOAuthVerified` flag (derived from whether `github_username` exists in the database) and pass it through to the originality metric. When OAuth has NOT been completed, GitHub Originality should show as "Awaiting Verification" in dark orange with no progress bar -- identical to the unverified bytecode state.

### Files to Update

| File | Change |
|------|--------|
| `src/hooks/useClaimedProfiles.ts` | Already maps `githubUsername` -- no change needed |
| `src/pages/ProgramDetail.tsx` | Pass `githubOAuthVerified={!!claimedProfile?.githubUsername}` to `DevelopmentTabContent` |
| `src/pages/ProfileDetail.tsx` | Pass `githubOAuthVerified={!!profile.githubUsername}` to `DevelopmentTabContent` |
| `src/components/program/tabs/DevelopmentTabContent.tsx` | Accept new `githubOAuthVerified` prop; update `getGithubOriginalityInfo()` to treat `!githubOAuthVerified` as unverified (dark orange, no bar) |
| `src/components/profile/tabs/DevelopmentTab.tsx` | Same logic: check `profile.githubUsername` to determine verified state |
| `src/components/program/MetricCards.tsx` | Accept `githubOAuthVerified` prop; apply same unverified logic |

### Logic Change (in `getGithubOriginalityInfo`)

```text
Before:
  if githubIsFork === undefined -> "Awaiting Analysis" (unverified)
  if githubIsFork === true      -> "Forked Repository" (warning)
  if githubIsFork === false     -> "Original Repository" (full bar)

After:
  if !githubOAuthVerified       -> "Awaiting Verification" (dark orange, no bar)
  if githubIsFork === true      -> "Forked Repository" (warning bar)
  if githubIsFork === false     -> "Original Repository" (full bar)
```

Only profiles where the owner has completed GitHub OAuth will show the green bar. All others get the dark orange "Pending" indicator.

