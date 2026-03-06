import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RPC_URL =
  Deno.env.get("RPC_URL") || "https://api.mainnet-beta.solana.com";

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use getRecentPrioritizationFees RPC method
    const fees = await rpc("getRecentPrioritizationFees", []);

    if (!fees || !Array.isArray(fees) || fees.length === 0) {
      return new Response(
        JSON.stringify({
          current: { p50: 0, p75: 0, p90: 0, p99: 0, min: 0, max: 0, median: 0 },
          slots: [],
          fetchedAt: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allFees = fees.map((f: any) => f.prioritizationFee as number);
    const nonZeroFees = allFees.filter((f: number) => f > 0);
    const feeSource = nonZeroFees.length > 0 ? nonZeroFees : allFees;

    const current = {
      p50: percentile(feeSource, 50),
      p75: percentile(feeSource, 75),
      p90: percentile(feeSource, 90),
      p99: percentile(feeSource, 99),
      min: Math.min(...feeSource),
      max: Math.max(...feeSource),
      median: percentile(feeSource, 50),
      sampleSize: fees.length,
      nonZeroCount: nonZeroFees.length,
    };

    // Return per-slot data for charting (last 50)
    const slots = fees
      .slice(-50)
      .map((f: any) => ({
        slot: f.slot,
        fee: f.prioritizationFee,
      }));

    return new Response(
      JSON.stringify({ current, slots, fetchedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
