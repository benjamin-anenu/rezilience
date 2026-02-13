

# Rezilience Admin Portal — Command Center

## Problem Restatement

Rezilience needs an internal operations dashboard that gives the founder (and future team) a **single pane of glass** into every metric the Solana Foundation would care about when evaluating milestone reports: platform adoption, user engagement depth, infrastructure costs, third-party service health, AI consumption, registry growth, and operational expenditure. Today, this data is scattered across Supabase logs, edge function console output, GitHub, and mental estimates — making grant reporting a manual, error-prone process.

## Who This Is For

| Audience | Need |
|----------|------|
| **Benjamin (Super Admin)** | Real-time operational intelligence, grant milestone reporting data, cost tracking |
| **Solana Foundation reviewers** | Exportable proof that the platform delivers measurable value to the ecosystem |
| **Future team members** | Operational awareness without needing database access |

## What Success Looks Like

- One URL (`/admin`) with authentication-gated access showing every KPI needed for a Solana Foundation milestone report
- Exportable snapshots for quarterly grant reporting
- Real-time visibility into platform health, cost, and engagement
- Zero guesswork on what things cost or how users behave

---

## Module Architecture

### Module 1: Admin Authentication (Login Gate)

A premium-branded login page at `/admin/login` with:
- Email + password authentication via the backend auth system
- Hardcoded super-admin check (only `benjamin.o.anenu@gmail.com` can access)
- Session persistence with protected route wrapper
- Branded with Rezilience logo, dark terminal aesthetic, animated background

### Module 2: Platform Overview (Home Dashboard)

The landing view after login — a high-density KPI wall:

| Metric Card | Source |
|-------------|--------|
| Total Registered Projects | `claimed_profiles` count |
| Claimed vs Unclaimed ratio | `claim_status` aggregation |
| Active / Stale / Decaying distribution | `liveness_status` counts |
| Average Rezilience Score (trend) | `ecosystem_snapshots` time-series |
| Total Contributors indexed | Aggregated `github_contributors` |
| Total TVL tracked (USD) | Aggregated `tvl_usd` |
| Score History entries recorded | `score_history` count |
| Platform uptime indicator | Edge function health checks |

Charts:
- **Registry Growth** (area chart): New profiles over time from `created_at` timestamps
- **Score Distribution** (smooth histogram): Bell curve of all project scores
- **Liveness Breakdown** (animated donut): ACTIVE / STALE / DECAYING proportions
- **Category Distribution** (horizontal bar): Projects by category

### Module 3: User Engagement Analytics

Track how builders, developers, investors, and the public interact with every surface:

| Metric | How It Is Tracked |
|--------|-------------------|
| Page views by route | New `admin_analytics` table logging navigation events |
| Tab interactions (Explorer tabs, Profile tabs) | Client-side event tracking |
| Search queries (Explorer, Library, Docs) | Logged to `admin_analytics` |
| Profile detail visits (which projects get viewed most) | Event logging |
| Click-through rates (CTA buttons, external links) | Event logging |
| GPT conversations started / messages sent | `chat_conversations` + `chat_messages` counts |
| Library section opens (Learn, Dictionary, Blueprints, Docs) | Event logging |
| Readme page visits | Event logging |
| Dependency Tree explorations | Event logging |
| Grants page visits | Event logging |
| Mobile vs Desktop ratio | User-agent parsing in analytics |
| Session duration estimates | First/last event timestamps |
| Unique visitors (fingerprint-based, no PII) | Anonymous session IDs |

Charts:
- **Daily Active Users** (smooth area chart with gradient fill)
- **Page Popularity** (ranked horizontal bars with wave animation)
- **Engagement Funnel**: Landing → Explorer → Profile → Claim (Sankey-style)
- **Feature Adoption Heatmap**: Which modules get used most by time-of-day

### Module 4: AI Consumption Dashboard

Track every AI interaction and its cost:

| Metric | Source |
|--------|--------|
| Total GPT conversations | `chat_conversations` count |
| Total messages processed | `chat_messages` count |
| Messages per conversation (avg) | Computed ratio |
| Tool calls triggered (lookup_project, etc.) | New `admin_ai_usage` table |
| Model used per request | Logged from edge function |
| Estimated token consumption | Input/output token counts from API response |
| Estimated cost per conversation | Token count x model pricing |
| Daily / Weekly / Monthly AI spend | Aggregated cost estimates |
| Error rate (429s, 402s, 500s) | Edge function response status logging |
| Average response latency | Timestamp delta logging |

