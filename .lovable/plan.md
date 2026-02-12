

# Expand Protocol Library + Algolia Integration Setup

## Part 1: Add More Protocols (Tier 2)

Add 10 new Tier 2 protocols to `src/data/protocols.ts`, covering gaps across all categories:

**DeFi (3 new)**
- **Orca** -- Leading concentrated liquidity DEX (Whirlpools)
- **Drift Protocol** -- Perpetuals and spot DEX
- **Marginfi** -- Lending and borrowing protocol

**Infrastructure (2 new)**
- **Switchboard** -- Decentralized oracle network (alternative to Pyth)
- **Clockwork** -- On-chain automation / cron jobs (now Sablier)

**NFTs (1 new)**
- **Tensor** -- NFT trading and analytics platform

**Developer Tools (3 new)**
- **Solana Playground** -- Browser-based IDE for Solana programs
- **Seahorse** -- Write Solana programs in Python (compiles to Anchor)
- **Bankrun** -- Fast Solana program testing framework

**Wallets (1 new)**
- **Solflare** -- Multi-platform Solana wallet with staking

Update `src/data/categories.ts` protocol counts to match new totals:
- DeFi: 3 -> 6
- Infrastructure: 4 -> 6
- NFTs: 1 -> 2
- Developer Tools: 1 -> 4
- Wallets: 1 -> 2

Also update the Algolia reindex edge function's protocol array to include all 20 protocols.

## Part 2: Algolia Integration

### Secrets Needed
Three values are required:
1. **ALGOLIA_ADMIN_KEY** -- stored as a backend secret (for the reindex edge function)
2. **ALGOLIA_APP_ID** -- stored as a backend secret (for the reindex edge function)
3. **VITE_ALGOLIA_APP_ID** -- added to code (publishable, safe for frontend)
4. **VITE_ALGOLIA_SEARCH_KEY** -- added to code (publishable, safe for frontend)

I will request the secrets from you after you confirm. The publishable keys will be added directly to the frontend search code.

### Flow
1. You provide all 3 credentials (App ID, Search Key, Admin Key)
2. I store `ALGOLIA_ADMIN_KEY` and `ALGOLIA_APP_ID` as backend secrets
3. I add `VITE_ALGOLIA_APP_ID` and `VITE_ALGOLIA_SEARCH_KEY` to the search library code
4. Deploy the `algolia-reindex` edge function
5. Call the edge function to seed the index with all 20 protocols

## Technical Details

### Files modified
- `src/data/protocols.ts` -- Add 10 Tier 2 protocol entries (each with full data: description, links, code examples, common issues, when-to-use/not-to-use, keywords)
- `src/data/categories.ts` -- Update protocol counts
- `src/lib/library-search.ts` -- Add VITE_ALGOLIA_APP_ID and VITE_ALGOLIA_SEARCH_KEY references (currently reads from `import.meta.env`)
- `supabase/functions/algolia-reindex/index.ts` -- Add all 20 protocols to the index data

### No new dependencies
`algoliasearch` is already installed. The `library-search.ts` already imports from `algoliasearch/lite`.

### No breaking changes
- Existing 10 protocols remain unchanged
- Search fallback continues to work without Algolia keys
- All existing routes and components are unaffected

