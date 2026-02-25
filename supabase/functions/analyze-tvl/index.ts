import { createClient } from "npm:@supabase/supabase-js@2";
import { logServiceHealth } from "../_shared/service-health.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Static mapping from DB project_name → DeFiLlama protocol slug.
 * Case-insensitive lookup is done via toLowerCase().
 */
const DEFILLAMA_SLUG_MAP: Record<string, string> = {
  "marinade finance": "marinade",
  "marinade": "marinade",
  "kamino finance (klend)": "kamino",
  "kamino lending": "kamino",
  "kamino lend (klend)": "kamino",
  "kamino": "kamino",
  "jupiter aggregator v6": "jupiter",
  "jupiter": "jupiter",
  "jupiter dca": "jupiter-dca",
  "jupiter perpetuals": "jupiter-perps",
  "jupiter perps": "jupiter-perps",
  "jupiter limit order v2": "jupiter-limit-order",
  "raydium clmm": "raydium",
  "raydium": "raydium",
  "drift protocol v2": "drift",
  "drift protocol": "drift",
  "drift": "drift",
  "drift keeper bots v2": "drift",
  "marginfi v2": "marginfi",
  "marginfi lending": "marginfi",
  "marginfi": "marginfi",
  "mango v4": "mango-markets",
  "mango markets": "mango-markets",
  "meteora dlmm": "meteora",
  "meteora": "meteora",
  "lifinity v2": "lifinity",
  "lifinity": "lifinity",
  "blazestake": "blazestake",
  "jito stake pool": "jito",
  "jito spl stake pool": "jito",
  "jito": "jito",
  "hubble protocol": "hubble-protocol",
  "phoenix v1": "phoenix",
  "phoenix": "phoenix",
  "invariant": "invariant",
  "dual finance": "dual-finance",
  "save (formerly solend)": "solend",
  "solend": "solend",
  "sanctum": "sanctum",
  "sanctum spl stake pool": "sanctum",
  "sanctum token ratio": "sanctum",
  "hxro dexterity": "hxro",
  "hxro": "hxro",
  "credix": "credix-finance",
  "flash trade": "flash-trade",
  "jet protocol v2": "jet-protocol",
  "jet protocol": "jet-protocol",
  "access protocol": "access-protocol",
  "openbook dex v2": "openbook",
  "openbook v2": "openbook",
  "openbook": "openbook",
  "orca": "orca",
  "orca whirlpools": "orca",
  "tulip protocol": "tulip-protocol",
  "port finance": "port-finance",
  "francium": "francium",
  "apricot finance": "apricot",
  "larix": "larix",
  "saber": "saber",
  "mercurial finance": "mercurial-finance",
  "atrix": "atrix",
  "serum": "serum",
  "raydium amm v4": "raydium",
  "raydium cpmm": "raydium",
  "meteora dynamic pools": "meteora",
  "flash trade": "flash-trade",
  "step finance": "step-finance",
  "symmetry": "symmetry",
  "uxd protocol": "uxd-protocol",
  "zeta markets": "zeta-markets",
  "strata protocol": "strata",
  "spl stake pool": "lido",
  "credix": "credix-finance",
  "perena numeraire amm": "perena",
  "hxro dexterity": "hxro",
  "solayer": "solayer",
  "quarry": "quarry",
  "tensor": "tensor",
  "parcl": "parcl",
  "lulo": "lulo",
};

/**
 * Resolve a project name to a DeFiLlama slug.
 * First checks the static map, then falls back to naive slugification.
 */
function resolveDefillamaSlug(name: string): string {
  const mapped = DEFILLAMA_SLUG_MAP[name.toLowerCase().trim()];
  if (mapped) return mapped;
  return normalizeProtocolName(name);
}

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
    const start = Date.now();
    const response = await fetch("https://api.llama.fi/chains", {
      headers: {
        Accept: "application/json",
        "User-Agent": "Rezilience-Registry",
      },
    });
    logServiceHealth("DeFiLlama API", "/chains", response.status, Date.now() - start);
    
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
 * Normalize protocol name for DeFiLlama lookup (fallback)
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
 */
function calculateRiskRatio(tvl: number, monthlyCommits: number): { ratio: number; level: string } {
  if (tvl === 0) return { ratio: 0, level: "HEALTHY" };
  
  const commits = Math.max(monthlyCommits, 1);
  const ratio = tvl / commits;
  
  if (ratio > 50_000_000) return { ratio, level: "ZOMBIE_TITAN" };
  if (ratio > 10_000_000) return { ratio, level: "HIGH_RISK" };
  if (ratio > 1_000_000) return { ratio, level: "MODERATE" };
  return { ratio, level: "HEALTHY" };
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

    const slug = resolveDefillamaSlug(protocol_name);
    console.log(`📎 Resolved slug: "${protocol_name}" → "${slug}"`);
    
    // Fetch protocol data from DeFiLlama
    const start = Date.now();
    const response = await fetch(`https://api.llama.fi/protocol/${slug}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Rezilience-Registry",
      },
    });
    const latency = Date.now() - start;

    // Only log as error for actual failures (5xx, network), NOT 404s
    if (response.status === 404) {
      logServiceHealth("DeFiLlama API", `/protocol/${slug}`, 200, latency, undefined);
    } else {
      logServiceHealth("DeFiLlama API", `/protocol/${slug}`, response.status, latency, response.ok ? undefined : `HTTP ${response.status}`);
    }

    if (!response.ok) {
      console.log(`Protocol ${protocol_name} (slug: ${slug}) not found on DeFiLlama`);
      
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
      
      if (profile_id) {
        await updateProfile(profile_id, result);
      }
      
      return new Response(
        JSON.stringify({ success: true, data: result, note: "Protocol not found on DeFiLlama" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    const tvlSolana = data.currentChainTvls?.Solana || 0;
    
    let currentTvl = 0;
    if (data.currentChainTvls) {
      currentTvl = Object.values(data.currentChainTvls).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);
    }
    
    const tvlUsd = tvlSolana || currentTvl || 0;
    const chains = data.chains || [];

    const solanaTotalTVL = await getSolanaTotalTVL();
    const marketShare = solanaTotalTVL > 0 ? (tvlSolana / solanaTotalTVL) * 100 : 0;

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
