

# Claim My Profile Journey with GitHub OAuth

## Overview
Implement a complete "Claim Profile" flow that allows developers to verify ownership of their Solana programs by connecting their GitHub account. This uses OAuth for read-only access, building trust through transparency and converting unverified programs to "Verified Titan" status.

---

## User Flow

```text
"CLAIM MY PROFILE" (Nav Button)
         ↓
   /claim-profile
         ↓
┌─────────────────────────────┐
│  Step 1: Enter Program ID   │
│  [Input Field] [VERIFY]     │
└─────────────────────────────┘
         ↓ (on-chain check)
┌─────────────────────────────┐
│  Step 2: Connect GitHub     │
│  Trust messaging + OAuth    │
│  [CONNECT GITHUB button]    │
└─────────────────────────────┘
         ↓ (GitHub OAuth)
   /github-callback
         ↓ (token exchange)
┌─────────────────────────────┐
│  Step 3: Data Indexed       │
│  Step 4: Score Calculated   │
└─────────────────────────────┘
         ↓
   /program/:id?verified=true
   (Shows VERIFIED TITAN badge)
```

---

## Files to Create

### 1. `src/pages/ClaimProfile.tsx`
Complete claiming interface with:
- Step 1: Program ID verification (mock on-chain check)
- Step 2: GitHub OAuth connection with trust messaging
- Progress bar showing verification steps
- "Read-Only Access" trust indicator
- Quote: "IN AN OPEN-SOURCE WORLD, PRIVACY IS ROT."

### 2. `src/pages/GitHubCallback.tsx`
OAuth callback handler:
- Receive authorization code from GitHub
- Display loading spinner during processing
- Show error state if verification fails
- Redirect to program page on success

### 3. `src/lib/github.ts`
GitHub utility functions:
- `fetchGitHubData()` - Get repo stats (stars, forks, commits, contributors)
- `calculateGitHubMetrics()` - Process raw GitHub data

### 4. `src/lib/scoring.ts`
Resilience scoring algorithm:
- `calculateResilienceScore()` - Compute score from GitHub data
- Determine liveness status based on commit frequency

### 5. `supabase/functions/github-token/index.ts`
Edge function for secure token exchange:
- Receives authorization code
- Exchanges for access token using client secret
- Returns token to client (never exposes secret)

---

## Files to Modify

### 1. `src/App.tsx`
Add new routes:
- `/claim-profile` → ClaimProfile page
- `/github-callback` → GitHubCallback page

### 2. `src/components/layout/Navigation.tsx`
- "CLAIM MY PROFILE" button already exists (added previously)
- Link it to `/claim-profile` route

### 3. `src/pages/ProgramDetail.tsx`
Add verification status display:
- "VERIFIED TITAN" badge for verified programs
- "UNVERIFIED" badge with "CLAIM PROFILE" CTA for unverified

### 4. `src/types/index.ts`
Add new types:
- `VerificationStep` interface
- `GitHubData` interface
- `ResilienceScoreResult` interface

---

## Technical Implementation Details

### ClaimProfile Page UI Structure

```tsx
// Verification Steps
const verificationSteps = [
  { step: 1, label: 'Program Claimed', status: 'pending' },
  { step: 2, label: 'GitHub Connected', status: 'pending' },
  { step: 3, label: 'Data Indexed', status: 'pending' },
  { step: 4, label: 'Score Calculated', status: 'pending' },
];

// Step 1: Program Input
<Card>
  <Input placeholder="Enter Solana Program ID..." />
  <Button>VERIFY PROGRAM</Button>
</Card>

// Step 2: GitHub OAuth (shown after program verified)
<Card>
  <Quote>"IN AN OPEN-SOURCE WORLD, PRIVACY IS ROT."</Quote>
  <TrustMessage>Read-Only Access: We only read commit history...</TrustMessage>
  <Button onClick={handleGitHubConnect}>
    <Github /> CONNECT GITHUB
  </Button>
</Card>

// Progress Bar
<Progress value={(completedSteps / 4) * 100} />
```

