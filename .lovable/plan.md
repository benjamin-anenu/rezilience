

# Rezilience Library: Hybrid Search Architecture (Algolia + TypeScript Fallback)

## Adapting Claude's Architecture to Our Stack

The Claude conversation outlines a solid hybrid search system, but several parts need adaptation because we run on **Vite/React + Lovable Cloud**, not Next.js:

| Claude's Plan | Our Adaptation |
|---|---|
| `NEXT_PUBLIC_` env vars | `VITE_ALGOLIA_APP_ID` and `VITE_ALGOLIA_SEARCH_KEY` (publishable keys, safe in code) |
| `.env.local` for admin key | Lovable Cloud secret (`ALGOLIA_ADMIN_KEY`) accessed via edge function |
| `ts-node` indexing script | Edge function `algolia-reindex` callable on-demand |
| CI/CD reindex step | Manual trigger via edge function (or future cron) |

## What Gets Built

### Phase 1: Data Layer

**`src/data/protocols.ts`** -- 10 Tier 1 protocol entries following the same static-data pattern as `solana-grants.ts`:
- Jupiter, Anchor, Metaplex, Helius, Pyth, Phantom, Solana Web3.js, SPL Token, Raydium, Marinade
- Each entry: name, slug, id, category, tier, description, status, lastUpdated, links (official/docs/github/discord/twitter), quickFacts, integration difficulty, install commands, code example, common issues, when-to-use/when-not-to-use, keywords

**`src/data/categories.ts`** -- 5 categories: DeFi, Infrastructure, NFTs, Developer Tools, Wallets

### Phase 2: Search Layer

**`src/lib/library-search.ts`** -- Hybrid search engine:
- Primary: Algolia `algoliasearch/lite` (publishable key in frontend, ~5KB)
- Fallback: Weighted client-side TypeScript search (exact name > keyword > description > category)
- localStorage request counter with monthly reset
- Automatic degradation at 9,500 requests (buffer before 10K free tier limit)
- Returns `{ results, searchMethod, limitReached }`

### Phase 3: Indexing Edge Function

**`supabase/functions/algolia-reindex/index.ts`** -- Edge function that:
- Reads `ALGOLIA_ADMIN_KEY` from Lovable Cloud secrets
- Reads `ALGOLIA_APP_ID` from secrets
- Imports protocol data and pushes to Algolia index
- Configures searchable attributes, faceting, and custom ranking
- Called manually when protocol data changes

### Phase 4: UI Components

All in `src/components/library/`:

1. **`LibraryHero.tsx`** -- Intent-driven hero section with stats ("10+ Protocols", "Always Up-to-Date", "less than 5min To First Integration"), popular paths quick links, Bloomberg terminal aesthetic (Space Grotesk, teal accents, dark cards)

2. **`LibrarySearchBar.tsx`** -- Search input with:
   - Debounced input (300ms)
   - Dropdown results showing protocol name, category badge, description
   - Keyboard navigation (Enter selects top result)
   - Search method indicator (lightning bolt for Algolia, CPU icon for fallback)
   - Usage warning banner when approaching limit
   - Clear button

3. **`ProtocolCard.tsx`** -- Card displaying: name, category badge, difficulty badge, time-to-integrate estimate, description snippet, "Updated X days ago" indicator, link to detail page

4. **`CategoryGrid.tsx`** -- 5 clickable category cards (TrendingUp for DeFi, Server for Infrastructure, Image for NFTs, Wrench for Tools, Wallet for Wallets) that filter the protocol list

5. **`CodeBlock.tsx`** -- Minimal `<pre>` with `font-mono` styling and copy-to-clipboard button. No external syntax highlighting dependency.

6. **`UpdateBadge.tsx`** -- Relative time display using `date-fns` (already installed)

### Phase 5: Pages

**`src/pages/Library.tsx`** (complete rewrite) -- The hub:
- LibraryHero with integrated search
- Popular Learning Paths section (4 cards: "Your First Solana Program", "Token Swap Integration", "NFT Minting", "Oracle Price Feeds")
- CategoryGrid for filtering
- "Core Infrastructure" section showing Tier 1 protocol cards
- "Recently Updated" section
- Responsive: 1-col mobile, 2-col tablet, 3-col desktop

**`src/pages/ProtocolDetail.tsx`** (new) -- Individual protocol at `/library/:slug`:
- Back navigation to Library
- Protocol header with name, description, update badge, external links
- Quick Start section (install commands + code in CodeBlock)
- "When to Use" vs "When Not to Use" comparison
- Common Issues and Solutions
- Quick Facts sidebar
- Link to official documentation

### Phase 6: Routing

Add to `src/App.tsx`: `/library/:slug` route for ProtocolDetail

## Dependencies

**New npm package**: `algoliasearch` (the `/lite` build is ~5KB gzipped, client-side only, publishable key)

**New Lovable Cloud secret**: `ALGOLIA_ADMIN_KEY` (requested from user before building the edge function)

**New publishable config** (safe in code):
- `VITE_ALGOLIA_APP_ID`
- `VITE_ALGOLIA_SEARCH_KEY`

These will be added after the user creates their free Algolia account.

## Edge Cases Handled

| Scenario | Behavior |
|---|---|
| No Algolia keys configured | Falls back to TypeScript search silently (zero errors) |
| Algolia rate limit hit | Automatic switch to fallback, user sees subtle indicator |
| Invalid protocol slug in URL | Redirect to `/library` with toast notification |
| Empty search query | Shows all protocols grouped by category |
| Mobile viewport | Single-column layout, search dropdown fills width |
| Code block overflow | Horizontal scroll within CodeBlock component |
| Protocol data changes | Call `algolia-reindex` edge function to sync index |

## User Flows

1. **Search flow**: Library -> Type "swap" -> See Jupiter card in dropdown -> Click -> Read quick-start -> Copy code
2. **Browse flow**: Library -> Click "DeFi" category -> Browse filtered cards -> Select protocol -> Read detail
3. **Learning path flow**: Library -> Click "Your First Solana Program" -> Guided sequence of protocol cards

## File Summary

### New files (12)
- `src/data/protocols.ts`
- `src/data/categories.ts`
- `src/lib/library-search.ts`
- `src/components/library/LibraryHero.tsx`
- `src/components/library/LibrarySearchBar.tsx`
- `src/components/library/ProtocolCard.tsx`
- `src/components/library/CategoryGrid.tsx`
- `src/components/library/CodeBlock.tsx`
- `src/components/library/UpdateBadge.tsx`
- `src/components/library/index.ts`
- `src/pages/ProtocolDetail.tsx`
- `supabase/functions/algolia-reindex/index.ts`

### Modified files (2)
- `src/pages/Library.tsx` -- Complete rewrite
- `src/App.tsx` -- Add `/library/:slug` route

### New dependency (1)
- `algoliasearch` -- Algolia client (lite build for frontend search)

### New Lovable Cloud secret (1)
- `ALGOLIA_ADMIN_KEY` -- For the reindex edge function

### Setup sequence
1. Build all static data files and UI components first (works with fallback search immediately)
2. Ask user to create Algolia account and provide keys
3. Store admin key as Lovable Cloud secret
4. Add publishable keys to code
5. Deploy reindex edge function
6. Run initial index

This means the Library works immediately with TypeScript search while Algolia is being set up -- zero blocked work.

