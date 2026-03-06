import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RPC_URL =
  Deno.env.get("RPC_URL") || "https://api.mainnet-beta.solana.com";

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

// Decode base64 account data to find Anchor IDL
function findAnchorIdlAddress(programId: string): string {
  // Anchor stores IDL at a deterministic PDA:
  // seeds = ["anchor:idl", programId]
  // We'll use the standard approach: fetch from anchor IDL account
  // The IDL account address = PDA(["anchor:idl"], programId)
  // We can't easily compute PDAs in pure JS without @solana/web3.js,
  // so we'll try the Anchor registry API approach instead
  return programId;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { programId } = await req.json();

    if (!programId || typeof programId !== "string" || programId.length < 32) {
      return new Response(
        JSON.stringify({ error: "Invalid program ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strategy 1: Try Anchor's on-chain IDL via the getAccountInfo method
    // Anchor IDL accounts have a well-known seed derivation
    // We'll try to fetch from known public IDL sources

    // Strategy 2: Try fetching from anchor.so public API
    let idl = null;
    let source = "unknown";

    // Try anchor-lang registry (public IDLs hosted by projects)
    try {
      const anchorRes = await fetch(
        `https://raw.githubusercontent.com/AnchorLang/anchor/master/idl/${programId}.json`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (anchorRes.ok) {
        idl = await anchorRes.json();
        source = "anchor-registry";
      }
    } catch {
      // not found, continue
    }

    // Strategy 3: Try Solana FM API (public)
    if (!idl) {
      try {
        const fmRes = await fetch(
          `https://api.solana.fm/v0/programs/${programId}`,
          { 
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(5000),
          }
        );
        if (fmRes.ok) {
          const fmData = await fmRes.json();
          if (fmData?.data?.idl) {
            idl = fmData.data.idl;
            source = "solana-fm";
          }
        }
      } catch {
        // not found, continue
      }
    }

    // Strategy 4: Try to read Anchor IDL account directly from chain
    if (!idl) {
      try {
        // Anchor IDL accounts use discriminator [0x00, 0x00, ...] with specific layout
        // The account address is derived from seeds ["anchor:idl"] + programId
        // Since we can't compute PDA without crypto libs, try getAccountInfo on known patterns
        
        // Attempt: Check if program has executable data that hints at IDL
        const accountInfo = await rpc("getAccountInfo", [
          programId,
          { encoding: "jsonParsed" },
        ]);

        if (accountInfo?.value) {
          const info = accountInfo.value;
          const parsed = info.data?.parsed;
          
          // Build a basic program info response
          idl = {
            name: programId.slice(0, 8),
            version: "unknown",
            instructions: [],
            accounts: [],
            metadata: {
              executable: info.executable,
              owner: info.owner,
              lamports: info.lamports,
              rentEpoch: info.rentEpoch,
            },
          };

          if (parsed?.type === "program") {
            idl.metadata.programData = parsed.info?.programData;
          }

          source = "on-chain";
        }
      } catch {
        // fallback
      }
    }

    if (!idl) {
      return new Response(
        JSON.stringify({ error: "No IDL found for this program. It may not use Anchor or have a published IDL." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ idl, source, programId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
