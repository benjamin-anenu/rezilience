

# GitHub Repository Submission & Enhanced Dashboard Implementation

## Overview

This plan implements a dual-path GitHub integration for the "Join the Registry" onboarding flow:
1. **Primary Path**: Submit a GitHub repository URL (no OAuth required) - validates and fetches all metrics via public API
2. **Secondary Path**: Connect GitHub account via OAuth (existing flow) - provides private repo access

Additionally, auto-populates form fields from GitHub data and creates a rich dashboard view showing detailed GitHub analytics for project owners.

---

## Current State

| Component | Status |
|-----------|--------|
| GitHub OAuth flow | Working - exchanges code, fetches metrics, stores token |
| `fetch-github` edge function | Working - updates scores for existing projects |
| `SocialsForm.tsx` | Single path - only OAuth connect button |
| `claimed_profiles` table | Has columns for GitHub data but limited fields |
| Dashboard/Profile pages | Shows basic score, missing detailed GitHub stats |

---

## Architecture Design

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ONBOARDING STEP 3: GITHUB                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    OPTION A: SUBMIT REPO URL                          │  │
│  │                      (PRIMARY - RECOMMENDED)                          │  │
│  │                                                                       │  │
│  │  [https://github.com/solana-labs/solana________________] [ANALYZE]   │  │
│  │                                                                       │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░  Analyzing...                    │  │
│  │  ✓ Repository validated                                               │  │
│  │  ✓ Fetching commits...                                                │  │
│  │  ✓ Counting contributors...                                           │  │
│  │  ✓ Calculating score...                                               │  │
│  │                                                                       │  │
│  │  ┌───────────────────────────────────────────────────────────────┐   │  │
│  │  │  ANALYSIS RESULT                                               │   │  │
│  │  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │  │
│  │  │  Score: 87/100          Status: ACTIVE                         │   │  │
│  │  │  Stars: 14,239          Forks: 4,123                          │   │  │
│  │  │  Contributors: 156      Commits (30d): 234                     │   │  │
│  │  │  Language: Rust         Last Push: 2 hours ago                 │   │  │
│  │  └───────────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│                            ─── OR ───                                       │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    OPTION B: CONNECT GITHUB                           │  │
│  │                  (For Private Repos & Better Rate Limits)             │  │
│  │                                                                       │  │
│  │  [🔒 CONNECT GITHUB ACCOUNT]                                          │  │
│  │                                                                       │  │
│  │  "Grants read access to private repositories for enhanced metrics"   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: New Edge Function - `analyze-github-repo`

Create a new edge function that analyzes a GitHub repository URL without requiring OAuth:

**Endpoint**: `POST /functions/v1/analyze-github-repo`

**Request Body**:
```json
{
  "github_url": "https://github.com/solana-labs/solana"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "name": "solana",
    "fullName": "solana-labs/solana",
    "description": "Web-Scale Blockchain for fast, secure...",
    "htmlUrl": "https://github.com/solana-labs/solana",
    "homepage": "https://solana.com",
    "language": "Rust",
    "stars": 14239,
    "forks": 4123,
    "contributors": 156,
    "openIssues": 892,
    "createdAt": "2017-11-16T19:01:44Z",
    "pushedAt": "2026-02-05T12:34:56Z",
    "isFork": false,
    "topics": ["blockchain", "solana", "cryptocurrency"],
    "commitVelocity": 8.5,
    "commitsLast30Days": 234,
    "releasesLast30Days": 3,
    "latestRelease": { "tag": "v1.18.5", "date": "2026-02-01T10:30:00Z" },
    "topContributors": [
      { "login": "alice-dev", "contributions": 234, "avatar": "..." },
      { "login": "bob-dev", "contributions": 156, "avatar": "..." }
    ],
    "recentEvents": [
      { "type": "PushEvent", "actor": "alice-dev", "date": "2026-02-05T10:30:00Z" }
    ],
    "resilienceScore": 87.5,
    "livenessStatus": "ACTIVE",
    "daysSinceLastCommit": 0
  }
}
```

**APIs Called**:
1. `GET /repos/{owner}/{repo}` - Basic repo info
2. `GET /repos/{owner}/{repo}/commits` - Commit history (last 30 days)
3. `GET /repos/{owner}/{repo}/contributors` - Contributor list (top 10)
4. `GET /repos/{owner}/{repo}/releases` - Release history
5. `GET /repos/{owner}/{repo}/stats/commit_activity` - Weekly commit stats
6. `GET /repos/{owner}/{repo}/events` - Recent activity (last 10)

---

### Phase 2: Database Schema Updates

Add new columns to `claimed_profiles` table to store extended GitHub analytics:

```sql
ALTER TABLE claimed_profiles
ADD COLUMN IF NOT EXISTS github_stars integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_forks integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_contributors integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_language varchar,
ADD COLUMN IF NOT EXISTS github_last_commit timestamptz,
ADD COLUMN IF NOT EXISTS github_commit_velocity numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_commits_30d integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_releases_30d integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_open_issues integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_topics jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS github_top_contributors jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS github_recent_events jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS github_is_fork boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS github_homepage varchar;
```

---

### Phase 3: Updated SocialsForm Component

Replace the current single-path GitHub integration with a dual-option interface:

**New Component Structure**:

```text
src/components/claim/
├── SocialsForm.tsx          (Updated - orchestrates both paths)
├── GitHubUrlAnalyzer.tsx    (New - handles URL submission + analysis UI)
├── GitHubConnectButton.tsx  (New - OAuth connect with explanation)
└── GitHubAnalysisResult.tsx (New - displays analysis results)
```

**Key Features**:
- Premium Bloomberg Terminal aesthetic with analysis progress steps
- Real-time progress indicators during API fetching
- Auto-populate project name & description if not already set
- Display comprehensive analysis results before proceeding

---

### Phase 4: Auto-Population Logic

When GitHub data is fetched, automatically populate these form fields if empty:

| GitHub Field | Form Field |
|--------------|------------|
| `name` or `full_name` | `projectName` (if empty) |
| `description` | `description` (if empty) |
| `homepage` | `websiteUrl` (if empty) |
| `language` → category mapping | `category` (if empty) |
| `topics` | Suggest category |

**Language to Category Mapping**:
```javascript
const languageCategoryMap = {
  'Rust': 'infrastructure',
  'Solidity': 'defi',
  'TypeScript': 'developer-tools',
  'JavaScript': 'developer-tools',
  'Python': 'developer-tools',
  'Move': 'infrastructure',
  // Default: 'other'
};
```

---

### Phase 5: Enhanced Dashboard - GitHub Analytics View

When a project owner clicks on their project in the Dashboard, show comprehensive GitHub analytics:

**New Component**: `src/components/dashboard/GitHubAnalyticsCard.tsx`

```text
┌─────────────────────────────────────────────────────────────────────┐
│ GITHUB ANALYTICS                                    [↻ Refresh]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐│
│  │    14,239    │  │    4,123     │  │     156      │  │   234    ││
│  │    Stars     │  │    Forks     │  │ Contributors │  │ Commits  ││
│  │              │  │              │  │              │  │  (30d)   ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘│
│                                                                     │
│  COMMIT VELOCITY                                                    │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░  8.5 commits/week                  │
│                                                                     │
│  TOP CONTRIBUTORS                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 🥇 @alice-dev     234 commits  ████████████████████             ││
│  │ 🥈 @bob-dev       156 commits  █████████████                    ││
│  │ 🥉 @charlie-dev    89 commits  ███████                          ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  RECENT ACTIVITY                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ● PushEvent     @alice-dev      "Fix: reduce RPC latency"   2h  ││
│  │ ● IssuesEvent   @bob-dev        Opened #1234                5h  ││
│  │ ● PushEvent     @charlie-dev    "Feature: validator..."    12h  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  RELEASES (Last 30 Days)                                            │
│  v1.18.5 (Feb 1)  •  v1.18.4 (Jan 25)  •  v1.18.3 (Jan 15)        │
│                                                                     │
│  Last synced: 2 hours ago                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Phase 6: Profile Detail Page Enhancements

Extend `ProfileDetail.tsx` and `ProgramDetail.tsx` to show GitHub analytics to owners:

**Owner Detection**: Check if `user.id === profile.xUserId`

**Owner-Only Section**: "GitHub Insights" card visible only to the profile owner

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/analyze-github-repo/index.ts` | Edge function for public repo analysis |
| `src/components/claim/GitHubUrlAnalyzer.tsx` | URL input + analysis UI with progress steps |
| `src/components/claim/GitHubAnalysisResult.tsx` | Display analysis results card |
| `src/components/dashboard/GitHubAnalyticsCard.tsx` | Detailed GitHub stats for owners |
| `src/hooks/useGitHubAnalysis.ts` | React hook for calling analyze endpoint |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/claim/SocialsForm.tsx` | Dual-path UI (URL submit primary, OAuth secondary) |
| `src/pages/ClaimProfile.tsx` | Handle analysis result, auto-populate fields |
| `src/pages/ProfileDetail.tsx` | Show GitHub analytics to owners |
| `src/hooks/useClaimedProfiles.ts` | Add GitHub fields to transform function |
| `src/types/index.ts` | Extended GitHubData interface |
| `supabase/config.toml` | Add config for new edge function |

---

## Technical Details

### Edge Function: `analyze-github-repo`

```typescript
// Key implementation points:

// 1. Parse and validate GitHub URL
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+)/,
    /github\.com\/([^\/]+)\/([^\/]+)\.git$/,
  ];
  // ... validation
}

