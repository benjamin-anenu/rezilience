

# Fix GitHub OAuth UUID Error

## Problem Identified
The `github-oauth-callback` edge function is failing with error:
```
invalid input syntax for type uuid: "profile_1770362052773_219320147"
```

**Root Cause:** The `claimed_profiles.id` column is defined as `UUID` type in the database, but the edge function generates a string ID like `profile_${Date.now()}_${githubUser.id}` which is not a valid UUID.

**Line 298** in the edge function:
```typescript
const profileId = profile_data?.id || `profile_${Date.now()}_${githubUser.id}`;
```

---

## Solution

Change the ID generation to use a proper UUID format using `crypto.randomUUID()` which is available in Deno:

**File:** `supabase/functions/github-oauth-callback/index.ts`

### Change at Line 298

**Before:**
```typescript
const profileId = profile_data?.id || `profile_${Date.now()}_${githubUser.id}`;
```

**After:**
```typescript
const profileId = profile_data?.id || crypto.randomUUID();
```

This ensures a valid UUID is generated when no profile ID is provided, matching the database column type.

---

## Why This Works

- `crypto.randomUUID()` is a built-in Deno/Web API that generates RFC 4122 compliant UUIDs
- Example output: `"550e8400-e29b-41d4-a716-446655440000"`
- This format is compatible with PostgreSQL's `uuid` type

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/github-oauth-callback/index.ts` | Use `crypto.randomUUID()` instead of string concatenation for profile ID |

---

## After the Fix

Once deployed, the GitHub OAuth flow will:
1. Exchange the authorization code for an access token
2. Fetch GitHub user profile and repository data
3. Calculate resilience score
4. Successfully insert into `claimed_profiles` with a valid UUID
5. Redirect to the profile page with "Verified Titan" status

