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
    const requestedDimensions: string[] = body.dimensions || ['github', 'dependencies', 'governance', 'tvl', 'bytecode', 'vulnerabilities', 'security'];
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
      .select("id, project_name, github_org_url, multisig_address, category, resilience_score, dependency_health_score, governance_tx_30d, tvl_usd, tvl_risk_ratio, github_commits_30d, program_id, github_last_commit")
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
    const analyzeVulnsUrl = `${supabaseUrl}/functions/v1/analyze-vulnerabilities`;
    const analyzeSecurityUrl = `${supabaseUrl}/functions/v1/analyze-security-posture`;

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
        // Determine applicable dimensions for adaptive weighting
        const categoryLower = (profile.category || '').toLowerCase();
        const hasGovernance = !!(profile.multisig_address) || categoryLower === 'dao' || categoryLower.includes('governance');
        const hasTvl = categoryLower.includes('defi');

        let govScore = 0;
        let govTx30d = profile.governance_tx_30d || 0;
        if (requestedDimensions.includes('governance') && (profile.multisig_address || (hasGovernance && profile.program_id))) {
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
        if (requestedDimensions.includes('tvl') && hasTvl) {
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

        // === BYTECODE VERIFICATION (if requested) ===
        if (requestedDimensions.includes('bytecode') && profile.program_id) {
          const verifyBytecodeUrl = `${supabaseUrl}/functions/v1/verify-bytecode`;
          try {
            const bytecodeResponse = await fetch(verifyBytecodeUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({
                program_id: profile.program_id,
                profile_id: profile.id,
                github_url: profile.github_org_url,
              }),
            });

            if (bytecodeResponse.ok) {
              const bytecodeData = await bytecodeResponse.json();
              if (bytecodeData?.success && !bytecodeData?.cached) {
                console.log(`✓ Bytecode verified: ${profile.project_name} (${bytecodeData.data?.matchStatus})`);
              }
            }
          } catch (bytecodeErr) {
            console.error(`✗ Bytecode verification failed for ${profile.project_name}:`, bytecodeErr);
          }
        }

        // === VULNERABILITY ANALYSIS (if requested) ===
        if (requestedDimensions.includes('vulnerabilities')) {
          try {
            const vulnResponse = await fetch(analyzeVulnsUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({ profile_id: profile.id }),
            });

            if (vulnResponse.ok) {
              const vulnData = await vulnResponse.json();
              console.log(`✓ Vulnerabilities scanned: ${profile.project_name} (${vulnData?.vulnerability_count || 0} CVEs)`);
            } else {
              await vulnResponse.text();
            }
          } catch (vulnErr) {
            console.error(`✗ Vulnerability scan failed for ${profile.project_name}:`, vulnErr);
          }
        }

        // === SECURITY POSTURE ANALYSIS (if requested) ===
        if (requestedDimensions.includes('security') && profile.github_org_url) {
          try {
            const secResponse = await fetch(analyzeSecurityUrl, {
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

            if (secResponse.ok) {
              const secData = await secResponse.json();
              console.log(`✓ Security posture analyzed: ${profile.project_name} (OpenSSF: ${secData?.score ?? 'N/A'}/10)`);
            } else {
              await secResponse.text();
            }
          } catch (secErr) {
            console.error(`✗ Security posture failed for ${profile.project_name}:`, secErr);
          }
        }

        // === CALCULATE UNIFIED RESILIENCE SCORE (Adaptive Weights) ===
        // Determine weights based on applicable dimensions
        let weights: { github: number; dependencies: number; governance: number; tvl: number };

        if (hasGovernance && hasTvl) {
          weights = { github: 0.40, dependencies: 0.25, governance: 0.20, tvl: 0.15 };
        } else if (hasGovernance && !hasTvl) {
          weights = { github: 0.45, dependencies: 0.30, governance: 0.25, tvl: 0 };
        } else if (!hasGovernance && hasTvl) {
          weights = { github: 0.50, dependencies: 0.30, governance: 0, tvl: 0.20 };
        } else {
          weights = { github: 0.60, dependencies: 0.40, governance: 0, tvl: 0 };
        }

        const baseScore = Math.round(
          (githubScore * weights.github) +
          (depsScore * weights.dependencies) +
          (govScore * weights.governance) +
          (tvlScore * weights.tvl)
        );

        // Continuity Decay: exponential penalty for inactivity
        // λ = 0.00167/day ≈ 5%/month
        const lastCommit = profile.github_last_commit;
        let daysSinceLastCommit = 0;
        if (lastCommit) {
          daysSinceLastCommit = Math.floor(
            (Date.now() - new Date(lastCommit).getTime()) / (1000 * 60 * 60 * 24)
          );
        }
        const decayRate = 0.00167;
        const continuityDecay = 1 - Math.exp(-decayRate * daysSinceLastCommit);
        const finalScore = Math.max(0, Math.min(100, Math.round(baseScore * (1 - continuityDecay))));

        const scoreBreakdown = {
          github: Math.round(githubScore),
          dependencies: Math.round(depsScore),
          governance: hasGovernance ? Math.round(govScore) : null,
          tvl: hasTvl ? Math.round(tvlScore) : null,
          baseScore,
          continuityDecay: Math.round(continuityDecay * 100),
          finalScore,
          weights,
          applicableDimensions: [
            'github', 'dependencies',
            ...(hasGovernance ? ['governance'] : []),
            ...(hasTvl ? ['tvl'] : []),
          ],
        };

        console.log(`✓ Unified score for ${profile.project_name}: ${finalScore} (base:${baseScore} decay:${Math.round(continuityDecay * 100)}% G:${githubScore} D:${depsScore} Gov:${govScore} T:${tvlScore})`);

        // Write to BOTH columns — resilience_score is now canonical
        const { error: updateError } = await supabase
          .from("claimed_profiles")
          .update({
            resilience_score: finalScore,
            integrated_score: finalScore, // backward compat
            score_breakdown: scoreBreakdown,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);

        if (updateError) {
          console.error(`✗ Failed to update integrated score for ${profile.project_name}:`, updateError);
        }

        // Write score_history from the final canonical score (single source of truth)
        const today = new Date().toISOString().split("T")[0];
        const actualVelocity = Math.round(((profile.github_commits_30d || 0) / 30) * 100) / 100;
        // Delete existing snapshot for today (if any), then insert fresh
        const todayStart = `${today}T00:00:00Z`;
        const todayEnd = `${today}T23:59:59Z`;
        await supabase
          .from("score_history")
          .delete()
          .eq("claimed_profile_id", profile.id)
          .gte("snapshot_date", todayStart)
          .lte("snapshot_date", todayEnd);

        const { error: historyError } = await supabase
          .from("score_history")
          .insert({
            claimed_profile_id: profile.id,
            score: finalScore,
            commit_velocity: actualVelocity,
            days_last_commit: daysSinceLastCommit,
            snapshot_date: new Date().toISOString(),
            breakdown: scoreBreakdown,
          });
        if (historyError) {
          console.error(`Score history insert failed for ${profile.project_name}:`, historyError);
        }

        successCount++;
        results.push({ 
          profile: profile.project_name, 
          status: "updated",
          integrated_score: finalScore,
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

    // === ECOSYSTEM SNAPSHOT (only on final batch) ===
    if (!hasMore) {
      try {
        console.log("[refresh-all-profiles] Final batch — writing ecosystem snapshot");
        const { data: agg } = await supabase
          .from("claimed_profiles")
          .select("resilience_score, github_commits_30d, github_contributors, tvl_usd, dependency_health_score, governance_tx_30d, liveness_status");

        if (agg && agg.length > 0) {
          const total = agg.length;
          const active = agg.filter((p: any) => p.liveness_status === "ACTIVE").length;
          const stale = agg.filter((p: any) => p.liveness_status === "STALE").length;
          const decaying = agg.filter((p: any) => p.liveness_status === "DECAYING").length;
          const healthy = agg.filter((p: any) => (p.resilience_score || 0) >= 70).length;
          const scoredProfiles = agg.filter((p: any) => (p.resilience_score || 0) > 0);
          const avgScore = scoredProfiles.length > 0
            ? scoredProfiles.reduce((s: number, p: any) => s + (p.resilience_score || 0), 0) / scoredProfiles.length
            : 0;
          const totalCommits = agg.reduce((s: number, p: any) => s + (p.github_commits_30d || 0), 0);
          const totalContributors = agg.reduce((s: number, p: any) => s + (p.github_contributors || 0), 0);
          const totalTvl = agg.reduce((s: number, p: any) => s + (p.tvl_usd || 0), 0);
          const avgDepHealth = agg.reduce((s: number, p: any) => s + (p.dependency_health_score || 0), 0) / total;
          const totalGovTx = agg.reduce((s: number, p: any) => s + (p.governance_tx_30d || 0), 0);

          const today = new Date().toISOString().split("T")[0];
          await supabase
            .from("ecosystem_snapshots")
            .upsert({
              snapshot_date: today,
              total_projects: total,
              active_projects: active,
              avg_resilience_score: Math.round(avgScore * 10) / 10,
              total_commits_30d: totalCommits,
              total_contributors: totalContributors,
              total_tvl_usd: totalTvl,
              avg_dependency_health: Math.round(avgDepHealth * 10) / 10,
              total_governance_tx: totalGovTx,
              healthy_count: healthy,
              stale_count: stale,
              decaying_count: decaying,
            }, { onConflict: "snapshot_date" });

          console.log(`✓ Ecosystem snapshot written for ${today}`);
        }
      } catch (snapErr) {
        console.error("Ecosystem snapshot failed:", snapErr);
      }
    }

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
