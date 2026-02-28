import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { profile_id, realm_dao_address, requested_sol, milestone_allocations } = body;

      if (!profile_id || !realm_dao_address || !requested_sol) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check for existing active proposal
      const { data: existing } = await supabase
        .from("funding_proposals")
        .select("id, status")
        .eq("profile_id", profile_id)
        .in("status", ["pending_signature", "voting", "accepted", "funded"])
        .limit(1);

      if (existing && existing.length > 0) {
        return new Response(
          JSON.stringify({ error: "An active funding proposal already exists for this profile", proposal_id: existing[0].id }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create proposal
      const { data: proposal, error: insertErr } = await supabase
        .from("funding_proposals")
        .insert({
          profile_id,
          realm_dao_address,
          requested_sol,
          milestone_allocations: milestone_allocations || [],
          status: "voting",
        })
        .select("id")
        .single();

      if (insertErr) {
        console.error("Insert error:", insertErr);
        return new Response(
          JSON.stringify({ error: insertErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update profile funding status
      await supabase
        .from("claimed_profiles")
        .update({
          funding_requested_sol: requested_sol,
          funding_status: "voting",
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile_id);

      // Create ecosystem trend
      const { data: profileData } = await supabase
        .from("claimed_profiles")
        .select("project_name")
        .eq("id", profile_id)
        .single();

      if (profileData) {
        await supabase.from("ecosystem_trends").insert({
          event_type: "funding_proposal",
          title: `${profileData.project_name} requested ${requested_sol} SOL funding from DAO`.slice(0, 120),
          profile_id,
          priority: "high",
          created_by: "system",
        }).catch(() => {});
      }

      return new Response(
        JSON.stringify({ success: true, proposal_id: proposal.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update_status") {
      const { proposal_id, status, proposal_address, proposal_tx, escrow_address } = body;

      if (!proposal_id || !status) {
        return new Response(
          JSON.stringify({ error: "Missing proposal_id or status" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updateData: Record<string, unknown> = { status };
      if (proposal_address) updateData.proposal_address = proposal_address;
      if (proposal_tx) updateData.proposal_tx = proposal_tx;
      if (escrow_address) updateData.escrow_address = escrow_address;
      if (status === "funded") updateData.funded_at = new Date().toISOString();

      const { error: updateErr } = await supabase
        .from("funding_proposals")
        .update(updateData)
        .eq("id", proposal_id);

      if (updateErr) {
        return new Response(
          JSON.stringify({ error: updateErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Sync funding_status to profile
      const { data: proposal } = await supabase
        .from("funding_proposals")
        .select("profile_id")
        .eq("id", proposal_id)
        .single();

      if (proposal) {
        await supabase
          .from("claimed_profiles")
          .update({ funding_status: status, updated_at: new Date().toISOString() })
          .eq("id", proposal.profile_id);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
