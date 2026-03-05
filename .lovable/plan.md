

# Fix Broken RPC Providers in Health Monitor

## Root Cause

From the live network responses, the failures are clear:

| Provider | Error | Reason |
|----------|-------|--------|
| **Ankr** | Returns data but no valid slot | `getHealth` likely returns non-"ok" or rate-limited |
| **QuickNode** | DNS failure | `solana-mainnet.quiknode.pro` requires a project-specific subdomain (paid) |
| **GetBlock** | Empty JSON response | `go.getblock.io/solana-mainnet` requires an API key in the URL path |
| **Alchemy** | Empty JSON response | `solana-mainnet.g.alchemy.com/v2/demo` demo key is deprecated/blocked |
| **Chainstack** | "Access token" error | Requires authentication token |

**These are not public endpoints.** They all require paid accounts or API keys to function. Only Helius (via secret), Solana Mainnet, and PublicNode are truly free and open.

## Plan

### 1. Update `supabase/functions/check-rpc-health/index.ts`
- Remove QuickNode, GetBlock, Alchemy, Chainstack (require API keys, will always show "down" without them)
- Keep: Helius, Solana Mainnet, Ankr (fix URL to use their documented public endpoint), PublicNode
- Add **Extrnode** (`https://solana-mainnet.rpc.extrnode.com`) -- a truly public free endpoint
- Add each provider's signup/docs URL as a `docs_url` field in the response so the frontend can link to it

### 2. Update `src/components/tools/RPCHealthMonitor.tsx`
- Display a small link icon or "Get API Key" link for providers that have a `docs_url`
- Update skeleton count to match the new provider count (5-6)
- Add a note below the grid: "Want to add more providers? Many RPC services offer free tiers with API keys."

### Files Modified
- `supabase/functions/check-rpc-health/index.ts` -- trim to working endpoints, add docs URLs
- `src/components/tools/RPCHealthMonitor.tsx` -- show docs links, update count

