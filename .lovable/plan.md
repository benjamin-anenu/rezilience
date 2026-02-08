
# Squads Multisig Support Implementation Plan

## Overview

This plan extends the authority verification system to detect and support Squads Protocol multisig-controlled programs. When the upgrade authority is a PDA (Program Derived Address) belonging to a Squads multisig, the system will detect this, provide clear guidance, and offer an alternative verification path.

## Current State Analysis

The existing implementation has:
- `verify-program-authority` edge function that fetches `upgradeAuthority` from program's `programData`
- `isPotentialMultisig()` function that currently returns `false` (stub implementation)
- `AuthorityVerificationModal` with states for direct authority match, mismatch, and immutable programs
- `authorityType` field supporting: `direct`, `multisig`, `immutable`, `none`

**Gap**: No actual multisig detection logic or UI flow for multisig-controlled programs.

---

## Technical Implementation

### Step 1: Enhanced Multisig Detection in Edge Function

**File**: `supabase/functions/verify-program-authority/index.ts`

Enhance the `isPotentialMultisig()` function to actually detect Squads PDAs:

**Detection Logic**:
```text
1. Query the Squads v4 program (SMPLecH...v4) to check if authority is a known multisig vault
2. Use PDA derivation pattern: ["squad", createKey, "multisig"] 
3. Check if the authority account is owned by the Squads program
4. Return multisig metadata: vault address, multisig PDA, Squads version
```

**New Response Fields**:
- `multisigAddress`: The Squads multisig PDA (if detected)
- `vaultAddress`: The Squads vault (if different from authority)
- `squadsVersion`: 'v3' | 'v4' | 'unknown'
- `squadsUrl`: Direct link to Squads dashboard for this multisig

### Step 2: Update Hook and Types

**File**: `src/hooks/useVerifyProgramAuthority.ts`

Add new fields to the response interface:

```text
AuthorityVerificationResult {
  isAuthority: boolean;
  authorityType: 'direct' | 'multisig' | 'immutable' | 'none';
  actualAuthority: string | null;
  // NEW: Multisig-specific fields
  multisigInfo?: {
    multisigAddress: string;
    vaultAddress?: string;
    squadsVersion: 'v3' | 'v4' | 'unknown';
    squadsUrl: string;
  };
  error?: string;
}
```

**File**: `src/types/index.ts`

Update the `ClaimedProfile` interface to include optional multisig info for audit trail:
- `multisigAddress?: string` - The Squads multisig PDA
- `squadsVersion?: string` - Version of Squads used

### Step 3: New Multisig Verification Modal State

**File**: `src/components/claim/AuthorityVerificationModal.tsx`

Add a new step: `'multisig-detected'` with the following UI:

**UI Components**:
1. **Header**: "Multisig Authority Detected" with Squads logo/icon
2. **Info Panel**: Display detected multisig address and connected wallet
3. **Verification Options**:
   - **Option A**: "I am a member of this multisig" - shows membership verification guidance
   - **Option B**: "Initiate verification via Squads" - opens Squads dashboard link
4. **Manual Override**: Input field for users to enter a transaction signature proving ownership
5. **External Link**: Button to open Squads dashboard directly

**Flow Logic**:
```text
IF authorityType === 'multisig' && multisigInfo exists:
  SHOW 'multisig-detected' step
  - Display Squads dashboard link
  - Provide guidance for multisig members
  - Allow manual signature submission (future feature)
  - Option to "Request Manual Review" for complex cases
```

### Step 4: Squads Dashboard Deep Linking

Generate proper Squads dashboard URLs:
- **v4 (current)**: `https://app.squads.so/squads/{multisigAddress}/home`
- **v3 (legacy)**: `https://v3.squads.so/squads/{multisigAddress}`

The URL will be constructed based on detected Squads version.

### Step 5: Database Schema Update

**Migration**: Add multisig tracking fields to `claimed_profiles`:

New columns:
- `multisig_address` (TEXT): The Squads multisig PDA if applicable
- `squads_version` (TEXT): 'v3', 'v4', or null
- `multisig_verified_via` (TEXT): 'member_signature' | 'transaction_proof' | 'manual_review'

### Step 6: Alternative Verification Paths

For multisig-controlled programs, provide three verification options:

