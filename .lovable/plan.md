

# Fix Ankr and Extrnode False "Down" Status

## Problem
Ankr and Extrnode respond successfully (low latency, HTTP 200) but return non-standard responses to `getHealth` and `getSlot`. The current logic only marks a provider healthy if it gets `result: "ok"` from getHealth OR a numeric slot from getSlot. These providers likely return error objects for both (e.g. rate-limit messages or different response formats), so they get marked "down" despite being reachable and functional.

Showing "down" is misleading -- the endpoint is alive and responding, just not returning the expected JSON-RPC result format.

## Solution

### 1. Edge function: Use HTTP response status as the primary health signal
In `supabase/functions/check-rpc-health/index.ts`, change the health determination logic:
- If the endpoint responds with HTTP 200 to either request, it is **reachable** -- mark as "healthy" or "degraded" based on latency
- Only mark "down" if the fetch throws (DNS failure, timeout, connection refused) or returns HTTP 4xx/5xx
- Still try to extract slot number, but treat it as optional metadata, not a health gate

### 2. Frontend: Show "reachable" context for providers without slot data
In `src/components/tools/RPCHealthMonitor.tsx`:
- When `slot` is null but status is healthy/degraded, show "Reachable (slot unavailable)" instead of nothing
- This gives users honest information without painting a false "down" picture

### Files Modified
- `supabase/functions/check-rpc-health/index.ts` -- use HTTP status codes as health signal
- `src/components/tools/RPCHealthMonitor.tsx` -- handle null slot for reachable providers

