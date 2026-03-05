

# Fix Unreachable RPC and Ecosystem Endpoints

## Problem
Several hardcoded URLs in the edge functions are unreachable from the Deno runtime:
- **Triton** (`https://mainnet.triton.one`) -- DNS fails; requires project-specific URL
- **Jupiter** (`quote-api.jup.ag`) -- DNS fails from edge function network
- **Birdeye** (`public-api.birdeye.so`) -- returns 404 (endpoint changed or requires API key header)
- **Magic Eden** (`api-mainnet.magiceden.dev`) -- returns 400
- **Raydium** (`api-v3.raydium.io/main/pairs`) -- returns 404 (path changed)

## Fix

### 1. `check-rpc-health/index.ts` -- Replace Triton with reachable endpoints
- Remove `https://mainnet.triton.one` (not publicly accessible without account)
- Replace with **Ankr** (`https://rpc.ankr.com/solana`) and/or **GetBlock** or simply keep only the two working providers (Helius + Solana Mainnet) and add a note that more can be configured

### 2. `check-ecosystem-status/index.ts` -- Update API URLs
- **Jupiter**: Update to `https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112` (their current public API)
- **Birdeye**: Update to `https://public-api.birdeye.so/defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=1` or use their v1 endpoint
- **Magic Eden**: Update to `https://api-mainnet.magiceden.dev/v2/collections/popular?limit=1`
- **Raydium**: Update to `https://api-v3.raydium.io/pools/info/list?poolType=all&poolSortField=default&sortType=desc&pageSize=1&page=1`

### Files Modified
- `supabase/functions/check-rpc-health/index.ts` -- replace Triton URL
- `supabase/functions/check-ecosystem-status/index.ts` -- update 4 API URLs

