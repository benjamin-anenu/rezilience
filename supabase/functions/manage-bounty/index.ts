import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

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
    const { action } = body;

    switch (action) {
      case "create": {
        const { x_user_id, realm_dao_address, title, description, reward_sol } = body;

        if (!x_user_id || !realm_dao_address || !title || reward_sol === undefined) {
          return jsonResponse({ error: "Missing required fields: x_user_id, realm_dao_address, title, reward_sol" }, 400);
        }

        if (typeof reward_sol !== "number" || reward_sol <= 0) {
          return jsonResponse({ error: "reward_sol must be a positive number" }, 400);
        }

        if (title.length > 200) {
          return jsonResponse({ error: "Title must be 200 characters or less" }, 400);
        }

        if (description && description.length > 2000) {
          return jsonResponse({ error: "Description must be 2000 characters or less" }, 400);
        }

        // Verify the user owns a profile with this realm_dao_address
        const { data: profile, error: profileError } = await supabase
          .from("claimed_profiles")
          .select("id, x_user_id, realms_dao_address")
          .eq("x_user_id", x_user_id)
          .eq("realms_dao_address", realm_dao_address)
          .single();

        if (profileError || !profile) {
          return jsonResponse({ error: "You must own a profile with this Realm DAO address to create bounties" }, 403);
        }

        const { data: bounty, error: insertError } = await supabase
          .from("bounties")
          .insert({
            realm_dao_address,
            title: title.trim(),
            description: description?.trim() || null,
            reward_sol,
            status: "open",
            creator_profile_id: profile.id,
            creator_x_user_id: x_user_id,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Insert error:", insertError);
          return jsonResponse({ error: "Failed to create bounty" }, 500);
        }

        return jsonResponse({ success: true, bounty });
      }

      case "claim": {
        const { x_user_id, bounty_id, wallet_address } = body;

        if (!x_user_id || !bounty_id || !wallet_address) {
          return jsonResponse({ error: "Missing required fields: x_user_id, bounty_id, wallet_address" }, 400);
        }

        // Get the bounty
        const { data: bounty, error: bountyError } = await supabase
          .from("bounties")
          .select("*")
          .eq("id", bounty_id)
          .single();

        if (bountyError || !bounty) {
          return jsonResponse({ error: "Bounty not found" }, 404);
        }

        if (bounty.status !== "open") {
          return jsonResponse({ error: "This bounty is no longer open for claiming" }, 400);
        }

        // Can't claim your own bounty
        if (bounty.creator_x_user_id === x_user_id) {
          return jsonResponse({ error: "You cannot claim your own bounty" }, 400);
        }

        // Find claimer's profile
        const { data: claimerProfile } = await supabase
          .from("claimed_profiles")
          .select("id")
          .eq("x_user_id", x_user_id)
          .single();

        const { data: updated, error: updateError } = await supabase
          .from("bounties")
          .update({
            status: "claimed",
            claimer_x_user_id: x_user_id,
            claimer_wallet: wallet_address,
            claimer_profile_id: claimerProfile?.id || null,
            claimed_at: new Date().toISOString(),
          })
          .eq("id", bounty_id)
          .eq("status", "open") // Optimistic lock
          .select()
          .single();

        if (updateError || !updated) {
          return jsonResponse({ error: "Failed to claim bounty. It may have been claimed by someone else." }, 409);
        }

        return jsonResponse({ success: true, bounty: updated });
      }

      case "submit": {
        const { x_user_id, bounty_id, evidence_summary, evidence_links } = body;

        if (!x_user_id || !bounty_id || !evidence_summary) {
          return jsonResponse({ error: "Missing required fields: x_user_id, bounty_id, evidence_summary" }, 400);
        }

        if (evidence_summary.length > 2000) {
          return jsonResponse({ error: "Evidence summary must be 2000 characters or less" }, 400);
        }

        const { data: bounty, error: bountyError } = await supabase
          .from("bounties")
          .select("*")
          .eq("id", bounty_id)
          .single();

        if (bountyError || !bounty) {
          return jsonResponse({ error: "Bounty not found" }, 404);
        }

        if (bounty.status !== "claimed") {
          return jsonResponse({ error: "Bounty must be in 'claimed' status to submit evidence" }, 400);
        }

        if (bounty.claimer_x_user_id !== x_user_id) {
          return jsonResponse({ error: "Only the claimer can submit evidence" }, 403);
        }

        const validLinks = Array.isArray(evidence_links) 
          ? evidence_links.filter((l: string) => typeof l === "string" && l.length <= 500).slice(0, 10)
          : [];

        const { data: updated, error: updateError } = await supabase
          .from("bounties")
          .update({
            status: "submitted",
            evidence_summary: evidence_summary.trim(),
            evidence_links: validLinks,
            submitted_at: new Date().toISOString(),
          })
          .eq("id", bounty_id)
          .select()
          .single();

        if (updateError) {
          return jsonResponse({ error: "Failed to submit evidence" }, 500);
        }

        return jsonResponse({ success: true, bounty: updated });
      }

      case "approve":
      case "reject": {
        const { x_user_id, bounty_id } = body;

        if (!x_user_id || !bounty_id) {
          return jsonResponse({ error: "Missing required fields: x_user_id, bounty_id" }, 400);
        }

        const { data: bounty, error: bountyError } = await supabase
          .from("bounties")
          .select("*")
          .eq("id", bounty_id)
          .single();

        if (bountyError || !bounty) {
          return jsonResponse({ error: "Bounty not found" }, 404);
        }

        if (bounty.status !== "submitted") {
          return jsonResponse({ error: "Bounty must be in 'submitted' status to approve/reject" }, 400);
        }

        if (bounty.creator_x_user_id !== x_user_id) {
          return jsonResponse({ error: "Only the bounty creator can approve/reject" }, 403);
        }

        const newStatus = action === "approve" ? "approved" : "rejected";

        const { data: updated, error: updateError } = await supabase
          .from("bounties")
          .update({
            status: newStatus,
            resolved_at: new Date().toISOString(),
          })
          .eq("id", bounty_id)
          .select()
          .single();

        if (updateError) {
          return jsonResponse({ error: `Failed to ${action} bounty` }, 500);
        }

        return jsonResponse({ success: true, bounty: updated });
      }

      default:
        return jsonResponse({ error: "Invalid action. Must be: create, claim, submit, approve, reject" }, 400);
    }
  } catch (error) {
    console.error("Error in manage-bounty:", error);
    return jsonResponse({ error: error.message || "Internal server error" }, 500);
  }
});
