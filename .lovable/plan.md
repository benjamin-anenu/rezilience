

# Solana Builder Toolkit -- Four Public-Good Tools

## What We're Building

A new `/tools` hub page under the TOOLKIT dropdown with four live utility tools that solve real, daily Solana builder pain points:

1. **RPC Health Monitor** -- Live latency and status of major RPC providers
2. **Token/Program Lookup** -- Paste any Solana address, get decoded info instantly
3. **Transaction Decoder** -- Human-readable breakdown of any transaction
4. **Ecosystem Status Page** -- Operational status of major Solana services

## Architecture

All four tools live on a single `/tools` page with tab-based navigation (like the Library rooms). Each tool calls a dedicated edge function that queries public Solana RPC endpoints and APIs -- no API keys needed beyond the existing `RPC_URL` (Helius) secret.

```text
TOOLKIT dropdown
  ├── Tools (NEW) -- /tools
  ├── GPT
  ├── Grants
  └── Library
```

## Tool Details

### 1. RPC Health Monitor
- Edge function `check-rpc-health` pings 5 public RPC endpoints (Helius, Triton, QuickNode free, Alchemy, mainnet-beta) with `getHealth` + `getSlot` calls
- Measures latency, reports status (healthy/degraded/down), shows last block height
- Frontend renders a card grid with green/yellow/red indicators and latency bars
- Auto-refreshes every 30 seconds via `useQuery` with `refetchInterval`

### 2. Token/Program Lookup
- Edge function `lookup-address` accepts a base58 address, calls `getAccountInfo` via Helius RPC
- Detects account type (Program, Token Mint, Token Account, Wallet, Unknown)
- For programs: shows executable status, owner, upgrade authority, data size
- For token mints: shows supply, decimals, mint authority, freeze authority
- Frontend: search bar + result card with parsed fields

### 3. Transaction Decoder
- Edge function `decode-transaction` accepts a signature, calls `getTransaction` with `maxSupportedTransactionVersion: 0`
- Parses: fee, block time, signers, instructions (program + parsed data), token balance changes, logs
- Frontend: search bar + structured breakdown with collapsible instruction cards

### 4. Ecosystem Status Page
- Edge function `check-ecosystem-status` pings health endpoints of major services (Helius, Jupiter, Birdeye, Magic Eden, Jito, Marinade, Raydium, Orca, Phantom)
- Simple HTTP HEAD/GET with 5s timeout -- marks as up/degraded/down
- Frontend: status grid with uptime indicators, auto-refresh every 60s

## Files Created

- `src/pages/Tools.tsx` -- Hub page with four tabs
- `src/components/tools/RPCHealthMonitor.tsx` -- RPC health card grid
- `src/components/tools/AddressLookup.tsx` -- Address search + result display
- `src/components/tools/TransactionDecoder.tsx` -- Tx search + instruction breakdown
- `src/components/tools/EcosystemStatus.tsx` -- Service status grid
- `supabase/functions/check-rpc-health/index.ts`
- `supabase/functions/lookup-address/index.ts`
- `supabase/functions/decode-transaction/index.ts`
- `supabase/functions/check-ecosystem-status/index.ts`

## Files Modified

- `src/components/layout/Navigation.tsx` -- Add "Tools" to `toolkitItems` array
- `src/App.tsx` -- Add `/tools` route

## No New Secrets Needed

All tools use the existing `RPC_URL` secret (Helius) for Solana queries, and public HTTP endpoints for ecosystem status checks.

