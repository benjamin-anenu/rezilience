
# Fix: Governance Account Search Using Wrong Byte Offset

## Root Cause

The `fetch-realms-governance` edge function has the **primary memcmp offset backwards**. In spl-governance's `GovernanceV2` account layout:

```text
Offset 0:  account_type (1 byte)
Offset 1:  realm        (32 bytes)  <-- realm pubkey lives HERE
Offset 33: governed_account (32 bytes)
```

The code searches at **offset 33 first** (which matches `governed_account`, not `realm`), then falls back to offset 1. This means:

- For `7vrFDrK9GRNX7YZXbo7N3kvta7Pbn6W1hCXQ6C7WBxG9`: It finds accounts where that address is the `governed_account` (not the realm), then tries to fetch proposals for those wrong governance accounts -- resulting in `total: 0`.
- For `jjCAwuuNpJCNMLAanpwgJZ6cdXzLPXe2GfD6TaDQBXt`: Nothing matches at either offset, so "No governance accounts found."
- For `GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw`: This is the spl-governance **program ID** itself, so it coincidentally matches some accounts and returns data.

## Fix

### File: `supabase/functions/fetch-realms-governance/index.ts`

**Swap the offsets**: Use offset 1 as the primary search (correct for realm field), and offset 33 as the fallback for edge cases.

```typescript
// Primary: realm field is at offset 1 in GovernanceV2
const governanceAccounts = await rpcGetProgramAccounts(rpcUrl, GOV_PROGRAM_ID, [
  { memcmp: { offset: 1, bytes: realm_address } },
]);

if (!governanceAccounts || governanceAccounts.length === 0) {
  // Fallback: try offset 33 (governed_account) for unusual layouts
  const govAccountsAlt = await rpcGetProgramAccounts(rpcUrl, GOV_PROGRAM_ID, [
    { memcmp: { offset: 33, bytes: realm_address } },
  ]);
  // ... rest of fallback logic
}
```

This is a one-line swap in the edge function. After fixing, redeploy the function.

### No Frontend Changes Needed

The UI error handling already works correctly -- the backend was just returning wrong data due to the offset bug.
