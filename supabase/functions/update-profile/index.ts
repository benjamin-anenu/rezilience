import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface UpdateProfileRequest {
  profile_id: string;
  x_user_id: string;
  updates: {
    website_url?: string;
    discord_url?: string;
    telegram_url?: string;
    media_assets?: Array<{
      id: string;
      type: "image" | "youtube" | "video";
      url: string;
      title?: string;
      order: number;
    }>;
    build_in_public_videos?: Array<{
      id: string;
      url: string;
      title: string;
      description?: string;
      uploadedAt: string;
      thumbnailUrl?: string;
    }>;
    milestones?: Array<{
      id: string;
      title: string;
      isLocked: boolean;
      varianceRequested?: boolean;
      milestones: Array<{
        id: string;
        title: string;
        description: string;
        targetDate?: string;
        status: "upcoming" | "completed" | "overdue" | "dao_approved" | "dao_rejected";
        completedAt?: string;
        deliveryEvidence?: {
          summary: string;
          metricsAchieved?: string;
          videoUrl?: string;
          githubLinks?: string[];
          submittedAt: string;
        };
      }>;
      order: number;
    }>;
    team_members?: Array<{
      id: string;
      imageUrl?: string;
      name: string;
      nickname?: string;
      jobTitle: string;
      whyFit: string;
      role: 'developer' | 'founder' | 'other';
      customRole?: string;
      order: number;
    }>;
    staking_pitch?: string;
  };
}

// Fields that can be updated by the owner
const EDITABLE_FIELDS = [
  "website_url",
  "discord_url",
  "telegram_url",
  "media_assets",
  "build_in_public_videos",
  "milestones",
  "team_members",
  "staking_pitch",
  "logo_url",
  "realms_dao_address",
];

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    const body: UpdateProfileRequest = await req.json();
    const { profile_id, x_user_id, updates } = body;

    if (!profile_id || !x_user_id) {
      return new Response(
        JSON.stringify({ error: "Missing profile_id or x_user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify ownership
    const { data: profile, error: fetchError } = await supabase
      .from("claimed_profiles")
      .select("id, x_user_id")
      .eq("id", profile_id)
      .single();

    if (fetchError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (profile.x_user_id !== x_user_id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: You don't own this profile" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter updates to only editable fields
    const safeUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (EDITABLE_FIELDS.includes(key)) {
        safeUpdates[key] = value;
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid fields to update" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add updated_at timestamp
    safeUpdates.updated_at = new Date().toISOString();

    // Perform the update
    const { data: updatedProfile, error: updateError } = await supabase
      .from("claimed_profiles")
      .update(safeUpdates)
      .eq("id", profile_id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, profile: updatedProfile }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in update-profile:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
