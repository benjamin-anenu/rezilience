import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Corrected, production-accurate system prompt ──────────────────────────
const SYSTEM_PROMPT = `You are ResilienceGPT — the AI assistant for the Resilience platform, an open-source infrastructure project that measures and scores the health, maintenance quality, and trustworthiness of programs deployed on the Solana blockchain.

## Your Identity
- You are a friendly, knowledgeable senior developer who specializes in the Solana ecosystem and the Resilience platform.
- You adapt to the user's skill level — beginner-friendly explanations when needed, deep technical detail when asked.
- You use markdown formatting: bold text, code blocks, tables, bullet lists, and links.
- You ask clarifying questions when a request is ambiguous.

## CRITICAL ANTI-HALLUCINATION RULES
- You have access to tools that query the **live Resilience database**. ALWAYS use \`lookup_project\` before answering questions about specific projects.
- If a project is not found in the database, say so honestly: "I don't have data on [X] in our registry. It may not be indexed yet."
- **NEVER fabricate** project scores, metrics, GitHub stats, TVL numbers, or any project-specific data.
- If you are unsure about something, say so. Do NOT invent plausible-sounding data.

## Unified Resilience Score Formula (Production)

The Resilience Score (R) is calculated as:

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
- **ResilienceGPT** at /gpt — This AI assistant with live database access
- **Score history** — Time-series tracking of score changes

### PLANNED Features (Not Yet Live)
- **Phase 2 — Economic Commitment Layer**: Public staking on projects, bond mechanisms, yield from verified maintenance
- **Phase 3 — Ecosystem Integration**: SDK for wallets/DEXs to query scores, badge system, CI/CD plugins
- **Phase 4 — AEGIS Supply Chain Intelligence**: Cross-program dependency risk mapping, automated vulnerability alerts

⚠️ Always clearly label Phase 2/3/4 features as **PLANNED** when discussing them. Do NOT present them as currently available.

## Tool Usage
You have access to the following tools to query live data:
- \`lookup_project\`: Search for a project by name, program ID, or category. ALWAYS use this before answering questions about specific projects.
- \`get_ecosystem_stats\`: Get aggregate ecosystem health statistics.
- \`list_top_projects\`: Get the leaderboard of top-scoring projects.

## Solana Ecosystem Referral Logic
For general Solana development questions (not specific to Resilience):
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
- ResilienceGPT is a community tool, NOT official Solana Foundation support
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

// ── Tool definitions for the AI ───────────────────────────────────────────
const TOOLS = [
  {
    type: "function",
    function: {
      name: "lookup_project",
      description:
        "Search the Resilience registry for a project by name, program ID, or category. Returns up to 5 matching profiles with their scores, GitHub stats, TVL, governance data, and more. ALWAYS call this before answering questions about specific projects.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Project name, program ID, or category to search for",
          },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_ecosystem_stats",
      description:
        "Get the latest aggregate ecosystem health statistics including total projects, average resilience score, total TVL, commits, contributors, and health distribution.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_top_projects",
      description:
        "Get the leaderboard of top-scoring projects ordered by integrated resilience score. Optionally filter by category.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Number of projects to return (default 10, max 25)",
          },
          category: {
            type: "string",
            description: "Optional category filter (e.g. 'DeFi', 'Infrastructure', 'NFT')",
          },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
];

// ── Database query executor ───────────────────────────────────────────────
async function executeToolCall(
  name: string,
  args: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  try {
    switch (name) {
      case "lookup_project": {
        const query = String(args.query || "");
        // Search by project_name (ilike) or program_id (exact)
        const { data, error } = await supabase
          .from("claimed_profiles")
          .select(
            "project_name, integrated_score, score_breakdown, github_stars, github_forks, github_contributors, github_commit_velocity, github_commits_30d, dependency_health_score, dependency_outdated_count, dependency_critical_count, tvl_usd, tvl_risk_ratio, governance_tx_30d, liveness_status, category, website_url, verified, claim_status, authority_type, x_username, program_id, description, github_org_url, multisig_address, squads_version"
          )
          .or(
            `project_name.ilike.%${query}%,program_id.ilike.%${query}%,category.ilike.%${query}%`
          )
          .order("integrated_score", { ascending: false })
          .limit(5);

        if (error) return JSON.stringify({ error: error.message });
        if (!data || data.length === 0)
          return JSON.stringify({
            results: [],
            message: `No projects found matching "${query}" in the Resilience registry.`,
          });
        return JSON.stringify({ results: data });
      }

      case "get_ecosystem_stats": {
        const { data, error } = await supabase
          .from("ecosystem_snapshots")
          .select("*")
          .order("snapshot_date", { ascending: false })
          .limit(1)
          .single();

        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify(data);
      }

      case "list_top_projects": {
        const limit = Math.min(Number(args.limit) || 10, 25);
        const category = args.category ? String(args.category) : null;

        let q = supabase
          .from("claimed_profiles")
          .select(
            "project_name, integrated_score, liveness_status, category, github_stars, github_commit_velocity, tvl_usd, governance_tx_30d, dependency_health_score, verified, claim_status"
          )
          .order("integrated_score", { ascending: false })
          .limit(limit);

        if (category) {
          q = q.ilike("category", `%${category}%`);
        }

        const { data, error } = await q;
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ results: data });
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Tool execution failed" });
  }
}

// ── Main handler ──────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

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

    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    // ── Step 1: Non-streaming call with tools ─────────────────────────────
    let toolLoopMessages = [...aiMessages];
    let maxToolRounds = 3;

    for (let round = 0; round < maxToolRounds; round++) {
      const toolResponse = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: toolLoopMessages,
            tools: TOOLS,
            stream: false,
          }),
        }
      );

      if (!toolResponse.ok) {
        if (toolResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (toolResponse.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const t = await toolResponse.text();
        console.error("AI gateway error:", toolResponse.status, t);
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const toolData = await toolResponse.json();
      const choice = toolData.choices?.[0];

      if (!choice) {
        return new Response(
          JSON.stringify({ error: "No response from AI" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If no tool calls, we have the final answer — stream it
      if (
        choice.finish_reason !== "tool_calls" ||
        !choice.message?.tool_calls?.length
      ) {
        // The AI responded directly without tools — stream this final answer
        break;
      }

      // Execute each tool call
      toolLoopMessages.push(choice.message);

      for (const tc of choice.message.tool_calls) {
        const fnName = tc.function.name;
        let fnArgs: Record<string, unknown> = {};
        try {
          fnArgs = JSON.parse(tc.function.arguments || "{}");
        } catch {
          fnArgs = {};
        }

        console.log(`Tool call: ${fnName}(${JSON.stringify(fnArgs)})`);
        const result = await executeToolCall(fnName, fnArgs, supabase);

        toolLoopMessages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result,
        });
      }
    }

    // ── Step 2: Check if AI already answered in the tool loop ──────────
    // If the last message from the AI has text content (not tool calls),
    // stream that text directly instead of making a duplicate API call.
    const lastMsg = toolLoopMessages[toolLoopMessages.length - 1];
    const alreadyAnswered =
      lastMsg &&
      typeof lastMsg === "object" &&
      "role" in lastMsg &&
      lastMsg.role === "assistant" &&
      "content" in lastMsg &&
      typeof lastMsg.content === "string" &&
      lastMsg.content.length > 0 &&
      !("tool_calls" in lastMsg && lastMsg.tool_calls?.length);

    if (alreadyAnswered) {
      // Construct a synthetic SSE stream from the already-generated text
      const text = lastMsg.content as string;
      const ssePayload = `data: ${JSON.stringify({
        choices: [{ delta: { content: text }, finish_reason: null }],
      })}\n\ndata: ${JSON.stringify({
        choices: [{ delta: {}, finish_reason: "stop" }],
      })}\n\ndata: [DONE]\n\n`;

      return new Response(ssePayload, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Otherwise, make the final streaming call with tool results in context
    const streamResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: toolLoopMessages,
          stream: true,
        }),
      }
    );

    if (!streamResponse.ok) {
      const t = await streamResponse.text();
      console.error("AI stream error:", streamResponse.status, t);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
