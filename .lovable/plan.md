

# Session Duration Tracking, World Map, and Rate Limiter Fix

## Critical Bug Fix First

The rate limiter trigger (`check_analytics_rate_limit`) is blocking most event inserts. Currently only 115 page_view events exist -- all click, search, and feature events are being silently dropped because the batch insert triggers the rate check per row, and the 100 events/minute/session limit gets exhausted by page views alone. This must be fixed for any tracking to work.

## Changes

### 1. Fix Rate Limiter (Database Migration)

Increase the rate limit from 100 to 500 events/minute/session. The current 100 limit is too aggressive for batch inserts where a single flush can contain 50 events, and multiple flushes per minute are normal during active browsing.

```sql
-- Replace the function body to allow 500 events/min/session
CREATE OR REPLACE FUNCTION public.check_analytics_rate_limit()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
  SET search_path TO 'public' AS $$
DECLARE recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.admin_analytics
  WHERE session_id = NEW.session_id
    AND created_at > now() - interval '1 minute';
  IF recent_count >= 500 THEN
    RAISE EXCEPTION 'Analytics rate limit exceeded';
  END IF;
  RETURN NEW;
END; $$;
```

### 2. Session Duration Tracking

**`src/hooks/useAnalyticsTracker.ts`** -- Add a `session_start` event on mount with a timestamp, and a `session_end` event on `beforeunload`/unmount. No schema change needed -- we use `event_metadata` to store the start timestamp.

- On hook mount: fire `trackEvent('session_start', location.pathname, { ts: Date.now() })`
- On `beforeunload`: fire `trackEvent('session_end', location.pathname, { ts: Date.now() })`

**`src/pages/admin/AdminEngagementPage.tsx`** -- Compute session duration from the data:
- Group events by `session_id`
- Duration = last event `created_at` minus first event `created_at` (in seconds)
- Calculate average and median session duration
- Add two new KPI cards: "Avg Session" and "Median Session" (formatted as "Xm Ys")

### 3. World Map Visualization

Add an SVG-based world map to `AdminEngagementPage.tsx` showing visitor locations as glowing dots. No external library needed -- use an inline simplified world map SVG with country centroids mapped to coordinates.

**Implementation approach:**
- Create a `src/components/admin/WorldMap.tsx` component
- Include a lightweight world map outline as an SVG path (Natural Earth simplified -- ~50 lines of path data for continent outlines)
- Maintain a lookup table of ~50 common country names to `[x, y]` coordinates on the SVG viewBox
- Render colored, sized dots for each country proportional to event count
- Tooltip on hover showing country name and count
- Use the teal/orange color palette matching the rest of the dashboard
- Replace the existing "Visitor Locations" bar chart with a split layout: world map (3 cols) + bar chart (2 cols)

### 4. Dashboard Layout Update

**`src/pages/admin/AdminEngagementPage.tsx`** changes:

| Section | Change |
|---------|--------|
| KPI strip | Add "Avg Session" and "Median Session" cards |
| Visitor Locations | Split into 2-panel row: World Map (left) + existing bar chart (right) |
| Data fetch | Add session duration computation from event timestamps |

## Files Changed

| File | Action |
|---|---|
| Database migration | Fix rate limiter: 100 -> 500 events/min |
| `src/hooks/useAnalyticsTracker.ts` | Add `session_start` and `session_end` events |
| `src/components/admin/WorldMap.tsx` | **New** -- SVG world map with country dots |
| `src/pages/admin/AdminEngagementPage.tsx` | Add session duration KPIs, integrate world map, keep bar chart alongside |

