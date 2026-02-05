

# Comprehensive Pre-Production Audit: Phase 0 MVP + GitHub OAuth Integration

---

## 1. Coverage & Intent Validation

### Original Intent & Requirements (from Phase 0 Spec)

| Requirement | Status | Notes |
|-------------|--------|-------|
| **GitHub OAuth login** | PARTIAL | Real OAuth exists but X (Twitter) is primary auth; GitHub is secondary for verification only |
| **Supabase setup + schema** | COMPLETE | Tables: `projects`, `score_history`, `bonds`, `claimed_profiles` |
| **Basic project CRUD** | COMPLETE | Submit via edge function, read via hooks |
| **Scoring Algorithm** | COMPLETE | Exponential decay formula implemented |
| **Daily score refresh job** | NOT IMPLEMENTED | Manual trigger only via `fetch-github` edge function |
| **Explorer/Leaderboard** | COMPLETE | Real-time filtering by status and verification |
| **Project detail pages** | COMPLETE | With GitHub + claimed profile data |
| **Manual project claims** | COMPLETE | 5-step claim flow with GitHub OAuth |
| **Score history graph** | PARTIAL | `UpgradeChart` component exists but relies on `score_history` data |

### Formula Implementation Comparison

**Spec Formula:**
```
R(P,t) = (O × I) × e^(-λ × t) + S
```

**Implementation (fetch-github/index.ts):**
```typescript
const originality = isFork ? 0.7 : 1.0;  // Spec says 0.3 for forks
const intensity = velocityScore + contributorScore + starScore;
const lambda = 0.02;  // Spec says 0.05/month
const decayFactor = Math.exp(-lambda * daysSinceCommit);
const stakingBonus = Math.min(Math.log10(totalStaked + 1) * 3, 15);
const baseScore = (originality * intensity) * decayFactor;
const finalScore = baseScore + stakingBonus;
```

**DISCREPANCY FOUND:**
- Fork penalty: `0.7` (implementation) vs `0.3` (spec) - Inconsistent
- Decay λ: `0.02` per day (implementation) vs `0.05` per month (spec) - Different units!
- Two different edge functions use different fork penalties: `fetch-github` uses `0.7`, `github-oauth-callback` uses `0.3`

---

## 2. Reverse-Engineering Check: User Journeys

### Journey A: Submit a New Project

```text
User → /submit → Fill form → Calls add-project edge function → Insert into projects table
                                                              ↓
                                       MISSING: Does NOT trigger fetch-github to populate metrics
                                       Result: Project saved with score=0, liveness=STALE
```

**ISSUE:** Projects are inserted but GitHub data is never fetched automatically. The user sees a blank score until someone manually triggers `fetch-github`.

### Journey B: Claim a Profile (Join the Registry)

```text
User → /claim-profile → X Auth → 5-step form → GitHub OAuth redirect
                                                      ↓
                                   GitHub callback → github-oauth-callback edge function
                                                      ↓
                                   Fetches repo metrics → Calculates score → Upserts claimed_profiles
                                                      ↓
                                   Redirects to /profile/:id?verified=true
```

**ISSUE:** The `ProfileDetail.tsx` loads profile from `localStorage`, NOT from the database! This means:
- Data is device-specific
- No persistence across browsers/devices
- Database stores the profile but UI never reads it

### Journey C: View Explorer Leaderboard

```text
User → /explorer → useProjects hook → Fetches from projects table
                                              ↓
                   Filters by verification status → Displays ProgramLeaderboard
```

**ISSUE:** The `verified` field in `projects` table is separate from `claimed_profiles.verified`. There's no link between them. A claimed profile doesn't update the `projects` table's `verified` flag.

---

## 3. Edge Cases & Failure Scenarios

### Critical Edge Cases

