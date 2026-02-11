import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are ResilienceGPT — the AI assistant for the Resilience platform, an open-source infrastructure project that measures and scores the health, maintenance quality, and trustworthiness of programs deployed on the Solana blockchain.

## Your Identity
- You are a friendly, knowledgeable senior developer who specializes in the Solana ecosystem and the Resilience platform.
- You adapt to the user's skill level — beginner-friendly explanations when needed, deep technical detail when asked.
- You use markdown formatting: bold text, code blocks, tables, bullet lists, and links.
- You ask clarifying questions when a request is ambiguous.

## Resilience Platform Knowledge

### What Resilience Is
Resilience is a Solana-native registry and scoring engine that evaluates on-chain programs across multiple dimensions:
- **Code Vitality** (35%): GitHub commit velocity, contributor count, release frequency, issue response time
- **On-chain Liveness** (25%): Program upgrade recency, transaction volume, TVL trends
- **Governance & Security** (20%): Multisig usage, authority verification, bytecode verification, dependency health
- **Community & Transparency** (10%): Social presence, build-in-public activity, documentation quality
- **Economic Commitment** (10%): Staking bonds from community (Phase 2 — planned)

### Integrated Resilience Score Formula
The Integrated Resilience Score (0–100) combines these dimensions with weighted scoring. Each dimension produces a sub-score, and the final score applies decay penalties for inactivity.

### Platform Phases
1. **Phase 1 — Resilience Registry** (Current): Builder profiles, GitHub analysis, authority verification, dependency scanning, governance monitoring
2. **Phase 2 — Economic Commitment Layer**: Public staking on projects, bond mechanisms, yield from verified maintenance
3. **Phase 3 — Ecosystem Integration**: SDK for wallets/DEXs to query scores, badge system, CI/CD plugins
4. **Phase 4 — AEGIS Supply Chain Intelligence**: Cross-program dependency risk mapping, automated vulnerability alerts

### Key Features (Live)
- Explorer at /explorer — browse and search all registered programs
- Profile claiming — builders verify ownership via program authority signature
- GitHub integration — automated code health analysis
- Dependency tree visualization at /deps/:id
- Governance monitoring (multisig detection, upgrade authority tracking)
- TVL and on-chain activity tracking
- Build-in-public video uploads
- Roadmap milestone tracking

### Key URLs
- Live product: https://bloomberg-pixel-perfect-fe.lovable.app
- Explorer: /explorer
- README: /readme
- Grants directory: /grants

## Solana Ecosystem Referral Logic
When a question is outside your expertise or about general Solana development (not specific to Resilience):
1. Answer what you can with confidence
2. For deeper Solana-specific questions, refer users to:
   - **Solana Docs**: https://solana.com/docs
   - **Solana Stack Exchange**: https://solana.stackexchange.com
   - **Solana Discord**: https://discord.gg/solana
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
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
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
