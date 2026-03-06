import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RPC_URL =
  Deno.env.get("RPC_URL") || "https://api.mainnet-beta.solana.com";

// BPFLoaderUpgradeab1e program ID
const BPF_LOADER = "BPFLoaderUpgradeab1e11111111111111111111111";

interface DeployEvent {
  signature: string;
  slot: number;
  blockTime: number | null;
  programId: string;
  authority: string | null;
  type: "deploy" | "upgrade" | "close";
}

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get recent signatures for the BPF Loader Upgradeable program
    const sigs = await rpc("getSignaturesForAddress", [
      BPF_LOADER,
      { limit: 30 },
    ]);

    const events: DeployEvent[] = [];

    // Process each signature to extract deploy info
    for (const sig of sigs.slice(0, 20)) {
      try {
        const tx = await rpc("getTransaction", [
          sig.signature,
          { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
        ]);

        if (!tx || !tx.meta || tx.meta.err) continue;

        const instructions = tx.transaction?.message?.instructions || [];
        const innerInstructions = tx.meta?.innerInstructions || [];

        // Flatten all instructions
        const allInstructions = [
          ...instructions,
          ...innerInstructions.flatMap((ii: any) => ii.instructions || []),
        ];

        for (const ix of allInstructions) {
          const programIdStr =
            ix.programId?.toString?.() || ix.programId || "";
          if (programIdStr !== BPF_LOADER) continue;

          const parsed = ix.parsed;
          if (!parsed) continue;

          const ixType = parsed.type || "";
          let eventType: "deploy" | "upgrade" | "close" | null = null;

          if (ixType === "deployWithMaxDataLen" || ixType === "initializeBuffer") {
            eventType = "deploy";
          } else if (ixType === "upgrade" || ixType === "setAuthority") {
            eventType = "upgrade";
          } else if (ixType === "close") {
            eventType = "close";
          }

          if (!eventType) continue;

          const info = parsed.info || {};
          const programAddress =
            info.programAccount ||
            info.account ||
            info.bufferAccount ||
            "unknown";

          events.push({
            signature: sig.signature,
            slot: tx.slot,
            blockTime: tx.blockTime,
            programId: programAddress,
            authority: info.authority || info.upgradeAuthority || null,
            type: eventType,
          });
          break; // one event per tx
        }
      } catch {
        // skip failed tx parsing
      }
    }

    // Deduplicate by signature
    const seen = new Set<string>();
    const unique = events.filter((e) => {
      if (seen.has(e.signature)) return false;
      seen.add(e.signature);
      return true;
    });

    return new Response(
      JSON.stringify({ events: unique, fetchedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
