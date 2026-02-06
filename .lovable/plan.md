
# Enhanced Program Detail Page with Public GitHub Analytics & Chart Switcher

## Overview

This plan adds two key features to the Program Detail page (Explorer → project details):

1. **Public GitHub Analytics Display** - Show the same rich GitHub data from the owner dashboard to all public visitors
2. **Chart Type Switcher** - Allow users to toggle between different chart visualizations (Score History, Contributors Breakdown, Activity Heatmap)

---

## Current State

| Feature | Status |
|---------|--------|
| `GitHubAnalyticsCard` | Exists in `src/components/dashboard/` - only shown to owners |
| `UpgradeChart` | Shows Score + Velocity as ComposedChart (bar + line) |
| Public Program Detail | Missing GitHub metrics (stars, forks, contributors, commits) |
| Chart options | Single static view, no switcher |

---

## Architecture Design

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROGRAM DETAIL PAGE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     PUBLIC GITHUB METRICS                             │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │  │
│  │  │ 14.2k  │ │  4.1k  │ │  156   │ │  234   │ │   3    │ │  Rust  │   │  │
│  │  │ Stars  │ │ Forks  │ │Contrib.│ │Commits │ │Releases│ │Language│   │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  ANALYTICS                                                            │  │
│  │  ┌────────────────────────────────────────────────────────────────┐   │  │
│  │  │ [Score History] [Contributors] [Activity] [Releases]           │   │  │
│  │  └────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                       │  │
│  │  ┌────────────────────────────────────────────────────────────────┐   │  │
│  │  │                                                                │   │  │
│  │  │              [SELECTED CHART VISUALIZATION]                    │   │  │
│  │  │                                                                │   │  │
│  │  │    - Score History: Line + Bar (existing)                      │   │  │
│  │  │    - Contributors: Pie Chart with top 5                        │   │  │
│  │  │    - Activity: Stacked Area by event type                      │   │  │
│  │  │    - Releases: Timeline bar chart                              │   │  │
│  │  │                                                                │   │  │
│  │  └────────────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Public GitHub Metrics Bar Component

Create a new component `PublicGitHubMetrics.tsx` that displays key stats in a horizontal bar:

**New Component**: `src/components/program/PublicGitHubMetrics.tsx`

| Metric | Icon | Data Source |
|--------|------|-------------|
| Stars | Star | `github_stars` |
| Forks | GitFork | `github_forks` |
| Contributors | Users | `github_contributors` |
| Commits (30d) | Activity | `github_commits_30d` |
| Releases (30d) | Package | `github_releases_30d` |
| Language | Code | `github_language` |

This component will:
- Accept `ClaimedProfile['githubAnalytics']` as props
- Display metrics in a responsive 6-column grid (stacks to 3x2 on mobile)
- Show "—" for missing data
- Include GitHub link icon with external link to repository

---

### Phase 2: Multi-Chart Component with Tabs

Create an enhanced analytics section with chart type switching:

**New Component**: `src/components/program/AnalyticsCharts.tsx`

**Chart Types**:

1. **Score History** (default) - Existing ComposedChart (bar + line)
   - X-axis: Months
   - Left Y-axis: Commit velocity (bars)
   - Right Y-axis: Resilience score (line)

2. **Contributors** - Pie Chart
   - Shows top 5 contributors by commit count
   - Data from `github_top_contributors`
   - Legend with percentages

3. **Activity** - Stacked Area Chart
   - Shows event distribution over time
   - Event types: PushEvent, IssuesEvent, PullRequestEvent, ReleaseEvent
   - Data from `github_recent_events`

4. **Releases** - Bar Chart
   - Shows release frequency over last 6 months
   - Data derived from score_history or releases data

**UI Pattern**: Use `Tabs` component from shadcn/ui for switching

---

### Phase 3: Update ProgramDetail Page

Modify `src/pages/ProgramDetail.tsx` to:

1. Add `PublicGitHubMetrics` component after the description section
2. Replace current `UpgradeChart` with new `AnalyticsCharts` component
3. Pass `claimedProfile?.githubAnalytics` to new components
4. Show empty states when no GitHub data is available

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/program/PublicGitHubMetrics.tsx` | Horizontal metrics bar for public view |
| `src/components/program/AnalyticsCharts.tsx` | Multi-chart component with tab switcher |
| `src/components/program/ContributorsPieChart.tsx` | Pie chart for contributor breakdown |
| `src/components/program/ActivityAreaChart.tsx` | Stacked area chart for event activity |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ProgramDetail.tsx` | Add PublicGitHubMetrics, replace UpgradeChart with AnalyticsCharts |
| `src/components/program/index.ts` | Export new components |

---

## Technical Details

### PublicGitHubMetrics Component

```tsx
interface PublicGitHubMetricsProps {
  analytics?: GitHubAnalytics;
  githubUrl?: string;
}

// Responsive grid: 6 columns on desktop, 3 on tablet, 2 on mobile
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
  {metrics.map(metric => (
    <div className="text-center p-3 rounded-sm border bg-muted/30">
      <Icon className="mx-auto h-4 w-4" />
      <div className="font-mono text-xl font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  ))}
</div>
```

### AnalyticsCharts Tab Configuration

```tsx
const chartTabs = [
  { value: 'score', label: 'Score History', icon: TrendingUp },
  { value: 'contributors', label: 'Contributors', icon: Users },
  { value: 'activity', label: 'Activity', icon: Activity },
  { value: 'releases', label: 'Releases', icon: Package },
];

<Tabs defaultValue="score">
  <TabsList className="w-full justify-start">
    {chartTabs.map(tab => (
      <TabsTrigger key={tab.value} value={tab.value}>
        <tab.icon className="h-4 w-4 mr-2" />
        {tab.label}
      </TabsTrigger>
    ))}
  </TabsList>
  <TabsContent value="score">
    <UpgradeChart projectId={projectId} />
  </TabsContent>
  <TabsContent value="contributors">
    <ContributorsPieChart data={topContributors} />
  </TabsContent>
  {/* ... */}
</Tabs>
```

### ContributorsPieChart Data Transform

```tsx
// Transform github_top_contributors to Recharts pie format
const pieData = topContributors.slice(0, 5).map(c => ({
  name: c.login,
  value: c.contributions,
  avatar: c.avatar,
}));

// Add "Others" if more than 5 contributors
if (topContributors.length > 5) {
  const othersTotal = topContributors
    .slice(5)
    .reduce((sum, c) => sum + c.contributions, 0);
  pieData.push({ name: 'Others', value: othersTotal });
}
```

---

## Visual Hierarchy (Updated ProgramDetail Layout)

```text
1. Back to Explorer link
2. Verification Banner (if verified)
3. Program Header (name, score, status, social links)
4. Description Section
5. PUBLIC GITHUB METRICS BAR ← NEW
6. ANALYTICS CHARTS with TAB SWITCHER ← ENHANCED
7. Recent Events (existing)
8. Metric Cards (Originality, Staked, Constraints)
9. Verified Timeline (if verified)
10. Website Preview (if verified)
11. Media Gallery & Social Pulse (if verified)
12. Stake CTA
```

---

## Chart Styling Guidelines

All charts will follow the existing Bloomberg Terminal aesthetic:
- Dark theme with `hsl(var(--card))` backgrounds
- Primary teal color for active data
- Muted foreground for axis labels
- JetBrains Mono font for tooltips and values
- Consistent 300px chart height
- Empty states with centered messages
