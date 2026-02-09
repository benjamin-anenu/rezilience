import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Scheduled job to refresh GitHub data for all verified claimed profiles.
 * This is called by a pg_cron job daily to keep resilience scores up to date.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting daily refresh of all verified profiles...");

    // Fetch all verified profiles AND unclaimed profiles with GitHub URLs
    // This ensures unclaimed profiles are actively monitored for liveness
    const { data: profiles, error: fetchError } = await supabase
      .from("claimed_profiles")
      .select("id, project_name, github_org_url, multisig_address, category")
      .or("verified.eq.true,claim_status.eq.unclaimed")
      .not("github_org_url", "is", null);

    if (fetchError) {
      throw new Error(`Failed to fetch profiles: ${fetchError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No verified profiles with GitHub URLs found", updated: 0 }),
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
    const results: Array<{ profile: string; status: string }> = [];

    // Process each profile (with rate limiting to avoid GitHub API limits)
    for (const profile of profiles) {
      try {
        console.log(`Refreshing: ${profile.project_name} (${profile.github_org_url})`);

        // Call the analyze-github-repo function for each profile
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
          console.log(`✓ GitHub analyzed: ${profile.project_name}`);
        }

        // Call analyze-dependencies for Rust/Solana projects
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
          console.log(`✓ Dependencies analyzed: ${profile.project_name}`);
        }

        // Call analyze-governance if multisig_address exists
        if (profile.multisig_address) {
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
            console.log(`✓ Governance analyzed: ${profile.project_name}`);
          }
        }

        // Call analyze-tvl for DeFi protocols
        if (profile.category === 'defi') {
          const tvlResponse = await fetch(analyzeTvlUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              protocol_name: profile.project_name,
              profile_id: profile.id,
              monthly_commits: 30, // Placeholder, ideally from GitHub analysis
            }),
          });

          if (tvlResponse.ok) {
            console.log(`✓ TVL analyzed: ${profile.project_name}`);
          }
        }

        successCount++;
        results.push({ profile: profile.project_name, status: "updated" });
        console.log(`✓ Full analysis complete: ${profile.project_name}`);

        // Rate limit: wait 2 seconds between profiles to respect all API limits
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (err) {
        errorCount++;
        results.push({ profile: profile.project_name, status: `exception: ${err}` });
        console.error(`✗ Exception for ${profile.project_name}:`, err);
      }
    }

    const summary = {
      message: `Daily refresh complete: ${successCount} updated, ${errorCount} errors`,
      total: profiles.length,
      success: successCount,
      errors: errorCount,
      results,
      completedAt: new Date().toISOString(),
    };

    console.log(summary.message);

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
