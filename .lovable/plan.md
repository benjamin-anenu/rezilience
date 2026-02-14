

## GitHub Originality and Bytecode Originality: In-Page Verification Actions

### What Changes

**1. GitHub Originality -- "Verify GitHub" Button (In-Page OAuth)**
- When the owner views their profile and GitHub is unverified (`github_username` is null), a "Verify GitHub" button appears on the GitHub Originality card.
- Clicking it triggers the GitHub OAuth flow directly (same `buildGitHubOAuthUrl` used in the claim flow).
- Before redirect, the current profile ID is stored in localStorage so the callback knows where to return.
- The existing `GitHubCallback` page (`/github/callback`) will be updated to detect this "re-verification" scenario and redirect back to `/profile/:id` instead of `/claim-profile`.
- On success, `github_username` is written to the database, the card refreshes to show the full teal bar.
- **Blacklist integration**: The `github-oauth-callback` edge function already handles profile updates. If the callback fails (e.g., repo mismatch), the attempt is recorded. After 5 failures, the button is disabled and shows "Blocked" -- reusing the existing `useClaimBlacklist` hook with a new identifier (e.g., `github_verify_{profileId}`).

**2. Bytecode Originality -- "Verify On-Chain" Button (Wallet Modal)**
- When the owner views their profile and bytecode is unverified, a "Verify On-Chain" button appears on the Bytecode Originality card.
- Clicking it opens the existing `AuthorityVerificationModal` -- the same wallet connect, authority check, and SIWS signing flow used during initial claim.
- On success, the `verify-bytecode` edge function is called with the signed proof, writing `bytecode_match_status` and `bytecode_confidence` to the database.
- The card then refreshes to show the verification result (progress bar + confidence tier).
- **Blacklist integration**: The `AuthorityVerificationModal` already has blacklist checking built in (checks before authority verification, records failed attempts, blocks after 5 failures). This will work identically.
- If there is no `programId` on the profile (off-chain project), the card shows "N/A -- Off-chain project" with no button.

### Files to Change

| File | Change |
|------|--------|
| `src/components/profile/tabs/DevelopmentTab.tsx` | Add "Verify GitHub" and "Verify On-Chain" buttons to owner cards; accept `isOwner`, `profileId`, `programId` props; import `AuthorityVerificationModal`, `buildGitHubOAuthUrl`, `generateOAuthState`, `useBytecodeVerification`, `useClaimBlacklist` |
| `src/pages/ProfileDetail.tsx` | Pass `isOwner`, `profileId={profile.id}`, `programId={profile.programId}` to `DevelopmentTab` |
| `src/pages/GitHubCallback.tsx` | Detect `localStorage.verifyGithubProfileId` and redirect to `/profile/:id` instead of `/claim-profile` on success; pass profile ID to the edge function |
| `src/hooks/useBytecodeVerification.ts` | Update `unknown` default description to distinguish between "no program ID" and "has program ID but unverified" |

### Flow Details

**GitHub OAuth Flow (from profile page):**
```text
Owner clicks "Verify GitHub"
  -> Store profileId in localStorage ('verifyGithubProfileId')
  -> Store current profile data in localStorage ('claimingProfile')
  -> Redirect to GitHub OAuth URL
  -> GitHub redirects to /github/callback
  -> GitHubCallback detects 'verifyGithubProfileId'
  -> Calls github-oauth-callback edge function with profile data
  -> On success: redirects to /profile/:id (not /claim-profile)
  -> Profile reloads, github_username now set
  -> GitHub Originality card shows full bar
```

**Bytecode Verification Flow (from profile page):**
```text
Owner clicks "Verify On-Chain"
  -> AuthorityVerificationModal opens
  -> Connect wallet (Phantom/Solflare)
  -> Blacklist check (reuses existing hook)
  -> Verify wallet is program's upgrade authority (RPC call)
  -> Sign structured SIWS message (no on-chain transaction)
  -> On success: call verify-bytecode edge function
  -> Modal closes, profile refreshes
  -> Bytecode Originality card shows verification result
```

### Button Visibility Rules
- Buttons only appear when `isOwner === true` AND the metric is `isUnverified`
- Once verified, the button disappears and the progress bar replaces it
- Bytecode button is hidden if no `programId` exists (shows "N/A" instead)
- If blacklisted, the button shows as disabled with "Blocked" text
