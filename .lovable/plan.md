

# Fix ResilienceGPT: Accurate System Prompt + Live Database Access

## Problem

ResilienceGPT currently has two critical flaws:

1. **Wrong scoring weights in system prompt** -- Claims 35/25/20/10/10 but production formula is 40/25/20/15 (GitHub/Deps/Governance/TVL)
2. **No database access** -- When asked about specific projects (e.g., "Tell me about Pollinet"), the GPT fabricates data instead of looking it up. It has zero ability to query real project information.

## Solution

### Part 1: Fix the System Prompt

Rewrite the system prompt in `supabase/functions/chat-gpt/index.ts` to:

- Correct the scoring formula to **R = 0.40 x GitHub + 0.25 x Dependencies + 0.20 x Governance + 0.15 x TVL**
- Remove the fictional "Community & Transparency (10%)" and "Economic Commitment (10%)" dimensions that don't exist in production
- Clearly separate **live features** from **planned features** so the GPT stops presenting aspirational features as real
- Add a **strict anti-hallucination rule**: "When asked about a specific project, ALWAYS use the `lookup_project` tool first. NEVER invent project data, scores, or metrics."

### Part 2: Give ResilienceGPT Database Access via Tool Calling

Instead of the current simple streaming chat, the edge function will use **AI tool calling** to let the model query the database on demand.

**How it works:**

```text
User asks: "Tell me about Marinade Finance"
        |
        v
Edge function sends messages + tool definitions to Lovable AI
        |
        v
AI decides to call "lookup_project" tool with query "Marinade"
        |
        v
Edge function intercepts tool call, queries claimed_profiles table
        |
        v
Real data injected back into conversation as tool result
        |
        v
AI generates response using REAL data (score, GitHub stats, TVL, etc.)
        |
        v
Final response streamed to user
```

**Tools defined for the AI:**

| Tool | Purpose | Database Query |
|------|---------|---------------|
| `lookup_project` | Search for a project by name, program ID, or category | `claimed_profiles` with ilike search, returns top 5 matches |
| `get_ecosystem_stats` | Get aggregate ecosystem health data | `ecosystem_snapshots` latest row |
| `list_top_projects` | Get leaderboard by score | `claimed_profiles` ordered by `integrated_score` desc, limit 10 |

### Part 3: Updated Edge Function Architecture

The `chat-gpt` edge function changes from a simple proxy to a **tool-calling orchestrator**:

1. Receive user messages
2. Send to Lovable AI with tool definitions (non-streaming first call)
3. If AI responds with a tool call:
   - Execute the database query using Supabase service role client
   - Send tool results back to the AI
   - Get final response
4. Stream the final AI response to the client

**Important**: The tool-calling round (steps 2-3) uses non-streaming mode. Only the final response (step 4) is streamed to the frontend. This keeps the frontend code unchanged.

---

## Technical Details

### Files Modified

**1. `supabase/functions/chat-gpt/index.ts`** (major rewrite)

- Import `@supabase/supabase-js` for database access
- Replace `SYSTEM_PROMPT` with corrected, production-accurate prompt
- Add tool definitions array for `lookup_project`, `get_ecosystem_stats`, `list_top_projects`
- Add `executeToolCall()` function that runs Supabase queries based on tool name
- Change request flow: first non-streaming call with tools, handle tool calls, then stream final response
- Database client uses `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (both already configured as secrets)

**2. No frontend changes needed** -- The streaming response format stays identical. The tool-calling loop happens entirely server-side before streaming begins.

### Corrected System Prompt (Key Changes)

Current (wrong):
- Code Vitality (35%), On-chain Liveness (25%), Governance (20%), Community (10%), Economic (10%)

Fixed (matches production):
- GitHub Code Health (40%): commit velocity, contributors, releases, issues, fork detection
- Dependency Health (25%): outdated/critical dependency counts, supply chain risk
- Governance & Security (20%): multisig usage, governance transaction frequency
- TVL & Economic Activity (15%): Total Value Locked, risk ratio (TVL per commit)

Additional prompt rules:
- "You have access to tools that query the live Resilience database. ALWAYS use `lookup_project` before answering questions about specific projects."
- "If a project is not found in the database, say so honestly. Do NOT fabricate scores or metrics."
- "Clearly label Phase 2/3/4 features as PLANNED, not live."

### Tool Definitions

```text
lookup_project:
  parameters: { query: string }
  returns: array of matching profiles with:
    project_name, integrated_score, score_breakdown,
    github_stars, github_forks, github_contributors,
    github_commit_velocity, github_commits_30d,
    dependency_health_score, tvl_usd, governance_tx_30d,
    liveness_status, category, website_url, verified,
    claim_status, authority_type, x_username

get_ecosystem_stats:
  parameters: none
  returns: latest ecosystem snapshot with:
    total_projects, active_projects, avg_resilience_score,
    total_commits_30d, total_contributors, total_tvl_usd,
    healthy_count, stale_count, decaying_count

list_top_projects:
  parameters: { limit?: number, category?: string }
  returns: top N projects ordered by integrated_score
```

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Project not found in database | AI responds honestly: "I don't have data on [X] in our registry. It may not be indexed yet." |
| Multiple tool calls needed | Loop handles up to 3 sequential tool calls before forcing a final response |
| Tool call fails (DB error) | Return error message as tool result; AI adapts response gracefully |
| General Solana question (no tool needed) | AI responds directly without tool calls -- no performance overhead |
| Rate limit from AI gateway | Same 429/402 handling as before |