### GitHub OAuth Flow

```tsx
// Initiate OAuth
const handleGitHubConnect = () => {
  const clientId = 'GITHUB_CLIENT_ID'; // From secrets
  const redirectUri = `${window.location.origin}/github-callback`;
  const scope = 'public_repo read:user';
  
  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  
  window.location.href = authUrl;
};
```

### Edge Function for Token Exchange

```typescript
// supabase/functions/github-token/index.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { code } = await req.json();
  
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: Deno.env.get('GITHUB_CLIENT_ID'),
      client_secret: Deno.env.get('GITHUB_CLIENT_SECRET'),
      code,
    }),
  });

  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
```

### Scoring Algorithm

```typescript
// src/lib/scoring.ts
export function calculateResilienceScore(githubData: GitHubData, stake: { stakedSOL: number }) {
  // Liveness (40%): Commit frequency, recency
  const livenessScore = calculateLiveness(githubData);
  
  // Originality (30%): Stars, forks ratio, contributors
  const originalityScore = calculateOriginality(githubData);
  
  // Assurance (30%): Staked SOL
  const assuranceScore = calculateAssurance(stake);
  
  const totalScore = Math.round(
    livenessScore * 0.4 + 
    originalityScore * 0.3 + 
    assuranceScore * 0.3
  );
  
  return {
    score: totalScore,
    livenessStatus: livenessScore > 70 ? 'active' : 
                   livenessScore > 40 ? 'degraded' : 'dormant',
    breakdown: { liveness: livenessScore, originality: originalityScore, assurance: assuranceScore }
  };
}
```

---

## Mock Implementation (Phase 0)

Since this is Phase 0 without live Supabase database yet, the implementation will use:

1. **localStorage** to persist verification state temporarily
2. **Mock GitHub API responses** for demo purposes
3. **URL parameters** to show verified badge on program detail

The full database integration can be added when Supabase is connected.

---

## Design Consistency

All new components will follow the existing Bloomberg Terminal aesthetic:

| Element | Classes |
|---------|---------|
| Cards | `border-border bg-card border-primary/30` (active) |
| Headers | `font-display text-lg uppercase tracking-tight` |
| Data values | `font-mono text-primary` |
| Trust messaging | `text-muted-foreground text-sm` |
| Buttons | `bg-primary text-primary-foreground` |
| Progress | `bg-primary/20` track, `bg-primary` fill |
| Verified badge | `bg-primary/20 text-primary border-primary/30` |
| Unverified badge | `bg-destructive/20 text-destructive border-destructive/30` |

---

## Secrets Required

Before implementing the GitHub OAuth, these secrets need to be configured:

| Secret | Description |
|--------|-------------|
| `GITHUB_CLIENT_ID` | OAuth App Client ID from GitHub Developer Settings |
| `GITHUB_CLIENT_SECRET` | OAuth App Client Secret (never exposed to frontend) |

I will prompt you to add these secrets when implementing the edge function.

---

## Acceptance Criteria

| Requirement | Implementation |
|-------------|----------------|
| Developer can enter Program ID | Step 1 input with verify button |
| Program is verified on-chain | Mock verification against existing programs |
| GitHub OAuth with read-only scope | `public_repo read:user` scope only |
| Trust messaging displayed | Quote + "Read-Only Access" indicator |
| Progress bar shows verification status | 4-step progress with completion tracking |
| "VERIFIED TITAN" badge on success | Badge displayed on ProgramDetail page |
| "CLAIM PROFILE" CTA for unverified | Link to /claim-profile from program page |

---

## Implementation Order

1. **Types & Utilities**: Add new types and helper functions
2. **ClaimProfile Page**: Create the main claiming interface (mock data)
3. **GitHubCallback Page**: Create callback handler (mock success)
4. **Update Routes**: Add new routes to App.tsx
5. **Update Navigation**: Link "CLAIM MY PROFILE" button
6. **Update ProgramDetail**: Add verified/unverified badges
7. **Edge Function**: Create github-token function (requires secrets)

