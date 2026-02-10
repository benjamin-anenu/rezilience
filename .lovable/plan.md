

# Three Updates: Compact Heatmap, Language Chart, Registry Disclaimer

## 1. Compact Titan Watch Boxes

Currently the heatmap grid uses `aspect-square` cells with `gap-1`, making boxes large. Changes:

**`src/components/explorer/EcosystemHeatmap.tsx`**
- Increase column count: `grid-cols-8 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-16` (from 6/8/10/12)
- Remove `aspect-square` and use fixed small dimensions: `h-8 w-8 sm:h-9 sm:w-9` for tighter packing
- Reduce gap from `gap-1` to `gap-0.5`
- Reduce score font size slightly for the smaller cells

## 2. Top Languages Chart in Ecosystem Pulse

The `github_languages` JSONB column already exists on `claimed_profiles` and stores byte counts per language. We aggregate across all registry projects to show which languages dominate.

**`src/hooks/useEcosystemPulse.ts`**
- Add `github_languages` to the select query
- Add `languageBreakdown: Record<string, number>` to the `EcosystemAggregates` interface
- In `computeAggregates()`, iterate all profiles, merge their `github_languages` byte counts, then convert to project counts (how many projects use each language) -- project count is more meaningful than raw bytes across different repos
- Return top 8 languages sorted by project count

**`src/components/explorer/EcosystemPulse.tsx`**
- Add a new "Top Languages" card in the bottom row (change from `sm:grid-cols-3` to `sm:grid-cols-2 lg:grid-cols-4` to fit 4 cards)
- Use a horizontal bar chart (same style as the existing Categories card) showing language name + project count
- Icon: `Code` from lucide-react

## 3. Registry Data Disclaimer

**`src/components/explorer/EcosystemPulse.tsx`**
- Add a subtle banner/notice at the top of the Pulse section stating: "Data reflects only projects indexed in the Resilience Registry and does not represent the entire Solana ecosystem."
- Use the same muted styling as the existing `SparseDataNotice` component (border, small text, info icon)
- This notice is always visible (not conditional like the sparse data notice)

## Technical Details

- No database changes needed -- `github_languages` is already stored as JSONB
- The language aggregation counts how many projects use each language (not total bytes) for a fairer representation
- The disclaimer is always shown regardless of data state