Charts:
- **AI Cost Over Time** (area chart with cumulative spend line)
- **Conversations Per Day** (bar chart with trend line)
- **Token Usage Breakdown** (stacked area: input vs output tokens)
- **Model Distribution** (pie chart if multiple models used)

### Module 5: Third-Party Integration Status Board

Monitor every external service the platform depends on:

| Service | Type | Status Check | Monthly Cost Estimate |
|---------|------|-------------|----------------------|
| GitHub API | REST API | Rate limit remaining, last successful call | Free tier |
| DeFiLlama API | REST API | Last successful TVL fetch | Free |
| Solana RPC | JSON-RPC | Last successful call, latency | Variable |
| OtterSec / Bytecode API | REST API | Last verification result | Free |
| Algolia Search | SaaS | Index status, record count | $0-29/mo |
| X (Twitter) OAuth | OAuth 2.0 | Last successful auth | Free |
| Lovable AI Gateway | API | Last call status, credit balance | Per-usage |

Each service gets a status card with:
- Green/Yellow/Red indicator (based on last successful call recency)
- Last call timestamp
- Error count in last 24h
- Estimated monthly cost
- Link to service dashboard

New table: `admin_service_health` — edge functions log each external call's status, latency, and response code.

### Module 6: Maintenance Cost Board

A financial operations view tracking platform running costs:

| Cost Category | Tracking Method |
|---------------|-----------------|
| Database (Lovable Cloud) | Fixed tier cost |
| Edge Function invocations | Count from `admin_service_health` |
| AI API consumption | Token-based cost from Module 4 |
| Algolia search operations | Monthly operation count |
| Storage (team-images bucket) | File count x avg size |
| Domain / hosting | Manual entry field |
| Total Monthly Burn Rate | Sum of all categories |

Charts:
- **Monthly Cost Breakdown** (stacked bar chart)
- **Cost Trend** (line chart showing month-over-month)
- **Cost Per Active User** (derived metric)

### Module 7: Registry Health Deep-Dive

Granular view into the project registry:

- **Claim Funnel**: How many profiles are unclaimed → pending → claimed → verified
- **Verification Rate**: % of claimed profiles that pass authority verification
- **Blacklist Activity**: Failed claim attempts, permanent bans
- **GitHub Analysis Coverage**: % of profiles with recent GitHub analysis
- **Dependency Analysis Coverage**: % with dependency data
- **Governance Coverage**: % with governance data
- **Score Distribution Over Time**: Animated area chart showing how the score bell curve shifts

### Module 8: Grant Milestone Reporter

A dedicated view for generating Solana Foundation reports:

- Date range selector (milestone period)
- Auto-generated metrics summary for the selected period
- Export to PDF / CSV functionality
- Key metrics: new registrations, score improvements, user engagement growth, AI usage, infrastructure costs
- Narrative template with auto-filled data points
- Before/after comparisons for each milestone period

---

## Database Changes

### New Tables

**`admin_users`** — Super admin authentication
- `id` (uuid, PK)
- `email` (text, unique)
- `role` (text: 'super_admin')
- `created_at` (timestamptz)
- RLS: No public access (service role only)

**`admin_analytics`** — Client-side event tracking
- `id` (uuid, PK)
- `event_type` (text: 'page_view', 'click', 'search', 'tab_change', 'feature_use')
- `event_target` (text: route path, button name, search query)
- `event_metadata` (jsonb: additional context)
- `session_id` (text: anonymous session fingerprint)
- `device_type` (text: 'mobile', 'desktop', 'tablet')
- `created_at` (timestamptz)
- RLS: Insert-only for anon, read-only for service role

**`admin_ai_usage`** — AI consumption tracking
- `id` (uuid, PK)
- `conversation_id` (uuid, nullable)
- `model` (text)
- `input_tokens` (integer)
- `output_tokens` (integer)
- `tool_calls` (jsonb: array of tool names called)
- `latency_ms` (integer)
- `status_code` (integer)
- `estimated_cost_usd` (numeric)
- `created_at` (timestamptz)
- RLS: No public access

**`admin_service_health`** — Third-party service monitoring
- `id` (uuid, PK)
- `service_name` (text)
- `endpoint` (text)
- `status_code` (integer)
- `latency_ms` (integer)
- `error_message` (text, nullable)
- `created_at` (timestamptz)
- RLS: No public access

