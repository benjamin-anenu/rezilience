import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// BPF Upgradeable Loader Program ID
const BPF_UPGRADEABLE_LOADER = "BPFLoaderUpgradeab1e11111111111111111111111";

// Squads Program IDs
const SQUADS_V3_PROGRAM = "SMPLecH534NA9acpos4G6x7uf3LWbCAwZQE9e8ZekMu";
const SQUADS_V4_PROGRAM = "SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf";

interface VerifyAuthorityRequest {
  program_id: string;
  wallet_address: string;
}

interface MultisigInfo {
  multisigAddress: string;
  vaultAddress?: string;
  squadsVersion: "v3" | "v4" | "unknown";
  squadsUrl: string;
}

interface VerifyAuthorityResponse {
  isAuthority: boolean;
  authorityType: "direct" | "multisig" | "immutable" | "none";
  actualAuthority: string | null;
  multisigInfo?: MultisigInfo;
  error?: string;
}

// Detect if an authority address is a Squads multisig PDA
async function detectSquadsMultisig(
  authorityAddress: string,
  rpcUrl: string
): Promise<MultisigInfo | null> {
  try {
    // Fetch the account info for the authority address
    const accountRes = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAccountInfo",
        params: [authorityAddress, { encoding: "base64" }],
      }),
    });

    const accountData = await accountRes.json();

    if (!accountData.result?.value) {
      return null;
    }

    const owner = accountData.result.value.owner;

    // Check if owned by Squads v4 program
    if (owner === SQUADS_V4_PROGRAM) {
      return {
        multisigAddress: authorityAddress,
        squadsVersion: "v4",
        squadsUrl: `https://app.squads.so/squads/${authorityAddress}/home`,
      };
    }

    // Check if owned by Squads v3 program
    if (owner === SQUADS_V3_PROGRAM) {
      return {
        multisigAddress: authorityAddress,
        squadsVersion: "v3",
        squadsUrl: `https://v3.squads.so/squads/${authorityAddress}`,
      };
    }

    // Check if this might be a vault PDA (owned by system program but derived from Squads)
    // Squads v4 vaults are typically PDAs derived from the multisig
    // We can detect this by checking if the authority is a PDA (not a regular wallet)
    // Regular wallets have specific patterns, PDAs tend to have more "random" looking addresses
    // This is a heuristic - we check if the account has no lamports and specific data patterns
    
    // For now, if it's not directly owned by Squads, check if it might be a vault
    // by looking for accounts that are likely PDAs (no signature capability)
    const lamports = accountData.result.value.lamports;
    const dataLength = accountData.result.value.data?.[0]?.length || 0;
    
    // Vaults typically have minimal data and are owned by the system program or Squads
    if (owner === "11111111111111111111111111111111" && lamports > 0 && dataLength === 0) {
      // This could be a Squads vault - we can't definitively tell without more context
      // Return as unknown multisig so the UI can provide guidance
      return {
        multisigAddress: authorityAddress,
        squadsVersion: "unknown",
        squadsUrl: `https://app.squads.so/squads/${authorityAddress}/home`,
      };
    }

    return null;
  } catch (error) {
    console.error("Error detecting Squads multisig:", error);
    return null;
  }
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

    // Step 3: Compare authority with wallet OR detect multisig
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

    // If not a direct match, check if the authority is a Squads multisig
    if (!isMatch) {
      const multisigInfo = await detectSquadsMultisig(upgradeAuthority, rpcUrl);
      
      if (multisigInfo) {
        // Authority is a multisig PDA
        return new Response(
          JSON.stringify({ 
            isAuthority: false,
            authorityType: "multisig",
            actualAuthority: upgradeAuthority,
            multisigInfo,
          } as VerifyAuthorityResponse),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        isAuthority: isMatch,
        authorityType: isMatch ? "direct" : "none",
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