**Path A: Member Signature (Recommended)**
- User proves they are a member of the multisig
- Sign SIWS message with their member wallet
- System stores member wallet + multisig reference
- Badge: "VERIFIED (Multisig Member)"

**Path B: Transaction Proof (Advanced)**
- User provides a transaction signature from the multisig
- System verifies the transaction was executed by the multisig
- Suitable for teams that have already made an on-chain action
- Badge: "VERIFIED (Multisig Transaction)"

**Path C: Manual Review (Fallback)**
- User submits request for manual verification
- Provides documentation (Squads screenshot, team confirmation)
- Admin reviews and approves
- Badge: "VERIFIED (Manual Review)"

---

## Files to Create

None - all changes are modifications to existing files.

## Files to Modify

1. `supabase/functions/verify-program-authority/index.ts` - Add Squads detection logic
2. `src/hooks/useVerifyProgramAuthority.ts` - Add multisig info to response type
3. `src/components/claim/AuthorityVerificationModal.tsx` - Add multisig-detected UI state
4. `src/types/index.ts` - Add multisig fields to ClaimedProfile
5. `src/pages/ClaimProfile.tsx` - Handle multisig verification flow
6. `supabase/functions/github-oauth-callback/index.ts` - Store multisig metadata on profile creation

---

## UI Design

### Multisig Detection Screen

```text
+--------------------------------------------------+
|     [Squads Icon]  MULTISIG AUTHORITY DETECTED   |
+--------------------------------------------------+
|                                                  |
|  This program's upgrade authority is controlled  |
|  by a Squads multisig wallet.                    |
|                                                  |
|  +--------------------------------------------+  |
|  | Multisig Address:                          |  |
|  | SMq1...8xZK                                |  |
|  |                                            |  |
|  | Your Wallet:                               |  |
|  | ABC...XYZ                                  |  |
|  +--------------------------------------------+  |
|                                                  |
|  To claim this profile, you have two options:    |
|                                                  |
|  [  VERIFY AS MULTISIG MEMBER  ]                 |
|  Sign with your member wallet to prove you       |
|  are part of this multisig.                      |
|                                                  |
|  [  OPEN SQUADS DASHBOARD  ->  ]                 |
|  Initiate a verification transaction from        |
|  your Squads dashboard.                          |
|                                                  |
|  +--------------------------------------------+  |
|  | [?] Need help? Contact support for         |  |
|  | manual verification.                       |  |
|  +--------------------------------------------+  |
|                                                  |
|         [ CANCEL ]     [ TRY DIFFERENT WALLET ]  |
+--------------------------------------------------+
```

### Badge States for Multisig

| State | Badge | Color |
|-------|-------|-------|
| Multisig Member Verified | VERIFIED TITAN (MS) | Cyan |
| Multisig Pending | PENDING VERIFICATION | Amber |
| Multisig Manual Review | UNDER REVIEW | Grey |

---

## Security Considerations

1. **Member Verification**: When a user claims "I am a member," the system should ideally verify this on-chain by checking the multisig's member list. However, Squads v4 makes this complex, so initial implementation will trust the signature but mark it as "multisig member" type.

2. **Audit Trail**: All multisig verifications store the multisig address, member wallet, and verification method for transparency.

3. **Single Claim Rule**: Once a multisig program is claimed by one member, other members cannot claim it again. The first verified member owns the profile.

---

## Implementation Phases

**Phase 1 (This PR)**:
- Detect Squads multisig via account owner check
- Display multisig-detected UI with Squads dashboard link
- Allow member signature verification (trust-based)
- Store multisig metadata in database

**Phase 2 (Future)**:
- On-chain member verification via Squads SDK
- Transaction proof verification
- Admin review workflow

---

## Testing Checklist

- Test with a known Squads v4 multisig-controlled program (e.g., Jupiter, Marinade)
- Verify Squads dashboard link opens correctly
- Test member signature flow for multisig programs
- Confirm multisig programs show correct badge type
- Test with non-Squads multisig (should fall back to "unknown multisig")
- Verify single-claim rule for multisig programs

---

## Estimated Implementation Time

- Edge Function Enhancement: 2-3 hours
- Hook/Types Updates: 1 hour
- Modal UI Changes: 3-4 hours
- ClaimProfile Integration: 1-2 hours
- Database Migration: 30 minutes
- Testing: 2-3 hours

**Total**: 1-1.5 days of focused development
