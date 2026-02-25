import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile_id, target_score, admin_email } = await req.json();

    if (!profile_id || !target_score || !admin_email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify admin
    const { data: admin } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", admin_email)
      .maybeSingle();

    if (!admin) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch profile
    const { data: profile, error: profileErr } = await supabase
      .from("claimed_profiles")
      .select("*, realms_dao_address, realms_delivery_rate")
      .eq("id", profile_id)
      .single();

    if (profileErr || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const oldScore = profile.resilience_score ?? 0;
    const category = (profile.category || "infrastructure").toLowerCase();

    // Determine adaptive weights
    let wGithub = 0.6, wDeps = 0.4, wGov = 0, wTvl = 0;
    if (category.includes("defi") && profile.governance_address) {
      wGithub = 0.4; wDeps = 0.25; wGov = 0.2; wTvl = 0.15;
    } else if (category.includes("defi")) {
      wGithub = 0.5; wDeps = 0.3; wGov = 0; wTvl = 0.2;
    } else if (category.includes("dao") || category.includes("governance")) {
      wGithub = 0.45; wDeps = 0.3; wGov = 0.25; wTvl = 0;
    }

    const depScore = profile.dependency_health_score ?? 50;
    let govScore = profile.governance_tx_30d ? Math.min(profile.governance_tx_30d * 5, 80) : 0;

    // Realms DAO Accountability modifier
    let realmsModifier = 0;
    if (profile.realms_dao_address && profile.realms_delivery_rate !== null && profile.realms_delivery_rate !== undefined) {
      if (profile.realms_delivery_rate >= 70) realmsModifier = 10;
      else if (profile.realms_delivery_rate < 40) realmsModifier = -15;
      govScore = Math.max(0, Math.min(100, govScore + realmsModifier));
    }
    const tvlScore = profile.tvl_usd ? Math.min(Math.log10(profile.tvl_usd + 1) * 15, 80) : 0;

    // Back-calculate needed GitHub score
    const nonGithubContribution = (wDeps * depScore) + (wGov * govScore) + (wTvl * tvlScore);
    const neededGithubScore = Math.min(100, Math.max(0, (target_score - nonGithubContribution) / wGithub));

    // Map GitHub score to credible field values
    const now = new Date().toISOString();
    const commitVelocity = Math.round((neededGithubScore / 40) * 10) / 10; // scale
    const commits30d = Math.round(commitVelocity * 7 * 4.3); // weeks in a month

    const scoreBreakdown = {
      github: Math.round(neededGithubScore),
      dependencies: Math.round(depScore),
      governance: Math.round(govScore),
      tvl: Math.round(tvlScore),
      weights: { github: wGithub, deps: wDeps, gov: wGov, tvl: wTvl },
      realms_modifier: realmsModifier,
      continuity_decay: 1.0,
      final: target_score,
      recalibrated: true,
      recalibrated_at: now,
      recalibrated_by: admin_email,
      previous_score: oldScore,
    };

    // Update profile
    const { error: updateErr } = await supabase
      .from("claimed_profiles")
      .update({
        github_commit_velocity: commitVelocity,
        github_commits_30d: commits30d,
        github_last_commit: now,
        github_last_activity: now,
        liveness_status: "ACTIVE",
        resilience_score: target_score,
        integrated_score: target_score,
        score_breakdown: scoreBreakdown,
        updated_at: now,
      })
      .eq("id", profile_id);

    if (updateErr) {
      return new Response(
        JSON.stringify({ error: updateErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert score history
    await supabase.from("score_history").insert({
      claimed_profile_id: profile_id,
      score: target_score,
      commit_velocity: commitVelocity,
      days_last_commit: 0,
      breakdown: scoreBreakdown,
      snapshot_date: now,
    });

    return new Response(
      JSON.stringify({
        success: true,
        old_score: oldScore,
        new_score: target_score,
        profile_name: profile.project_name,
        breakdown: scoreBreakdown,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
