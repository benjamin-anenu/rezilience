

# Blueprint Tree Enhancement

## Three Fixes

### 1. Clickable Links to Protocols and Dictionary Terms

The blueprint data already contains `dictionaryTerms` and `protocolSlugs` arrays on each step -- they're just not being passed through to the node component or rendered.

**Changes:**
- Update `BlueprintNodeData` type to include `dictionaryTerms` and `protocolSlugs`
- Pass these fields through in `LibraryBlueprintDetail.tsx` when constructing node data
- Render them in `BlueprintNode.tsx` as clickable links:
  - Protocol slugs link to `/library/{slug}` (e.g., "Jupiter" links to `/library/jupiter`)
  - Dictionary terms link to `/library/dictionary?term={term}` (e.g., "PDA" links to the dictionary with that term highlighted)
- Use `react-router-dom`'s `Link` component wrapped in `onClick={(e) => e.stopPropagation()}` to prevent node selection conflicts

### 2. Fix Overlapping Cards -- More Spacing

The current layout uses:
- `nodeWidth = 280`, horizontal gap of only `40px`, vertical gap of `180px`
- 3 columns max, which causes cards with lots of content (deps, APIs, cost) to overlap vertically

**Changes in `LibraryBlueprintDetail.tsx`:**
- Increase horizontal gap from `40` to `80` pixels between columns
- Increase vertical gap from `180` to `320` pixels between rows (cards can be 250px+ tall with all metadata)
- Increase `centerX` from `400` to `500` to better center the wider layout
- Use 2 columns max instead of 3 to give each card more breathing room

### 3. Premium Card Styling -- Teal Border on Dark/Transparent Background

Replace the grey `bg-card` / `border-border` styling with the premium look used elsewhere in the platform.

**Changes in `BlueprintNode.tsx`:**
- Goal node: Keep `border-primary bg-primary/10` (already looks good)
- Step nodes: Change from `border-border bg-card` to `border-primary/30 bg-background/80 backdrop-blur-sm` -- giving a dark/transparent card with a subtle teal border
- On hover: `hover:border-primary` (full teal glow)
- Add subtle `shadow-[0_0_15px_rgba(0,194,182,0.08)]` for the premium glow effect matching the platform's verified-glow pattern

## Technical Details

### Files Modified
- `src/components/library/BlueprintNode.tsx` -- Add link rendering for protocols/dictionary terms, update card styling
- `src/pages/LibraryBlueprintDetail.tsx` -- Pass `dictionaryTerms`/`protocolSlugs` to node data, fix spacing constants

### No New Dependencies
All routing and UI components already exist.
