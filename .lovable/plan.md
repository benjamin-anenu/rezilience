

# Interactive Ecosystem Map on Landing Page

## Overview

Add an interactive world map between the Hero Section and The Gap Section on the landing page. It will visualize the geographic distribution of projects in the Rezilience Registry, pulling live data from `claimed_profiles_public`. This reuses the existing SVG world map infrastructure already built for the admin dashboard -- no new npm dependencies needed.

## Data Flow

The map will query `claimed_profiles_public` to aggregate projects by `country` code, then display:
- Country fill color intensity based on number of projects
- Animated glow dots at country centroids
- Tooltips showing project count, top categories, and liveness breakdown per country
- Summary stats bar (total countries, total projects, most active region)

## New Files

### 1. `src/hooks/useRegistryGeoData.ts`
Custom hook that:
- Fetches all projects from `claimed_profiles_public` (reuses the existing query pattern from `useExplorerProjects`)
- Aggregates by `country` field into a `Map<string, CountryStats>` where `CountryStats` includes: `projectCount`, `activeCount`, `staleCount`, `decayingCount`, `topCategories`, `avgScore`
- Maps lowercase DB codes (`us`) to uppercase ISO codes (`US`) for the SVG map lookup
- Returns: `{ data, isLoading, countryStats, summary }`

### 2. `src/components/landing/EcosystemMapSection.tsx`
The landing page section component containing:
- Section header: "BUILDING ACROSS THE GLOBE" with subtitle
- Summary stats row (countries represented, total registered projects, most active region)
- The interactive SVG map (reusing `WORLD_COUNTRIES` paths from `world-map-paths.ts`)
- Color legend explaining the gradient
- A "View Full Registry" CTA button linking to `/explorer`

**Map behavior:**
- Countries with projects get a teal fill, intensity proportional to project count
- Animated pulsing dots at centroids for countries with data (reusing the pattern from `WorldMap.tsx`)
- Hover tooltip shows: country name, project count, top categories, liveness breakdown (Active/Stale/Decaying)
- Countries without data remain dark (`hsl(214, 18%, 14%)`)
- Responsive: scales to container width

## Modified Files

### 3. `src/components/landing/index.ts`
Add export for `EcosystemMapSection`.

### 4. `src/pages/Index.tsx`
Insert `<EcosystemMapSection />` between `<HeroSection />` and `<TheGapSection />`.

## Technical Details

- The existing `WORLD_COUNTRIES` array in `world-map-paths.ts` provides ~180 SVG country paths with ISO alpha-2 IDs and centroid coordinates -- we reuse this directly
- Country code translation: DB stores `us` -> map expects `US` (simple `.toUpperCase()`)
- Special case: DB code `uk` maps to ISO `GB` (the map paths use `GB` for United Kingdom)
- The `other` country code in the DB (used for countries not in the COUNTRIES list) will be excluded from the map since it has no geographic position
- Framer Motion will be used for section entrance animations and tooltip transitions
- The map viewBox matches the admin version (`0 0 800 420`) for consistency

## Current Data Snapshot

Based on current DB data, the map will show ~17 countries with data:
- US: 22 projects (heaviest)
- India: 5, Poland: 3, UK/HK/KR/PT/DE/SG/FR: 2 each
- NG/CA/CH/BR/NL: 1 each
- "other": 8 (excluded from map)

