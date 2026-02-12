

# Rezilience Library -- Premium Knowledge Hub Redesign

## Vision

Transform the Library from a flat list of protocol cards into an immersive, experience-adaptive knowledge platform with four distinct "rooms" -- each serving a different purpose and audience level. The design follows the Bloomberg Terminal aesthetic with premium interactions.

## Architecture: Four Rooms

```text
/library (Landing Hub)
  |
  +-- /library/learn        --> Room 1: Guided Learning (experience-adaptive)
  |     +-- /library/learn/beginner
  |     +-- /library/learn/intermediate  
  |     +-- /library/learn/advanced
  |
  +-- /library/dictionary   --> Room 2: Solana Dictionary (A-Z glossary)
  |
  +-- /library/blueprints   --> Room 3: Project Blueprints (interactive dependency maps)
  |     +-- /library/blueprints/wallet
  |     +-- /library/blueprints/defi-protocol
  |     +-- /library/blueprints/nft-marketplace
  |     +-- /library/blueprints/depin-node
  |     +-- /library/blueprints/dao
  |
  +-- /library/protocols    --> Room 4: Protocol Search (current search, refined UI)
        +-- /library/:slug  --> Protocol Detail (existing, unchanged)
```

## Room 1: Guided Learning (Experience-Adaptive)

When a developer enters the Library, the landing hub greets them with:

**"Where are you on your Solana journey?"**

Three clickable experience tiers displayed as premium glass cards:

- **Explorer** (0-6 months) -- "I'm new to Solana and want to understand the basics"
  - Shows: What is Solana, Accounts Model, Transactions 101, Setting up your first wallet, Hello World program
- **Builder** (6-24 months) -- "I've built on Solana and want to go deeper"
  - Shows: Advanced Anchor patterns, CPI (Cross-Program Invocation), Token Extensions, Compressed NFTs, Versioned Transactions
- **Architect** (2+ years) -- "I'm designing production systems"
  - Shows: Program security auditing, Clockwork automation, Multi-sig governance patterns, Custom oracle integration, ZK compression

Each tier unlocks curriculum-style content cards with progress indicators. Content is stored as static TypeScript data (like protocols) for editorial quality.

## Room 2: Solana Dictionary

A searchable, alphabetically organized glossary of Solana and Web3 terminology.

Each entry includes:
- **Term** (e.g., "PDA -- Program Derived Address")
- **Category tag** (Accounts, Transactions, DeFi, NFTs, Governance, etc.)
- **Plain English definition** -- What it is
- **When to use it** -- Practical context
- **Example** -- Code snippet or analogy
- **Related terms** -- Cross-links to other dictionary entries

The dictionary is filterable by category and searchable via the existing Algolia/fallback system. Initial seed: 40-50 essential terms.

## Room 3: Project Blueprints (Interactive Dependency Maps)

The signature feature. A developer selects what they want to build:

- Build a Solana Wallet
- Build a DeFi Protocol (DEX / Lending)
- Build an NFT Marketplace
- Build a DePIN Node
- Build a DAO / Governance System

Each blueprint renders an interactive tree (using @xyflow/react, same as dependency-tree) showing:

```text
[Project Goal]
    |
    +-- [Step 1: Environment Setup]
    |     Language: Rust / TypeScript
    |     Tools: Anchor, Solana CLI
    |     Docs: link
    |
    +-- [Step 2: Core Program]
    |     Dependencies: [solana-web3.js] [anchor]
    |     APIs: [Helius RPC]
    |     Est. Cost: Free tier / $49/mo
    |
    +-- [Step 3: Frontend]
    |     Dependencies: [wallet-adapter] [React]
    |     APIs: [Jupiter] [Pyth]
    |
    +-- [Step 4: Testing & Deployment]
          Tools: [Bankrun] [Solana Playground]
          Network: Devnet -> Mainnet
```

Each node is clickable, linking to the relevant protocol detail or dictionary entry. Badges show recommended programming language and alternatives. Cost disclaimers note that pricing may change.

## Room 4: Protocol Search (Refined)

The current search + protocol grid, but with a cleaner UI:
- Larger search bar with prominent placement
- Simplified category pills (horizontal scroll on mobile) instead of the 5-column grid
- Protocol cards with clearer hierarchy: name, one-line description, difficulty badge
- Remove visual clutter (Recently Updated section folds into a "Sort by" dropdown)

## Landing Hub Design

The `/library` page becomes a premium gateway with:

1. **Hero**: "THE REZILIENCE LIBRARY" headline with subtext: "The knowledge centre for Solana builders. Whether you wrote your first program yesterday or you've shipped three protocols -- start here."
2. **Experience Selector**: Three glass cards (Explorer / Builder / Architect) that persist choice in localStorage
3. **Four Room Cards**: Large, icon-driven navigation cards for Learn, Dictionary, Blueprints, and Search -- each with a one-line description and entry count
4. **Search Bar**: Positioned prominently below the hero for quick protocol lookup

## Technical Implementation

### New Files
- `src/pages/LibraryLearn.tsx` -- Learning room with experience tiers
- `src/pages/LibraryDictionary.tsx` -- Dictionary page with search and filters
- `src/pages/LibraryBlueprints.tsx` -- Blueprint listing page
- `src/pages/LibraryBlueprintDetail.tsx` -- Individual blueprint with @xyflow/react tree
- `src/data/dictionary.ts` -- 40-50 Solana/Web3 term entries
- `src/data/learning-paths.ts` -- Curriculum content per experience level
- `src/data/blueprints.ts` -- Blueprint tree data (nodes, edges, metadata)
- `src/components/library/ExperienceSelector.tsx` -- Three-tier selector component
- `src/components/library/RoomCard.tsx` -- Navigation card for each room
- `src/components/library/DictionaryEntry.tsx` -- Individual term card
- `src/components/library/BlueprintNode.tsx` -- Custom @xyflow/react node for blueprints

### Modified Files
- `src/pages/Library.tsx` -- Complete redesign as the hub/gateway
- `src/App.tsx` -- Add new routes (`/library/learn`, `/library/dictionary`, `/library/blueprints`, `/library/blueprints/:type`)
- `src/components/library/LibraryHero.tsx` -- Redesign for the new premium hero
- `src/components/library/index.ts` -- Export new components
- `src/components/layout/Navigation.tsx` -- No change needed (Library link already exists)

### No New Dependencies
- @xyflow/react is already installed (used for dependency tree)
- framer-motion is already installed (for entrance animations)
- All UI components (Card, Badge, Tabs, etc.) already exist

### Data Strategy
All content is static TypeScript files for editorial quality and Algolia indexability. No database tables needed. Dictionary and learning content can later be indexed into Algolia using the existing reindex edge function.

### Mobile UX
- Experience selector uses horizontal swipe cards
- Room cards stack vertically
- Blueprint trees use pinch-to-zoom (already supported by @xyflow/react)
- Dictionary uses vaul drawers for term details on mobile

## Implementation Order

1. Data files first (dictionary.ts, learning-paths.ts, blueprints.ts)
2. Library hub redesign (Library.tsx + new hero)
3. Room 4: Protocol Search refinement (quickest, builds on existing)
4. Room 2: Dictionary page
5. Room 1: Learning room with experience tiers
6. Room 3: Blueprints with interactive trees
7. Route registration in App.tsx

This is a large feature set. I recommend we build it in 2-3 rounds:
- **Round 1**: Hub redesign + Dictionary + Protocol Search refinement
- **Round 2**: Learning room with experience tiers
- **Round 3**: Project Blueprints with interactive dependency maps

