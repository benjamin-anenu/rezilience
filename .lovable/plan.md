

# Fix Build-in-Public Sorting + Make Button Actionable

## Change 1: Sort by Tweet Snowflake Date (X Post Date), Not Database Timestamp

**Problem:** `useBuildersFeed.ts` sorts posts by `video.uploadedAt || video.timestamp` -- these are the dates the entry was created in Rezilience's database, NOT when the tweet was actually posted on X.

The `BuilderPostCard` component already has a `getTweetDate()` function that extracts the real post date from Twitter's snowflake ID. But this logic is only used for display ("2d ago"), not for sorting.

**Fix in `src/hooks/useBuildersFeed.ts`:**

Add a snowflake date parser to the hook and sort by the extracted tweet date instead of the database timestamp. This ensures newest X posts appear at the top and oldest at the bottom.

```typescript
// Extract tweet ID from URL
const getTweetId = (url: string): string | null => {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
};

// Parse Twitter snowflake ID to real post timestamp
const getSnowflakeTimestamp = (url: string): number => {
  const tweetId = getTweetId(url);
  if (!tweetId) return 0;
  try {
    const id = BigInt(tweetId);
    return Number(id >> 22n) + 1288834974657;
  } catch {
    return 0;
  }
};

// Sort by snowflake-derived date (newest first, oldest last)
posts.sort((a, b) => {
  const tsA = getSnowflakeTimestamp(a.tweetUrl);
  const tsB = getSnowflakeTimestamp(b.tweetUrl);
  if (!tsA && !tsB) return 0;
  if (!tsA) return 1;  // no tweet ID = push to bottom
  if (!tsB) return -1;
  return tsB - tsA;    // newest first
});
```

This replaces the current sort that uses `new Date(a.timestamp)` (database field).

---

## Change 2: Make the "Builders In Public" Button More Actionable

**Problem:** The toggle button in Explorer just says "Builders In Public" -- it's not clear it's clickable or what it does.

**Fix in `src/pages/Explorer.tsx`:**

Update button text to clearly communicate it's an action with a destination:

- When inactive: **"View Builders In Public"** with a right-arrow icon
- When active: **"Back to Registry"** with a left-arrow icon

```tsx
<Button
  variant={activeView === 'builders' ? 'default' : 'outline'}
  size="sm"
  onClick={...}
  className="flex items-center gap-2"
>
  {activeView === 'builders' ? (
    <>
      <ArrowLeft className="h-4 w-4" />
      Back to Registry
    </>
  ) : (
    <>
      <Megaphone className="h-4 w-4" />
      View Builders In Public
      <ArrowRight className="h-4 w-4" />
    </>
  )}
</Button>
```

This makes it immediately clear the button is actionable -- the arrow and "View" verb signal a navigation intent.

---

## Summary

| File | Change |
|------|--------|
| `src/hooks/useBuildersFeed.ts` | Sort by X tweet snowflake date (real post time), not database timestamp |
| `src/pages/Explorer.tsx` | Change button text to "View Builders In Public" with arrow icons for clear CTA |

