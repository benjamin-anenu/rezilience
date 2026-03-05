

# Expand RPC Health Monitor with All Available Public Providers

## What Changes

Update `supabase/functions/check-rpc-health/index.ts` to add every major publicly accessible Solana RPC endpoint. Also update the frontend grid layout to accommodate more cards.

## New RPC Endpoints

Current 3 providers expand to **8+**:

| Provider | URL | Notes |
|----------|-----|-------|
| Helius | From `RPC_URL` secret | Already present |
| Solana Mainnet | `api.mainnet-beta.solana.com` | Already present |
| Ankr | `rpc.ankr.com/solana` | Already present |
| **QuickNode (Free)** | `solana-mainnet.quiknode.pro` | Free public tier |
| **GetBlock** | `go.getblock.io/solana-mainnet` | Free public endpoint |
| **Alchemy** | `solana-mainnet.g.alchemy.com/v2/demo` | Demo key endpoint |
| **Chainstack** | `solana-mainnet.core.chainstack.com` | Public endpoint |
| **PublicNode** | `solana-rpc.publicnode.com` | Free community RPC |

Some of these may fail DNS from the edge function runtime (same issue Triton had). The existing error handling already gracefully marks unreachable providers as "down" -- so no risk, just honest reporting.

## Files Modified

1. **`supabase/functions/check-rpc-health/index.ts`** -- Add 5 new entries to `RPC_ENDPOINTS` array
2. **`src/components/tools/RPCHealthMonitor.tsx`** -- Update skeleton count from 3 to 8 to match, and adjust grid to `lg:grid-cols-4` for better layout with more cards

