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
      throw new Error("Missing configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const { action } = body;

    if (action === "list") {
      const { x_user_id, unread_only } = body;
      if (!x_user_id) return jsonResponse({ error: "Missing x_user_id" }, 400);

      let query = supabase
        .from("notifications")
        .select("*")
        .eq("recipient_x_user_id", x_user_id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (unread_only) {
        query = query.eq("read", false);
      }

      const { data, error } = await query;
      if (error) return jsonResponse({ error: error.message }, 500);

      return jsonResponse({ notifications: data });
    }

    if (action === "unread_count") {
      const { x_user_id } = body;
      if (!x_user_id) return jsonResponse({ error: "Missing x_user_id" }, 400);

      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_x_user_id", x_user_id)
        .eq("read", false);

      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ count: count || 0 });
    }

    if (action === "mark_read") {
      const { x_user_id, notification_ids } = body;
      if (!x_user_id) return jsonResponse({ error: "Missing x_user_id" }, 400);

      let query = supabase
        .from("notifications")
        .update({ read: true })
        .eq("recipient_x_user_id", x_user_id);

      if (notification_ids && Array.isArray(notification_ids)) {
        query = query.in("id", notification_ids);
      }

      const { error } = await query;
      if (error) return jsonResponse({ error: error.message }, 500);

      return jsonResponse({ success: true });
    }

    if (action === "create") {
      // Internal action: called by other edge functions to create notifications
      const { recipient_x_user_id, type, title, body: notifBody, bounty_id, profile_id } = body;

      if (!recipient_x_user_id || !type || !title) {
        return jsonResponse({ error: "Missing required fields" }, 400);
      }

      const { error } = await supabase.from("notifications").insert({
        recipient_x_user_id,
        type,
        title,
        body: notifBody || null,
        bounty_id: bounty_id || null,
        profile_id: profile_id || null,
      });

      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("Error:", err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
});
