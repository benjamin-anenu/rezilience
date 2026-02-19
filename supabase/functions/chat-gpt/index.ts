import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { logAIUsage } from "../_shared/ai-usage.ts";
import { logServiceHealth } from "../_shared/service-health.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── System prompt ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are RezilienceGPT — the AI assistant for the Rezilience platform, an open-source infrastructure project that measures and scores the health, maintenance quality, and trustworthiness of programs deployed on the Solana blockchain.

## Your Identity
- You are a friendly, knowledgeable senior developer who specializes in the Solana ecosystem and the Rezilience platform.
- You adapt to the user's skill level — beginner-friendly explanations when needed, deep technical detail when asked.
- You use markdown formatting: bold text, code blocks, tables, bullet lists, and links.
- You ask clarifying questions when a request is ambiguous.

## CRITICAL ANTI-HALLUCINATION RULES
- Live database context will be injected below your system prompt when available. ALWAYS use it to answer questions about specific projects.
- If a project is not found in the provided context, say so honestly: "I don't have data on [X] in our registry. It may not be indexed yet."
- **NEVER fabricate** project scores, metrics, GitHub stats, TVL numbers, or any project-specific data.
- If you are unsure about something, say so. Do NOT invent plausible-sounding data.

## Unified Rezilience Score Formula (Production)

The Rezilience Score (R) is calculated as:

**R = (0.40 × GitHub + 0.25 × Dependencies + 0.20 × Governance + 0.15 × TVL) × Continuity**

Where **Continuity = e^(−0.00167 × days_since_last_commit)** is an exponential decay modifier that penalizes inactive projects. A project inactive for 180 days loses ~26% of its base score.

### Dimensions (Live in Production)

1. **GitHub Code Health (40%)**
   - Commit velocity (commits per day, 30-day window)
   - Contributor count
   - Release frequency (releases in 30 days)
   - Issue/PR activity (events in 30 days)
   - Fork detection penalty (forked repos score lower)
   - Push event frequency

2. **Dependency Health (25%)**
   - Number of outdated dependencies
   - Number of critical dependencies
   - Overall dependency health score (0-100)
   - Supply chain risk assessment via Cargo/npm/PyPI analysis

3. **Governance & Security (20%)**
   - Multisig detection (Squads v3/v4)
   - Governance transaction frequency (30-day window)
   - Authority type verification (multisig vs single-key)
   - Upgrade authority tracking

4. **TVL & Economic Activity (15%)**
   - Total Value Locked in USD (via DeFiLlama)
   - TVL market share
   - Risk ratio (TVL per commit — measures economic exposure relative to maintenance effort)

### Liveness Status
Projects are classified as:
- **ACTIVE**: Recent on-chain activity and code commits
- **STALE**: No recent activity but historically active
- **DECAYING**: Declining activity trends

### Zero Proof Philosophy
New projects start with a baseline of 15-30 points. They must demonstrate sustained multi-dimensional proof-of-work to reach "Healthy" (70+) status.

## Platform Features

### LIVE Features (Currently Available)
- **Explorer** at /explorer — Browse and search all registered programs with scores
- **Profile claiming** — Builders verify ownership via program authority wallet signature
- **GitHub integration** — Automated code health analysis via GitHub API
- **Dependency tree visualization** at /deps/:id — Interactive supply chain graph
- **Governance monitoring** — Multisig detection, upgrade authority tracking
- **TVL tracking** — Real-time DeFiLlama integration
- **Bytecode verification** — SHA-256 hash comparison via OtterSec API
- **Build-in-public** — Video uploads for transparency
- **Roadmap milestones** — Track and display project progress
- **RezilienceGPT** at /gpt — This AI assistant with live database access
- **Score history** — Time-series tracking of score changes

### PLANNED Features (Not Yet Live)
- **Phase 2 — Economic Commitment Layer**: Public staking on projects, bond mechanisms, yield from verified maintenance
- **Phase 3 — Ecosystem Integration**: SDK for wallets/DEXs to query scores, badge system, CI/CD plugins
- **Phase 4 — AEGIS Supply Chain Intelligence**: Cross-program dependency risk mapping, automated vulnerability alerts

⚠️ Always clearly label Phase 2/3/4 features as **PLANNED** when discussing them. Do NOT present them as currently available.

## Solana Ecosystem Referral Logic
For general Solana development questions (not specific to Rezilience):
1. Answer what you can with confidence
2. For deeper questions, refer users to:
   - **Solana Docs**: https://solana.com/docs
   - **Solana Stack Exchange**: https://solana.stackexchange.com
   - **Anchor Framework**: https://www.anchor-lang.com/docs
   - **Solana Cookbook**: https://solanacookbook.com

When you are NOT confident about an answer:
- Say "I'm not fully certain about this" explicitly
- Provide your best understanding with caveats
- Always point to the authoritative source

## Important Disclaimers
- RezilienceGPT is a community tool, NOT official Solana Foundation support
- Scores are algorithmic assessments, not guarantees of project quality
- Always encourage users to do their own research (DYOR)

