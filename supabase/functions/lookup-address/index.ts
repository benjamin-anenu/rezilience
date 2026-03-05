import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RPC_URL = Deno.env.get('RPC_URL') || '';

const KNOWN_PROGRAMS: Record<string, string> = {
  '11111111111111111111111111111111': 'System Program',
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'Token Program',
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb': 'Token-2022',
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL': 'Associated Token',
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr': 'Memo v2',
  'BPFLoaderUpgradeab1e11111111111111111111111': 'BPF Upgradeable Loader',
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': 'Jupiter v6',
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc': 'Orca Whirlpool',
};

async function rpcCall(method: string, params: unknown[]) {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { address } = await req.json();
    if (!address || typeof address !== 'string') {
      return new Response(JSON.stringify({ error: 'Address required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if it's a known program
    const knownName = KNOWN_PROGRAMS[address];

    const accountInfo = await rpcCall('getAccountInfo', [address, { encoding: 'jsonParsed' }]);

    if (!accountInfo?.value) {
      return new Response(JSON.stringify({
        address, type: 'unknown', exists: false, known_name: knownName || null,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data, executable, lamports, owner } = accountInfo.value;
    const solBalance = lamports / 1e9;

    let type = 'wallet';
    let details: Record<string, unknown> = { sol_balance: solBalance, owner };

    if (executable) {
      type = 'program';
      details = { ...details, executable: true, data_size: data?.[0]?.length || 0 };
    } else if (owner === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' || owner === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') {
      if (data?.parsed?.type === 'mint') {
        type = 'token_mint';
        const info = data.parsed.info;
        details = {
          ...details,
          supply: info.supply,
          decimals: info.decimals,
          mint_authority: info.mintAuthority,
          freeze_authority: info.freezeAuthority,
          is_initialized: info.isInitialized,
        };
      } else if (data?.parsed?.type === 'account') {
        type = 'token_account';
        const info = data.parsed.info;
        details = {
          ...details,
          mint: info.mint,
          token_amount: info.tokenAmount,
          owner: info.owner,
          state: info.state,
        };
      }
    }

    return new Response(JSON.stringify({
      address, type, exists: true, known_name: knownName || null, details,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
