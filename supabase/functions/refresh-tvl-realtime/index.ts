import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * High-frequency cron job (every 5 minutes) to refresh TVL metrics
 * for all DeFi protocols.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("[TVL Realtime] Starting TVL refresh cycle...");

    const { data: profiles, error: fetchError } = await supabase
      .from("claimed_profiles")
      .select("id, project_name, category, github_commits_30d, tvl_usd")
      .or("verified.eq.true,claim_status.eq.unclaimed")
      .eq("category", "defi");

    if (fetchError) {
      throw new Error(`Failed to fetch profiles: ${fetchError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No DeFi profiles found", updated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[TVL Realtime] Found ${profiles.length} DeFi profiles to refresh`);

    const analyzeTvlUrl = `${supabaseUrl}/functions/v1/analyze-tvl`;

    let successCount = 0;
    let errorCount = 0;
    const results: Array<{ profile: string; status: string; tvl_usd?: number }> = [];

    for (const profile of profiles) {
      try {
        console.log(`[TVL Realtime] Fetching TVL for: ${profile.project_name}`);

        const response = await fetchWithRetry(analyzeTvlUrl, {
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

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`✗ TVL analysis failed: ${profile.project_name} - ${errorText}`);
          errorCount++;
          results.push({ profile: profile.project_name, status: `error: ${errorText}` });
        } else {
          const data = await response.json();
          successCount++;
          results.push({ 
            profile: profile.project_name, 
            status: "updated",
            tvl_usd: data?.tvl_usd,
          });
          console.log(`✓ TVL updated: ${profile.project_name} ($${(data?.tvl_usd || 0).toLocaleString()})`);
        }

        // 1.5s delay to avoid DeFiLlama rate limits (was 200ms)
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (err) {
        errorCount++;
        results.push({ profile: profile.project_name, status: `exception: ${err}` });
        console.error(`✗ Exception for ${profile.project_name}:`, err);
      }
    }

    const summary = {
      message: `TVL realtime refresh complete: ${successCount} updated, ${errorCount} errors`,
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
    console.error("[TVL Realtime] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Fetch with 403 retry — if rate-limited, wait 3s and retry once.
 */
async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  const response = await fetch(url, init);
  if (response.status === 403) {
    console.log("[TVL Realtime] Got 403 rate-limit, waiting 3s and retrying...");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return fetch(url, init);
  }
  return response;
}
