

# Update X Client ID

## Summary
Replace the current hardcoded X OAuth Client ID with the new value provided.

## Change Required

**File:** `src/context/AuthContext.tsx`

**Line 17 - Current:**
```typescript
const X_CLIENT_ID = 'ZZfXbSqg03wCPXO2hCoIZHZUH';
```

**Updated:**
```typescript
const X_CLIENT_ID = 'VmVzd2xOelNXOUZ2TFNCLUZqalQ6MTpjaQ';
```

## Important Reminder
After updating the Client ID in the code, make sure the X Developer Portal is also configured with the matching Client ID and has the correct callback URI:
- **Callback URI:** `https://id-preview--620e3ac9-b8b9-47de-a2e2-0ff41af4217f.lovable.app/x-callback`

