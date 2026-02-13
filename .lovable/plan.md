
# Admin Portal Redesign — Chart-First Intelligence Dashboard

## Problem Identified

The current admin portal has three critical flaws:

1. **Stat cards dominate, charts are secondary**: The Overview page shows 8 text stat cards taking up the entire top half, with only 2 small charts below the fold. The user wants charts as the PRIMARY visual element with figures as compact secondary context.

2. **No Library engagement tracking**: The Library pages (Learn, Dictionary, Blueprints, Protocols, Docs) have zero granular tracking — users cannot see which rooms, terms, blueprints, or protocols the public is accessing.

3. **Costs are manual input**: The Costs page is a CRUD form for manually entering dollar amounts. It should auto-compute costs from actual API call counts in `admin_service_health` and AI token costs in `admin_ai_usage`, with known pricing per service.

4. **Visual aesthetic is flat**: Cards are plain bordered boxes. No glass morphism, no gradient fills on charts, no fluid animations, no depth or premium feel.

---

## Design Philosophy: Chart-First Intelligence

Every module will follow this layout hierarchy:

```text
[Compact KPI Strip]          <-- Single row, inline mini-metrics (tiny text, no cards)
[DOMINANT CHART AREA]        <-- 70-80% of viewport, large fluid charts
[Secondary detail below]     <-- Tables/lists only when needed
```

StatCards will be redesigned as a **compact inline strip** — a single row of metrics with sparklines embedded, NOT full bordered cards taking up grid space.

---

## Files to Change

### Redesigned Components

| File | Action | Purpose |
|------|--------|---------|
| `src/components/admin/StatCard.tsx` | **REWRITE** | Compact inline metric with embedded mini-sparkline |
| `src/components/admin/AdminSidebar.tsx` | **EDIT** | Add Library section, polish with glass effect |
| `src/pages/admin/AdminOverview.tsx` | **REWRITE** | Chart-dominant layout: large area charts, radial gauges, compact KPI strip |
| `src/pages/admin/AdminEngagementPage.tsx` | **REWRITE** | Add Library engagement section, device donut, engagement funnel as Sankey-style horizontal bars, hourly heatmap |
| `src/pages/admin/AdminAIUsagePage.tsx` | **REWRITE** | Larger charts, token flow visualization, cost accumulation curve |
| `src/pages/admin/AdminIntegrationsPage.tsx` | **EDIT** | Add latency sparklines inside each service card, pulsing status dots |
| `src/pages/admin/AdminCostsPage.tsx` | **REWRITE** | Auto-computed costs from `admin_service_health` + `admin_ai_usage` + known pricing, stacked area chart, category breakdown donut |
| `src/pages/admin/AdminRegistryPage.tsx` | **EDIT** | Funnel as gradient horizontal flow, coverage as radial progress rings |
| `src/pages/admin/AdminReporterPage.tsx` | **EDIT** | Add comparison charts (period vs period), sparklines in summary |
| `src/pages/admin/AdminDashboard.tsx` | **EDIT** | Add subtle animated gradient background to main content area |
| `src/hooks/useAnalyticsTracker.ts` | **EDIT** | No changes needed (already tracks page_view) |
| `src/index.css` | **EDIT** | Add admin-specific animation keyframes and glass utilities |

### New Files for Library Tracking

| File | Action | Purpose |
|------|--------|---------|
| (No new files needed) | — | Library pages already use `useTrackEvent` via Layout. We just need to add `trackEvent` calls inside Library sub-pages |
| `src/pages/LibraryLearn.tsx` | **EDIT** | Add `trackEvent('feature_use', 'library_learn', { module })` on module clicks |
| `src/pages/LibraryDictionary.tsx` | **EDIT** | Add `trackEvent('feature_use', 'library_dictionary', { term })` on term views |
| `src/pages/LibraryBlueprints.tsx` | **EDIT** | Add `trackEvent('feature_use', 'library_blueprints')` |
| `src/pages/LibraryProtocols.tsx` | **EDIT** | Add `trackEvent('feature_use', 'library_protocols', { protocol })` |
| `src/pages/LibraryDocs.tsx` | **EDIT** | Add `trackEvent('feature_use', 'library_docs', { service })` |

---

## Module-by-Module Redesign

### Overview (Chart-First)

**Layout**:
- **Top**: Compact KPI strip — single row of 6-8 metrics in a slim horizontal bar (no borders, no card boxes). Each metric is just: label + value + tiny inline sparkline or trend arrow. Think Bloomberg terminal ticker.
- **Hero Chart (full width, h-96)**: Dual-axis ComposedChart — Registry Growth as gradient area + Average Score as overlaid line. This is the centerpiece.
- **2-column row below**: 
  - Left: Score Distribution as a smooth AreaChart (not bars) with gradient fill, showing a fluid bell curve
  - Right: Liveness as animated radial/donut chart with glow effects and percentage labels inside
