
# Add Top Contributors Display to Public GitHub Metrics

## Problem

The public `PublicGitHubMetrics` component only displays a contributor **count** (e.g., "3 Contributors"), but the data for individual contributor profiles is already available in the database:

```json
{
  "github_top_contributors": [
    {
      "login": "benjamin-anenu",
      "contributions": 1,
      "avatar": "https://avatars.githubusercontent.com/u/219320147?v=4"
    }
  ]
}
```

The owner dashboard (`GitHubAnalyticsCard`) shows this rich data, but public visitors cannot see it.

---

## Solution

Add a **Top Contributors** section to `PublicGitHubMetrics.tsx` that displays:
- Contributor avatars (clickable to GitHub profile)
- GitHub usernames
- Contribution counts with progress bars
- Ranking medals (gold, silver, bronze)

---

## Visual Design

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ GITHUB METRICS                               [ACTIVE]     [View Repository] │
├─────────────────────────────────────────────────────────────────────────────┤
│  ... existing metrics grid ...                                              │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ TOP CONTRIBUTORS                                                      │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │ 🥇 [avatar] @benjamin-anenu         ████████████████████████  12 commits│
│  │ 🥈 [avatar] @alice-dev              ███████████████░░░░░░░░░   8 commits│
│  │ 🥉 [avatar] @bob-builder            ████████░░░░░░░░░░░░░░░░   5 commits│
│  │    [avatar] @carol-coder            ███░░░░░░░░░░░░░░░░░░░░░   2 commits│
│  │    [avatar] @david-designer         ██░░░░░░░░░░░░░░░░░░░░░░   1 commit │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ... existing topics and footer ...                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Access Existing Data

The `github_top_contributors` field is already in the `GitHubAnalytics` interface and passed to the component:

```typescript
interface GitHubAnalytics {
  // ... existing fields
  github_top_contributors?: Array<{
    login: string;
    contributions: number;
    avatar: string;
  }>;
}
```

### 2. Add Contributors Section

Add a new section after the velocity bar and before the topics section:

```typescript
{/* Top Contributors */}
{analytics?.github_top_contributors && analytics.github_top_contributors.length > 0 && (
  <div className="space-y-2">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
      Top Contributors
    </span>
    <div className="space-y-2 rounded-sm border border-border bg-muted/30 p-3">
      {analytics.github_top_contributors.slice(0, 5).map((contributor, index) => {
        const maxContributions = analytics.github_top_contributors?.[0]?.contributions || 1;
        const percentage = (contributor.contributions / maxContributions) * 100;
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

        return (
          <div key={contributor.login} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {medal && <span className="text-sm">{medal}</span>}
                <a
                  href={`https://github.com/${contributor.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <img
                    src={contributor.avatar}
                    alt={contributor.login}
                    className="h-5 w-5 rounded-full"
                  />
                  <span className="font-mono text-xs">@{contributor.login}</span>
                </a>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {contributor.contributions} {contributor.contributions === 1 ? 'commit' : 'commits'}
              </span>
            </div>
            <Progress value={percentage} className="h-1" />
          </div>
        );
      })}
    </div>
  </div>
)}
```

### 3. Style Consistency

The design will match the existing Bloomberg Terminal aesthetic:
- Muted background container with border
- Mono font for usernames and numbers
- Progress bars showing relative contribution weight
- Medal emojis for top 3 contributors
- Clickable links to GitHub profiles

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/program/PublicGitHubMetrics.tsx` | Add Top Contributors section after velocity bar |

---

## Edge Cases Handled

1. **No contributors data**: Section is hidden if `github_top_contributors` is empty or undefined
2. **Single contributor**: Shows that contributor at 100% with gold medal
3. **Many contributors**: Limits display to top 5 (already sliced in edge function)
4. **Avatar loading errors**: Could add `onError` fallback to a default avatar

---

## Result

After implementation, public visitors will be able to see:
- Who is actively building the project
- Relative contribution levels
- Direct links to contributor GitHub profiles
- This provides transparency and trust signals for potential users/stakers
