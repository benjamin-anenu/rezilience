

## Remove Stars and Releases from GitHub Scoring Formula

### What Changes

Stars and Releases are removed entirely as scoring dimensions. Their 25 points are redistributed to three activity-quality metrics that directly measure builder resilience.

### New Point Allocation

| Dimension | Old Max | New Max | Rationale |
|-----------|---------|---------|-----------|
| Weighted Activity (pushes, PRs, issues) | 40 | **45** | Core signal of builder effort |
| Contributor Diversity | 20 | **20** | Unchanged |
| ~~Releases~~ | ~~15~~ | **0** | Removed -- penalizes continuous deployers |
| ~~Stars/Popularity~~ | ~~10~~ | **0** | Removed -- vanity metric, easily gamed |
| Project Age | 10 | **10** | Unchanged |
| Commit Consistency | 5 | **10** | Doubled -- rewards daily shipping discipline |
| PR Velocity Bonus (NEW) | 0 | **8** | Rewards code review culture and merge throughput |
| Issue Responsiveness (NEW) | 0 | **7** | Rewards projects that engage with bug reports and feedback |
| **Total** | **100** | **100** | |

### New Dimensions Explained

**PR Velocity Bonus (0-8 pts):** Measures pull request activity in the last 30 days. PRs indicate code review, collaboration readiness, and structured development -- even for solo builders who use PRs for self-review.
- 15+ PRs: 8 pts
- 8+ PRs: 6 pts
- 3+ PRs: 4 pts
- 1+ PRs: 2 pts

**Issue Responsiveness (0-7 pts):** Measures issue and issue-comment activity in the last 30 days. Projects that engage with issues demonstrate accountability and community responsiveness.
- 20+ issue events: 7 pts
- 10+ issue events: 5 pts
- 5+ issue events: 3 pts
- 1+ issue events: 1 pt

**Commit Consistency (expanded 0-10 pts):** Rewards sustained daily work rather than burst commits.
- 25+ active days: 10 pts
- 20+ active days: 8 pts
- 15+ active days: 6 pts
- 10+ active days: 4 pts
- 5+ active days: 2 pts

### Weighted Activity Adjustment

Remove `releasesLast30Days * 10.0` from the weighted activity formula since releases are no longer a scoring input. The formula becomes:
```
weightedActivity = (pushEvents * 1.0) + (prEvents * 2.5) + (issueEvents * 0.5)
```

Activity tiers expanded to 0-45 range with adjusted thresholds.

### Technical Changes

**`supabase/functions/analyze-github-repo/index.ts`:**
- Remove the Releases scoring block (lines 358-361)
- Remove the Stars/Popularity scoring block (lines 363-367)
- Remove `releasesLast30Days * 10.0` from weighted activity calculation
- Expand Weighted Activity tiers from 0-40 to 0-45
- Expand Commit Consistency from 0-5 to 0-10 with more granular tiers
- Add PR Velocity Bonus block (0-8 pts) using existing `prEvents30d`
- Add Issue Responsiveness block (0-7 pts) using existing `issueEvents30d`

No frontend changes needed. No database changes needed. Stars/forks/releases data continues to be collected and displayed in the UI -- they just no longer influence the score.

### Expected Impact

For your profile (solo builder, ~300 push events, ~0 PRs, ~0 issues, daily commits):
- **Before**: 40 (activity) + 8 (solo bonus) + 0 (releases) + 0 (stars) + 5 (age) + 5 (consistency) = **58**/100
- **After**: 45 (activity) + 8 (solo bonus) + 5 (age) + 10 (consistency) + 0 (PRs) + 0 (issues) = **68**/100

The score rises because you're no longer penalized for missing vanity metrics. It also creates a clear path to 80+: start using PRs and engaging with issues.

