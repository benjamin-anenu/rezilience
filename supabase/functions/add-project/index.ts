import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AddProjectRequest {
  program_id: string;
  program_name: string;
  github_url?: string;
  website_url?: string;
  description?: string;
  logo_url?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    const body: AddProjectRequest = await req.json();

    // Validate required fields
    if (!body.program_id || !body.program_name) {
      return new Response(
        JSON.stringify({ error: "program_id and program_name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if project already exists
    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("program_id", body.program_id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "Project with this program_id already exists", id: existing.id }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert new project
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

    if (error) {
      throw new Error(`Failed to insert project: ${error.message}`);
    }

    // If GitHub URL provided, trigger a fetch
    if (body.github_url) {
      // Call fetch-github function for this specific project
      const fetchUrl = `${supabaseUrl}/functions/v1/fetch-github`;
      fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ project_id: data.id }),
      }).catch((e) => console.error("Failed to trigger GitHub fetch:", e));
    }

    return new Response(
      JSON.stringify({
        message: "Project created successfully",
        project: data,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in add-project function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
