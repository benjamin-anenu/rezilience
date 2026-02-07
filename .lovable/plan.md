

# Fix: Build In Public Videos Crash - Data Shape Mismatch

## Problem

When adding a video via the Build In Public tab, the page crashes with:
```
TypeError: Cannot read properties of undefined (reading 'match')
```

## Root Cause

**Data Shape Mismatch** between the editor and display components:

| Component | Field Used | Purpose |
|-----------|-----------|---------|
| `BuildInPublicTab` (editor) | `url` | Saves X/Twitter URL |
| `BuildInPublicSection` (display) | `tweetUrl` | Reads X/Twitter URL |

The editor saves:
```json
{ "id": "...", "url": "https://x.com/...", "title": "..." }
```

But the display expects:
```json
{ "id": "...", "tweetUrl": "https://x.com/...", "url": "..." }
```

When `CommunityTabContent` renders `BuildInPublicSection`, it passes videos where `tweetUrl` is `undefined`, causing `getTweetId(video.tweetUrl)` to crash on `.match()`.

---

## Solution

Update `BuildInPublicSection.tsx` to handle both field names with a fallback, making it backwards compatible with any existing data shapes.

---

## Files to Modify

### 1. `src/components/program/BuildInPublicSection.tsx`

Update `getTweetId` and video rendering to handle both `tweetUrl` and `url`:

**Line 27-29 (getTweetId function):**
```typescript
const getTweetId = (url: string | undefined): string | null => {
  if (!url) return null;
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
};
```

**Line 63-64 (inside map):**
```typescript
{videos.map((video) => {
  // Handle both field names for backwards compatibility
  const videoUrl = video.tweetUrl || video.url;
  const tweetId = getTweetId(videoUrl);
```

**Line 68-69 (anchor href):**
```typescript
<a 
  href={videoUrl}
```

---

## Additional Fix: Align Type Definition

### 2. `src/types/index.ts`

Make `tweetUrl` optional since new entries use `url`:

**Line 186-193:**
```typescript
export interface BuildInPublicVideo {
  id: string;
  url: string;
  tweetUrl?: string;  // Make optional - legacy field
  thumbnailUrl?: string;
  title?: string;
  timestamp?: string;
}
```

---

## Summary

| File | Change | Priority |
|------|--------|----------|
| `src/components/program/BuildInPublicSection.tsx` | Add null check + fallback to `url` field | CRITICAL |
| `src/types/index.ts` | Make `tweetUrl` optional | MEDIUM |

This fix ensures:
1. No more crashes when viewing videos added via the Build In Public tab
2. Backwards compatible with any old data that uses `tweetUrl`
3. Proper null handling for edge cases

