

# Fix: CORS Error and Slow DAO Analysis

## Problem

Two issues are happening together:

1. **Slow response**: The `getProgramAccounts` RPC call against the spl-governance program on mainnet can take 10-30+ seconds for large DAOs. When it exceeds the edge function timeout (default ~60s), the function crashes without sending a response.

2. **CORS error**: When the function times out or crashes, no response headers are sent -- including CORS headers. The browser then blocks the failed request with a CORS error. Additionally, the current `Access-Control-Allow-Headers` is missing headers that the Supabase JS client sends.

## Changes

### File: `supabase/functions/fetch-realms-governance/index.ts`

1. **Update CORS headers** to include all headers the Supabase client sends:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
```

2. **Add RPC request timeouts** using `AbortController` with a 10-second timeout per RPC call, so one slow call doesn't hang the entire function:
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000);
const response = await fetch(rpcUrl, { signal: controller.signal, ... });
clearTimeout(timeout);
```

3. **Limit governance account processing** -- cap at 5 governance accounts to prevent cascading slow RPC calls for large DAOs.

4. **Wrap the entire handler in a try/catch** that always returns CORS headers, even on unexpected errors or timeouts.

### File: `src/components/demo/LiveAnalysisSection.tsx`

5. **Add a timeout indicator in the UI** -- show "This may take up to 30 seconds for large DAOs..." while loading, so users know to wait.

6. **Improve error message for network failures** -- detect fetch/CORS errors and show a user-friendly message like "Request timed out. The DAO may have too many governance accounts for real-time analysis. Try a smaller DAO."

