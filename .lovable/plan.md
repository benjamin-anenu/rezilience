

# Bytecode Verification Hardening Plan

## Current State: Honest Assessment

The existing `verify-bytecode` function is essentially a **registry lookup wrapper** around the OtterSec API. It does NOT perform actual bytecode verification. The "bytecodeHash" stored in the database is computed from the first 64 characters of a base64-encoded program account (not the executable), making it meaningless for comparison purposes.

**This would not pass security scrutiny from any Solana auditor.**

---

## What Needs to Change

### Fix 1: Compute the Real On-Chain Executable Hash (Mandatory)

**Problem:** `getAccountInfo` on a program ID returns the program proxy account, not the executable bytecode. The real executable lives in the `programData` account.

**Solution:** Follow the Solana program account structure:
- Fetch the program account to find the `programData` address (bytes 4-36 of the account data)
- Fetch the `programData` account which contains the actual ELF executable (after the 45-byte metadata header)
- Compute SHA-256 of the full executable data
- This hash will match the `on_chain_hash` from the OtterSec API, enabling independent cross-verification

**Technical detail:** The `programData` account layout is: `[4 bytes state][32 bytes authority][1 byte slot_info][8 bytes slot][...executable bytes]`. The executable starts at offset 45.

### Fix 2: Cross-Verify Against OtterSec Hash (Mandatory)

**Problem:** We blindly trust OtterSec's `is_verified` boolean.

**Solution:** When OtterSec returns a verified status with `on_chain_hash` and `executable_hash`:
- Compare OtterSec's `on_chain_hash` against our independently computed hash
- If they match, confidence is HIGH (two independent sources agree)
- If they differ, flag as SUSPICIOUS regardless of OtterSec's `is_verified` status
- Store both hashes in the database for audit trail

### Fix 3: Validate program_id Input (Mandatory)

**Problem:** No validation that `program_id` is a valid Solana public key.

**Solution:** Add base58 validation before making any external calls:
- Check length is 32-44 characters
- Verify characters are valid base58 (no 0, O, I, l)
- Reject obvious garbage inputs

### Fix 4: Fix Fork Detection Logic (Mandatory)

**Problem:** `providedRepo.includes(verifiedRepo)` is trivially bypassable with URL manipulation.

**Solution:** Normalize both URLs to `owner/repo` format and compare exact equality:
- Strip protocol, trailing slashes, `.git` suffix, tree/branch paths
- Extract only `{owner}/{repo}` and compare case-insensitively
- Reject partial substring matches entirely

### Fix 5: Add Upgrade Detection via Slot Tracking (Recommended)

**Problem:** A 24h cache means a malicious program upgrade goes undetected.

**Solution:** The `programData` account contains a `slot` field (the last slot where the program was deployed/upgraded). Compare this against the previously stored value:
- If slot changed since last verification, force re-verification regardless of cache
- Store `last_deploy_slot` in the database alongside the hash
- This catches upgrades within seconds of the next check

### Fix 6: Use a Dedicated RPC Endpoint (Recommended)

**Problem:** `api.mainnet-beta.solana.com` is rate-limited and unreliable for production use.

**Solution:** Use a dedicated RPC provider via a secret:
- Add an `RPC_URL` secret for a production endpoint (e.g., Helius, QuickNode)
- Fall back to public RPC if the secret is not configured
- This also enables fetching larger `programData` accounts reliably

### Fix 7: Add Verification Confidence Levels (Recommended)

**Problem:** Current system has binary "verified/unknown" which oversimplifies.

**Solution:** Introduce a confidence tier:
- **HIGH**: Our computed hash matches OtterSec's `on_chain_hash`, program is verified, and repo URLs match exactly
- **MEDIUM**: OtterSec says verified but we couldn't independently compute the hash (programData too large or RPC failed)
- **LOW**: Program exists on-chain but not in OtterSec registry (unknown provenance)
- **SUSPICIOUS**: Hash mismatch between our computation and OtterSec, or repo URL mismatch detected
- **NOT_DEPLOYED**: Program not found on-chain

---

## Implementation Scope

### Files to modify:
1. **`supabase/functions/verify-bytecode/index.ts`** -- Complete rewrite of verification logic with real hash computation, input validation, cross-verification, and slot tracking
2. **`src/hooks/useBytecodeVerification.ts`** -- Update types to include confidence level and deploy slot
3. **`src/components/program/tabs/DevelopmentTabContent.tsx`** -- Display confidence tier and last deploy slot
4. **`src/components/program/MetricCards.tsx`** -- Update bytecode display to reflect confidence levels

### Database changes:
- Add columns to `claimed_profiles`: `bytecode_deploy_slot` (bigint), `bytecode_on_chain_hash` (text), `bytecode_confidence` (text)

### Secrets needed:
- `RPC_URL` (optional but recommended for reliability)

---

## What This Does NOT Change

- The OtterSec API remains the primary source for "is this program's source code verified?" -- this is correct and industry-standard
- We are adding **independent validation** on top of it, not replacing it
- The UI flow and auto-refresh pipeline remain unchanged
- The 24h cache TTL stays, but upgrade detection via slot comparison adds a safety net

## Priority Order

1. Fix 3 (input validation) -- 5 minutes, prevents abuse
2. Fix 4 (fork detection) -- 10 minutes, prevents gaming
3. Fix 1 (real hash computation) -- core upgrade, 30 minutes
4. Fix 2 (cross-verification) -- depends on Fix 1, 15 minutes
5. Fix 5 (slot tracking) -- 15 minutes
6. Fix 7 (confidence levels) -- 20 minutes, UI + types
7. Fix 6 (dedicated RPC) -- 5 minutes, secret setup
