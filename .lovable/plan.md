

# Blueprint Tree Static Layout + Keyboard Controls & Grant Card Uniformity

## Part 1: Blueprint Tree -- Static Layout with Zoom/Arrow Key Controls

### What Changes

The interactive ReactFlow canvas on the Blueprint Detail page will become a **static, non-draggable tree** rendered at a **slightly smaller scale**. Users will gain **keyboard arrow key navigation** (panning the viewport) and **zoom controls** (reusing the existing `TreeControls` component from the Dependency Tree page).

### Technical Details

**File: `src/pages/LibraryBlueprintDetail.tsx`**

1. **Reduce canvas height** from `h-[70vh]` to `h-[60vh]` for a more compact feel
2. **Reduce node spacing**: Shrink `verticalGap` from 340 to 280, and node width from 320 to 280
3. **Import and add `TreeControls`** component inside the ReactFlow canvas (already built for the Dependency Tree page -- fully reusable)
4. **Add keyboard event handler**: Attach an `onKeyDown` listener to the canvas wrapper that maps arrow keys to viewport panning (using `useReactFlow().setViewport()`) and `+`/`-` keys to zoom
5. **Add `tabIndex={0}`** to the wrapper div so it can receive keyboard focus
6. **Keep `nodesDraggable={false}` and `nodesConnectable={false}`** (already set -- nodes stay static)
7. Add a small hint text below the canvas: "Use arrow keys to pan, +/- to zoom"

**File: `src/components/library/BlueprintNode.tsx`**

8. Reduce `max-w-[320px]` to `max-w-[280px]` and tighten padding from `px-5 py-4` to `px-4 py-3`

### New Component: `BlueprintControls`

A thin wrapper around keyboard logic + the existing `TreeControls` UI. It will:
- Listen for ArrowUp/Down/Left/Right to pan the viewport by 50px per keypress
- Listen for `+`/`-` to zoom in/out
- Render the existing zoom/fit/reset button panel (same as `TreeControls`)

---

## Part 2: Grant Cards -- Uniform Size Matching Other Cards

### What Changes

The Grant cards will be restructured to have a **fixed, uniform height** and a cleaner layout that matches the premium card pattern used elsewhere (Protocol cards, Explorer cards).

### Technical Details

**File: `src/pages/Grants.tsx`**

1. **Fixed card height**: Add `h-full` to the card and use `flex flex-col` with `flex-1` on the body to ensure all cards stretch to the same height within the grid row
2. **Simplify the card structure**: Remove the inner "Key Criteria" bordered box -- move criteria to a compact comma-separated line or a 2-line cap to reduce height variance
3. **Cap focus areas** to 4 tags max with `slice(0, 4)` to prevent overflow differences
4. **Cap criteria highlights** to 3 items max
5. **Move description to a `line-clamp-2`** to ensure uniform text height across cards
6. **Ensure the grid uses `grid-rows-subgrid`** or the wrapper div uses `h-full` so cards in each row align

The result: all grant cards will be the same height per row, with a clean premium look matching the Protocol cards and other library components.

