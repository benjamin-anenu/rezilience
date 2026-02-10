

# Add RPC_URL Secret for Reliable Solana RPC Access

## What This Does
Adds a `RPC_URL` secret to the project so the `verify-bytecode` edge function uses a dedicated Solana RPC endpoint instead of the rate-limited public one.

## Steps

1. **Request the secret** -- Use the add_secret tool to prompt you for your Helius (or other provider) RPC URL.
   - Format will be something like: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
   - You can get a free key at [helius.dev](https://helius.dev) (100K requests/day, no credit card needed)

2. **No code changes needed** -- The `verify-bytecode` function already reads `RPC_URL` from environment and falls back to the public endpoint:
   ```typescript
   const rpcUrl = Deno.env.get("RPC_URL") || "https://api.mainnet-beta.solana.com";
   ```
   Once the secret is set, it will be picked up automatically on the next invocation.

## How to Get a Free Helius API Key
1. Go to [helius.dev](https://helius.dev) and sign up
2. Create a new project
3. Copy the RPC URL (it includes your API key)
4. Paste it when prompted

