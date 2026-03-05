

# Fix Transaction Decoder "[object Object]" Error

## Problem

The `supabase.functions.invoke()` error object is not a standard `Error` — it's a `FunctionsHttpError` or similar. When thrown directly via `throw error`, react-query stores the raw object. The UI then renders `(decode.error as Error).message` which evaluates to `[object Object]` because `.message` is either undefined or itself an object.

## Fix

In `src/components/tools/TransactionDecoder.tsx`, update the `mutationFn` error handling to extract a proper string message before throwing:

```typescript
if (error) throw new Error(error.message || JSON.stringify(error));
```

This ensures `decode.error.message` is always a readable string.

**Single file change:** `src/components/tools/TransactionDecoder.tsx`, line ~48.

