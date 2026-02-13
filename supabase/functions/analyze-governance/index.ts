import { createClient } from "npm:@supabase/supabase-js@2";
import { logServiceHealth } from "../_shared/service-health.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GovernanceAnalysisResult {
  address: string;
  totalTransactions: number;
  transactions30d: number;
  transactions90d: number;
  lastActivity: string | null;
  healthScore: number;
  healthStatus: "VERY_ACTIVE" | "ACTIVE" | "SOME_ACTIVITY" | "DORMANT" | "BRAIN_DEAD" | "NO_GOVERNANCE";
  analyzedAt: string;
  found: boolean;
}

// Solana RPC endpoint (use public mainnet)
const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";

/**
 * Validate Solana address format
 */
function isValidSolanaAddress(address: string): boolean {
  // Base58 characters, 32-44 characters long
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Fetch recent signatures for an address using Solana RPC
 */
async function getSignaturesForAddress(
  address: string,
  limit: number = 100
): Promise<Array<{ signature: string; blockTime: number | null; slot: number }>> {
  try {
    const start = Date.now();
    const response = await fetch(SOLANA_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [
          address,
          { limit, commitment: "confirmed" }
        ],
      }),
    });
    logServiceHealth("Solana RPC", "/getSignaturesForAddress", response.status, Date.now() - start);

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.error("Solana RPC error:", data.error);
      return [];
    }

    return (data.result || []).map((sig: { signature: string; blockTime: number | null; slot: number }) => ({
      signature: sig.signature,
      blockTime: sig.blockTime,
      slot: sig.slot,
    }));
  } catch (error) {
    console.error("Error fetching signatures:", error);
    return [];
  }
}

/**
 * Calculate governance health score and status
 */
function calculateGovernanceHealth(
  transactions30d: number,
  transactions90d: number,
  lastActivityTimestamp: number | null
): { score: number; status: string } {
  const now = Date.now() / 1000;
  
  // Calculate days since last activity
  const daysSinceActivity = lastActivityTimestamp
    ? Math.floor((now - lastActivityTimestamp) / (60 * 60 * 24))
    : 999;

  // Score based on activity level
  if (transactions30d >= 10) {
    return { score: 100, status: "VERY_ACTIVE" };
  } else if (transactions30d >= 5) {
    return { score: 85, status: "ACTIVE" };
  } else if (transactions30d >= 1) {
    return { score: 70, status: "SOME_ACTIVITY" };
  } else if (transactions90d >= 5) {
    return { score: 50, status: "SOME_ACTIVITY" };
  } else if (transactions90d > 0 && daysSinceActivity <= 90) {
    return { score: 30, status: "DORMANT" };
  } else if (daysSinceActivity > 180) {
    return { score: 0, status: "BRAIN_DEAD" };
  } else if (daysSinceActivity > 90) {
    return { score: 15, status: "DORMANT" };
  }

  return { score: 25, status: "DORMANT" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { governance_address, profile_id } = await req.json();

    if (!governance_address) {
      // No governance address provided - return neutral result
      const result: GovernanceAnalysisResult = {
        address: "",
        totalTransactions: 0,
        transactions30d: 0,
        transactions90d: 0,
        lastActivity: null,
        healthScore: 0,
        healthStatus: "NO_GOVERNANCE",
        analyzedAt: new Date().toISOString(),
        found: false,
      };
      
      return new Response(
        JSON.stringify({ success: true, data: result, note: "No governance address provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isValidSolanaAddress(governance_address)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid Solana address format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`🏛️ Analyzing governance for: ${governance_address}`);

    // Fetch recent transactions
    const signatures = await getSignaturesForAddress(governance_address, 100);
    
    if (signatures.length === 0) {
      console.log("No transactions found for governance address");
      
      const result: GovernanceAnalysisResult = {
        address: governance_address,
        totalTransactions: 0,
        transactions30d: 0,
        transactions90d: 0,
        lastActivity: null,
        healthScore: 0,
        healthStatus: "BRAIN_DEAD",
        analyzedAt: new Date().toISOString(),
        found: false,
      };
      
      if (profile_id) {
        await updateProfile(profile_id, result);
      }
      
      return new Response(
        JSON.stringify({ success: true, data: result, note: "No transactions found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate time windows
    const now = Date.now() / 1000;
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
    const ninetyDaysAgo = now - (90 * 24 * 60 * 60);

    // Count transactions in each window
    const transactions30d = signatures.filter(
      (s) => s.blockTime && s.blockTime > thirtyDaysAgo
    ).length;
    
    const transactions90d = signatures.filter(
      (s) => s.blockTime && s.blockTime > ninetyDaysAgo
    ).length;

    // Get last activity timestamp
    const lastActivityTimestamp = signatures[0]?.blockTime || null;
    const lastActivity = lastActivityTimestamp
      ? new Date(lastActivityTimestamp * 1000).toISOString()
      : null;

    // Calculate health score
    const { score, status } = calculateGovernanceHealth(
      transactions30d,
      transactions90d,
      lastActivityTimestamp
    );

    const result: GovernanceAnalysisResult = {
      address: governance_address,
      totalTransactions: signatures.length,
      transactions30d,
      transactions90d,
      lastActivity,
      healthScore: score,
      healthStatus: status as GovernanceAnalysisResult["healthStatus"],
      analyzedAt: new Date().toISOString(),
      found: true,
    };

    console.log(`✅ Governance analysis complete: ${transactions30d} tx (30d), ${transactions90d} tx (90d), Status: ${status}`);

    // Update profile if provided
    if (profile_id) {
      await updateProfile(profile_id, result);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing governance:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Update claimed_profiles with governance analysis results
 */
async function updateProfile(profileId: string, result: GovernanceAnalysisResult): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseKey) return;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { error } = await supabase
    .from("claimed_profiles")
    .update({
      governance_address: result.address || null,
      governance_tx_30d: result.transactions30d,
      governance_last_activity: result.lastActivity,
      governance_analyzed_at: result.analyzedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (error) {
    console.error("Error updating claimed_profiles:", error);
  } else {
    console.log(`Updated profile ${profileId} with governance analysis`);
  }
}
