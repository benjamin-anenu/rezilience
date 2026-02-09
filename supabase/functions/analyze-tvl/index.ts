import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TVLAnalysisResult {
  protocolName: string;
  tvlUsd: number;
  tvlSolana: number;
  marketShare: number;
  riskRatio: number;
  riskLevel: "HEALTHY" | "MODERATE" | "HIGH_RISK" | "ZOMBIE_TITAN";
  chains: string[];
  analyzedAt: string;
  found: boolean;
}

/**
 * Get total Solana TVL for market share calculation
 */
async function getSolanaTotalTVL(): Promise<number> {
  try {
    const response = await fetch("https://api.llama.fi/chains", {
      headers: {
        Accept: "application/json",
        "User-Agent": "Resilience-Registry",
      },
    });
    
    if (!response.ok) return 0;
    
    const chains = await response.json();
    const solana = chains.find((c: { name: string; tvl?: number }) => c.name === "Solana");
    return solana?.tvl || 0;
  } catch (error) {
    console.error("Error fetching total Solana TVL:", error);
    return 0;
  }
}

/**
 * Normalize protocol name for DeFiLlama lookup
 * DeFiLlama uses slugified names
 */
function normalizeProtocolName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Calculate TVL-to-commit risk ratio
 * High TVL with low commits = ZOMBIE TITAN (high risk)
 */
function calculateRiskRatio(tvl: number, monthlyCommits: number): { ratio: number; level: string } {
  if (tvl === 0) return { ratio: 0, level: "HEALTHY" };
  
  const commits = Math.max(monthlyCommits, 1); // Avoid division by zero
  const ratio = tvl / commits;
  
  // Risk thresholds based on $TVL per commit
  if (ratio > 50_000_000) {
    return { ratio, level: "ZOMBIE_TITAN" }; // >$50M per commit = RED FLAG
  } else if (ratio > 10_000_000) {
    return { ratio, level: "HIGH_RISK" }; // >$10M per commit
  } else if (ratio > 1_000_000) {
    return { ratio, level: "MODERATE" }; // >$1M per commit
  }
  
  return { ratio, level: "HEALTHY" }; // <$1M per commit
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { protocol_name, profile_id, monthly_commits } = await req.json();

    if (!protocol_name) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing protocol_name parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`💰 Analyzing TVL for protocol: ${protocol_name}`);

    const normalizedName = normalizeProtocolName(protocol_name);
    
    // Fetch protocol data from DeFiLlama
    const response = await fetch(`https://api.llama.fi/protocol/${normalizedName}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Resilience-Registry",
      },
    });

    if (!response.ok) {
      console.log(`Protocol ${protocol_name} not found on DeFiLlama`);
      
      const result: TVLAnalysisResult = {
        protocolName: protocol_name,
        tvlUsd: 0,
        tvlSolana: 0,
        marketShare: 0,
        riskRatio: 0,
        riskLevel: "HEALTHY",
        chains: [],
        analyzedAt: new Date().toISOString(),
        found: false,
      };
      
      // Update profile if provided
      if (profile_id) {
        await updateProfile(profile_id, result);
      }
      
      return new Response(
        JSON.stringify({ success: true, data: result, note: "Protocol not found on DeFiLlama" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Get Solana-specific TVL if available
    // currentChainTvls contains current TVL per chain
    // data.tvl is historical array, not current value
    const tvlSolana = data.currentChainTvls?.Solana || 0;
    
    // Get current total TVL from chainTvls summary or calculate from currentChainTvls
    let currentTvl = 0;
    if (data.currentChainTvls) {
      currentTvl = Object.values(data.currentChainTvls).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);
    }
    
    const tvlUsd = tvlSolana || currentTvl || 0;
    const chains = data.chains || [];

    // Get total Solana TVL for market share
    const solanaTotalTVL = await getSolanaTotalTVL();
    const marketShare = solanaTotalTVL > 0 ? (tvlSolana / solanaTotalTVL) * 100 : 0;

    // Calculate risk ratio
    const commits = monthly_commits || 1;
    const { ratio, level } = calculateRiskRatio(tvlSolana || tvlUsd, commits);

    const result: TVLAnalysisResult = {
      protocolName: data.name || protocol_name,
      tvlUsd,
      tvlSolana,
      marketShare,
      riskRatio: ratio,
      riskLevel: level as TVLAnalysisResult["riskLevel"],
      chains,
      analyzedAt: new Date().toISOString(),
      found: true,
    };

    console.log(`✅ TVL analysis complete: $${(tvlUsd / 1e6).toFixed(2)}M TVL, ${marketShare.toFixed(2)}% market share, Risk: ${level}`);

    // Update profile if provided
    if (profile_id) {
      await updateProfile(profile_id, result);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing TVL:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Update claimed_profiles with TVL analysis results
 */
async function updateProfile(profileId: string, result: TVLAnalysisResult): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseKey) return;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { error } = await supabase
    .from("claimed_profiles")
    .update({
      tvl_usd: result.tvlSolana || result.tvlUsd,
      tvl_market_share: result.marketShare,
      tvl_risk_ratio: result.riskRatio,
      tvl_analyzed_at: result.analyzedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (error) {
    console.error("Error updating claimed_profiles:", error);
  } else {
    console.log(`Updated profile ${profileId} with TVL analysis`);
  }
}
