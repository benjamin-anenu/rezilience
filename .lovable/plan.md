
# Cleanup Plan: Remove Unnecessary localStorage and Mock Data

## Summary of Findings

After a thorough sweep of the codebase, I found the following issues that need cleaning:

---

## 1. Mock Data File to DELETE

### `src/data/mockData.ts`
- **Status**: NOT IMPORTED ANYWHERE - can be safely deleted
- Contains fake data for:
  - `mockVerifiedProfiles` (Raydium demo data)
  - `ecosystemStats` (fake stats)
  - `programs[]` (10 fake programs with fake scores)
  - `recentEvents[]` (fake upgrade events)
  - `upgradeChartData[]` (fake chart data)
  - `getProgramById()` and `searchPrograms()` helper functions

---

## 2. Mock Data in Page Components

### `src/pages/MyBonds.tsx` (Lines 18-53)
- **Issue**: Entire page uses hardcoded `mockBonds` array
- **Fix**: Convert to use real data from database or show empty state with "Coming in Phase 2" message

### `src/components/staking/StakingForm.tsx` (Line 39)
- **Issue**: `const walletBalance = 1250.45;` - hardcoded mock balance
- **Fix**: Either fetch real balance from wallet or show placeholder

---

## 3. Mock X (Twitter) OAuth Flow

### `src/pages/XCallback.tsx` (Lines 24-36)
- **Issue**: Creates fake user `mockXUser` with hardcoded data
- **Fix**: This is intentional Phase 0 behavior (X OAuth not implemented), but should add a clear comment or consider removing the mock delay

### `src/context/AuthContext.tsx` (Lines 31-35)
- **Issue**: `signInWithX()` redirects to `/x-callback?code=mock_x_auth_code`
- **Fix**: This is Phase 0 mock auth - either keep with clear comment or plan real X OAuth

---

## 4. Unnecessary localStorage Usage

### Necessary localStorage (KEEP):
| Location | Key | Purpose | Status |
|----------|-----|---------|--------|
| `AuthContext.tsx` | `x_user` | Session persistence for X auth | KEEP (until real auth) |
| `supabase/client.ts` | (internal) | Supabase session storage | KEEP (required) |
| `ClaimProfile.tsx` | `github_oauth_state` | CSRF protection | KEEP (security) |
| `ClaimProfile.tsx` | `claimingProfile` | OAuth redirect state | KEEP (needed for flow) |
| `GitHubCallback.tsx` | Various claim keys | OAuth redirect cleanup | KEEP (handles cleanup) |

### Unnecessary localStorage (REMOVE):

| Location | Key | Issue |
|----------|-----|-------|
| `Dashboard.tsx` (L22) | `verifiedPrograms` | Should fetch from DB instead |
| `ClaimProfile.tsx` (L68) | `claimingWalletAddress` | Not used after callback |
| `ClaimProfile.tsx` (L94) | `claimingProgramId` | Not used after callback |
| `ClaimProfile.tsx` (L96) | `claimingProgramDbId` | Not used after callback |
| `ClaimProfile.tsx` (L108-109) | `claimingXUserId`, `claimingXUsername` | Part of claimingProfile object |

---

## 5. Mock GitHub Data Function

### `src/lib/github.ts` (Lines 40-59)
- **Issue**: `fetchGitHubData()` returns fake data with hash-based random values
- **Status**: Function is NOT USED - real GitHub data comes from edge functions
- **Fix**: Either remove function or keep as fallback with clear "mock" comment

---

## Implementation Plan

### Phase 1: Delete Unused Files
1. Delete `src/data/mockData.ts` (not imported anywhere)

### Phase 2: Fix Dashboard to Use Database
1. Update `Dashboard.tsx` to use `useVerifiedProfiles()` hook instead of localStorage

### Phase 3: Clean Up MyBonds Page
1. Replace `mockBonds` with empty state + "Coming in Phase 2" message
2. OR fetch from `bonds` table if any real data exists

### Phase 4: Clean Up StakingForm
1. Replace hardcoded `walletBalance` with real wallet balance or "Connect wallet" message

### Phase 5: Remove Unused localStorage Writes
1. Remove `claimingWalletAddress` storage in ClaimProfile.tsx (not read anywhere)
2. Remove `claimingProgramId` storage (already in claimingProfile object)
3. Remove `claimingProgramDbId` storage (already in claimingProfile object)
4. Remove `claimingXUserId/claimingXUsername` storage (already in claimingProfile object)

### Phase 6: Add Comments to Intentional Mock Code
1. Add clear comments to X OAuth mock flow explaining Phase 0 status
2. Add comment to `fetchGitHubData()` explaining it's unused/fallback only

---

## Files Modified

| File | Action |
|------|--------|
| `src/data/mockData.ts` | DELETE entirely |
| `src/pages/Dashboard.tsx` | Replace localStorage with useVerifiedProfiles hook |
| `src/pages/MyBonds.tsx` | Replace mockBonds with Phase 2 placeholder |
| `src/components/staking/StakingForm.tsx` | Replace mock balance with real wallet query |
| `src/pages/ClaimProfile.tsx` | Remove redundant localStorage writes |
| `src/lib/github.ts` | Add comment that fetchGitHubData is unused |
| `src/context/AuthContext.tsx` | Add comment about Phase 0 mock X auth |
| `src/pages/XCallback.tsx` | Add comment about Phase 0 mock X auth |

---

## Technical Notes

- **ProfileDetail.tsx** and **ProgramDetail.tsx** are already clean - they use `useClaimedProfile()` hook to fetch from database
- **GitHubCallback.tsx** properly cleans up localStorage after OAuth completes
- The localStorage used for OAuth CSRF state and redirect data is necessary and should be kept