- **3rd row (full width)**: Category distribution as a Treemap or fluid horizontal stacked bar

**Visual Polish**:
- All charts get gradient fills with `linearGradient` defs (teal-to-transparent, orange-to-transparent)
- `type="monotone"` on all curves for smooth fluid lines
- Chart containers get `.glass` background (bg-card/40 backdrop-blur-md) with subtle border glow
- Animated number counters on the KPI strip using framer-motion
- Pulsing "LIVE" indicator with proper animation

### Engagement (Library + Feature Heatmap)

**Layout**:
- **Compact KPI strip** (same style as Overview)
- **Full-width Daily Activity chart (h-80)**: Multi-line area chart — separate lines for page_views, clicks, searches, feature_use — stacked with transparency
- **2-column row**:
  - Left: **Library Engagement Breakdown** — Horizontal bar chart showing visits to each Library room (Learn, Dictionary, Blueprints, Protocols, Docs) pulled from `admin_analytics` where `event_target` contains `/library/`
  - Right: **Device Distribution** — Smooth donut chart (not separate stat cards)
- **Full-width**: Page Popularity as a fluid horizontal bar chart with gradient bars and hover effects
- **GPT Usage mini-section**: Conversations + Messages as inline metrics with a small sparkline

### AI Usage (Token Flow)

**Layout**:
- Compact KPI strip (conversations, messages, total spend, avg latency)
- **Hero Chart (full width, h-80)**: Cost accumulation curve — cumulative spend over time as a smooth area chart with gradient
- **2-column**:
  - Left: Token usage stacked area (input vs output) with different gradient colors
  - Right: Model distribution as a radial/donut with labels
- **Latency distribution**: Histogram showing response time buckets

### Costs (Auto-Computed)

**New Logic**: Instead of manual CRUD entries, auto-calculate costs:

```text
AI Cost = SUM(admin_ai_usage.estimated_cost_usd) grouped by month
API Calls = COUNT(admin_service_health) grouped by service + month
  - GitHub API: Free (show call count only)
  - DeFiLlama: Free
  - Solana RPC: $0.001 per call estimate
  - Algolia: based on operations count at published pricing
  - Lovable Cloud: fixed monthly
```

**Layout**:
- Compact KPI strip (Total Monthly, AI Cost, API Cost, Infrastructure)
- **Hero Chart (full width)**: Stacked area chart — AI cost layer + API cost layer + Infrastructure layer, showing total burn over time
- **2-column**:
  - Left: Cost breakdown donut by category
  - Right: Cost per active user trend line
- **Bottom**: Still allow manual override entries for domain/hosting costs that can't be auto-detected, but as a minimal expandable section — not the primary view
- Disclaimer banner: "Estimates based on usage metrics"

### Integrations

**Enhancement**:
- Add tiny sparkline charts inside each service card showing latency over last 24h
- Pulsing green/amber/red dot for status
- Cards get glass morphism background

### Registry

**Enhancement**:
- Claim Funnel as gradient horizontal flow bars (widest at top, narrowing)
- Coverage metrics as three animated radial progress rings side by side
- Score distribution over time as animated area chart

### Grant Reporter

**Enhancement**:
- Add period-comparison charts: current period vs previous period
- Sparklines embedded in the metric cards
- Visual summary chart (radar/spider chart) showing multiple dimensions

---

## Visual System Upgrades (index.css)

New utility classes:
- `.glass-card`: `bg-card/30 backdrop-blur-xl border border-primary/5 shadow-[0_0_30px_hsl(var(--primary)/0.03)]`
- `.kpi-strip`: Slim horizontal flex container with dividers between metrics
- `@keyframes count-up`: For animated number reveals
- `@keyframes glow-pulse`: Subtle pulsing border glow on chart containers
- Chart gradient definitions standardized across all pages

---

## Implementation Sequence

1. Update `index.css` with new admin utility classes
2. Redesign `StatCard.tsx` into compact inline metrics
3. Rewrite `AdminOverview.tsx` — chart-first with compact KPI strip
4. Add Library tracking to all Library sub-pages (5 files)
5. Rewrite `AdminEngagementPage.tsx` — add Library breakdown, device donut, multi-line activity
6. Rewrite `AdminAIUsagePage.tsx` — cumulative cost curve, token flow
7. Rewrite `AdminCostsPage.tsx` — auto-computed from usage tables, stacked area
8. Polish `AdminIntegrationsPage.tsx` — sparklines, glass cards
9. Polish `AdminRegistryPage.tsx` — gradient funnel, radial rings
10. Polish `AdminReporterPage.tsx` — comparison charts
11. Update `AdminDashboard.tsx` — animated gradient background on main area

All charts use `type="monotone"` for fluid curves, `linearGradient` fills, `strokeWidth={2.5}` for crisp lines, and consistent tooltip styling with glass backgrounds.
