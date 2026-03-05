import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SERVICES = [
  { name: 'Solana Mainnet RPC', url: 'https://api.mainnet-beta.solana.com', category: 'Infrastructure', method: 'POST', body: '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' },
  { name: 'Helius', url: Deno.env.get('RPC_URL') || '', category: 'Infrastructure', method: 'POST', body: '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' },
  { name: 'Jupiter', url: 'https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000', category: 'DEX' },
  { name: 'Birdeye', url: 'https://public-api.birdeye.so/public/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=1', category: 'Analytics' },
  { name: 'Magic Eden', url: 'https://api-mainnet.magiceden.dev/v2/collections?offset=0&limit=1', category: 'NFT' },
  { name: 'Jito', url: 'https://bundles.jito.wtf/api/v1/bundles/tip_floor', category: 'MEV' },
  { name: 'Raydium', url: 'https://api-v3.raydium.io/main/pairs', category: 'DEX' },
  { name: 'DexScreener', url: 'https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112', category: 'Analytics' },
];

async function checkService(service: typeof SERVICES[0]) {
  if (!service.url) return { name: service.name, category: service.category, status: 'down', latency: null, error: 'No URL' };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const start = Date.now();
    const opts: RequestInit = { signal: controller.signal, method: service.method || 'GET' };
    if (service.body) {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = service.body;
    }
    const res = await fetch(service.url, opts);
    const latency = Date.now() - start;
    await res.text(); // consume body

    const status = res.ok ? (latency < 2000 ? 'up' : 'degraded') : 'down';
    return { name: service.name, category: service.category, status, latency, http_status: res.status };
  } catch (e) {
    return { name: service.name, category: service.category, status: 'down', latency: null, error: e.message };
  } finally {
    clearTimeout(timeout);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const results = await Promise.all(SERVICES.map(checkService));
    const summary = {
      total: results.length,
      up: results.filter(r => r.status === 'up').length,
      degraded: results.filter(r => r.status === 'degraded').length,
      down: results.filter(r => r.status === 'down').length,
    };
    return new Response(JSON.stringify({ results, summary, checked_at: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
