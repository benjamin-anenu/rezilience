

# New Library Room: Solana Ecosystem Documentation

## Overview

Add a fifth room to the Library called **"Solana Ecosystem Documentation"** at `/library/docs`. This page surfaces official documentation for the 10 most-used Solana services in a README-style layout with a sticky Table of Contents, AI-powered search via the existing Ask GPT modal, category filters, and direct links to official docs.

## What Gets Built

### 1. Static Data File: `src/data/solana-docs.ts`

A curated list of 10 Solana services, each with:
- Name, slug, logo URL, official docs URL, short description
- Category tag (e.g., "RPC & Data", "DeFi", "Wallets", "NFTs", "Dev Tools", "Identity")
- Key API sections (endpoints, SDKs, CLI tools) with brief descriptions and direct links
- Tags for filtering

**Initial 10 services:**
1. **Helius** (RPC, DAS API, webhooks, enhanced transactions)
2. **Jupiter** (Swap API, Limit Orders, DCA, Perpetuals)
3. **Metaplex** (Token Metadata, Bubblegum cNFTs, Candy Machine, Umi SDK)
4. **Anchor** (Framework, IDL, Program testing, CLI)
5. **Solana Web3.js** (Core SDK, transactions, keypairs, connections)
6. **Phantom** (Wallet Adapter, deeplinks, provider API)
7. **Marinade** (Liquid staking API, mSOL, native stake)
8. **Raydium** (AMM SDK, CLMM, AcceleRaytor)
9. **Squads** (Multisig SDK, program manager, v4 API)
10. **Jito** (MEV, bundles, tip program, block engine)

### 2. New Page: `src/pages/LibraryDocs.tsx`

**Layout mirrors the README page:**
- Hero section with "ECOSYSTEM DOCUMENTATION" badge
- Sticky Table of Contents sidebar (left) listing all 10 services
- Main content area (right) with one section per service, each containing:
  - Service header with logo, name, category badge, and "View Official Docs" external link button
  - Short description card
  - API/SDK subsections as cards (same premium card style as README) listing key features with direct links
  - Each subsection links out to the exact official docs page for that feature

**Search Box (top of page):**
- A prominent search input styled like the Library hero search
- When the user types a query and presses Enter (or clicks search):
  1. The query is sent to the Ask GPT modal which opens automatically
  2. GPT receives a specialized prompt: "The user is looking for Solana documentation about: [query]. Based on our documentation index, suggest which services and API sections are most relevant. If none match perfectly, suggest official documentation URLs that would help."
  3. GPT responds with relevant service recommendations and direct links
  4. If no exact match, GPT provides a disclaimer: "These are AI suggestions -- always verify against official documentation."

**Category Filter Pills:**
- Horizontal pill bar (same pattern as Protocol room) for filtering by category: All, RPC & Data, DeFi, Wallets, NFTs, Dev Tools, Identity
- Filters the visible service sections in real-time

**Ask GPT Button:**
- Positioned in a standalone section below the hero (same pattern as Learning room)
- Opens the existing `AskGptModal` with context about Solana ecosystem documentation

### 3. Room Card Addition

Update `src/pages/Library.tsx`:
- Add a 5th room card: "Ecosystem Docs" with `FileText` icon, linking to `/library/docs`, count shows "10 services"

### 4. Route Registration

Update `src/App.tsx`:
- Add route: `/library/docs` pointing to `LibraryDocs`

## Technical Details

### File Changes

| File | Action |
|------|--------|
| `src/data/solana-docs.ts` | **CREATE** -- Static data for 10 Solana services with API sections |
| `src/pages/LibraryDocs.tsx` | **CREATE** -- Full page with README-style layout, TOC, search, filters |
| `src/components/library/DocsTableOfContents.tsx` | **CREATE** -- Sticky TOC component (reuses pattern from `readme/TableOfContents`) |
| `src/components/library/DocsServiceSection.tsx` | **CREATE** -- Individual service section component |
| `src/components/library/DocsSearchBar.tsx` | **CREATE** -- AI-powered search bar that triggers Ask GPT |
| `src/pages/Library.tsx` | **EDIT** -- Add 5th room card |
| `src/App.tsx` | **EDIT** -- Add `/library/docs` route |

### AI Search Flow

```text
User types query in search box
        |
        v
Press Enter / click search
        |
        v
Open AskGptModal with specialized prompt:
"User is searching Solana docs for: [query].
 Review these services: [list from solana-docs.ts].
 Suggest the most relevant docs sections with links.
 If none match, suggest official URLs with disclaimer."
        |
        v
GPT streams response with recommendations
```

### Component Architecture

- `DocsSearchBar` -- manages query state, triggers AskGptModal on submit
- `DocsTableOfContents` -- sticky sidebar, IntersectionObserver for active section tracking (same as README TOC)
- `DocsServiceSection` -- renders one service with its API subsections as premium cards
- `AskGptModal` -- reused as-is from existing library components

### Design Patterns Followed

- README page layout (hero + TOC sidebar + content sections)
- Protocol room filter pills for category filtering
- Library search bar styling for the search input
- Premium card styling (`card-premium`) for API section cards
- `ExternalLink` icon for all official doc links
- `scroll-mt-24` on sections for smooth TOC scrolling
- Same animation delays on cards (`animate-card-enter`)

