import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Calculate governance score (0-100) based on 30-day transaction count
 */
function calculateGovernanceScore(txCount: number): number {
  if (txCount >= 30) return 100; // Very active DAO
  if (txCount >= 15) return 80;
  if (txCount >= 5) return 60;
  if (txCount >= 1) return 40;
  return 0; // No governance activity
}

/**
 * Calculate TVL score (0-100) based on risk ratio (TVL / monthly commits)
 * Lower ratio = better (more code maintenance per $ locked)
 */
function calculateTvlScore(riskRatio: number, tvlUsd: number): number {
  if (tvlUsd === 0) return 50; // Neutral for non-DeFi
  
  // Risk ratio: TVL in millions per commit
  // < 0.1M per commit = excellent
  // > 10M per commit = risky (too much $ per code update)
  if (riskRatio <= 0.1) return 100;
  if (riskRatio <= 0.5) return 85;
  if (riskRatio <= 1) return 70;
  if (riskRatio <= 5) return 50;
  if (riskRatio <= 10) return 30;
  return 15; // Very high risk
}

/**
 * Scheduled job to refresh GitHub data for all verified claimed profiles.
 * This is called by a pg_cron job daily to keep resilience scores up to date.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for selective dimension refresh and batch params
    const body = await req.json().catch(() => ({}));
    const requestedDimensions: string[] = body.dimensions || ['github', 'dependencies', 'governance', 'tvl'];
    const batchSize: number = Math.min(Math.max(body.batch_size || 5, 1), 50);
    const offset: number = Math.max(body.offset || 0, 0);
    const autoChain: boolean = body.auto_chain !== false; // default true
    
    console.log(`[refresh-all-profiles] Dimensions: ${requestedDimensions.join(', ')}, batch_size: ${batchSize}, offset: ${offset}, auto_chain: ${autoChain}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First get total count
    const { count: totalCount } = await supabase
      .from("claimed_profiles")
      .select("id", { count: "exact", head: true })
      .or("verified.eq.true,claim_status.eq.unclaimed")
      .not("github_org_url", "is", null);

    console.log(`Total eligible profiles: ${totalCount}, processing offset ${offset} batch ${batchSize}`);

    // Fetch batch of profiles
    const { data: profiles, error: fetchError } = await supabase
      .from("claimed_profiles")
      .select("id, project_name, github_org_url, multisig_address, category, resilience_score, dependency_health_score, governance_tx_30d, tvl_usd, tvl_risk_ratio, github_commits_30d")
      .or("verified.eq.true,claim_status.eq.unclaimed")
      .not("github_org_url", "is", null)
      .order("project_name")
      .range(offset, offset + batchSize - 1);

    if (fetchError) {
      throw new Error(`Failed to fetch profiles: ${fetchError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No verified profiles with GitHub URLs found", updated: 0, dimensions: requestedDimensions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${profiles.length} verified profiles to refresh`);

    // Get the analyze function URLs
    const analyzeGitHubUrl = `${supabaseUrl}/functions/v1/analyze-github-repo`;
    const analyzeDepsUrl = `${supabaseUrl}/functions/v1/analyze-dependencies`;
    const analyzeGovUrl = `${supabaseUrl}/functions/v1/analyze-governance`;
    const analyzeTvlUrl = `${supabaseUrl}/functions/v1/analyze-tvl`;

    let successCount = 0;
    let errorCount = 0;
    const results: Array<{ profile: string; status: string; integrated_score?: number }> = [];

    // Process each profile (with rate limiting to avoid API limits)
    for (const profile of profiles) {
      try {
        console.log(`Refreshing: ${profile.project_name} (${profile.github_org_url})`);

        // === GITHUB ANALYSIS (if requested) ===
        let githubScore = profile.resilience_score || 0;
        if (requestedDimensions.includes('github')) {
          const gitHubResponse = await fetch(analyzeGitHubUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              github_url: profile.github_org_url,
              profile_id: profile.id,
            }),
          });

          if (!gitHubResponse.ok) {
            const errorText = await gitHubResponse.text();
            console.error(`✗ GitHub analysis failed: ${profile.project_name} - ${errorText}`);
          } else {
            const gitHubData = await gitHubResponse.json();
            githubScore = gitHubData?.data?.resilienceScore || githubScore;
            console.log(`✓ GitHub analyzed: ${profile.project_name} (score: ${githubScore})`);
          }
        }

        // === DEPENDENCY ANALYSIS (if requested) ===
        let depsScore = profile.dependency_health_score || 50;
        if (requestedDimensions.includes('dependencies')) {
          const depsResponse = await fetch(analyzeDepsUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              github_url: profile.github_org_url,
              profile_id: profile.id,
            }),
          });

          if (depsResponse.ok) {
            const depsData = await depsResponse.json();
            depsScore = depsData?.health_score || depsScore;
            console.log(`✓ Dependencies analyzed: ${profile.project_name} (score: ${depsScore})`);
          }
        }

        // === GOVERNANCE ANALYSIS (if requested) ===
        let govScore = 0;
        let govTx30d = profile.governance_tx_30d || 0;
        if (requestedDimensions.includes('governance') && profile.multisig_address) {
          const govResponse = await fetch(analyzeGovUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              governance_address: profile.multisig_address,
              profile_id: profile.id,
            }),
          });

          if (govResponse.ok) {
            const govData = await govResponse.json();
            govTx30d = govData?.tx_count_30d || 0;
            console.log(`✓ Governance analyzed: ${profile.project_name} (txs: ${govTx30d})`);
          }
        }
        govScore = calculateGovernanceScore(govTx30d);

        // === TVL ANALYSIS (if requested) ===
        let tvlScore = 50; // Neutral default
        let tvlUsd = profile.tvl_usd || 0;
        let tvlRiskRatio = profile.tvl_risk_ratio || 0;
        if (requestedDimensions.includes('tvl') && profile.category === 'defi') {
          const tvlResponse = await fetch(analyzeTvlUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              protocol_name: profile.project_name,
              profile_id: profile.id,
              monthly_commits: profile.github_commits_30d || 30,
            }),
          });

          if (tvlResponse.ok) {
            const tvlData = await tvlResponse.json();
            tvlUsd = tvlData?.tvl_usd || 0;
            tvlRiskRatio = tvlData?.risk_ratio || 0;
            console.log(`✓ TVL analyzed: ${profile.project_name} ($${tvlUsd.toLocaleString()})`);
          }
        }
        tvlScore = calculateTvlScore(tvlRiskRatio, tvlUsd);

        // === CALCULATE INTEGRATED SCORE ===
        // Formula: R = 0.40×GitHub + 0.25×Deps + 0.20×Gov + 0.15×TVL
        const integratedScore = Math.round(
          (githubScore * 0.40) +
          (depsScore * 0.25) +
          (govScore * 0.20) +
          (tvlScore * 0.15)
        );

        const scoreBreakdown = {
          github: Math.round(githubScore),
          dependencies: Math.round(depsScore),
          governance: Math.round(govScore),
          tvl: Math.round(tvlScore),
          weights: {
            github: 0.40,
            dependencies: 0.25,
            governance: 0.20,
            tvl: 0.15,
          },
        };

        console.log(`✓ Integrated score for ${profile.project_name}: ${integratedScore} (G:${githubScore} D:${depsScore} Gov:${govScore} T:${tvlScore})`);

        // Update the integrated score in the database
        const { error: updateError } = await supabase
          .from("claimed_profiles")
          .update({
            integrated_score: integratedScore,
            score_breakdown: scoreBreakdown,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);

        if (updateError) {
          console.error(`✗ Failed to update integrated score for ${profile.project_name}:`, updateError);
        }

        successCount++;
        results.push({ 
          profile: profile.project_name, 
          status: "updated",
          integrated_score: integratedScore,
        });
        console.log(`✓ Full analysis complete: ${profile.project_name}`);

        // Rate limit: wait 1 second between profiles
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        errorCount++;
        results.push({ profile: profile.project_name, status: `exception: ${err}` });
        console.error(`✗ Exception for ${profile.project_name}:`, err);
      }
    }

    const nextOffset = offset + profiles.length;
    const hasMore = totalCount ? nextOffset < totalCount : false;

    const summary = {
      message: `Batch complete: ${successCount} updated, ${errorCount} errors (offset ${offset}, batch ${batchSize})`,
      total: totalCount || 0,
      batch_size: batchSize,
      offset,
      next_offset: hasMore ? nextOffset : null,
      has_more: hasMore,
      processed: profiles.length,
      success: successCount,
      errors: errorCount,
      dimensions: requestedDimensions,
      results,
      completedAt: new Date().toISOString(),
    };

    console.log(summary.message);

    // Self-chain: fire-and-forget the next batch if there are more profiles
    if (hasMore && autoChain) {
      const selfUrl = `${supabaseUrl}/functions/v1/refresh-all-profiles`;
      console.log(`🔗 Auto-chaining next batch: offset ${nextOffset}`);
      fetch(selfUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          batch_size: batchSize,
          offset: nextOffset,
          dimensions: requestedDimensions,
          auto_chain: true,
        }),
      }).catch((err) => console.error("Auto-chain failed:", err));
    }

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Refresh job error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
