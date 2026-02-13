import { createClient } from "npm:@supabase/supabase-js@2";
import { logServiceHealth } from "../_shared/service-health.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Confidence tiers for verification results
type ConfidenceTier = "HIGH" | "MEDIUM" | "LOW" | "SUSPICIOUS" | "NOT_DEPLOYED";

interface HardenedVerificationResult {
  programId: string;
  verified: boolean;
  bytecodeHash: string | null;
  onChainHash: string | null;
  matchStatus: "original" | "fork" | "unknown" | "not-deployed";
  confidence: ConfidenceTier;
  deploySlot: number | null;
  message: string;
  verifiedAt: string;
}

// ── Validation Utilities ──

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function isValidBase58(str: string): boolean {
  for (const char of str) {
    if (!BASE58_ALPHABET.includes(char)) return false;
  }
  return true;
}

function isValidSolanaProgramId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  if (id.length < 32 || id.length > 44) return false;
  return isValidBase58(id);
}

/**
 * Normalize a GitHub URL to lowercase "owner/repo" format for exact comparison.
 * Strips protocol, domain, trailing slashes, .git suffix, tree/branch paths.
 */
function normalizeGitHubRepo(url: string): string | null {
  if (!url) return null;
  try {
    let cleaned = url.trim().toLowerCase();
    // Remove protocol
    cleaned = cleaned.replace(/^https?:\/\//, "");
    // Remove www.
    cleaned = cleaned.replace(/^www\./, "");
    // Remove github.com/
    cleaned = cleaned.replace(/^github\.com\//, "");
    // Remove .git suffix
    cleaned = cleaned.replace(/\.git$/, "");
    // Remove trailing slash
    cleaned = cleaned.replace(/\/$/, "");
    // Remove tree/branch/path segments (e.g., /tree/main/packages/foo)
    const parts = cleaned.split("/");
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Compute SHA-256 hash of binary data, returning hex string.
 */
async function computeSHA256(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Decode a base64 string to Uint8Array.
 */
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Extract programData address from a BPF Upgradeable Loader program account.
 * Program account layout: [4 bytes state][32 bytes programData address]
 * State byte 0x02 = "Program" variant of the UpgradeableLoaderState enum.
 */
function extractProgramDataAddress(accountDataBase64: string): string | null {
  try {
    const bytes = base64ToBytes(accountDataBase64);
    // Check minimum size: 4 + 32 = 36 bytes
    if (bytes.length < 36) return null;
    // First 4 bytes are the state enum (little-endian u32). 
    // Value 2 = "Program" variant which contains the programData address
    const state = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
    if (state !== 2) return null;
    // Bytes 4-35 are the programData pubkey (32 bytes)
    const pubkeyBytes = bytes.slice(4, 36);
    return encodeBase58(pubkeyBytes);
  } catch {
    return null;
  }
}

/**
 * Parse programData account to extract deploy slot and executable bytes.
 * ProgramData layout: [4 bytes state][8 bytes slot][1 byte authority_option][32 bytes authority (if present)][...executable]
 * State byte 0x03 = "ProgramData" variant.
 * The executable starts at offset 45 (4 + 8 + 1 + 32).
 */
function parseProgramData(accountDataBase64: string): {
  deploySlot: number;
  executableBytes: Uint8Array;
} | null {
  try {
    const bytes = base64ToBytes(accountDataBase64);
    // Minimum: 45 bytes header + at least 1 byte of executable
    if (bytes.length < 46) return null;
    
    const state = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
    if (state !== 3) return null;

    // Bytes 4-11: slot as little-endian u64 (we only read lower 48 bits safely)
    const deploySlot = Number(
      BigInt(bytes[4]) |
      (BigInt(bytes[5]) << 8n) |
      (BigInt(bytes[6]) << 16n) |
      (BigInt(bytes[7]) << 24n) |
      (BigInt(bytes[8]) << 32n) |
      (BigInt(bytes[9]) << 40n)
    );

    // Executable bytes start at offset 45
    const EXECUTABLE_OFFSET = 45;
    const executableBytes = bytes.slice(EXECUTABLE_OFFSET);
    
    // Trim trailing zeros (Solana pads program data)
    let lastNonZero = executableBytes.length - 1;
    while (lastNonZero > 0 && executableBytes[lastNonZero] === 0) {
      lastNonZero--;
    }
    const trimmedExecutable = executableBytes.slice(0, lastNonZero + 1);

    return { deploySlot, executableBytes: trimmedExecutable };
  } catch {
    return null;
  }
}

/**
 * Base58 encode bytes (for converting programData pubkey bytes to string).
 */
function encodeBase58(bytes: Uint8Array): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  
  // Count leading zeros
  let leadingZeros = 0;
  for (const b of bytes) {
    if (b !== 0) break;
    leadingZeros++;
  }

  // Convert to base58
  let num = 0n;
  for (const b of bytes) {
    num = num * 256n + BigInt(b);
  }

  let result = "";
  while (num > 0n) {
    const remainder = Number(num % 58n);
    num = num / 58n;
    result = ALPHABET[remainder] + result;
  }

  // Add leading '1's for each leading zero byte
  return "1".repeat(leadingZeros) + result;
}

// ── Main Handler ──

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { program_id, profile_id, github_url } = await req.json();

    // ── Fix 3: Input Validation ──
    if (!program_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing program_id parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isValidSolanaProgramId(program_id)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid program_id: must be a valid Solana base58 public key (32-44 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[verify-bytecode] Starting hardened verification for: ${program_id}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Database configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── Fix 5: Upgrade Detection via Slot Tracking ──
    // Check cache, but also compare deploy slot to detect upgrades
    let previousDeploySlot: number | null = null;

    if (profile_id) {
      const { data: existingProfile } = await supabase
        .from("claimed_profiles")
        .select("bytecode_verified_at, bytecode_deploy_slot")
        .eq("id", profile_id)
        .single();

      if (existingProfile?.bytecode_verified_at) {
        previousDeploySlot = existingProfile.bytecode_deploy_slot ?? null;
        const lastVerified = new Date(existingProfile.bytecode_verified_at);
        const hoursSinceVerification = (Date.now() - lastVerified.getTime()) / (1000 * 60 * 60);

        // We'll check slot later -- if it changed we'll force re-verify
        if (hoursSinceVerification < 24) {
          // Temporarily mark as cached; we'll override if slot changed
          console.log(`[verify-bytecode] Last verified ${hoursSinceVerification.toFixed(1)}h ago, checking for upgrades...`);
        }
      }
    }

    // ── Fix 6: Dedicated RPC Endpoint ──
    const rpcUrl = Deno.env.get("RPC_URL") || "https://api.mainnet-beta.solana.com";

    // ── Fix 1: Compute Real On-Chain Executable Hash ──
    let programExists = false;
    let onChainHash: string | null = null;
    let deploySlot: number | null = null;

    try {
      // Step 1a: Fetch program account to find programData address
      const rpcStart = Date.now();
      const programAccountResponse = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getAccountInfo",
          params: [program_id, { encoding: "base64", commitment: "confirmed" }],
        }),
      });
      logServiceHealth("Solana RPC", "/getAccountInfo", programAccountResponse.status, Date.now() - rpcStart);

      const programAccountResult = await programAccountResponse.json();

      if (!programAccountResult.result?.value) {
        console.log(`[verify-bytecode] Program ${program_id} not found on-chain`);
        programExists = false;
      } else {
        programExists = true;
        const accountData = programAccountResult.result.value.data;

        if (accountData && accountData[0]) {
          const programDataAddress = extractProgramDataAddress(accountData[0]);

          if (programDataAddress) {
            console.log(`[verify-bytecode] Found programData address: ${programDataAddress}`);

            // Step 1b: Fetch programData account (contains actual executable)
            const programDataResponse = await fetch(rpcUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: 2,
                method: "getAccountInfo",
                params: [programDataAddress, { encoding: "base64", commitment: "confirmed" }],
              }),
            });

            const programDataResult = await programDataResponse.json();

            if (programDataResult.result?.value?.data?.[0]) {
              const parsed = parseProgramData(programDataResult.result.value.data[0]);

              if (parsed) {
                deploySlot = parsed.deploySlot;
                onChainHash = await computeSHA256(parsed.executableBytes);
                console.log(`[verify-bytecode] Computed on-chain hash: ${onChainHash.substring(0, 16)}... | Slot: ${deploySlot}`);

                // ── Fix 5 continued: Check if slot changed ──
                if (previousDeploySlot !== null && deploySlot !== previousDeploySlot) {
                  console.log(`[verify-bytecode] UPGRADE DETECTED! Slot changed ${previousDeploySlot} -> ${deploySlot}. Forcing re-verification.`);
                } else if (previousDeploySlot !== null && deploySlot === previousDeploySlot) {
                  // Slot unchanged and within 24h cache -- return cached
                  // (we already checked hoursSinceVerification above)
                  const { data: cachedProfile } = await supabase
                    .from("claimed_profiles")
                    .select("bytecode_verified_at")
                    .eq("id", profile_id)
                    .single();

                  if (cachedProfile?.bytecode_verified_at) {
                    const lastVerified = new Date(cachedProfile.bytecode_verified_at);
                    const hoursSinceVerification = (Date.now() - lastVerified.getTime()) / (1000 * 60 * 60);
                    if (hoursSinceVerification < 24) {
                      console.log(`[verify-bytecode] No upgrade detected, using cache.`);
                      return new Response(
                        JSON.stringify({ success: true, message: "Verified within 24h, no upgrade detected", cached: true }),
                        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                      );
                    }
                  }
                }
              } else {
                console.log(`[verify-bytecode] Could not parse programData account`);
              }
            }
          } else {
            console.log(`[verify-bytecode] Could not extract programData address (may not be upgradeable loader)`);
          }
        }
      }
    } catch (rpcError) {
      console.error("[verify-bytecode] RPC error:", rpcError);
      // Continue -- we'll assign MEDIUM confidence at worst
    }

    // If program doesn't exist, short-circuit
    if (!programExists) {
      const result: HardenedVerificationResult = {
        programId: program_id,
        verified: false,
        bytecodeHash: null,
        onChainHash: null,
        matchStatus: "not-deployed",
        confidence: "NOT_DEPLOYED",
        deploySlot: null,
        message: "Program not found on Solana mainnet",
        verifiedAt: new Date().toISOString(),
      };

      if (profile_id) {
        await updateProfile(supabase, profile_id, result);
      }

      return new Response(
        JSON.stringify({ success: true, data: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Fix 2: Cross-Verify Against OtterSec ──
    let matchStatus: "original" | "fork" | "unknown" = "unknown";
    let confidence: ConfidenceTier = "LOW";
    let message = "Program exists but not in verified builds registry";
    let otterSecOnChainHash: string | null = null;

    try {
      const otterStart = Date.now();
      const verifyResponse = await fetch(
        `https://verify.osec.io/status/${program_id}`,
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(10000),
        }
      );
      logServiceHealth("OtterSec API", `/status/${program_id}`, verifyResponse.status, Date.now() - otterStart);

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        otterSecOnChainHash = verifyData.on_chain_hash || null;

        if (verifyData.is_verified) {
          // ── Fix 4: Strict Fork Detection ──
          if (github_url && verifyData.repo_url) {
            const normalizedProvided = normalizeGitHubRepo(github_url);
            const normalizedVerified = normalizeGitHubRepo(verifyData.repo_url);

            if (normalizedProvided && normalizedVerified) {
              if (normalizedProvided === normalizedVerified) {
                matchStatus = "original";
                message = `Verified by OtterSec. Repo: ${verifyData.repo_url}`;
              } else {
                matchStatus = "fork";
                message = `Bytecode verified for different repo: ${verifyData.repo_url} (claimed: ${github_url})`;
              }
            } else {
              // Could not normalize one or both URLs
              matchStatus = "original";
              message = `Verified by OtterSec. Repo URL normalization skipped.`;
            }
          } else {
            // No github_url to compare, trust OtterSec
            matchStatus = "original";
            message = `Verified by OtterSec. Repo: ${verifyData.repo_url || "N/A"}`;
          }

          // ── Fix 2: Cross-verify hashes ──
          if (onChainHash && otterSecOnChainHash) {
            if (onChainHash === otterSecOnChainHash) {
              confidence = matchStatus === "original" ? "HIGH" : "SUSPICIOUS";
              message += " | Hash cross-verified independently.";
              console.log(`[verify-bytecode] HIGH confidence: hashes match`);
            } else {
              confidence = "SUSPICIOUS";
              matchStatus = "unknown";
              message = `HASH MISMATCH: Our hash (${onChainHash.substring(0, 12)}...) differs from OtterSec (${otterSecOnChainHash.substring(0, 12)}...). Possible tampering.`;
              console.warn(`[verify-bytecode] SUSPICIOUS: hash mismatch detected!`);
            }
          } else if (onChainHash) {
            // We have our hash but OtterSec didn't return one
            confidence = matchStatus === "original" ? "MEDIUM" : "LOW";
            message += " | OtterSec did not return on_chain_hash for cross-verification.";
          } else {
            // We couldn't compute hash (RPC failed or programData too large)
            confidence = "MEDIUM";
            message += " | Could not independently compute on-chain hash.";
          }
        } else {
          // OtterSec says not verified
          matchStatus = "unknown";
          confidence = onChainHash ? "LOW" : "LOW";
          message = "Program exists on-chain but not verified by OtterSec";
        }
      } else if (verifyResponse.status === 404) {
        matchStatus = "unknown";
        confidence = "LOW";
        message = "Program not in OtterSec verified builds registry";
      }
    } catch (verifyError) {
      console.log("[verify-bytecode] OtterSec API unavailable:", verifyError);
      matchStatus = "unknown";
      confidence = onChainHash ? "LOW" : "LOW";
      message = "Verification service temporarily unavailable";
    }

    const result: HardenedVerificationResult = {
      programId: program_id,
      verified: matchStatus === "original" && (confidence === "HIGH" || confidence === "MEDIUM"),
      bytecodeHash: onChainHash,
      onChainHash,
      matchStatus,
      confidence,
      deploySlot,
      message,
      verifiedAt: new Date().toISOString(),
    };

    console.log(`[verify-bytecode] Final: status=${matchStatus}, confidence=${confidence}`);

    // Update profile in database
    if (profile_id) {
      await updateProfile(supabase, profile_id, result);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[verify-bytecode] Fatal error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Update claimed_profiles with verification results.
 */
async function updateProfile(
  supabase: ReturnType<typeof createClient>,
  profileId: string,
  result: HardenedVerificationResult
) {
  const { error: updateError } = await supabase
    .from("claimed_profiles")
    .update({
      bytecode_hash: result.bytecodeHash,
      bytecode_on_chain_hash: result.onChainHash,
      bytecode_verified_at: result.verifiedAt,
      bytecode_match_status: result.matchStatus,
      bytecode_confidence: result.confidence,
      bytecode_deploy_slot: result.deploySlot,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (updateError) {
    console.error(`[verify-bytecode] Error updating profile ${profileId}:`, updateError);
  } else {
    console.log(`[verify-bytecode] Updated profile ${profileId}: ${result.matchStatus} (${result.confidence})`);
  }
}
