import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckBlacklistRequest {
  profile_id: string;
  wallet_address: string;
}

interface CheckBlacklistResponse {
  isBlacklisted: boolean;
  attemptCount: number;
  isPermanentBan: boolean;
  message?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile_id, wallet_address }: CheckBlacklistRequest = await req.json();

    if (!profile_id || !wallet_address) {
      return new Response(
        JSON.stringify({ 
          isBlacklisted: false, 
          attemptCount: 0,
          isPermanentBan: false,
          message: "profile_id and wallet_address are required" 
        } as CheckBlacklistResponse),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role for reading blacklist
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if wallet is blacklisted for this profile
    const { data: blacklistEntry, error } = await supabase
      .from("claim_blacklist")
      .select("*")
      .eq("profile_id", profile_id)
      .eq("wallet_address", wallet_address)
      .maybeSingle();

    if (error) {
      console.error("Error checking blacklist:", error);
      return new Response(
        JSON.stringify({ 
          isBlacklisted: false, 
          attemptCount: 0,
          isPermanentBan: false,
          message: "Error checking blacklist" 
        } as CheckBlacklistResponse),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!blacklistEntry) {
      // No record - wallet is not blacklisted
      return new Response(
        JSON.stringify({ 
          isBlacklisted: false, 
          attemptCount: 0,
          isPermanentBan: false,
        } as CheckBlacklistResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if permanently banned (5+ attempts)
    if (blacklistEntry.is_permanent_ban || blacklistEntry.attempt_count >= 5) {
      return new Response(
        JSON.stringify({ 
          isBlacklisted: true, 
          attemptCount: blacklistEntry.attempt_count,
          isPermanentBan: true,
          message: "You have been permanently blocked from claiming this project due to repeated failed verification attempts. If you believe this is an error, please contact support." 
        } as CheckBlacklistResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if approaching ban (3+ attempts)
    if (blacklistEntry.attempt_count >= 3) {
      return new Response(
        JSON.stringify({ 
          isBlacklisted: false, 
          attemptCount: blacklistEntry.attempt_count,
          isPermanentBan: false,
          message: `Warning: You have ${5 - blacklistEntry.attempt_count} attempt(s) remaining before being permanently blocked from claiming this project.` 
        } as CheckBlacklistResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Has attempts but not yet at warning threshold
    return new Response(
      JSON.stringify({ 
        isBlacklisted: false, 
        attemptCount: blacklistEntry.attempt_count,
        isPermanentBan: false,
      } as CheckBlacklistResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in check-claim-blacklist:", error);
    return new Response(
      JSON.stringify({ 
        isBlacklisted: false, 
        attemptCount: 0,
        isPermanentBan: false,
        message: error instanceof Error ? error.message : "Unknown error" 
      } as CheckBlacklistResponse),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
