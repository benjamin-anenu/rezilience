

# Sticky Blueprint Header

## What Changes

The blueprint header section (containing the "Back to Blueprints" link, title, description, and cost disclaimer) will become **sticky** so it stays pinned at the top of the viewport while the ReactFlow canvas and any content below scrolls underneath it.

## Technical Details

**File: `src/pages/LibraryBlueprintDetail.tsx`** (Line 103)

1. Add `sticky top-16 z-10 bg-background` to the header `<section>` element (top-16 accounts for the main navigation bar height)
2. Add a subtle bottom border or shadow (`border-b border-border/50` or `shadow-sm`) so the sticky header visually separates from the canvas scrolling beneath it
3. Reduce vertical padding slightly (`py-8` to `py-6`) to keep the docked header compact

This ensures the header stays visible as users scroll through the blueprint tree, providing persistent context about which blueprint they are viewing.

