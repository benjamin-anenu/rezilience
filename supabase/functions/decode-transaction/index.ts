import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RPC_URL = Deno.env.get('RPC_URL') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { signature } = await req.json();
    if (!signature || typeof signature !== 'string') {
      return new Response(JSON.stringify({ error: 'Transaction signature required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'getTransaction',
        params: [signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }],
      }),
    });
    const data = await res.json();

    if (data.error) throw new Error(data.error.message);
    if (!data.result) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tx = data.result;
    const meta = tx.meta;
    const message = tx.transaction.message;

    const decoded = {
      signature,
      slot: tx.slot,
      block_time: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : null,
      success: meta.err === null,
      error: meta.err,
      fee_sol: meta.fee / 1e9,
      signers: message.accountKeys
        ?.filter((k: any) => k.signer)
        .map((k: any) => k.pubkey) || [],
      instructions: message.instructions?.map((ix: any, i: number) => ({
        index: i,
        program: ix.programId,
        program_name: ix.program || null,
        parsed: ix.parsed || null,
        data: ix.data || null,
        accounts: ix.accounts || [],
      })) || [],
      inner_instructions: (meta.innerInstructions || []).map((inner: any) => ({
        index: inner.index,
        instructions: inner.instructions?.map((ix: any) => ({
          program: ix.programId,
          program_name: ix.program || null,
          parsed: ix.parsed || null,
        })) || [],
      })),
      token_balance_changes: (() => {
        const pre = meta.preTokenBalances || [];
        const post = meta.postTokenBalances || [];
        return post.map((p: any) => {
          const preEntry = pre.find((pr: any) => pr.accountIndex === p.accountIndex);
          const preAmount = preEntry?.uiTokenAmount?.uiAmount || 0;
          const postAmount = p.uiTokenAmount?.uiAmount || 0;
          return {
            mint: p.mint,
            owner: p.owner,
            change: postAmount - preAmount,
            decimals: p.uiTokenAmount?.decimals,
          };
        }).filter((c: any) => c.change !== 0);
      })(),
      log_messages: meta.logMessages || [],
      compute_units: meta.computeUnitsConsumed || null,
    };

    return new Response(JSON.stringify(decoded), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