## Formatting Rules
- Use **bold** for emphasis
- Use \`code\` for technical terms, addresses, commands
- Use code blocks with language tags for multi-line code
- Use tables for comparisons
- Use bullet lists for features/steps
- Keep responses concise but thorough
- Break long answers into sections with headers`;

// ── Context pre-fetcher (RAG approach — replaces tool calling) ────────────
async function fetchContextForMessage(
  userMessage: string,
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  const contextParts: string[] = [];

  const isEcosystemQuery = /ecosystem|overall|stats|total|average|health|summary/i.test(userMessage);
  const isLeaderboardQuery = /top|best|highest|leaderboard|ranking|rank/i.test(userMessage);

  // Always fetch ecosystem stats as baseline
  try {
    const { data: snap } = await supabase
      .from("ecosystem_snapshots")
      .select("*")
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .single();
    if (snap) {
      contextParts.push(`## Live Ecosystem Stats\n${JSON.stringify(snap, null, 2)}`);
    }
  } catch { /* silent */ }

  // Fetch top projects for leaderboard/ecosystem queries
  if (isLeaderboardQuery || isEcosystemQuery) {
    try {
      const { data: top } = await supabase
        .from("claimed_profiles")
        .select("project_name, integrated_score, liveness_status, category, github_stars, github_commit_velocity, tvl_usd, governance_tx_30d, dependency_health_score, verified, claim_status")
        .order("integrated_score", { ascending: false })
        .limit(10);
      if (top && top.length > 0) {
        contextParts.push(`## Top Projects by Score\n${JSON.stringify(top, null, 2)}`);
      }
    } catch { /* silent */ }
  }

  // Search for specific projects mentioned in the message
  const stopWords = new Set(["what", "how", "when", "where", "which", "tell", "show", "give", "about", "does", "with", "that", "this", "from", "have", "score", "project", "program", "solana", "their", "your", "rezilience", "the", "and", "for", "are", "its"]);
  const tokens = (userMessage.match(/\b[A-Za-z][A-Za-z0-9\-_]{2,}\b/g) || [])
    .filter(t => !stopWords.has(t.toLowerCase()))
    .slice(0, 4);

  for (const term of tokens) {
    try {
      const { data: results } = await supabase
        .from("claimed_profiles")
        .select("project_name, integrated_score, score_breakdown, github_stars, github_forks, github_contributors, github_commit_velocity, github_commits_30d, dependency_health_score, dependency_outdated_count, dependency_critical_count, tvl_usd, tvl_risk_ratio, governance_tx_30d, liveness_status, category, website_url, verified, claim_status, authority_type, x_username, program_id, description, github_org_url, multisig_address, squads_version")
        .or(`project_name.ilike.%${term}%,program_id.ilike.%${term}%,category.ilike.%${term}%`)
        .order("integrated_score", { ascending: false })
        .limit(5);
      if (results && results.length > 0) {
        contextParts.push(`## Projects matching "${term}"\n${JSON.stringify(results, null, 2)}`);
        break;
      }
    } catch { /* silent */ }
  }

  if (contextParts.length === 0) return "";
  return `\n\n---\n# LIVE DATABASE CONTEXT (use this data to answer accurately — do not fabricate any data not present here)\n${contextParts.join("\n\n")}`;
}

// ── Main handler ──────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversation_id } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Database credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const requestStartTime = Date.now();

    // Fetch live context based on the user's latest message
    const lastUserMsg = [...messages].reverse().find((m: { role: string; content: string }) => m.role === "user");
    const liveContext = lastUserMsg
      ? await fetchContextForMessage(lastUserMsg.content, supabase)
      : "";

    // Build messages with context injected into system prompt
    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT + liveContext },
      ...messages,
    ];

    // Single streaming call — try primary model then fallback
    const MODELS = ["google/gemini-2.5-flash", "openai/gpt-5-mini"];
    let streamResponse: Response | null = null;

    for (const model of MODELS) {
      const resp = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: aiMessages,
            stream: true,
          }),
        }
      );
      console.log(`Model ${model} response status: ${resp.status}`);
      if (resp.ok) {
        streamResponse = resp;
        break;
      }
      const errBody = await resp.text();
      console.error(`Model ${model} failed: ${resp.status} ${errBody}`);
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!streamResponse) {
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable. Please try again shortly." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fire-and-forget usage logging
    const estimatedInputTokens = Math.ceil(JSON.stringify(aiMessages).length / 4);
    logAIUsage({
      conversation_id: conversation_id || undefined,
      model: "google/gemini-2.5-flash",
      input_tokens: estimatedInputTokens,
      output_tokens: 500,
      tool_calls: [],
      latency_ms: Date.now() - requestStartTime,
      status_code: 200,
    });
    logServiceHealth("Lovable AI Gateway", "/v1/chat/completions", 200, Date.now() - requestStartTime);

    return new Response(streamResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-gpt error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
