import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Lightweight edge function for GitHub re-verification.
 * Only updates github_username on an existing claimed profile.
 * Does NOT create new profiles or overwrite project metadata.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const githubClientId = Deno.env.get("GITHUB_CLIENT_ID");
    const githubClientSecret = Deno.env.get("GITHUB_CLIENT_SECRET");

    if (!githubClientId || !githubClientSecret) {
      return new Response(
        JSON.stringify({ error: "GitHub OAuth not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { code, profile_id } = await req.json();

    if (!code || !profile_id) {
      return new Response(
        JSON.stringify({ error: "code and profile_id are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the profile exists and is already claimed
    const { data: existingProfile, error: profileError } = await supabase
      .from("claimed_profiles")
      .select("id, project_name, github_org_url, github_username")
      .eq("id", profile_id)
      .maybeSingle();

    if (profileError || !existingProfile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: githubClientId,
          client_secret: githubClientSecret,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("GitHub token error:", tokenData.error_description);
      return new Response(
        JSON.stringify({
          error: `GitHub OAuth failed: ${tokenData.error_description || tokenData.error}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const accessToken = tokenData.access_token;
    const tokenScope = tokenData.scope;

    // Fetch GitHub user profile
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Rezilience-Platform",
      },
    });

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch GitHub user profile" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const githubUser = await userResponse.json();

    // Update ONLY github_username and token on the existing profile
    const { error: updateError } = await supabase
      .from("claimed_profiles")
      .update({
        github_username: githubUser.login,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile_id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({
          error: `Failed to update profile: ${updateError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Store token in profile_secrets
    await supabase
      .from("profile_secrets")
      .upsert(
        {
          profile_id,
          github_access_token: accessToken,
          github_token_scope: tokenScope,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "profile_id" }
      );

    // Trigger full analytics fetch if github URL is available
    const repoUrl = existingProfile.github_org_url;
    if (repoUrl) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/analyze-github-repo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            github_url: repoUrl,
            profile_id,
          }),
        });
      } catch (err) {
        console.error("Failed to trigger analytics:", err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          id: profile_id,
          projectName: existingProfile.project_name,
          githubUsername: githubUser.login,
          score: 0,
          livenessStatus: "ACTIVE",
          verified: true,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
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
