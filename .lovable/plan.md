

# Fix Row Click to Always Navigate to Program Detail Page

## Problem
Clicking a project row in the Explorer registry navigates to `/claim-profile` for unclaimed projects instead of the program detail page (`/program/:id`). The user expects all row clicks to open the project's detail page. The "Claim" button in the action column already handles the claim flow separately.

## Change

**File: `src/components/explorer/LeaderboardRow.tsx`** (lines 174-190)

Remove the unclaimed redirect logic from `handleRowClick`. Currently:
- If unclaimed --> navigates to `/claim-profile` (unwanted)
- If claimed --> navigates to `/program/:id`

After the fix, all row clicks will navigate to `/program/:id` regardless of claim status. The dedicated "Claim" button in the action column remains unchanged for users who want to claim a project.

## Technical Detail

In `handleRowClick`, remove the `if (project.claimStatus === 'unclaimed')` block (lines 177-184) so the function always falls through to the `/program/:routeId` navigation logic.

