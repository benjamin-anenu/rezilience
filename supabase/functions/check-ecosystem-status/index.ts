import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ServiceDef {
  name: string;
  url: string;
  category: string;
  method?: string;
  body?: string;
  requires_key?: boolean;
}

const SERVICES: ServiceDef[] = [
  { name: 'Solana Mainnet RPC', url: 'https://api.mainnet-beta.solana.com', category: 'Infrastructure', method: 'POST', body: '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' },
  { name: 'Helius', url: Deno.env.get('RPC_URL') || '', category: 'Infrastructure', method: 'POST', body: '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' },
  { name: 'Jupiter', url: 'https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112', category: 'DEX', requires_key: true },
  { name: 'Birdeye', url: 'https://public-api.birdeye.so/defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=1', category: 'Analytics', requires_key: true },
  { name: 'Magic Eden', url: 'https://api-mainnet.magiceden.dev/v2/collections/popular?limit=1', category: 'NFT' },
  { name: 'Jito', url: 'https://bundles.jito.wtf/api/v1/bundles/tip_floor', category: 'MEV' },
  { name: 'Raydium', url: 'https://api-v3.raydium.io/pools/info/list?poolType=all&poolSortField=default&sortType=desc&pageSize=1&page=1', category: 'DEX' },
  { name: 'DexScreener', url: 'https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112', category: 'Analytics' },
];

function deriveStatus(service: ServiceDef, res: Response, latency: number): string {
  const code = res.status;

  // 5xx → down
  if (code >= 500) return 'down';

  // 429 → rate limited (service is alive)
  if (code === 429) return 'rate_limited';

  // 401/403 on services that need a key → auth_required
  if ((code === 401 || code === 403) && service.requires_key) return 'auth_required';

  // 200-299 → up or degraded by latency
  if (res.ok) return latency < 2000 ? 'up' : 'degraded';

  // Other 4xx from non-key services → treat as degraded (reachable but unexpected)
  if (code >= 400 && code < 500) return 'degraded';

  return 'down';
}

async function checkService(service: ServiceDef) {
  if (!service.url) return { name: service.name, category: service.category, status: 'down', latency: null, error: 'No URL', requires_key: !!service.requires_key };

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
    await res.text();

    const status = deriveStatus(service, res, latency);
    return { name: service.name, category: service.category, status, latency, http_status: res.status, requires_key: !!service.requires_key };
  } catch (e) {
    return { name: service.name, category: service.category, status: 'down', latency: null, error: e.message, requires_key: !!service.requires_key };
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
      auth_required: results.filter(r => r.status === 'auth_required').length,
      rate_limited: results.filter(r => r.status === 'rate_limited').length,
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
