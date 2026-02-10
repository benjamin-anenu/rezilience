

# Ecosystem Pulse -- 3rd Explorer Tab

## Advisory Challenge (Before Implementation)

### What's actually being solved
You want a **macro-level dashboard** that answers: "Is the Solana builder ecosystem getting healthier or weaker over time?" Individual project views exist; what's missing is the **aggregate signal** -- a Bloomberg-style market overview for development continuity.

### Critical data constraints I must flag
- **score_history** contains only **2 days** of snapshots (Feb 9-10). Time-series charts will be sparse until data accumulates over weeks.
- **No historical TVL storage exists.** The `claimed_profiles.tvl_usd` column holds only the current value ($1.74B aggregate). A "TVL over time" chart requires a new table to start capturing daily snapshots.
- **Governance transactions are 0** across all 196 projects. That dimension adds no visual value today.
- The score_history `breakdown` JSONB stores commits, stars, PRs, issues, push events, releases, and contributors -- but **not TVL or dependency health**.

### Recommendation
Build the tab with charts that work **now** from existing data, add a lightweight daily-snapshot table for TVL accumulation, and accept that time-series depth grows organically. Do NOT fabricate "trend lines" from 2 days of data -- display what exists honestly and label sparse charts as "Accumulating data."

---

## Implementation

### 1. Database Migration -- `ecosystem_snapshots` table

Create a new table to store daily aggregate ecosystem metrics. This is the **only** way to get "TVL over time" and aggregate development trends.

```sql
CREATE TABLE public.ecosystem_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL UNIQUE,
  total_projects INTEGER NOT NULL DEFAULT 0,
  active_projects INTEGER NOT NULL DEFAULT 0,
  avg_resilience_score NUMERIC NOT NULL DEFAULT 0,
  total_commits_30d INTEGER NOT NULL DEFAULT 0,
  total_contributors INTEGER NOT NULL DEFAULT 0,
  total_tvl_usd NUMERIC NOT NULL DEFAULT 0,
  avg_dependency_health NUMERIC NOT NULL DEFAULT 0,
  total_governance_tx INTEGER NOT NULL DEFAULT 0,
  healthy_count INTEGER NOT NULL DEFAULT 0,
  stale_count INTEGER NOT NULL DEFAULT 0,
  decaying_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ecosystem_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.ecosystem_snapshots FOR SELECT USING (true);
```

### 2. Extend `refresh-all-profiles` edge function

After each refresh cycle completes, UPSERT a row into `ecosystem_snapshots` for today's date with aggregated metrics from `claimed_profiles`. This is a ~10-line addition to the existing function -- no new edge function needed.

### 3. New Hook -- `src/hooks/useEcosystemPulse.ts`

Two queries:
- **Current aggregates** from `claimed_profiles` (real-time totals for commits, contributors, TVL, score distribution, liveness counts)
- **Time-series** from `ecosystem_snapshots` (ordered by date, limited to 90 days) for trend charts

### 4. New Component -- `src/components/explorer/EcosystemPulse.tsx`

Layout: Two-column grid (main charts left, pulse indicator + TVL right on desktop; stacked on mobile).

**Left Column -- Development Ecosystem Charts:**

| Chart | Type | Data Source | Purpose |
|-------|------|-------------|---------|
| Aggregate Score Trend | Area chart | `ecosystem_snapshots` | Are builders collectively improving? |
| Development Activity | Stacked bar | `ecosystem_snapshots` | Total commits + contributors over time |
| Liveness Distribution | Donut chart | `claimed_profiles` (live) | Active vs Stale vs Decaying ratio |
| Category Breakdown | Horizontal bar | `claimed_profiles` (live) | Which sectors have the most projects? |
| Dependency Health Distribution | Bar chart | `claimed_profiles` (live) | How many projects have healthy supply chains? |

**Right Column -- Pulse + TVL:**

| Element | Type | Data Source |
|---------|------|-------------|
| Ecosystem Pulse | Animated concentric rings (CSS keyframes) | Live aggregate score |
| Pulse color | Teal (avg >= 70), Amber (40-69), Red (< 40) | `claimed_profiles` avg |
| "ECOSYSTEM HEARTBEAT" label | Static | -- |
| Current aggregate score | Large number inside pulse | Live calculation |
| Indexed TVL Over Time | Area chart | `ecosystem_snapshots.total_tvl_usd` |
| Current TVL | Large formatted number | `claimed_profiles` sum |

**The "Pulse" element** will use CSS `@keyframes` with concentric expanding/fading rings (like a radar ping), not WebGL/3D. This is:
- Performant (pure CSS, no JS animation loop)
- Mobile-friendly
- Visually striking without adding a 3D library dependency
- Color-coded to the ecosystem's aggregate health

**Sparse data handling**: When `ecosystem_snapshots` has fewer than 7 data points, display a "Data accumulating -- charts will populate over the coming weeks" notice with the available points still plotted. This is honest and prevents trust erosion from near-empty graphs.

### 5. Update Explorer Page -- 3rd Tab

Add `"pulse"` tab to the existing `Tabs` component:

```text
TabsList: [List View] [Titan Watch] [Ecosystem Pulse]
```

Grid changes from `grid-cols-2` to `grid-cols-3` on the TabsList.

### 6. Export updates

Add `EcosystemPulse` to `src/components/explorer/index.ts`.

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/` | New migration for `ecosystem_snapshots` table |
| `supabase/functions/refresh-all-profiles/index.ts` | Add UPSERT to `ecosystem_snapshots` after refresh cycle |
| `src/hooks/useEcosystemPulse.ts` | **New** -- fetches aggregates + time-series |
| `src/components/explorer/EcosystemPulse.tsx` | **New** -- full dashboard component with 5 charts + animated pulse |
| `src/components/explorer/index.ts` | Export new component |
| `src/pages/Explorer.tsx` | Add 3rd tab |

No new npm dependencies. Uses existing Recharts, Framer Motion, and Tailwind.

---

## What should be deferred

- **Real 3D rendering** (Three.js/WebGL): Adds ~200KB to bundle for a cosmetic effect. The CSS pulse achieves 90% of the visual impact at 0% bundle cost. Revisit only if the platform moves to a dedicated "dashboard" product.
- **Governance trend charts**: Data is uniformly zero. Adding it now creates a chart of nothing, which erodes credibility. Enable when governance data starts flowing.
- **Per-category TVL breakdown over time**: Requires a more complex snapshot schema. Start with aggregate TVL, decompose later when there's enough history to make category trends meaningful.

