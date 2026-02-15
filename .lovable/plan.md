

## Expand Integration Monitoring — Track All Services

### Current State
The admin integrations page only lists **6 hardcoded services**, but the codebase actually uses **10 distinct external APIs**. Several are missing from the dashboard, and some that ARE listed don't have health logging wired up in their edge functions.

### Discovery

Services currently **health-logged** (calling `logServiceHealth`):
- GitHub API (in `analyze-github-repo`)
- DeFiLlama API (in `analyze-tvl`)
- Solana RPC (in `analyze-governance`, `verify-bytecode`)
- Lovable AI Gateway (in `chat-gpt`)
- OtterSec API (in `verify-bytecode`)

Services **used but NOT health-logged**:
- OpenSSF Scorecard API (in `analyze-security-posture`)
- Crates.io API (in `analyze-dependencies`)
- X (Twitter) API (in `x-oauth-callback`)
- Algolia Search API (in `algolia-reindex`)

### Plan

#### 1. Update the SERVICES array in `AdminIntegrationsPage.tsx`

Replace the 6-item hardcoded list with the full 10 services, matching the actual `service_name` strings used in `logServiceHealth` calls:

| Service | Endpoint | Dashboard URL | Cost |
|---------|----------|---------------|------|
| GitHub API | api.github.com | github.com/settings/tokens | Free tier |
| DeFiLlama API | api.llama.fi | defillama.com | Free |
| Solana RPC | api.mainnet-beta.solana.com | — | Variable |
| Lovable AI Gateway | ai-gateway.lovable.dev | — | Included |
| OtterSec API | osec.io | osec.io | Free |
| OpenSSF Scorecard | api.scorecard.dev | scorecard.dev | Free |
| Crates.io API | crates.io | crates.io | Free |
| X (Twitter) API | api.x.com | developer.x.com | Free |
| Algolia Search | algolia.net | dashboard.algolia.com | $0-29/mo |
| Lovable Cloud | supabase.co | — | Included |

Also rename "DeFiLlama" to "DeFiLlama API" to match the actual logged name so the dashboard correctly correlates with the health data.

#### 2. Add health logging to the 4 untracked edge functions

Wire `logServiceHealth` into the functions that currently call these APIs without tracking:

- **`analyze-security-posture/index.ts`** — log the OpenSSF Scorecard API call (~line 56)
- **`analyze-dependencies/index.ts`** — log the Crates.io API call (~line 718)
- **`x-oauth-callback/index.ts`** — log the X API token + user calls (~lines 80, 108)
- **`algolia-reindex/index.ts`** — log the Algolia batch + settings calls (~lines 56, 70)

Each follows the same pattern already used elsewhere:
```text
const start = Date.now();
const response = await fetch(url, ...);
logServiceHealth("Service Name", endpoint, response.status, Date.now() - start);
```

#### 3. Update header count

The header currently shows `{data.length} SERVICES` — this is already dynamic, so it will automatically reflect 10 once the array is updated.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/admin/AdminIntegrationsPage.tsx` | Expand SERVICES array from 6 to 10, fix naming |
| `supabase/functions/analyze-security-posture/index.ts` | Add `logServiceHealth` for OpenSSF |
| `supabase/functions/analyze-dependencies/index.ts` | Add `logServiceHealth` for Crates.io |
| `supabase/functions/x-oauth-callback/index.ts` | Add `logServiceHealth` for X API |
| `supabase/functions/algolia-reindex/index.ts` | Add `logServiceHealth` for Algolia |

No database changes, no new dependencies. All edge functions already import or can import `logServiceHealth` from `_shared/service-health.ts`.

