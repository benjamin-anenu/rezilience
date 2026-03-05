import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RPC_ENDPOINTS = [
  { name: 'Helius', url: Deno.env.get('RPC_URL') || '' },
  { name: 'Solana Mainnet', url: 'https://api.mainnet-beta.solana.com' },
  { name: 'Triton (Free)', url: 'https://mainnet.triton.one' },
];

async function checkEndpoint(endpoint: { name: string; url: string }) {
  if (!endpoint.url) return { name: endpoint.name, status: 'down', latency: null, slot: null, error: 'No URL configured' };

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
    const healthData = await healthRes.json();
    const healthLatency = Date.now() - start;

    const slotStart = Date.now();
    const slotRes = await fetch(endpoint.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'getSlot' }),
      signal: controller.signal,
    });
    const slotData = await slotRes.json();
    const slotLatency = Date.now() - slotStart;

    const avgLatency = Math.round((healthLatency + slotLatency) / 2);
    const isHealthy = healthData.result === 'ok';

    return {
      name: endpoint.name,
      status: isHealthy ? (avgLatency < 500 ? 'healthy' : 'degraded') : 'down',
      latency: avgLatency,
      slot: slotData.result || null,
    };
  } catch (e) {
    return { name: endpoint.name, status: 'down', latency: null, slot: null, error: e.message };
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
