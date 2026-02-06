

# Real X (Twitter) OAuth Implementation Plan

## Current State

The X (Twitter) authentication is currently a **mock implementation**:
- `signInWithX()` in `AuthContext.tsx` redirects to `/x-callback?code=mock_x_auth_code`
- `XCallback.tsx` creates a hardcoded fake user (`verified_builder`)
- No edge function exists to handle real X OAuth token exchange
- No X/Twitter API secrets are configured

---

## What Needs to Be Built

### 1. Edge Function: `x-oauth-callback`

A new Supabase Edge Function to handle the OAuth 2.0 PKCE flow:

```text
Frontend                    X (Twitter) API              Edge Function
   │                             │                            │
   │──── Redirect to X ──────────▶                            │
   │                             │                            │
   │◀─── Auth code + state ──────│                            │
   │                             │                            │
   │──── POST code to edge fn ───────────────────────────────▶│
   │                             │                            │
   │                             │◀── Exchange code for token─│
   │                             │                            │
   │                             │──── Return access token ──▶│
   │                             │                            │
   │                             │◀── GET /2/users/me ────────│
   │                             │                            │
   │◀─── Return user data ────────────────────────────────────│
```

**Edge function responsibilities:**
- Receive authorization code from frontend
- Exchange code for access token via `https://api.x.com/2/oauth2/token`
- Fetch user profile via `https://api.x.com/2/users/me`
- Return user data (id, username, avatar)

### 2. Frontend Updates

**AuthContext.tsx:**
- Generate PKCE code verifier and challenge
- Store code verifier in `sessionStorage` (more secure than localStorage)
- Redirect to X's OAuth 2.0 authorization URL

**XCallback.tsx:**
- Retrieve authorization code from URL params
- Call the new `x-oauth-callback` edge function
- Store real user data in localStorage for session

### 3. Required Secrets

| Secret | Description |
|--------|-------------|
| `X_CLIENT_ID` | OAuth 2.0 Client ID from X Developer Portal |
| `X_CLIENT_SECRET` | OAuth 2.0 Client Secret from X Developer Portal |

---

## Implementation Details

### Step 1: Add X OAuth Secrets

Before any code changes, you'll need to:
1. Create an X Developer account at `developer.x.com`
2. Create a new app with OAuth 2.0 enabled
3. Set the callback URL to `https://[your-domain]/x-callback`
4. Get the Client ID and Client Secret
5. Add them as secrets in Lovable

### Step 2: Create Edge Function

**File:** `supabase/functions/x-oauth-callback/index.ts`

```typescript
// Handles X OAuth 2.0 PKCE token exchange
// - Receives: { code, code_verifier, redirect_uri }
// - Exchanges code for access token via api.x.com
// - Fetches user profile
// - Returns: { id, username, avatarUrl }
```

Key API endpoints:
- Token exchange: `POST https://api.x.com/2/oauth2/token`
- User profile: `GET https://api.x.com/2/users/me?user.fields=profile_image_url`

### Step 3: Update AuthContext.tsx

```typescript
const signInWithX = async () => {
  // Generate PKCE code verifier (random 43-128 chars)
  const codeVerifier = generateCodeVerifier();
  
  // Generate code challenge (SHA-256 hash of verifier)
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store for callback
  sessionStorage.setItem('x_code_verifier', codeVerifier);
  
  // Generate state for CSRF protection
  const state = crypto.randomUUID();
  sessionStorage.setItem('x_oauth_state', state);
  
  // Redirect to X authorization
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: import.meta.env.VITE_X_CLIENT_ID,
    redirect_uri: `${window.location.origin}/x-callback`,
    scope: 'tweet.read users.read',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  
  window.location.href = `https://x.com/i/oauth2/authorize?${params}`;
};
```

### Step 4: Update XCallback.tsx

```typescript
// 1. Verify state matches (CSRF protection)
// 2. Retrieve code verifier from sessionStorage
// 3. Call edge function with code + code_verifier
// 4. Store returned user in localStorage
// 5. Redirect to /claim-profile
```

### Step 5: Update config.toml

```toml
[functions.x-oauth-callback]
verify_jwt = false
```

---

## Configuration Requirements

### X Developer Portal Setup

1. Go to `developer.x.com` and create a project
2. Enable OAuth 2.0 with PKCE
3. Add callback URL: `https://id-preview--620e3ac9-b8b9-47de-a2e2-0ff41af4217f.lovable.app/x-callback`
4. Request scopes: `tweet.read`, `users.read`
5. Copy Client ID and Client Secret

### Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `VITE_X_CLIENT_ID` | Frontend (.env) | Initiate OAuth redirect |
| `X_CLIENT_ID` | Edge function secret | Token exchange |
| `X_CLIENT_SECRET` | Edge function secret | Token exchange |

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/x-oauth-callback/index.ts` | CREATE - Edge function for token exchange |
| `supabase/config.toml` | MODIFY - Add x-oauth-callback config |
| `src/context/AuthContext.tsx` | MODIFY - Real OAuth with PKCE |
| `src/pages/XCallback.tsx` | MODIFY - Call edge function |
| `src/lib/pkce.ts` | CREATE - PKCE helper functions |

---

## Security Considerations

1. **PKCE Flow**: Required by X for public clients (SPAs)
2. **State Parameter**: CSRF protection to prevent authorization code injection
3. **Code Verifier**: Stored in sessionStorage (cleared on tab close)
4. **Secret Storage**: Client secret only in edge function (never exposed to frontend)
5. **Token Handling**: Access token returned to frontend for session, not stored server-side

---

## Testing Checklist

After implementation:
- [ ] "Sign in with X" redirects to X authorization page
- [ ] After X approval, redirects back to `/x-callback`
- [ ] Callback successfully exchanges code for user data
- [ ] User appears as authenticated with real X username
- [ ] Session persists after page refresh
- [ ] Sign out clears session properly
- [ ] Error states display correctly for cancelled/failed auth

