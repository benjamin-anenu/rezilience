import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// BPF Upgradeable Loader Program ID
const BPF_UPGRADEABLE_LOADER = "BPFLoaderUpgradeab1e11111111111111111111111";

interface VerifyAuthorityRequest {
  program_id: string;
  wallet_address: string;
}

interface VerifyAuthorityResponse {
  isAuthority: boolean;
  authorityType: "direct" | "multisig" | "immutable" | "none";
  actualAuthority: string | null;
  error?: string;
}

// Detect if an address is likely a PDA/multisig (Squads, etc.)
function isPotentialMultisig(address: string): boolean {
  // Squads v3 multisigs typically derive PDAs from specific seeds
  // We can't definitively detect this without querying Squads program,
  // but we can flag addresses that don't match typical wallet patterns
  // For now, we'll return false and let the frontend handle special cases
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { program_id, wallet_address }: VerifyAuthorityRequest = await req.json();

    if (!program_id || !wallet_address) {
      return new Response(
        JSON.stringify({ 
          isAuthority: false, 
          authorityType: "none",
          actualAuthority: null,
          error: "program_id and wallet_address are required" 
        } as VerifyAuthorityResponse),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate program_id format (base58 encoded, 32-44 chars)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(program_id)) {
      return new Response(
        JSON.stringify({ 
          isAuthority: false, 
          authorityType: "none",
          actualAuthority: null,
          error: "Invalid program_id format" 
        } as VerifyAuthorityResponse),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Solana Mainnet RPC
    const rpcUrl = "https://api.mainnet-beta.solana.com";

    // Step 1: Fetch the program account to get programData address
    const programAccountRes = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAccountInfo",
        params: [
          program_id,
          { encoding: "jsonParsed" }
        ],
      }),
    });

    const programAccountData = await programAccountRes.json();

    if (programAccountData.error) {
      return new Response(
        JSON.stringify({ 
          isAuthority: false, 
          authorityType: "none",
          actualAuthority: null,
          error: `RPC error: ${programAccountData.error.message}` 
        } as VerifyAuthorityResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!programAccountData.result?.value) {
      return new Response(
        JSON.stringify({ 
          isAuthority: false, 
          authorityType: "none",
          actualAuthority: null,
          error: "Program not found on Solana mainnet" 
        } as VerifyAuthorityResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accountInfo = programAccountData.result.value;
    
    // Check if this is a BPF Upgradeable program
    if (accountInfo.owner !== BPF_UPGRADEABLE_LOADER) {
      return new Response(
        JSON.stringify({ 
          isAuthority: false, 
          authorityType: "none",
          actualAuthority: null,
          error: "Program is not a BPF Upgradeable program" 
        } as VerifyAuthorityResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the program account to get programData PDA
    const parsed = accountInfo.data?.parsed;
    if (!parsed || parsed.type !== "program") {
      return new Response(
        JSON.stringify({ 
          isAuthority: false, 
          authorityType: "none",
          actualAuthority: null,
          error: "Unable to parse program account" 
        } as VerifyAuthorityResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const programDataAddress = parsed.info?.programData;
    if (!programDataAddress) {
      return new Response(
        JSON.stringify({ 
          isAuthority: false, 
          authorityType: "none",
          actualAuthority: null,
          error: "Program data address not found" 
        } as VerifyAuthorityResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Fetch the programData account to get upgradeAuthority
    const programDataRes = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "getAccountInfo",
        params: [
          programDataAddress,
          { encoding: "jsonParsed" }
        ],
      }),
    });

    const programDataResult = await programDataRes.json();

    if (programDataResult.error || !programDataResult.result?.value) {
      return new Response(
        JSON.stringify({ 
          isAuthority: false, 
          authorityType: "none",
          actualAuthority: null,
          error: "Unable to fetch program data" 
        } as VerifyAuthorityResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const programDataInfo = programDataResult.result.value.data?.parsed?.info;
    const upgradeAuthority = programDataInfo?.authority;

    // Step 3: Compare authority with wallet
    if (!upgradeAuthority) {
      // Program is immutable (no upgrade authority)
      return new Response(
        JSON.stringify({ 
          isAuthority: false, 
          authorityType: "immutable",
          actualAuthority: null,
          error: "Program is immutable (no upgrade authority)" 
        } as VerifyAuthorityResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isMatch = upgradeAuthority === wallet_address;
    const isMultisig = isPotentialMultisig(upgradeAuthority);

    return new Response(
      JSON.stringify({ 
        isAuthority: isMatch,
        authorityType: isMatch ? "direct" : (isMultisig ? "multisig" : "none"),
        actualAuthority: upgradeAuthority,
      } as VerifyAuthorityResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error verifying authority:", error);
    return new Response(
      JSON.stringify({ 
        isAuthority: false, 
        authorityType: "none",
        actualAuthority: null,
        error: error instanceof Error ? error.message : "Unknown error" 
      } as VerifyAuthorityResponse),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
