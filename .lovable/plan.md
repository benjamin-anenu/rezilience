

## Fix Stale Score + Add New Scoring Signals to Dashboard

### Problem 1: Score Stuck at 47/100

The `analyze-github-repo` function correctly computes 63 with the new formula, but it only writes raw GitHub metrics (commits, PRs, issues, etc.) to the database. The `resilience_score` column is exclusively written by the `refresh-all-profiles` pipeline, which was never re-triggered after the formula change.

**Fix:** Trigger the `refresh-all-profiles` function for your profile with `dimensions=github,dependencies` to force a full recalculation using the new GitHub scoring formula.

### Problem 2: Dashboard Missing New Scoring Signals

The `GitHubAnalyticsCard` (owner dashboard) and `PublicGitHubMetrics` (public profile) currently show Stars, Forks, Contributors, Commits, Releases, and Commit Velocity -- but do not surface **PR Velocity** or **Issue Responsiveness**, which are now key scoring dimensions worth 15 combined points.

**Fix:** Add two new metric tiles to both components showing PR and Issue activity with visual indicators of their scoring tier.

### Technical Changes

**1. Trigger score recalculation**
- Call `refresh-all-profiles` with `profile_id` and `dimensions: ["github"]` to force the integrated score to recompute using the updated GitHub formula.

**2. `src/components/dashboard/GitHubAnalyticsCard.tsx`**
- Add `github_push_events_30d`, `github_pr_events_30d`, and `github_issue_events_30d` to the interface
- Add two new metric tiles after the existing grid:
  - **PR Velocity**: Shows PR count with scoring tier label (e.g., "8/8 pts" or "0/8 pts")
  - **Issue Responsiveness**: Shows issue event count with scoring tier label
- Add an "Activity Signals" breakdown section (similar to PublicGitHubMetrics) showing push, PR, issue, and commit bars

**3. `src/components/program/PublicGitHubMetrics.tsx`**
- Add two new tiles to the secondary metrics row:
  - **PRs (30d)** with GitPullRequest icon
  - **Issues (30d)** with MessageSquare icon
- These are already imported and the data fields already exist in the analytics object -- just need to be displayed as metric tiles

### Expected Outcome
- Score updates from 47 to ~63 (or slightly different based on dependency score and decay)
- Builders see exactly which scoring signals they're missing (PR Velocity: 0/8, Issue Responsiveness: 0/7)
- Clear path to improvement becomes visible in the dashboard
