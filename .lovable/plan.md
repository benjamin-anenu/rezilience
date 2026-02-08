

# Cryptographic Claim Logic Implementation Plan

## Overview

This plan implements the "no-loophole" Solana authority verification system to ensure only the true owner of an on-chain program can claim it in the Resilience Registry.

## The Triple-Check Verification Flow

```text
+-------------------+     +----------------------+     +------------------+
| 1. WALLET SIGN-IN | --> | 2. AUTHORITY CHECK   | --> | 3. DATABASE LOCK |
| User signs SIWS   |     | Fetch upgradeAuth    |     | Store wallet +   |
| message           |     | from programData     |     | verified = true  |
+-------------------+     +----------------------+     +------------------+
         |                         |                          |
         v                         v                          v
   "I am the owner        connectedWallet ===         claimed_by_wallet
   of [program_id]..."    upgradeAuthority            cannot be changed
```

## Technical Implementation

### Step 1: Create Authority Verification Edge Function

**New File**: `supabase/functions/verify-program-authority/index.ts`

This edge function will:
- Accept a `program_id` and `wallet_address`
- Call Solana RPC to fetch the program's `upgradeAuthority`
- Return whether the wallet matches the authority
- Handle Multisig PDAs (Squads protocol detection)

**Key Logic**:
```text
1. Fetch program account using getParsedAccountInfo(program_id)
2. If program is a BPF Upgradeable Loader program:
   - Extract the programData PDA
   - Fetch the programData account
   - Get the upgradeAuthority field
3. Compare upgradeAuthority with provided wallet_address
4. Return { isAuthority: boolean, authorityType: 'wallet' | 'multisig' | 'none' }
```

### Step 2: Implement SIWS (Sign In With Solana) Hook

**New File**: `src/hooks/useSIWS.ts`

This hook will:
- Generate a structured message: "I am the owner of [program_id] and I claim this profile on Resilience. Timestamp: [ISO date]"
- Request wallet signature via `signMessage()` from wallet adapter
- Verify the signature matches the connected public key
- Return signature and message for backend verification

### Step 3: Create Verification Modal Component

**New File**: `src/components/claim/AuthorityVerificationModal.tsx`

A high-tech modal with Signal Cyan accents that guides users through:
1. **Step 1**: "CONNECT AUTHORITY WALLET" button
2. **Step 2**: "Verifying On-Chain Authority" loader with Solana icon
3. **Step 3**: Sign message prompt with signature preview
4. **Success State**: Animated "VERIFIED TITAN" badge reveal
5. **Failure States**: Clear error messages for each failure mode

**UI States**:
- Wallet not connected: Show "Connect Wallet" CTA
- Wallet connected but not authority: "This wallet is not the upgrade authority for this program"
- Multisig detected: Show "Enter Multisig Address" field with Squads integration guidance
- Signature rejected: "Signature required to prove ownership"
- Success: Glowing cyan "VERIFIED TITAN" badge animation

### Step 4: Modify Claim Profile Flow

**File to Modify**: `src/pages/ClaimProfile.tsx`

Changes:
- When a Program ID is entered in Step 2, make wallet connection REQUIRED (not optional)
- Add new verification step between current Steps 2 and 3
- Integrate AuthorityVerificationModal for on-chain programs
- Allow bypass for off-chain projects (no program ID)

**New Flow**:
```text
Step 1: X Auth (unchanged)
Step 2: Core Identity + Program ID input
Step 2.5 (NEW): Authority Verification Modal (if program ID provided)
Step 3: Socials/GitHub
Step 4: Media
Step 5: Roadmap
```

### Step 5: Database Schema Updates

**Migration**: Add authority verification fields to `claimed_profiles`

New columns:
- `authority_wallet` (TEXT): The verified upgrade authority wallet
- `authority_verified_at` (TIMESTAMPTZ): When authority was verified
- `authority_signature` (TEXT): The SIWS signature for audit trail
- `authority_type` (TEXT): 'direct' | 'multisig' | 'immutable'

### Step 6: Update Backend Validation

**File to Modify**: `supabase/functions/github-oauth-callback/index.ts`

Add validation:
- If `program_id` is provided, require `authority_wallet` and `authority_verified`
- Verify the signature on the backend (prevent frontend spoofing)
- Only set `verified = true` if all checks pass

---

## Security Measures

### Why This Prevents Loopholes:

1. **Cryptographic Proof**: The SIWS signature proves the user controls the wallet private key
2. **On-Chain Truth**: The upgrade authority is read directly from Solana, not user input
3. **Database Lock**: Once verified, the authority wallet is locked to the profile
4. **Backend Verification**: Signatures are verified server-side, not just client-side

### Multisig Handling:

For programs controlled by Squads or other multisigs:
- Detect if authority is a PDA (starts with derived address pattern)
- Show "Multisig Detected" UI with guidance
- Option A: Verify user is a member of the multisig vault
- Option B: Require a verified transaction from the multisig to complete claim

---

## UI/UX Design

### Badge States:

| State | Badge | Color | Description |
|-------|-------|-------|-------------|
| Unclaimed | UNCLAIMED | Grey (#4B5563) | Waiting for owner |
| Authority Verified | VERIFIED TITAN | Cyan (#00F2FF) | Owner confirmed on-chain |
| Off-Chain Project | VERIFIED | Green | No program ID, GitHub verified |
| Pending Verification | PENDING | Amber | Awaiting signature |

### Error Messages:

- "This wallet (ABC...XYZ) is not the upgrade authority. The authority is (DEF...UVW)"
- "This program's authority is immutable (set to null). Contact support for verification."
- "Multisig detected. Please initiate verification via your Squads dashboard."

---

## Files to Create

1. `supabase/functions/verify-program-authority/index.ts` - Authority check edge function
2. `src/hooks/useSIWS.ts` - Sign In With Solana hook
3. `src/components/claim/AuthorityVerificationModal.tsx` - Verification UI

## Files to Modify

1. `src/pages/ClaimProfile.tsx` - Integrate new verification step
2. `supabase/functions/github-oauth-callback/index.ts` - Add backend validation
3. `src/types/index.ts` - Add new types
4. `supabase/config.toml` - Add new edge function config

---

## Testing Checklist

- Verify with a real Solana program you control (devnet first, then mainnet)
- Test with a wallet that is NOT the authority (should fail)
- Test with multisig-controlled programs
- Test with immutable programs (null authority)
- Verify signatures are validated server-side
- Confirm claimed profiles cannot be re-claimed by different wallets

---

## Estimated Implementation Time

- Edge Function (verify-program-authority): 2-3 hours
- SIWS Hook: 1-2 hours
- Authority Verification Modal: 3-4 hours
- ClaimProfile Integration: 2-3 hours
- Database Migration: 30 minutes
- Testing: 2-3 hours

**Total**: 1-2 days of focused development

