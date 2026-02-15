
## Fix: Remove Black Empty Space Below Video in Tweet Embeds

### Problem
The `max-h-[280px]` constraint only limits the `<video>` element's visible area, but the video's parent wrapper inside the `react-tweet` component retains its original height. This creates a large black empty area below the video thumbnail.

### Solution
Target the video's parent container elements as well, not just the `<video>` tag. Add CSS overrides to constrain the entire media wrapper:

### File: `src/components/explorer/BuilderPostCard.tsx`

Update the CSS selector string on line 77 to add:
- `[&_[data-video-wrapper]]:!max-h-[280px]` -- target react-tweet's video wrapper
- `[&_div[style*="padding-bottom"]]:!p-0 [&_div[style*="padding-bottom"]]:!h-[280px]` -- override the aspect-ratio padding-bottom trick used by tweet embeds for video containers
- `[&_[data-testid="videoPlayer"]]:!max-h-[280px]` -- target the video player container
- More broadly: `[&_div:has(>video)]:!max-h-[280px] [&_div:has(>video)]:!overflow-hidden` -- constrain any div that directly contains a video element

This ensures the entire video container block (not just the video tag) respects the height limit, eliminating the black dead space.

### Technical Detail
The `react-tweet` component uses a padding-bottom aspect-ratio hack for its media containers. We need to override both the video element and its wrapping divs to collapse the empty space.
