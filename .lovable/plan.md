

# Fix Admin Engagement Daily Activity Chart

## Problem

The "Daily Activity Breakdown" AreaChart appears empty/flat despite having thousands of events. Three root causes:

1. **Session events not excluded from counts**: `session_start` and `session_end` events are processed but don't map to any chart `dataKey`, so they inflate the event total without contributing visible data. Meanwhile the actual displayable events (page_view: 3845, click: 62, feature_use: 1) are dwarfed in scale.
2. **Only 2-3 data points**: AreaCharts need several points to form visible filled regions. With 2-3 days, the areas are razor-thin slivers.
3. **Raw ISO date labels**: X-axis shows `2026-02-15` instead of `Feb 15`.

## Solution

### File: `src/pages/admin/AdminEngagementPage.tsx`

**A. Format X-axis dates** -- Add a `tickFormatter` to the XAxis that converts `2026-02-15` to `Feb 15`:

```tsx
<XAxis
  dataKey="date"
  tickFormatter={(d) => {
    const [, m, day] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m) - 1]} ${parseInt(day)}`;
  }}
  ...
/>
```

**B. Switch from AreaChart to BarChart for low data-point counts** -- When there are fewer than 5 days of data, a stacked BarChart is far more readable than an AreaChart (bars have visible width even with 1 data point). The implementation will:

- Use a `ComposedChart` with stacked `Bar` components instead of `Area` when data length is small (under 7 days)
- Keep the `AreaChart` for when there's enough data to form smooth curves (7+ days)
- Or simply switch to stacked bars permanently since the Bloomberg aesthetic fits bars well

**C. Add the missing `searches` data key** -- The aggregation already collects `searches` but no `Area`/`Bar` renders it. Add a fourth series for searches using the existing `C.steel` color.

**D. Filter session events from aggregation** -- Skip `session_start` and `session_end` events in the daily aggregation loop so they don't inflate totals or confuse the data pipeline:

```tsx
all.forEach(e => {
  if (e.event_type === 'session_start' || e.event_type === 'session_end') return;
  const day = e.created_at.substring(0, 10);
  // ... rest of aggregation
});
```

## Summary of Changes

| Change | Impact |
|--------|--------|
| Filter out session events from daily aggregation | Prevents invisible data from skewing Y-axis scale |
| Format X-axis dates to `Feb 15` style | Cleaner, more readable labels |
| Switch to stacked BarChart | Bars are visible even with 1-3 data points (areas need 5+ to look good) |
| Add `searches` series | Shows all 4 tracked event types instead of 3 |

**1 file modified**: `src/pages/admin/AdminEngagementPage.tsx`
