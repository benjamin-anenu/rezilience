

# Sophisticated World Map + Tracking Verification

## Findings

### Visitor Data
Only **Nigeria** has visited the project so far (611 events). No other countries are represented. The tracking is working correctly -- there simply haven't been visitors from other locations yet.

### Why Features/Searches/GPT Show Zero
- **Searches**: Instrumented, but no visitor has typed a search query yet
- **Features**: Instrumented (GPT sends, tab changes, staking clicks), but no visitor has triggered them
- **GPT Convos/Messages**: The database tables are empty -- no authenticated user has used the GPT chat (guest chats go to browser storage, not the database)
- **Clicks**: 8 navigation clicks recorded, which is correct

The tracking code is all wired up properly. The zeros reflect actual zero usage of those features, not a bug.

## World Map Redesign

Replace the current simplistic SVG continent blobs with a professional, high-fidelity world map.

### Approach
- Use a proper **Natural Earth / GeoJSON-derived SVG** world map with recognizable country outlines (not the current abstract continent shapes)
- Render individual country paths so they can be highlighted/colored based on visitor count
- Countries with data get a **teal fill with intensity proportional to count** (choropleth style)
- Countries without data stay in the dark base color
- Active countries get a **pulsing glow dot** at their centroid for visual emphasis
- Graticule grid lines (latitude/longitude) in subtle dark strokes for geographic reference
- Equirectangular projection for clean, recognizable geography

### Visual Design
- Base country fill: `hsl(214, 18%, 14%)` (dark steel)
- Country borders: `hsl(214, 18%, 22%)` (subtle separation)
- Active country fill: teal gradient scaled by intensity
- Glow dots: animated pulse on countries with visitors
- Hover tooltip: country name, event count, percentage of total
- Ocean background: matches the glass-chart container

### File Changes

| File | Change |
|---|---|
| `src/components/admin/WorldMap.tsx` | Complete rewrite with proper SVG country paths, choropleth coloring, animated glow dots, and enhanced tooltip |

### Technical Details
- Embed a simplified but accurate world map SVG with ~180 country paths (sourced from Natural Earth 110m, simplified to keep bundle size under 40KB)
- Each path tagged with ISO country code for data matching
- Country name lookup table maps the names stored in the database (from ip-api.com) to ISO codes
- Smooth hover transitions and animated pulse keyframes for active dots
- Responsive: uses `viewBox` with `preserveAspectRatio` for clean scaling

