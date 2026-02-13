import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Pricing per 1M tokens (USD) — estimates
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "google/gemini-3-flash-preview": { input: 0.10, output: 0.40 },
  "google/gemini-2.5-flash": { input: 0.15, output: 0.60 },
  "google/gemini-2.5-pro": { input: 1.25, output: 5.00 },
  "openai/gpt-5-mini": { input: 0.40, output: 1.60 },
  "openai/gpt-5": { input: 2.50, output: 10.00 },
};

export interface AIUsageEntry {
  conversation_id?: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  tool_calls?: string[];
  latency_ms: number;
  status_code: number;
}

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] || { input: 0.50, output: 2.00 };
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

/**
 * Log AI usage to admin_ai_usage table. Fire-and-forget.
 */
export async function logAIUsage(entry: AIUsageEntry): Promise<void> {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return;

    const supabase = createClient(url, key);
    await supabase.from("admin_ai_usage").insert({
      conversation_id: entry.conversation_id || null,
      model: entry.model,
      input_tokens: entry.input_tokens,
      output_tokens: entry.output_tokens,
      tool_calls: entry.tool_calls || [],
      latency_ms: entry.latency_ms,
      status_code: entry.status_code,
      estimated_cost_usd: estimateCost(entry.model, entry.input_tokens, entry.output_tokens),
    });
  } catch {
    // Silent
  }
}