// 2. Parallel API fetching for speed
const [repoInfo, commits, contributors, releases, activity] = await Promise.all([
  fetchRepoInfo(owner, repo, token),
  fetchCommits(owner, repo, token),
  fetchContributors(owner, repo, token),
  fetchReleases(owner, repo, token),
  fetchActivity(owner, repo, token),
]);

// 3. Use fallback GITHUB_TOKEN from secrets for rate limits
const githubToken = Deno.env.get("GITHUB_TOKEN"); // 5000 req/hr vs 60/hr

// 4. Handle 404 gracefully for private repos
if (repoResponse.status === 404) {
  return { error: "Repository not found. It may be private - try connecting your GitHub account instead." };
}
```

### Analysis Progress UI

```tsx
const steps = [
  { label: 'Validating Repository', status: 'complete' },
  { label: 'Fetching Commits', status: 'in-progress' },
  { label: 'Counting Contributors', status: 'pending' },
  { label: 'Checking Releases', status: 'pending' },
  { label: 'Calculating Score', status: 'pending' },
];
```

### Auto-Population Flow

```tsx
// In ClaimProfile.tsx
const handleAnalysisComplete = (data: GitHubAnalysisResult) => {
  // Auto-populate empty fields
  if (!projectName && data.name) {
    setProjectName(data.name);
  }
  if (!description && data.description) {
    setDescription(data.description);
  }
  if (!websiteUrl && data.homepage) {
    setWebsiteUrl(data.homepage);
  }
  if (!category && data.language) {
    const suggestedCategory = languageCategoryMap[data.language] || 'other';
    setCategory(suggestedCategory);
  }
  
  // Store full analysis data for later use
  setGithubAnalysis(data);
};
```

---

## User Flow Summary

1. User reaches Step 3 (Verify/Socials)
2. **Primary Option**: Paste GitHub repo URL → Click "ANALYZE"
3. System shows progress steps while fetching data
4. Analysis results displayed in premium card format
5. Form fields auto-populated from GitHub data
6. User can proceed to Step 4 (or optionally use OAuth for private repos)
7. On final submit, all GitHub data saved to `claimed_profiles`
8. In Dashboard, owner sees full GitHub analytics for their projects

---

## Rate Limit Considerations

| Scenario | Rate Limit | Mitigation |
|----------|------------|------------|
| Unauthenticated | 60/hr | Use `GITHUB_TOKEN` secret |
| With `GITHUB_TOKEN` | 5,000/hr | Sufficient for ~1000 analyses/hr |
| User OAuth token | 5,000/hr per user | Best for private repos |

The system uses the `GITHUB_TOKEN` secret (already configured) as fallback for all public repo analyses, ensuring consistent rate limits.