| Scenario | Current Behavior | Risk Level |
|----------|-----------------|------------|
| **Empty projects table** | Shows "No Programs Yet" empty state | OK |
| **GitHub OAuth cancelled** | Error shown, user can retry | OK |
| **GitHub OAuth without VITE_GITHUB_CLIENT_ID** | Silent failure, console log only | HIGH |
| **GitHub API rate limit exceeded** | Generic error, no retry logic | MEDIUM |
| **Invalid GitHub URL format** | Silently skipped in fetch-github | MEDIUM |
| **GitHub repo is private** | 404 error, no user feedback | HIGH |
| **No stored GITHUB_TOKEN in env** | Falls back but may hit rate limits | MEDIUM |
| **claimed_profiles upsert conflict** | Overwrites existing profile | HIGH |
| **Duplicate program_id submission** | Returns 409 conflict properly | OK |
| **User submits project without GitHub URL** | Score remains 0 forever | HIGH |
| **Network failure during OAuth** | Generic error, loses form data | MEDIUM |
| **CSRF state mismatch** | Proper validation exists | OK |

### Data Integrity Risks

1. **`claimed_profiles.project_id` FK not enforced**: The column references nothing, orphaned profiles possible
2. **Score drift**: Two scoring functions with different parameters will produce different scores for same data
3. **Token storage**: `github_access_token` stored in plain text (not encrypted)

---

## 4. Touchpoints & User Journey Coherence

### Broken Transitions

1. **Submit → Explorer**: User submits project, it appears with score 0. No automatic scoring.
2. **Claim → Profile View**: Profile saved to DB but loaded from localStorage. Will show "Not Found" on different devices.
3. **Explorer → Program Detail**: Works correctly for database projects.
4. **Program Detail → Verified Data**: Attempts to find claimed profile in localStorage, not DB.

### Missing Connections

