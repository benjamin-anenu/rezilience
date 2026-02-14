import { createClient } from "npm:@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();

    const {
      profile_id,
      unclaimed_profile_id,
      project_name,
      x_user_id,
      x_username,
      ...rest
    } = body;

    // Validate required fields
    if (!project_name || !x_user_id || !x_username) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: project_name, x_user_id, x_username" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already has a claimed profile
    const { data: existing } = await supabase
      .from("claimed_profiles")
      .select("id")
      .eq("x_user_id", x_user_id)
      .eq("claim_status", "claimed")
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ error: "You already have a claimed profile", profile_id: existing[0].id }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profileData = {
      project_name,
      x_user_id,
      x_username,
      ...rest,
      claim_status: "claimed",
      verified: true,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let resultProfile;
    let error;

    if (unclaimed_profile_id) {
      // Verify it's actually unclaimed
      const { data: target, error: fetchErr } = await supabase
        .from("claimed_profiles")
        .select("id, claim_status")
        .eq("id", unclaimed_profile_id)
        .maybeSingle();

      if (fetchErr || !target) {
        return new Response(
          JSON.stringify({ error: "Profile not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (target.claim_status === "claimed") {
        return new Response(
          JSON.stringify({ error: "This profile has already been claimed" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await supabase
        .from("claimed_profiles")
        .update(profileData)
        .eq("id", unclaimed_profile_id)
        .select("id")
        .single();

      resultProfile = result.data;
      error = result.error;
    } else {
      const newId = profile_id || crypto.randomUUID();
      const result = await supabase
        .from("claimed_profiles")
        .insert([{ id: newId, ...profileData }])
        .select("id")
        .single();

      resultProfile = result.data;
      error = result.error;
    }

    if (error) {
      console.error("DB error:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Database error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const finalProfileId = resultProfile?.id || unclaimed_profile_id || profile_id;

    // Create ecosystem trend (fire-and-forget)
    try {
      await supabase.from("ecosystem_trends").insert({
        event_type: "claim",
        title: `${project_name} just joined the Rezilience Registry`.slice(0, 120),
        profile_id: finalProfileId,
        priority: "normal",
        created_by: "system",
      });
    } catch {
      // Non-critical
    }

    return new Response(
      JSON.stringify({ success: true, profile_id: finalProfileId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in claim-profile:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
