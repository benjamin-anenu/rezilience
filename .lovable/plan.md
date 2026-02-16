

# Make Map Full-Width, Static View (No Zoom/Pan)

## Changes to `src/components/landing/EcosystemMapSection.tsx`

### Remove
- All zoom state (`position`, `handleZoomIn`, `handleZoomOut`, `handleReset`, `handleMoveEnd`)
- The `ZoomableGroup` wrapper (render `Geographies` directly inside `ComposableMap`)
- The zoom control buttons (ZoomIn, ZoomOut, RotateCcw)
- Unused imports: `ZoomIn`, `ZoomOut`, `RotateCcw`, `ZoomableGroup`, `useCallback`

### Modify
- Remove the `rounded-xl border` wrapper styling -- let the map bleed edge-to-edge within the section
- Use `geoEqualEarth` projection instead of `geoMercator` for a better full-world view (less distortion at poles, shows all landmass cleanly)
- Set `projectionConfig` to `{ scale: 160, center: [0, 10] }` for optimal full-world framing
- Set map dimensions to `width={900} height={440}` with `style={{ width: '100%', height: 'auto' }}` so it scales responsively to fill the container
- Remove the `max-w-6xl` constraint from the map container so it spans wider, while keeping header/stats/CTA contained

### Result
A clean, static, full-section-width world map that shows the entire globe in one view. Tooltips still work on hover. Legend stays pinned bottom-left. No interactive zoom or pan controls.

