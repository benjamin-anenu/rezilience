

# X (Twitter) Authentication + Flexible Claim Profile Flow

## Overview
Implement X (Twitter) OAuth as the primary authentication layer. Users must sign in with X before claiming their profile. After authentication, they can optionally link a Program ID or Wallet, but GitHub connection remains required for scoring.

---

## New User Flow

```text
User clicks "CLAIM MY PROFILE"
            ↓
┌─────────────────────────────────────┐
│      SIGN IN WITH X (Required)      │
│   "X is your identity layer"        │
│   [𝕏 SIGN IN WITH X button]         │
└─────────────────────────────────────┘
            ↓
       /x-callback
            ↓
     User authenticated
            ↓
┌─────────────────────────────────────┐
│    CLAIM YOUR PROTOCOL              │
│                                     │
│  ┌─────────────┐ ┌─────────────┐   │
│  │ Program ID  │ │   Wallet    │   │
│  │ (OPTIONAL)  │ │ (OPTIONAL)  │   │
│  └─────────────┘ └─────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    GitHub (REQUIRED)        │   │
│  │    [CONNECT GITHUB]         │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
            ↓
      /github-callback
            ↓
   Score Calculated → VERIFIED TITAN
```

---

## Files to Create

### 1. `src/context/AuthContext.tsx`
Authentication context for managing X OAuth state:
- `user` - Current authenticated user (X profile)
- `loading` - Auth loading state
- `isAuthenticated` - Boolean check
- `signInWithX()` - Initiate OAuth flow
- `signOut()` - Clear session

### 2. `src/pages/XCallback.tsx`
X OAuth callback handler:
- Receive authorization code from X
- Exchange for token (mock in Phase 0)
- Create/update user session in localStorage
- Redirect to `/claim-profile` or `/dashboard`

### 3. `src/pages/Dashboard.tsx`
Authenticated user dashboard:
- Display X profile (avatar, username)
- List verified projects
- Quick actions: Claim Protocol, Explore

---

## Files to Modify

### 1. `src/App.tsx`
- Wrap app with `AuthProvider`
- Add `/x-callback` and `/dashboard` routes
- Add protected route wrapper for authenticated pages

### 2. `src/pages/ClaimProfile.tsx`
Complete redesign:
- Check auth state first - redirect to sign in if not authenticated
- Show 3 cards: Program ID (optional), Wallet (optional), GitHub (required)
- Wallet uses existing `useWallet()` from Solana adapter
- "OPTIONAL" and "REQUIRED" badges on cards
- GitHub always visible (not gated behind program verification)

### 3. `src/pages/GitHubCallback.tsx`
- Handle claims with or without Program ID
- Handle claims with or without Wallet address
- Store X user ID with claimed profile

### 4. `src/components/layout/Navigation.tsx`
- Show user avatar + username when authenticated
- "Sign Out" button for authenticated users
- "SIGN IN" button for unauthenticated users
- Conditional nav links based on auth state

### 5. `src/types/index.ts`
Add new types:
- `XUser` interface (id, username, avatar_url)
- `AuthState` interface
- Update `ClaimedProfile` to include `xUserId` and make `programId` optional

---

## Technical Implementation

### AuthContext Structure
```tsx
interface XUser {
  id: string;
  username: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: XUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithX: () => void;
  signOut: () => void;
}

// Check localStorage for existing session on mount
useEffect(() => {
  const storedUser = localStorage.getItem('x_user');
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
  setLoading(false);
}, []);
```

### X OAuth Flow (Mock for Phase 0)
```tsx
const signInWithX = () => {
  // Phase 0: Mock OAuth - go directly to callback
  // In production: redirect to X OAuth URL
  window.location.href = '/x-callback?code=mock_x_auth_code';
};
```

### ClaimProfile UI Structure
```tsx
{/* Auth Check */}
{!isAuthenticated && <SignInPrompt />}

{isAuthenticated && (
  <>
    {/* Optional Identifiers */}
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      {/* Program ID Card */}
      <Card>
        <Badge>OPTIONAL</Badge>
        <Input placeholder="Solana Program ID..." />
        <Button>VERIFY PROGRAM</Button>
        <p>Skip if you're not claiming a specific program</p>
      </Card>
      
      {/* Wallet Card */}
      <Card>
        <Badge>OPTIONAL</Badge>
        <WalletMultiButton />
        <p>Link your wallet for on-chain identity</p>
      </Card>
    </div>

    {/* Required: GitHub */}
    <Card className="border-primary">
      <Badge variant="primary">REQUIRED</Badge>
      <Quote>"IN AN OPEN-SOURCE WORLD, PRIVACY IS ROT."</Quote>
      <TrustMessage>Read-Only Access...</TrustMessage>
      <Button>CONNECT GITHUB</Button>
    </Card>
  </>
)}
```

