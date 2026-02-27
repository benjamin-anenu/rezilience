

# Fix: Live DAO Analysis "undefined" Results

## Root Causes

1. **Wrong address type**: Users are pasting Solana program IDs (like the SPL Token Program) instead of Realm addresses. These are fundamentally different -- a Realm address is the specific DAO governance account created on realms.today, not the program's deployment address.

2. **Missing error handling in UI**: When the edge function returns "No governance accounts found" (shape: `{ message, proposals: 0 }`), the frontend blindly sets it as `result` and tries to render `.total`, `.delivery_rate`, etc. -- all of which are `undefined` on that response shape.

## Changes

### File: `src/components/demo/LiveAnalysisSection.tsx`

1. **Handle "no data" response**: After calling the function, check if the response has `proposals === 0` or is missing `total`. Show a clear "No governance data found" message instead of rendering undefined values.

2. **Improve placeholder text**: Change the input placeholder from "Paste a Realms DAO address..." to "Paste a Realm address from realms.today..." to clarify what's expected.

3. **Add helper text**: Add a small note below the input explaining: "Use the Realm address from your DAO's page on realms.today -- this is different from a Solana program ID."

4. **Update example DAOs**: Replace the current examples with DAOs that have real, known Realm addresses that return actual proposal data. Keep "Marinade DAO" (GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw works and returns 8 proposals/100% delivery). Remove Mango and Drift if their addresses don't return data, and replace with working ones.

### Technical Detail

The response shape check:
```typescript
// After getting data from the function:
if (data.proposals === 0 || !data.total) {
  setError('No governance proposals found for this address. Make sure you are using a Realm address from realms.today, not a Solana program ID.');
  return;
}
setResult(data);
```

No backend changes needed -- the edge function already returns correctly, the UI just isn't handling the "no data" case.

