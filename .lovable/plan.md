

# Track Multi-Signal Activity for Accurate Liveness

## Problem Analysis

The current system uses **only commits to the default branch** to determine liveness:

```typescript
// Current logic (analyze-github-repo line 102):
fetchWithAuth(`/repos/${owner}/${repo}/commits?since=${sinceDate}&per_page=100`, githubToken)
```

This misses active development happening on:
- Feature branches (push events to non-main branches)
- Pull requests (open PRs indicate active work)
- Issues (bug fixes, feature planning)
- Code reviews (collaborative development)

**Your scenario**: Actively pushing to GitHub, but liveness shows "DECAYING" because no commits landed on main/default branch recently.

---

## Available GitHub Signals

| Signal | API Endpoint | What It Captures |
|--------|--------------|------------------|
| **PushEvents** | `/repos/{owner}/{repo}/events` | ALL pushes to ANY branch |
| **Commits (default)** | `/repos/{owner}/{repo}/commits` | Only default branch commits |
| **Pull Requests** | `/repos/{owner}/{repo}/pulls?state=all` | Open/merged PRs |
| **Issues** | `/repos/{owner}/{repo}/issues?state=all` | Bug reports, features |
| **Events Stream** | `/repos/{owner}/{repo}/events` | Last 90 days of ALL activity |

The **Events API** already captures push events to ALL branches - we just need to utilize it better!

---

## Solution: Multi-Signal Activity Score

### Phase 1: Parse Existing Events Data

We already fetch `/events` - enhance parsing to extract activity signals:

```typescript
// Count different activity types from events
const pushEvents = events.filter(e => e.type === 'PushEvent');
const prEvents = events.filter(e => e.type === 'PullRequestEvent');
const issueEvents = events.filter(e => e.type === 'IssuesEvent');
const reviewEvents = events.filter(e => e.type === 'PullRequestReviewEvent');

// Get most recent activity of ANY type
const latestActivity = events.length > 0 
  ? new Date(events[0].created_at) 
  : new Date(repoData.pushed_at);
```

### Phase 2: Add New Database Fields

| Field | Type | Description |
|-------|------|-------------|
| `github_push_events_30d` | integer | Push events (all branches) in last 30 days |
| `github_pr_events_30d` | integer | PR open/merge/close events in last 30 days |
| `github_issue_events_30d` | integer | Issue events in last 30 days |
| `github_last_activity` | timestamp | Most recent activity of ANY type |

### Phase 3: Update Liveness Calculation

**Current** (Commits-only):
```typescript
if (daysSinceLastCommit < 30 && commitsLast30Days >= 5) {
  return 'ACTIVE';
} else if (daysSinceLastCommit < 90) {
  return 'STALE';
}
return 'DECAYING';
```

**Proposed** (Multi-signal):
```typescript
// Calculate days since ANY activity (pushes, PRs, issues, etc.)
const daysSinceLastActivity = daysSince(latestActivityDate);

// Total activity score from all signals
const totalActivity = pushEvents30d + (prEvents30d * 2) + issueEvents30d + commitsLast30Days;

if (daysSinceLastActivity < 14 && totalActivity >= 5) {
  return 'ACTIVE';
} else if (daysSinceLastActivity < 45) {
  return 'STALE';
}
return 'DECAYING';
```

**Weighted scoring**:
- Push events: 1x (any branch activity counts)
- PR events: 2x (PRs = significant work)
- Issue events: 1x (planning/triage activity)
- Commits (default branch): 1x (still valuable)

---

## Implementation Files

| File | Changes |
|------|---------|
| `supabase/functions/analyze-github-repo/index.ts` | Parse events for activity types, calculate `last_activity` |
| Database migration | Add `github_push_events_30d`, `github_last_activity` columns |
| `src/lib/resilience-scoring.ts` | Use multi-signal activity for liveness |
| `src/components/program/PublicGitHubMetrics.tsx` | Display activity breakdown |

---

## Visual Result

After implementation, your profile would show:

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│ LIVENESS STATUS: ACTIVE                                                        │
├────────────────────────────────────────────────────────────────────────────────┤
│ Activity (Last 30 Days)                                                        │
│                                                                                │
│  Push Events (all branches)  ████████████████████████  12                      │
│  Pull Requests               ██████████████░░░░░░░░░░   5                      │
│  Commits (main)              ░░░░░░░░░░░░░░░░░░░░░░░░   0                      │
│  Issues                      ████████░░░░░░░░░░░░░░░░   3                      │
│                                                                                │
│  Last Activity: 2 hours ago (PushEvent to feature/new-ui)                      │
└────────────────────────────────────────────────────────────────────────────────┘
```

Instead of "DECAYING" because no main branch commits, you'd correctly show "ACTIVE" based on real development activity!

---

## Edge Cases

1. **Private repos**: Events API respects repo visibility - works with OAuth token
2. **Rate limits**: Events API shares GitHub's rate limit pool - already handled
3. **90-day window**: GitHub Events API only returns last 90 days - sufficient for liveness
4. **Empty repos**: Fall back to `pushed_at` timestamp if no events

---

## Summary

| Current Approach | Proposed Approach |
|------------------|-------------------|
| Commits to default branch only | All push events + PRs + Issues |
| `github_last_commit` for decay | `github_last_activity` (any event) |
| 5+ commits/30d = ACTIVE | 5+ total activities/30d = ACTIVE |
| Misses feature branch work | Captures ALL repository activity |

This accurately reflects real development patterns - builders working on feature branches, opening PRs, and triaging issues should NOT show as "DECAYING"!

