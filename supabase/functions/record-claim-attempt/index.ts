import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecordAttemptRequest {
  profile_id: string;
  wallet_address: string;
}

interface RecordAttemptResponse {
  success: boolean;
  attemptCount: number;
  isPermanentBan: boolean;
  message?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile_id, wallet_address }: RecordAttemptRequest = await req.json();

    if (!profile_id || !wallet_address) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          attemptCount: 0,
          isPermanentBan: false,
          message: "profile_id and wallet_address are required" 
        } as RecordAttemptResponse),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role for writing to blacklist
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if entry already exists
    const { data: existingEntry, error: checkError } = await supabase
      .from("claim_blacklist")
      .select("*")
      .eq("profile_id", profile_id)
      .eq("wallet_address", wallet_address)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing blacklist entry:", checkError);
      throw checkError;
    }

    let attemptCount: number;
    let isPermanentBan: boolean;

    if (existingEntry) {
      // Update existing entry - increment count
      const newCount = existingEntry.attempt_count + 1;
      isPermanentBan = newCount >= 5;

      const { error: updateError } = await supabase
        .from("claim_blacklist")
        .update({
          attempt_count: newCount,
          last_attempt_at: new Date().toISOString(),
          is_permanent_ban: isPermanentBan,
        })
        .eq("id", existingEntry.id);

      if (updateError) {
        console.error("Error updating blacklist entry:", updateError);
        throw updateError;
      }

      attemptCount = newCount;
    } else {
      // Create new entry
      const { error: insertError } = await supabase
        .from("claim_blacklist")
        .insert({
          profile_id,
          wallet_address,
          attempt_count: 1,
          first_attempt_at: new Date().toISOString(),
          last_attempt_at: new Date().toISOString(),
          is_permanent_ban: false,
        });

      if (insertError) {
        console.error("Error inserting blacklist entry:", insertError);
        throw insertError;
      }

      attemptCount = 1;
      isPermanentBan = false;
    }

    // Generate appropriate message
    let message: string | undefined;
    if (isPermanentBan) {
      message = "You have been permanently blocked from claiming this project. Contact support if you believe this is an error.";
    } else if (attemptCount >= 3) {
      message = `Warning: You have ${5 - attemptCount} attempt(s) remaining before being permanently blocked.`;
    } else if (attemptCount === 2) {
      message = "Authority verification failed. Please ensure you are connecting the correct wallet.";
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        attemptCount,
        isPermanentBan,
        message,
      } as RecordAttemptResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in record-claim-attempt:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        attemptCount: 0,
        isPermanentBan: false,
        message: error instanceof Error ? error.message : "Unknown error" 
      } as RecordAttemptResponse),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
