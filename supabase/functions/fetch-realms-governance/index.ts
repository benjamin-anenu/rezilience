import { createClient } from "npm:@supabase/supabase-js@2";
import { logServiceHealth } from "../_shared/service-health.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// spl-governance program ID
const GOV_PROGRAM_ID = "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw";

// Proposal state mapping
const PROPOSAL_STATES: Record<number, string> = {
  0: "Draft",
  1: "SigningOff",
  2: "Voting",
  3: "Succeeded",
  4: "Executing",
  5: "Completed",
  6: "Cancelled",
  7: "Defeated",
};

interface ProposalSummary {
  name: string;
  state: string;
  stateIndex: number;
  governance: string;
}

/**
 * Fetch Realms governance proposals for a DAO and update the profile.
 * POST { realm_address, profile_id }
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const start = Date.now();

  try {
    const { realm_address, profile_id } = await req.json();

    if (!realm_address || !profile_id) {
      return new Response(
        JSON.stringify({ error: "realm_address and profile_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate base58 format (32-44 chars, base58 alphabet)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(realm_address)) {
      return new Response(
        JSON.stringify({ error: "Invalid Solana address format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rpcUrl = Deno.env.get("RPC_URL") || "https://api.mainnet-beta.solana.com";

    console.log(`[Realms] Fetching governance accounts for realm: ${realm_address}`);

    // Step 1: Get all governance accounts owned by this realm
    // Governance accounts have the realm pubkey at byte offset 1 (after account type byte)
    const governanceAccounts = await rpcGetProgramAccounts(rpcUrl, GOV_PROGRAM_ID, [
      { memcmp: { offset: 33, bytes: realm_address } }, // realm field in GovernanceV2
    ]);

    if (!governanceAccounts || governanceAccounts.length === 0) {
      // Try alternative offset for v1
      const govAccountsV1 = await rpcGetProgramAccounts(rpcUrl, GOV_PROGRAM_ID, [
        { memcmp: { offset: 1, bytes: realm_address } },
      ]);

      if (!govAccountsV1 || govAccountsV1.length === 0) {
        console.log(`[Realms] No governance accounts found for realm ${realm_address}`);
        await updateProfile(profile_id, {
          realms_proposals_total: 0,
          realms_proposals_completed: 0,
          realms_proposals_active: 0,
          realms_delivery_rate: null,
          realms_last_proposal: null,
          realms_analyzed_at: new Date().toISOString(),
          realms_raw_data: [],
        });

        logServiceHealth("realms-governance", "/fetch-realms-governance", 200, Date.now() - start);

        return new Response(
          JSON.stringify({ message: "No governance accounts found", proposals: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      governanceAccounts.push(...govAccountsV1);
    }

    console.log(`[Realms] Found ${governanceAccounts.length} governance accounts`);

    // Cap at 5 governance accounts to prevent cascading slow RPC calls
    const cappedAccounts = governanceAccounts.slice(0, 5);
    if (governanceAccounts.length > 5) {
      console.log(`[Realms] Capped from ${governanceAccounts.length} to 5 governance accounts`);
    }

    // Step 2: For each governance account, fetch proposals
    const allProposals: ProposalSummary[] = [];

    for (const govAccount of cappedAccounts) {
      const govPubkey = govAccount.pubkey;

      // Proposals have the governance pubkey at offset 1 (after account type byte)
      const proposals = await rpcGetProgramAccounts(rpcUrl, GOV_PROGRAM_ID, [
        { memcmp: { offset: 1, bytes: govPubkey } },
        { dataSize: 0 }, // We don't filter by size since proposals vary
      ]);

      if (proposals) {
        for (const prop of proposals) {
          const parsed = parseProposalAccount(prop.account.data, govPubkey);
          if (parsed) {
            allProposals.push(parsed);
          }
        }
      }

      // Rate limit between governance accounts
      if (cappedAccounts.length > 1) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    console.log(`[Realms] Parsed ${allProposals.length} proposals`);

    // Step 3: Calculate metrics
    const stateCounts: Record<string, number> = {};
    for (const p of allProposals) {
      stateCounts[p.state] = (stateCounts[p.state] || 0) + 1;
    }

    const total = allProposals.length;
    const completed = (stateCounts["Completed"] || 0) + (stateCounts["Executing"] || 0);
    const active = (stateCounts["Voting"] || 0) + (stateCounts["SigningOff"] || 0);
    const draft = stateCounts["Draft"] || 0;
    const cancelled = stateCounts["Cancelled"] || 0;

    // Delivery Rate = (Completed + Executing) / (Total - Draft - Cancelled)
    const denominator = total - draft - cancelled;
    const deliveryRate = denominator > 0 ? Math.round((completed / denominator) * 100) : null;

    // Take the top 50 proposals for raw data storage
    const rawData = allProposals.slice(0, 50).map((p) => ({
      name: p.name,
      state: p.state,
      governance: p.governance.slice(0, 8),
    }));

    // Step 4: Update profile
    await updateProfile(profile_id, {
      realms_proposals_total: total,
      realms_proposals_completed: completed,
      realms_proposals_active: active,
      realms_delivery_rate: deliveryRate,
      realms_last_proposal: null, // We don't have timestamps from basic parsing
      realms_analyzed_at: new Date().toISOString(),
      realms_raw_data: rawData,
    });

    const latency = Date.now() - start;
    logServiceHealth("realms-governance", "/fetch-realms-governance", 200, latency);

    const result = {
      realm_address,
      profile_id,
      total,
      completed,
      active,
      delivery_rate: deliveryRate,
      state_breakdown: stateCounts,
      latency_ms: latency,
    };

    console.log(`[Realms] ✓ Analysis complete:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const latency = Date.now() - start;
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[Realms] Error:", errMsg);
    logServiceHealth("realms-governance", "/fetch-realms-governance", null, latency, errMsg);

    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── Helpers ───

async function updateProfile(profileId: string, updates: Record<string, unknown>) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase
    .from("claimed_profiles")
    .update(updates)
    .eq("id", profileId);

  if (error) {
    console.error(`[Realms] Failed to update profile ${profileId}:`, error.message);
  }
}

async function rpcGetProgramAccounts(
  rpcUrl: string,
  programId: string,
  filters: Array<{ memcmp?: { offset: number; bytes: string }; dataSize?: number }>
) {
  try {
    // Remove dataSize: 0 filter (it means "any size" which is not valid)
    const validFilters = filters.filter((f) => !(f.dataSize === 0));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getProgramAccounts",
        params: [
          programId,
          {
            encoding: "base64",
            filters: validFilters,
          },
        ],
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[Realms] RPC error: ${response.status}`);
      return null;
    }

    const json = await response.json();
    if (json.error) {
      console.error(`[Realms] RPC JSON error:`, json.error);
      return null;
    }

    return json.result || [];
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error(`[Realms] RPC request timed out after 10s`);
    } else {
      console.error(`[Realms] RPC fetch error:`, err);
    }
    return null;
  }
}

function parseProposalAccount(
  data: [string, string], // [base64data, encoding]
  governance: string
): ProposalSummary | null {
  try {
    const buffer = Uint8Array.from(atob(data[0]), (c) => c.charCodeAt(0));

    // Minimum size check
    if (buffer.length < 10) return null;

    // Account type byte at offset 0
    // ProposalV1 = 6, ProposalV2 = 14
    const accountType = buffer[0];
    if (accountType !== 6 && accountType !== 14) return null;

    // For ProposalV2 (type 14):
    // Offset layout (approximate):
    // 0: account_type (1)
    // 1: governance (32)
    // 33: governing_token_mint (32)
    // 65: state (1)
    // 66: token_owner_record (32)
    // 98: signatories_count (1)
    // ...then name as borsh string (4 byte length + data)

    let stateOffset: number;
    let nameOffset: number;

    if (accountType === 14) {
      stateOffset = 65;
      nameOffset = 131; // approximate
    } else {
      // ProposalV1 has slightly different layout
      stateOffset = 65;
      nameOffset = 131;
    }

    if (buffer.length <= stateOffset) return null;

    const stateIndex = buffer[stateOffset];
    const state = PROPOSAL_STATES[stateIndex] || `Unknown(${stateIndex})`;

    // Try to extract name (borsh string: 4-byte LE length + UTF-8)
    let name = "Unnamed Proposal";
    if (buffer.length > nameOffset + 4) {
      const nameLen =
        buffer[nameOffset] |
        (buffer[nameOffset + 1] << 8) |
        (buffer[nameOffset + 2] << 16) |
        (buffer[nameOffset + 3] << 24);

      if (nameLen > 0 && nameLen < 256 && buffer.length >= nameOffset + 4 + nameLen) {
        const nameBytes = buffer.slice(nameOffset + 4, nameOffset + 4 + nameLen);
        name = new TextDecoder().decode(nameBytes);
      }
    }

    return { name, state, stateIndex, governance };
  } catch {
    return null;
  }
}