**`admin_costs`** — Manual cost entries
- `id` (uuid, PK)
- `category` (text)
- `amount_usd` (numeric)
- `period` (text: '2025-01', '2025-02', etc.)
- `notes` (text, nullable)
- `created_at` (timestamptz)
- RLS: No public access

### Edge Function Changes

- **`chat-gpt`**: Add AI usage logging (tokens, latency, cost) to `admin_ai_usage` after each completion
- **All edge functions making external calls**: Log call status to `admin_service_health`

### Client-Side Analytics Hook

A new `useAnalyticsTracker` hook added to the root `Layout` component that:
- Logs page views on route change
- Provides `trackEvent()` function for click/interaction tracking
- Uses anonymous session IDs (no PII, no cookies)
- Batches events (sends every 10 seconds or on page unload)

---

## File Structure

```text
src/pages/admin/
  AdminLogin.tsx          -- Branded login page
  AdminDashboard.tsx      -- Main dashboard shell with sidebar nav
  AdminOverview.tsx       -- Module 2: KPI wall
  AdminEngagement.tsx     -- Module 3: User analytics
  AdminAIUsage.tsx        -- Module 4: AI consumption
  AdminIntegrations.tsx   -- Module 5: Service status
  AdminCosts.tsx          -- Module 6: Cost board
  AdminRegistry.tsx       -- Module 7: Registry deep-dive
  AdminReporter.tsx       -- Module 8: Grant reporter

src/components/admin/
  AdminSidebar.tsx        -- Navigation sidebar
  AdminProtectedRoute.tsx -- Auth gate wrapper
  StatCard.tsx            -- Reusable KPI card
  TrendChart.tsx          -- Reusable area/line chart
  StatusIndicator.tsx     -- Service health dot
  CostTable.tsx           -- Editable cost entries
  ReportExporter.tsx      -- PDF/CSV export

src/hooks/
  useAdminAuth.ts         -- Admin login/session management
  useAnalyticsTracker.ts  -- Client-side event logging
  useAdminStats.ts        -- Dashboard data fetching
  useServiceHealth.ts     -- Integration status polling
  useAIUsageStats.ts      -- AI consumption aggregation

supabase/functions/
  admin-stats/index.ts    -- Aggregated admin queries (service role)
```

---

## Security and Edge Cases

### Authentication Security
- Admin auth uses Supabase Auth (email/password) with an `admin_users` whitelist table
- The admin route checks both: (1) valid auth session AND (2) email exists in `admin_users`
- Failed login attempts are rate-limited by Supabase Auth defaults
- No "forgot password" flow exposed publicly — password reset only via backend

### Analytics Privacy
- No personally identifiable information stored in `admin_analytics`
- Session IDs are random UUIDs generated per browser session (not fingerprinting)
- No IP addresses, no user agents stored beyond device type classification
- GDPR-safe: no tracking cookies, no cross-site tracking

### Abuse Prevention
- `admin_analytics` INSERT is rate-limited (max 100 events/minute per session via a database trigger)
- Event payload size capped at 1KB per row
- Old analytics data auto-purged after 90 days (database function on cron)

### Cost Estimation Accuracy
- AI costs are estimates based on public token pricing — actual billing may differ
- Manual cost entries require the admin to update monthly
- Disclaimer shown on cost dashboards: "Estimates based on usage metrics, not actual invoices"

### Perception Analysis
- **Technical users**: Will appreciate the depth; may question token cost accuracy — mitigated by "estimate" labels
- **Non-technical users (SF reviewers)**: The Grant Reporter module presents clean, digestible summaries without overwhelming technical detail
- **Skeptical observers**: The analytics tracking is transparent (no PII, no cookies) and the open-source nature of the codebase means anyone can audit the tracking code

---

## Implementation Sequence

1. Database migrations (5 new tables + RLS policies)
2. Admin auth (Supabase Auth signup for admin email, protected route, login page)
3. Analytics tracking hook + Layout integration
4. Edge function instrumentation (AI usage logging, service health logging)
5. Admin dashboard shell + sidebar navigation
6. Module 2: Overview KPIs (queries existing data)
7. Module 3: Engagement analytics (reads from new `admin_analytics`)
8. Module 4: AI usage (reads from new `admin_ai_usage`)
9. Module 5: Integration status board
10. Module 6: Cost board
11. Module 7: Registry deep-dive
12. Module 8: Grant reporter with export

All charts use Recharts with smooth curves (`type="monotone"`), gradient fills, and the existing Bloomberg terminal color palette (teal primary, orange warning, steel gray secondary).

