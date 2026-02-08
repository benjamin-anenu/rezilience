
# Unclaimed Profiles System + Failed Claim Blacklist

## Overview

This plan implements two key features:
1. **Unclaimed Profiles**: Pre-seeded projects that appear in the registry with an "UNCLAIMED" badge, waiting to be claimed by their rightful owners
2. **Claim Attempt Blacklist**: A security mechanism that tracks failed claim attempts and blacklists wallets that repeatedly fail authority verification for specific projects

---

## Current State Analysis

The database already has the infrastructure for unclaimed profiles:
- `claim_status` column exists with values: `'claimed'`, `'unclaimed'`, `'pending'`
- `verified` boolean exists (should be `false` for unclaimed profiles)
- `x_user_id` is nullable (unclaimed profiles have no owner)

Currently, the Explorer only shows `verified = true` profiles. Unclaimed profiles need:
- `claim_status = 'unclaimed'`
- `verified = false` (no owner has claimed yet)
- Display in Explorer with special "UNCLAIMED" badge
- "CLAIM THIS PROJECT" CTA that leads to claim flow

---

## Technical Implementation

### Part 1: Unclaimed Profile Data Model

**Key Fields for Unclaimed Profiles**:
```text
claim_status = 'unclaimed'
verified = false
x_user_id = NULL (no owner)
claimer_wallet = NULL
authority_verified_at = NULL

-- Pre-populated data (from seed):
project_name
description
category
program_id
github_org_url
website_url
```

**When Claimed Successfully**:
```text
claim_status = 'claimed'
verified = true
x_user_id = <claimer's X ID>
claimer_wallet = <verified authority wallet>
authority_verified_at = <timestamp>
```

### Part 2: Blacklist Table for Failed Claims

**New Table: `claim_blacklist`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| profile_id | UUID | The unclaimed profile being claimed |
| wallet_address | VARCHAR | The wallet that failed verification |
| attempt_count | INTEGER | Number of failed attempts |
| first_attempt_at | TIMESTAMP | First failed attempt time |
| last_attempt_at | TIMESTAMP | Most recent failed attempt time |
| is_permanent_ban | BOOLEAN | If true, wallet is globally banned |
| created_at | TIMESTAMP | Record creation time |

**RLS Policies**:
- Read: Only backend functions can read (service role)
- Write: Only backend functions can write (via edge function)

### Part 3: Updated Explorer to Show Unclaimed Profiles

**File**: `src/hooks/useExplorerProjects.ts`

Modify to fetch both:
- `verified = true` (claimed profiles)
- `claim_status = 'unclaimed'` (pre-seeded unclaimed profiles)

Add new field to `ExplorerProject`:
```typescript
claimStatus: 'claimed' | 'unclaimed' | 'pending';
```

### Part 4: UI Updates for Unclaimed Badge

**File**: `src/components/explorer/ProgramLeaderboard.tsx`

Add "UNCLAIMED" badge for profiles where `claim_status === 'unclaimed'`:
- Amber/Yellow colored badge
- "CLAIM THIS PROJECT" CTA button
- Clicking routes to `/claim-profile?program_id={id}&project={name}`

### Part 5: Claim Flow for Pre-Seeded Projects

When a user clicks "CLAIM THIS PROJECT" on an unclaimed profile:

1. Route to `/claim-profile` with pre-populated data
2. User authenticates with X (Step 1)
3. User reviews/updates core identity (Step 2) - pre-populated from seed
4. User connects wallet and verifies authority (Step 2b)
5. **Blacklist Check**: Before verification, check if wallet is blacklisted for this profile
6. If authority verification **fails**:
   - Record attempt in `claim_blacklist`
   - If `attempt_count >= 3`: Show "You are not the owner. Further attempts may result in permanent ban."
   - If `attempt_count >= 5`: Permanently blacklist wallet for this project
7. If authority verification **succeeds**:
   - Update existing profile (not create new)
   - Set `claim_status = 'claimed'`, `verified = true`
   - Clear any blacklist entries for this wallet/profile combo

### Part 6: Edge Function Updates

**New Edge Function: `check-claim-blacklist`**

```text
POST /check-claim-blacklist
Body: { profile_id: string, wallet_address: string }
Response: { 
  isBlacklisted: boolean,
  attemptCount: number,
  isPermanentBan: boolean,
  message?: string
}
```

**Updated: `verify-program-authority`**

After verification failure, record the attempt:
1. Check if wallet is already permanently banned
2. If not, increment attempt count
3. Return appropriate warning message based on attempt count

### Part 7: Insert Drift Protocol as Unclaimed

