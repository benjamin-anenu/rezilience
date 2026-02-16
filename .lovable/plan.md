

# Click-to-Filter Map + Solana Branding

## Overview

Two changes to the Ecosystem Map section:
1. Clicking a country with data navigates to `/explorer` with that country pre-selected in the filter
2. Replace the generic pulsing dots with inline Solana logo SVGs, and update the section copy to reference Solana

## Changes to `src/components/landing/EcosystemMapSection.tsx`

### 1. Click-to-Navigate

- Import `useNavigate` from `react-router-dom`
- Add an `onClick` handler to each `Geography` element: if the country has data (`stats` exists), navigate to `/explorer?country=XX` where `XX` is the lowercase DB country code
- Create a reverse mapping `ISO_TO_DB_CODE` (e.g., `GB` -> `uk`, everything else just `.toLowerCase()`) to translate the map's alpha-2 codes back to the DB filter values used by Explorer
- Also add `onClick` to each `Marker` so clicking the pulsing dot navigates too
- Tooltip hint: add "Click to explore" text at the bottom of the tooltip

### 2. Solana Logo Markers

- Replace the inner `<circle>` in each Marker with a small inline SVG of the Solana logo (the simple "S" gradient mark)
- Keep the outer pulsing ring animation as-is for the glow effect
- The Solana logo will be rendered as an `<image>` or inline `<path>` element inside the SVG `<Marker>`, sized proportionally to `getPulseRadius()`

### 3. Solana-Branded Copy

- Update the pill badge from "Live Registry" to "Solana Assurance Layer"
- Update the heading to: "Solana Builders Across the Globe"
- Update the subtitle to: "Real-time distribution of Solana protocols monitored by the Rezilience Assurance Layer -- live on-chain signals from every continent."
- Update CTA button text to: "Explore Solana Registry"

## Changes to `src/pages/Explorer.tsx`

### 4. Read Country from URL

- On mount, read `country` from `URLSearchParams` (via `useSearchParams` or `useLocation`)
- If a valid country code is present, set `countryFilter` to that value
- This makes the map click flow work end-to-end: click US on map -> navigate to `/explorer?country=us` -> Explorer auto-filters to US projects

## Technical Notes

- The `COUNTRIES` array in `lib/countries.ts` uses lowercase values (`us`, `uk`, `sg`, etc.) which match the DB `country` column
- The map uses uppercase ISO alpha-2 (`US`, `GB`, `SG`), so the reverse mapping is: `GB` -> `uk` (special case), everything else -> `code.toLowerCase()`
- The Solana logo will be an inline SVG path (the official gradient "S" mark) rather than an external image, ensuring it renders crisply at small sizes within the map markers
