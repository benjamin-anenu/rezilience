

# Replace Projects Table with Ecosystem Pulse Charts

## What Changes

Remove the long projects table from the report and replace it with the Ecosystem Pulse visualizations -- the same charts already live on the Explorer page. This gives the Solana Foundation a visual, data-rich view of ecosystem health instead of a scroll-heavy table.

## Charts to Add (after the Milestone Summary narrative)

1. **Aggregate Rezilience Trend** -- Area chart showing avg score over time
2. **Ecosystem Heartbeat** -- The animated pulse ring with aggregate score (static version for print)
3. **Development Activity Over Time** -- Bar chart with commits + contributors
4. **Indexed TVL** -- Area chart with TVL trend + large headline number
5. **Liveness Categories** -- Pie chart (Active / Evolving / Under Observation)
6. **Supply Chain Health** -- Pie chart (Healthy / Warning / Critical / Unknown)
7. **Top Languages** -- Horizontal bar breakdown

## Technical Approach

Rather than importing the `EcosystemPulse` component directly (it has interactive UI, disclaimers, loading states, and CSS animations that don't translate well to print), we will:

- **Import `useEcosystemPulse` hook** directly into `AdminReporterPage.tsx` to fetch the same data
- **Render the charts inline** using the same Recharts components already imported, styled to match the reporter's existing `glass-chart` aesthetic
- **Add print-friendly heartbeat** -- a static circle with score number (no CSS animation in print)

## File Changes

### `src/pages/admin/AdminReporterPage.tsx`

| Section | Action |
|---------|--------|
| Imports | Add `useEcosystemPulse` hook, add `AreaChart, Area, PieChart, Pie, Cell, Legend` from recharts |
| Imports | Remove `Table, TableBody, TableCell, TableHead, TableHeader, TableRow` (no longer needed) |
| Data fetch | Remove `allProfiles` query from `fetchReportData` (no longer needed for the table) |
| Return value | Remove `allProfiles` from the return object |
| `getScoreColor` function | Can be removed (was only used by the table) |
| **Delete** | The entire "Registered Projects Table" section (~lines 264-308) |
| **Add** | Ecosystem Pulse section with 7 chart panels in a grid layout, using data from `useEcosystemPulse()` |

### New Section Layout (replaces the table)

```text
+------------------------------------------+
| ECOSYSTEM INTELLIGENCE                    |
+------------------------------------------+
| [Rezilience Trend]  | [Heartbeat Pulse]  |
| (area chart, 2col)  | + Quick Stats      |
+---------------------+--------------------+
| [Dev Activity]      | [Indexed TVL]      |
| (bar chart)         | (area chart)       |
+---------------------+--------------------+
| [Liveness] | [Supply Chain] | [Languages]|
| (pie)      | (pie)          | (bars)     |
+------------------------------------------+
```

Each chart will use the existing `glass-chart p-5 print-section` wrapper so the dark print theme applies automatically.

### Helper Functions Added Inline

- `formatTvl(value)` -- format large USD values (already exists in EcosystemPulse, will duplicate inline)
- `formatDate(dateStr)` -- format snapshot dates
- Liveness/dep-health color constants (same as EcosystemPulse)

No other files need changes. The print CSS already handles `.glass-chart` and `.print-section` styling for the dark PDF theme.

