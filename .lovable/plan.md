

# Two Changes: Layout Fix + Free API Integrations

## Change 1: Move "Builders In Public" to the Left as a Standalone Element

Currently, "Builders In Public" is the 4th tab inside the `TabsList`. You want it pulled out to the left side of the same line as the tabs, as its own standalone button/link.

### New Layout

```text
Before:
[List View] [Titan Watch] [Ecosystem Pulse] [Builders In Public]

After:
[Builders In Public]                    [List View] [Titan Watch] [Ecosystem Pulse]
```

The "Builders In Public" becomes a standalone toggle button on the left, and the three data-view tabs stay grouped on the right. When "Builders In Public" is active, the tabs deselect (and vice versa). This is achieved by managing active state manually instead of relying solely on the Tabs component.

### File Modified

**`src/pages/Explorer.tsx`**
- Add a `activeView` state (`'list' | 'heatmap' | 'pulse' | 'builders'`)
- Render the "Builders In Public" button outside the `TabsList`, positioned left via a flex container
- Remove the `Builders In Public` trigger from inside `TabsList` (now 3 columns)
- Conditionally render `BuildersInPublicFeed` when `activeView === 'builders'`, otherwise show the Tabs content

---

## Change 2: Free 3rd-Party API Integrations

After auditing your current data sources and researching what is available for free, here are the high-impact integrations that directly serve Resilience's mission of measuring project health, security, and trustworthiness:

### Currently Integrated
| Source | Purpose | Status |
|--------|---------|--------|
| GitHub API | Code health, commits, contributors | Live |
| Crates.io / NPM / PyPI | Dependency freshness | Live |
| DeFiLlama | TVL and economic activity | Live |
| Solana RPC | Governance transaction signatures | Live |
| OtterSec | Bytecode verification | Live |

### Recommended New Integrations (All Free, No API Key Required)

**1. OSV.dev (Google Open Source Vulnerabilities)** -- Priority: HIGH
- **What**: Free vulnerability database API. Query by package name + version to get known CVEs.
- **URL**: `https://api.osv.dev/v1/query`
- **Why**: Your dependency analysis currently tracks *outdated* packages but not *vulnerable* packages. OSV would let you flag "this project uses `anchor-lang 0.28.0` which has CVE-XXXX." This is the single biggest gap in your supply chain scoring.
- **Impact**: Adds a `vulnerability_count` field to dependency analysis. Projects with unpatched CVEs get a score penalty.
- **Cost**: Completely free, no auth needed, generous rate limits.

**2. OpenSSF Scorecard API** -- Priority: HIGH
- **What**: Google-backed security scorecard for GitHub repos (checks branch protection, code review, CI/CD, signed releases, etc.).
- **URL**: `https://api.scorecard.dev/projects/github.com/{owner}/{repo}`
- **Why**: Gives you an industry-standard security posture score (0-10) per repo. This directly strengthens the Governance & Security dimension (20%) with data you currently cannot compute.
- **Impact**: Adds `openssf_score` to profiles. Repos with branch protection, signed commits, and CI checks score higher.
- **Cost**: Free, no auth, public API.

**3. Helius Free Tier (Solana RPC + DAS)** -- Priority: MEDIUM
- **What**: Enhanced Solana RPC with Digital Asset Standard (DAS) API. Free tier: 100K requests/month.
- **URL**: `https://mainnet.helius-rpc.com/?api-key=FREE_KEY`
- **Why**: Your current governance analysis uses the public Solana RPC which has aggressive rate limits. Helius free tier gives you 100K calls/month with richer data (transaction parsing, account history, compressed NFT data).
- **Impact**: More reliable governance scoring, ability to parse transaction types (not just count signatures).
- **Cost**: Free tier (requires signup for API key).

**4. CoinGecko Free API** -- Priority: MEDIUM
- **What**: Token price, market cap, volume, and community data.
- **URL**: `https://api.coingecko.com/api/v3/coins/{id}`
- **Why**: Adds an economic dimension beyond TVL -- market cap, 24h volume, and price trends. Also provides community metrics (Twitter followers, Reddit subscribers) that CoinGecko already aggregates.
- **Impact**: Enriches the TVL dimension with market activity data. Could also feed the (planned) Community dimension.
- **Cost**: Free, no auth needed, 10-30 calls/min rate limit.

**5. libs.tech / deps.dev (Google)** -- Priority: LOW
- **What**: Google's dependency insight API for understanding transitive dependencies and their security status.
- **URL**: `https://api.deps.dev/v3alpha/systems/{system}/packages/{package}`
- **Why**: Your dependency analysis currently checks direct dependencies. deps.dev would let you trace *transitive* (indirect) vulnerabilities -- e.g., "your project depends on X which depends on Y which has a CVE."
- **Impact**: Deeper supply chain analysis for the AEGIS Phase 4 vision.
- **Cost**: Free, no auth.

### Implementation Approach

Each integration gets its own edge function, following the existing pattern:

| Edge Function | API Source | Database Column |
|---------------|-----------|-----------------|
| `analyze-vulnerabilities` | OSV.dev | `vulnerability_count`, `vulnerability_details` (JSONB) |
| `analyze-security-posture` | OpenSSF Scorecard | `openssf_score`, `openssf_checks` (JSONB) |

These would be called during the existing `refresh-all-profiles` cron cycle, alongside the current `analyze-dependencies`, `analyze-governance`, and `analyze-tvl` functions.

### Scoring Formula Impact

No change to the current 4-dimension formula yet. The new data enriches existing dimensions:
- **OSV vulnerabilities** feed into the Dependency Health (25%) dimension
- **OpenSSF Scorecard** feeds into the Governance & Security (20%) dimension
- **CoinGecko market data** feeds into the TVL & Economic (15%) dimension

---

## Files Modified Summary

1. **`src/pages/Explorer.tsx`** -- Pull "Builders In Public" out of TabsList, render it as a standalone button on the left side of the same row
2. **`supabase/functions/analyze-vulnerabilities/index.ts`** (NEW) -- OSV.dev integration
3. **`supabase/functions/analyze-security-posture/index.ts`** (NEW) -- OpenSSF Scorecard integration
4. **Database migration** -- Add `vulnerability_count`, `vulnerability_details`, `openssf_score`, `openssf_checks` columns to `claimed_profiles`
5. **`supabase/functions/refresh-all-profiles/index.ts`** -- Call the two new analysis functions during refresh cycle
6. **Scoring display updates** -- Show vulnerability badges and OpenSSF score in the Development tab