- `projects.verified` is never set to `true` by the claim flow
- `claimed_profiles.project_id` is never linked to `projects.id`
- No way to view claimed profiles from Explorer (they're separate entities)

---

## 5. Frontend Review

### UI States Analysis

| Page | Loading | Success | Error | Empty | Retry |
|------|---------|---------|-------|-------|-------|
| Explorer | Skeleton | Table | Error card | Empty state | Manual refresh |
| Submit | Button spinner | Success redirect | Toast | N/A | Retry button |
| Claim | Loader spinner | Redirect | Toast | N/A | Manual |
| GitHub Callback | Animated dots | Success message | Error card + buttons | N/A | Retry button |
| Profile Detail | "Loading..." | Profile card | "Not found" link | N/A | N/A |
| Program Detail | Skeleton | Full UI | "Not found" + CTA | N/A | N/A |

### UX Issues

1. **ClaimProfile Step 3**: `canProceedFromStep3` requires `githubOrgUrl.trim()` but user can also click "Complete Verification" on Step 5 without GitHub URL validation
2. **ProfileDetail.tsx (line 41-53)**: Loads from `localStorage.getItem('verifiedPrograms')` - data is ephemeral
3. **Missing GitHub OAuth error handling**: If `VITE_GITHUB_CLIENT_ID` is missing, `handleGitHubConnect` logs error but doesn't show user feedback
4. **Score display inconsistency**: `ProgramLeaderboard` uses `Math.round()`, `ProfileDetail` shows `score/100`

---

## 6. Backend Review

### Edge Function Analysis

**fetch-github/index.ts**
```typescript
// SECURITY: Uses service role key - OK for backend
// ISSUE: No idempotency - running twice inserts duplicate score_history
// ISSUE: No rate limiting protection
// ISSUE: Catch blocks swallow errors silently
```

**github-oauth-callback/index.ts**
```typescript
// SECURITY: verify_jwt = false (required for OAuth callback)
// SECURITY: Token stored in plain text in database
// ISSUE: No duplicate profile detection - upsert on ID can overwrite
// ISSUE: Profile ID is generated as `profile_${Date.now()}_${githubUser.id}` 
//        - if user claims twice, creates new profile each time
```

**add-project/index.ts**
```typescript
// SECURITY: Uses service role key
// ISSUE: Does not trigger fetch-github after insert
// ISSUE: No validation that program_id is real Solana address
```

### RLS Policy Review

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `projects` | public read | NO | NO | NO |
| `claimed_profiles` | claimer OR verified | with claimer_wallet | claimer only | NO |
| `score_history` | public read | NO | NO | NO |
| `bonds` | public read | NO | NO | NO |

**CRITICAL:** Edge functions use `SUPABASE_SERVICE_ROLE_KEY` bypassing RLS. This is correct for backend operations but:
- Any exposed endpoint could write to any table
- `github-oauth-callback` can create profiles for any wallet

---

## 7. Churn & Risk Assessment

### HIGH CHURN RISK

1. **"Profile not found" after claiming**
   - User completes 5-step claim, sees success, closes browser
   - Returns next day → Profile shows "Not found"
   - Root cause: localStorage-only storage for UI

2. **Zero score after project submission**
   - User submits valid project with GitHub URL
   - Score shows 0, liveness shows STALE
   - No automatic scoring trigger exists
   
3. **GitHub OAuth fails silently**
   - VITE_GITHUB_CLIENT_ID not configured
   - Button does nothing, console error only

### MEDIUM CHURN RISK

4. **Inconsistent scores**
   - Two functions calculate differently (λ=0.02 vs spec's 0.05)
   - Fork penalty: 0.7 vs 0.3

5. **Private repo handling**
   - User enters private repo URL
   - Gets generic error, no helpful message

6. **No automatic score refresh**
   - Scores become stale
   - No cron/scheduled job implemented

### LOW CHURN RISK

7. **Token stored unencrypted** - Security concern but doesn't affect UX
8. **No pagination** - Will matter at scale

---

## 8. Final Verdict

### Readiness Assessment: **NOT READY**

The implementation has significant gaps between what is stored in the database and what is displayed in the UI. The core functionality is present but disconnected.

---

## Mandatory Fixes (Blocking Production)

| Priority | Issue | Fix Required |
|----------|-------|--------------|
| P0 | ProfileDetail reads from localStorage, not DB | Change to fetch from `claimed_profiles` table |
| P0 | ProgramDetail reads claimed profiles from localStorage | Change to fetch from `claimed_profiles` table |
| P0 | Projects submitted never get scored | Trigger `fetch-github` after `add-project` |
| P0 | Claimed profiles don't link to projects table | Add `project_id` FK or update `projects.verified` |
| P1 | GitHub OAuth missing error UI | Show user feedback when `VITE_GITHUB_CLIENT_ID` is missing |
| P1 | Scoring formula inconsistencies | Unify λ=0.05/month (convert to days), fork penalty to 0.3 |
| P1 | Duplicate claims overwrite profiles | Check for existing profile before insert |

## Nice-to-Have Improvements

| Priority | Improvement |
|----------|-------------|
| P2 | Add scheduled score refresh (pg_cron or scheduled edge function) |
| P2 | Encrypt `github_access_token` before storage |
| P2 | Add retry logic for GitHub API failures |
| P2 | Add pagination to Explorer for scale |
| P3 | Add real-time subscription for live leaderboard updates |
| P3 | Add private repo detection with helpful error message |

---

## Architecture Fix Diagram

```text
CURRENT STATE (Broken):

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Submit    │───▶│  projects   │    │   claimed   │
│   Project   │    │  (score=0)  │    │  _profiles  │
└─────────────┘    └─────────────┘    └─────────────┘
                          ▲                   ▲
                          │ (never called)    │
                          │                   │
                   fetch-github          github-oauth
                                              │
                                    stored in localStorage
                                              ▼
                                    ┌─────────────────┐
                                    │ ProfileDetail   │
                                    │ (broken read)   │
                                    └─────────────────┘


REQUIRED STATE (Fixed):

┌─────────────┐    ┌─────────────┐
│   Submit    │───▶│  projects   │◀──────┐
│   Project   │    │  (scored)   │       │
└─────────────┘    └─────────────┘       │ link via project_id
       │                  ▲               │ or update verified flag
       │                  │               │
       ▼                  │         ┌─────────────┐
  fetch-github ───────────┘         │   claimed   │
  (auto-trigger)                    │  _profiles  │
                                    └─────────────┘
                                          ▲
                                          │
                                    github-oauth
                                          │
                                    ┌─────────────────┐
                                    │ ProfileDetail   │
                                    │ (DB read)       │
                                    └─────────────────┘
```

---

## Summary

The Phase 0 MVP infrastructure exists but critical data flows are broken. The claim flow writes to the database but reads from localStorage. Project submissions don't trigger scoring. The system will frustrate users with "Profile not found" errors and stale scores.

**Estimated effort to reach production-ready:** 8-12 hours of focused work on the P0/P1 fixes above.

