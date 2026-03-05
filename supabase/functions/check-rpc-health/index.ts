import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface RPCEndpoint {
  name: string;
  url: string;
  docs_url: string;
  requires_key?: boolean; // true = private endpoint (will get 401/403 without key)
}

const RPC_ENDPOINTS: RPCEndpoint[] = [
  { name: 'Helius', url: Deno.env.get('RPC_URL') || '', docs_url: 'https://www.helius.dev/' },
  { name: 'Solana Mainnet', url: 'https://api.mainnet-beta.solana.com', docs_url: 'https://solana.com/docs/core/clusters' },
  { name: 'PublicNode', url: 'https://solana-rpc.publicnode.com', docs_url: 'https://www.publicnode.com/' },
  // Private endpoints — we still ping them for latency but flag them differently
  { name: 'Ankr', url: 'https://rpc.ankr.com/solana', docs_url: 'https://www.ankr.com/rpc/solana/', requires_key: true },
  { name: 'Extrnode', url: 'https://solana-mainnet.rpc.extrnode.com', docs_url: 'https://extrnode.com/', requires_key: true },
];

async function checkEndpoint(endpoint: RPCEndpoint) {
  if (!endpoint.url) return { name: endpoint.name, status: 'down', latency: null, slot: null, docs_url: endpoint.docs_url, requires_key: !!endpoint.requires_key, error: 'No URL configured' };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const start = Date.now();
    const healthRes = await fetch(endpoint.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' }),
      signal: controller.signal,
    });
    const healthLatency = Date.now() - start;

    let slotValue: number | null = null;
    let slotLatency = 0;

    // Only try getSlot if health request succeeded with HTTP 200
    if (healthRes.ok) {
      const slotStart = Date.now();
      const slotRes = await fetch(endpoint.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'getSlot' }),
        signal: controller.signal,
      });
      const slotData = await slotRes.json();
      slotLatency = Date.now() - slotStart;
      slotValue = typeof slotData.result === 'number' ? slotData.result : null;
    }

    const avgLatency = Math.round(slotLatency > 0 ? (healthLatency + slotLatency) / 2 : healthLatency);

    // For private endpoints that return 401/403, they are "reachable" but need a key
    if (!healthRes.ok && endpoint.requires_key) {
      return {
        name: endpoint.name,
        status: 'private',
        latency: avgLatency,
        slot: null,
        docs_url: endpoint.docs_url,
        requires_key: true,
      };
    }

    return {
      name: endpoint.name,
      status: healthRes.ok ? (avgLatency < 500 ? 'healthy' : 'degraded') : 'down',
      latency: avgLatency,
      slot: slotValue,
      docs_url: endpoint.docs_url,
      requires_key: !!endpoint.requires_key,
    };
  } catch (e) {
    return { name: endpoint.name, status: 'down', latency: null, slot: null, docs_url: endpoint.docs_url, requires_key: !!endpoint.requires_key, error: e.message };
  } finally {
    clearTimeout(timeout);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const results = await Promise.all(RPC_ENDPOINTS.map(checkEndpoint));
    return new Response(JSON.stringify({ results, checked_at: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