### Navigation Auth Display
```tsx
{isAuthenticated ? (
  <div className="flex items-center gap-3">
    <img src={user.avatarUrl} className="h-8 w-8 rounded-full" />
    <span>@{user.username}</span>
    <Button variant="ghost" onClick={signOut}>
      <LogOut className="h-4 w-4" />
    </Button>
  </div>
) : (
  <Button asChild>
    <Link to="/claim-profile">SIGN IN</Link>
  </Button>
)}
```

---

## Verification Steps Update

Old flow (4 steps):
1. Program Claimed
2. GitHub Connected
3. Data Indexed
4. Score Calculated

New flow (4 steps):
1. X Authenticated (auto-complete on page load)
2. Identity Linked (optional - program or wallet)
3. GitHub Connected (required)
4. Score Calculated

---

## UX Improvements to Keep

From previous plan, these will be maintained:
- "OPTIONAL" and "REQUIRED" badges with distinct styling
- Trust messaging with "Read-Only Access" indicator
- Quote: "IN AN OPEN-SOURCE WORLD, PRIVACY IS ROT."
- Progress bar showing verification status
- Data Provenance notice at bottom
- "VERIFIED TITAN" badge on successful verification

---

## Design Details

### Badge Styling
```tsx
// Optional badge (muted)
<span className="rounded-sm bg-muted px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
  OPTIONAL
</span>

// Required badge (primary)
<span className="rounded-sm bg-primary/20 px-2 py-0.5 text-[10px] font-mono uppercase text-primary">
  REQUIRED
</span>
```

### X Sign-In Button
```tsx
<Button className="w-full bg-black text-white hover:bg-black/90">
  <span className="mr-2 text-xl">𝕏</span>
  SIGN IN WITH X
</Button>
```

### User Avatar in Nav
```tsx
<div className="flex items-center gap-2">
  <img 
    src={user.avatarUrl} 
    alt={user.username}
    className="h-7 w-7 rounded-full border border-primary/30"
  />
  <span className="font-mono text-sm text-muted-foreground">
    @{user.username}
  </span>
</div>
```

---

## Mock Data for Phase 0

Since no backend yet, X authentication will use mock data:

```tsx
// Mock X user on successful "OAuth"
const mockXUser: XUser = {
  id: 'x_mock_' + Date.now(),
  username: 'verified_builder',
  avatarUrl: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
};

// Store in localStorage
localStorage.setItem('x_user', JSON.stringify(mockXUser));
```

---

## Implementation Order

1. **Types**: Add `XUser` and update `ClaimedProfile`
2. **AuthContext**: Create auth context with mock X OAuth
3. **XCallback**: Create callback page (mock success)
4. **Update App.tsx**: Add AuthProvider and new routes
5. **Update Navigation**: Add auth-aware UI
6. **Redesign ClaimProfile**: X auth check + optional/required cards
7. **Update GitHubCallback**: Handle flexible claim data
8. **Dashboard**: Create authenticated user dashboard (optional)

---

## Secrets Required (Future)

When connecting real X OAuth:
- `X_CLIENT_ID` - OAuth App Client ID from X Developer Portal
- `X_CLIENT_SECRET` - OAuth App Client Secret

For Phase 0, these are not needed as we use mock authentication.

---

## Acceptance Criteria

| Requirement | Implementation |
|-------------|----------------|
| X sign-in required first | Auth check on ClaimProfile page |
| Mock X OAuth for Phase 0 | Direct redirect to /x-callback with mock code |
| Program ID is optional | Card with "OPTIONAL" badge, skip allowed |
| Wallet is optional | Card with "OPTIONAL" badge, uses existing adapter |
| GitHub is required | Card with "REQUIRED" badge, highlighted styling |
| User displayed in nav | Avatar + @username when authenticated |
| Sign out functionality | Clear localStorage, redirect to home |
| Trust messaging preserved | Quote + Read-Only Access indicator |
| Progress bar updated | 4-step flow with new labels |

