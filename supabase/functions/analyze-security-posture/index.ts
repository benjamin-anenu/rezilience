import { createClient } from "npm:@supabase/supabase-js@2";
import { logServiceHealth } from "../_shared/service-health.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Query the OpenSSF Scorecard API for a GitHub repo's security posture.
 * Returns a 0-10 score covering branch protection, code review, CI/CD,
 * signed releases, vulnerability disclosure, and more.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { github_url, profile_id } = await req.json();

    if (!github_url || !profile_id) {
      return new Response(
        JSON.stringify({ error: "github_url and profile_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract owner/repo from GitHub URL
    const match = github_url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      // Try org-level URL: github.com/org -> we can't query scorecard for orgs
      const orgMatch = github_url.match(/github\.com\/([^/]+)\/?$/);
      if (orgMatch) {
        console.log(`Skipping org-level URL for OpenSSF: ${github_url}`);
        return new Response(
          JSON.stringify({ score: null, message: "Org-level URLs not supported by OpenSSF Scorecard" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Invalid GitHub URL: ${github_url}`);
    }

    const owner = match[1];
    let repo = match[2];
    // Strip .git suffix if present
    repo = repo.replace(/\.git$/, "");

    const scorecardUrl = `https://api.scorecard.dev/projects/github.com/${owner}/${repo}`;
    console.log(`Querying OpenSSF Scorecard: ${scorecardUrl}`);

    const scStart = Date.now();
    const response = await fetch(scorecardUrl);
    logServiceHealth("OpenSSF Scorecard", `/projects/github.com/${owner}/${repo}`, response.status, Date.now() - scStart, response.ok ? undefined : `HTTP ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404) {
        console.log(`OpenSSF Scorecard not available for ${owner}/${repo}`);
        // Not all repos are indexed — this is normal
        await supabase
          .from("claimed_profiles")
          .update({
            openssf_score: null,
            openssf_checks: null,
            openssf_analyzed_at: new Date().toISOString(),
          })
          .eq("id", profile_id);

        return new Response(
          JSON.stringify({ score: null, message: "Repo not indexed by OpenSSF Scorecard" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`OpenSSF API error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const score = data.score ?? null;
    
    // Extract individual check results
    const checks = (data.checks || []).map((check: any) => ({
      name: check.name,
      score: check.score,
      reason: check.reason,
    }));

    // Update the profile
    const { error: updateError } = await supabase
      .from("claimed_profiles")
      .update({
        openssf_score: score,
        openssf_checks: checks,
        openssf_analyzed_at: new Date().toISOString(),
      })
      .eq("id", profile_id);

    if (updateError) {
      console.error("Failed to update OpenSSF data:", updateError);
    }

    console.log(`✓ OpenSSF Scorecard for ${owner}/${repo}: ${score}/10 (${checks.length} checks)`);

    return new Response(
      JSON.stringify({ score, checks, repo: `${owner}/${repo}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Security posture analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
