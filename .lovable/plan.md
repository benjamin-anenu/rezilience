

# Fix: Add X Client ID to Frontend

## Problem
The frontend cannot access `VITE_X_CLIENT_ID` because it was only added as a Supabase secret for edge functions. Frontend environment variables need to be bundled at build time.

## Solution
Hardcode the X Client ID directly in `AuthContext.tsx`. This is safe because:
- Client IDs are public identifiers (visible in OAuth redirect URLs)
- Only the Client **Secret** must remain hidden (which stays in edge function)

## Change Required

**File:** `src/context/AuthContext.tsx`

**Current code (line 17):**
```typescript
const X_CLIENT_ID = import.meta.env.VITE_X_CLIENT_ID;
```

**Updated code:**
```typescript
const X_CLIENT_ID = 'ZZfXbSqg03wCPXO2hCoIZHZUH';
```

This single-line change will resolve the "VITE_X_CLIENT_ID is not configured" error and allow the OAuth flow to redirect to X properly.

