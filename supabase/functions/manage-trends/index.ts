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
    const { action, admin_email, trend, trend_id } = body;

    if (!admin_email) {
      return new Response(
        JSON.stringify({ error: "Missing admin_email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Allow system calls (from claim flow) without admin check
    const isSystemCall = admin_email === 'system';

    if (!isSystemCall) {
      // Verify admin
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("id, email")
        .eq("email", admin_email)
        .maybeSingle();

      if (adminError || !adminUser) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Not an admin" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (action === "create") {
      if (!trend?.title || !trend?.event_type) {
        return new Response(
          JSON.stringify({ error: "Missing title or event_type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase
        .from("ecosystem_trends")
        .insert([{
          event_type: trend.event_type,
          title: trend.title.slice(0, 120),
          description: trend.description || null,
          profile_id: trend.profile_id || null,
          metadata: trend.metadata || {},
          priority: trend.priority || "normal",
          expires_at: trend.expires_at || null,
          created_by: admin_email,
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, trend: data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete") {
      if (isSystemCall) {
        return new Response(
          JSON.stringify({ error: "System cannot delete trends" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!trend_id) {
        return new Response(
          JSON.stringify({ error: "Missing trend_id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("ecosystem_trends")
        .delete()
        .eq("id", trend_id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'create' or 'delete'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in manage-trends:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
