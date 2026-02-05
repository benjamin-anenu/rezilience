
# Phase 1.5: Real GitHub OAuth Integration

## Overview
Implement proper GitHub OAuth so users authenticate with their own GitHub accounts. The scoring engine will then use the user's access token to fetch repository data from their connected repos.

## Current Problem
- GitHub flow is completely mocked - no real OAuth
- Users enter a GitHub URL manually without verification
- `fetch-github` edge function uses a global token (not user-specific)
- Can't verify the user actually owns/controls the repository

## Architecture

### OAuth Flow Diagram
```text
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub OAuth Flow                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User clicks "Connect GitHub"                                    │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐     Redirect with      ┌──────────────────┐   │
│  │   Frontend   │ ──────────────────────▶│  GitHub OAuth    │   │
│  │  /claim-profile │  client_id +        │  Authorization   │   │
│  └──────────────┘    redirect_uri        └──────────────────┘   │
│         ▲                                        │               │
│         │                                        │ User approves │
│         │                                        ▼               │
│         │                                ┌──────────────────┐   │
│  Redirect to profile                     │  GitHub Callback │   │
│  with verified status                    │  with ?code=xxx  │   │
│         │                                └──────────────────┘   │
│         │                                        │               │
│         │     ┌──────────────────────────────────┘               │
│         │     │  POST code to edge function                      │
│         │     ▼                                                  │
│         │  ┌────────────────────────────┐                        │
│         │  │  Edge Function             │                        │
│         │  │  github-oauth-callback     │                        │
│         │  │  ─────────────────────     │                        │
│         │  │  1. Exchange code for      │                        │
│         │  │     access_token           │                        │
│         │  │  2. Fetch user repos       │                        │
│         │  │  3. Calculate score        │                        │
│         │  │  4. Save to claimed_profiles│                       │
│         │  └────────────────────────────┘                        │
│         │              │                                         │
│         └──────────────┘                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Database Migration
Add column to store encrypted GitHub access tokens:
- `github_access_token` (TEXT, encrypted) on `claimed_profiles` table
- Consider whether to also add `github_token_expires_at` for token refresh

### Step 2: Create GitHub OAuth Edge Function
New edge function: `supabase/functions/github-oauth-callback/index.ts`
- Receives the authorization `code` from GitHub callback
- Exchanges code for access token using `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- Fetches user's GitHub profile and organization repos
- Calculates resilience score from their repos
- Stores access token and profile data in `claimed_profiles`
- Returns success with profile data

### Step 3: Request GitHub OAuth Credentials
You need to create a GitHub OAuth App:
1. Go to GitHub → Settings → Developer Settings → OAuth Apps
2. Create new OAuth App with:
   - **Application name**: Resilience Platform
   - **Homepage URL**: Your app URL
   - **Authorization callback URL**: `https://id-preview--620e3ac9-b8b9-47de-a2e2-0ff41af4217f.lovable.app/github-callback`
3. Save the **Client ID** and **Client Secret**

Required secrets:
- `GITHUB_CLIENT_ID` - OAuth App Client ID
- `GITHUB_CLIENT_SECRET` - OAuth App Client Secret

### Step 4: Update Frontend OAuth Flow
Modify `src/pages/ClaimProfile.tsx`:
- Change `handleGitHubConnect` to redirect to real GitHub OAuth URL:
  ```
  https://github.com/login/oauth/authorize?
    client_id=YOUR_CLIENT_ID&
    redirect_uri=.../github-callback&
    scope=read:user,read:org,repo&
    state=random_csrf_token
  ```

### Step 5: Update GitHub Callback Page
Modify `src/pages/GitHubCallback.tsx`:
- Remove mock data generation
- Send authorization code to new edge function
- Handle success/error responses
- Store session and redirect to profile

### Step 6: Update Scoring Engine
Modify `fetch-github` edge function:
- When refreshing scores for claimed profiles, use stored `github_access_token`
- Fall back to global `GITHUB_TOKEN` for unclaimed projects
- This allows higher rate limits and access to private repo stats

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/github-oauth-callback/index.ts` | Create | Exchange code for token, fetch repos, save profile |
| `src/pages/ClaimProfile.tsx` | Modify | Real OAuth redirect URL |
| `src/pages/GitHubCallback.tsx` | Modify | Call edge function instead of mock |
| `src/lib/github.ts` | Modify | Remove mock, add OAuth URL builder |
| Migration | Create | Add `github_access_token` column |

## Security Considerations
- GitHub access tokens are sensitive - store encrypted or use Vault
- Implement CSRF protection with `state` parameter
- Access tokens should only be readable by the profile owner
- Never expose tokens to frontend - all GitHub API calls via edge functions

## Benefits
- Verify user actually has access to the repository
- Access private repo statistics if user grants permission
- Higher API rate limits (5,000/hour per user vs shared)
- No need for global `GITHUB_TOKEN` for user-connected repos
- Enables future features like automatic repo discovery

## Technical Notes
- GitHub OAuth tokens don't expire by default (unless user revokes)
- The `repo` scope gives read access to public and private repos
- Consider using `public_repo` scope only if you don't need private repo access
- Edge function handles all token exchange server-side (never expose client secret)
