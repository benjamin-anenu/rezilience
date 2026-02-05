import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();

    if (!body.program_id || !body.program_name) {
      return new Response(
        JSON.stringify({ error: "program_id and program_name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("program_id", body.program_id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "Project already exists", id: existing.id }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        program_id: body.program_id,
        program_name: body.program_name,
        github_url: body.github_url || null,
        website_url: body.website_url || null,
        description: body.description || null,
        logo_url: body.logo_url || null,
        verified: false,
        resilience_score: 0,
        liveness_status: "STALE",
      })
      .select("id, program_id, program_name")
      .single();

    if (error) throw new Error(`Failed to insert: ${error.message}`);

    return new Response(
      JSON.stringify({ message: "Project created", project: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