**SQL Insert**:
```sql
INSERT INTO claimed_profiles (
  project_name,
  description,
  category,
  program_id,
  github_org_url,
  website_url,
  claim_status,
  verified,
  resilience_score,
  liveness_status
) VALUES (
  'Drift Protocol V2',
  'Perpetual futures, spot DEX, and lending with cross-margin',
  'defi',
  'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH',
  'https://github.com/drift-labs/protocol-v2',
  'https://drift.trade',
  'unclaimed',
  false,
  0,
  'STALE'
);
```

---

## Files to Create

1. `supabase/functions/check-claim-blacklist/index.ts` - Check if wallet is blacklisted
2. `supabase/functions/record-claim-attempt/index.ts` - Record failed claim attempt

## Files to Modify

1. `src/hooks/useExplorerProjects.ts` - Include unclaimed profiles in query
2. `src/components/explorer/ProgramLeaderboard.tsx` - Add UNCLAIMED badge and CTA
3. `src/pages/ClaimProfile.tsx` - Handle claiming pre-seeded profiles (update vs insert)
4. `src/components/claim/AuthorityVerificationModal.tsx` - Check blacklist before verification
5. `supabase/functions/verify-program-authority/index.ts` - Record failed attempts
6. `src/hooks/useClaimedProfiles.ts` - Add hook for unclaimed profile by ID

---

## Database Changes Required

1. **New table: `claim_blacklist`** - Tracks failed claim attempts per wallet/project
2. **Enable RLS** on `claim_blacklist` - Service role only access
3. **Insert Drift Protocol** as first unclaimed profile

---

## User Flow Diagram

```text
UNCLAIMED PROFILE IN REGISTRY
         |
         v
   [CLAIM THIS PROJECT]
         |
         v
   X Authentication
         |
         v
   Connect Wallet
         |
         v
   +------------------+
   | Check Blacklist  |
   +------------------+
         |
    +----+----+
    |         |
 Banned    OK
    |         |
    v         v
 [STOP]   Verify Authority
          |
     +----+----+
     |         |
  FAIL      SUCCESS
     |         |
     v         v
 Record     Update Profile:
 Attempt    - verified = true
     |      - claim_status = 'claimed'
     v      - x_user_id = <user>
 Show Warning
 (3+ attempts: stern warning)
 (5+ attempts: permanent ban)
```

---

## Badge States in Explorer

| State | Badge | Color | CTA |
|-------|-------|-------|-----|
| Unclaimed | UNCLAIMED | Amber/Yellow | CLAIM THIS PROJECT |
| Claimed (Authority) | VERIFIED TITAN | Cyan | View Profile |
| Claimed (Multisig) | VERIFIED TITAN (MS) | Cyan | View Profile |
| Claimed (No Authority) | REGISTERED | Grey | View Profile |

---

## Security Considerations

1. **Rate Limiting**: Blacklist prevents brute-force claim attempts
2. **Wallet-Specific**: Blacklist is per-wallet per-project, not global (unless permanent ban)
3. **Clear Path**: Legitimate owners are not affected by other users' failed attempts
4. **Service Role Only**: Blacklist table is not accessible from client
5. **Audit Trail**: All attempts are logged with timestamps

---

## Implementation Phases

**Phase A (This PR)**:
1. Create `claim_blacklist` table
2. Insert Drift Protocol as unclaimed
3. Update Explorer to show unclaimed profiles
4. Add UNCLAIMED badge and CTA

**Phase B (This PR)**:
5. Create blacklist check edge function
6. Update ClaimProfile to handle pre-seeded projects
7. Integrate blacklist checks into authority verification flow
8. Show warning messages for repeated failures

---

## Testing Checklist

- Verify Drift Protocol appears in Explorer with UNCLAIMED badge
- Verify clicking "CLAIM THIS PROJECT" routes to claim flow with pre-populated data
- Test successful claim converts unclaimed to claimed profile
- Test failed authority verification records blacklist entry
- Test 3rd failed attempt shows warning message
- Test 5th failed attempt triggers permanent ban
- Test banned wallet cannot attempt claim again
- Test different wallet can still claim same project
- Test legitimate owner can claim after others have been blacklisted

---

## Estimated Implementation Time

- Database Migration (blacklist table): 30 minutes
- Insert Drift Protocol: 15 minutes
- Explorer Updates (badge, CTA): 1-2 hours
- Blacklist Edge Functions: 2-3 hours
- ClaimProfile Updates: 2-3 hours
- Authority Modal Integration: 1-2 hours
- Testing: 2-3 hours

**Total**: 1-1.5 days of focused development
