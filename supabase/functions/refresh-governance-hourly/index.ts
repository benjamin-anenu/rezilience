import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Hourly cron job to refresh governance metrics for all profiles
 * with configured multisig/DAO addresses.
 * 
 * Governance activity can change rapidly (DAO votes, multisig transactions),
 * so this runs every hour to ensure near-real-time tracking.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("[Governance Hourly] Starting governance refresh cycle...");

    // Fetch all profiles with governance addresses configured
    const { data: profiles, error: fetchError } = await supabase
      .from("claimed_profiles")
      .select("id, project_name, governance_address, multisig_address, program_id, resilience_score, dependency_health_score, governance_tx_30d, tvl_usd, tvl_risk_ratio")
      .or("verified.eq.true,claim_status.eq.unclaimed")
      .or("multisig_address.not.is.null,category.eq.dao");

    if (fetchError) {
      throw new Error(`Failed to fetch profiles: ${fetchError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No profiles with governance addresses found", updated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Governance Hourly] Found ${profiles.length} profiles with governance/dao addresses`);

    const analyzeGovUrl = `${supabaseUrl}/functions/v1/analyze-governance`;

    let successCount = 0;
    let errorCount = 0;
    const results: Array<{ profile: string; status: string; tx_count?: number }> = [];

    for (const profile of profiles) {
      try {
        const addressToAnalyze = profile.multisig_address || profile.program_id;
        if (!addressToAnalyze) {
          console.log(`[Governance Hourly] Skipping ${profile.project_name}: no address available`);
          continue;
        }
        console.log(`[Governance Hourly] Analyzing: ${profile.project_name} (${addressToAnalyze})`);

        const response = await fetch(analyzeGovUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            governance_address: addressToAnalyze,
            profile_id: profile.id,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`✗ Governance analysis failed: ${profile.project_name} - ${errorText}`);
          errorCount++;
          results.push({ profile: profile.project_name, status: `error: ${errorText}` });
        } else {
          const data = await response.json();
          successCount++;
          results.push({ 
            profile: profile.project_name, 
            status: "updated",
            tx_count: data?.tx_count_30d,
          });
          console.log(`✓ Governance updated: ${profile.project_name} (${data?.tx_count_30d || 0} txs)`);
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        errorCount++;
        results.push({ profile: profile.project_name, status: `exception: ${err}` });
        console.error(`✗ Exception for ${profile.project_name}:`, err);
      }
    }

    // ── PASS 2: Realms DAO Accountability ──
    const { data: realmsProfiles, error: realmsError } = await supabase
      .from("claimed_profiles")
      .select("id, project_name, realms_dao_address")
      .not("realms_dao_address", "is", null);

    let realmsSuccess = 0;
    let realmsErrors = 0;

    if (!realmsError && realmsProfiles && realmsProfiles.length > 0) {
      console.log(`[Governance Hourly] Found ${realmsProfiles.length} profiles with Realms DAO addresses`);

      const realmsUrl = `${supabaseUrl}/functions/v1/fetch-realms-governance`;

      for (const rp of realmsProfiles) {
        try {
          console.log(`[Governance Hourly] Realms analysis: ${rp.project_name}`);

          const response = await fetch(realmsUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              realm_address: rp.realms_dao_address,
              profile_id: rp.id,
            }),
          });

          if (response.ok) {
            realmsSuccess++;
            const data = await response.json();
            console.log(`✓ Realms updated: ${rp.project_name} (${data?.delivery_rate ?? 'N/A'}% delivery)`);
          } else {
            realmsErrors++;
            console.error(`✗ Realms failed: ${rp.project_name} - ${await response.text()}`);
          }

          await new Promise((resolve) => setTimeout(resolve, 1500));
        } catch (err) {
          realmsErrors++;
          console.error(`✗ Realms exception for ${rp.project_name}:`, err);
        }
      }
    }

    const summary = {
      message: `Governance hourly refresh complete: ${successCount} updated, ${errorCount} errors | Realms: ${realmsSuccess} updated, ${realmsErrors} errors`,
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
    console.error("[Governance Hourly] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
