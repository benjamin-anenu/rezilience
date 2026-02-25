

## Fix TVL Zero Values and Service Health False Alarms

### Problem Summary
1. **TVL is zero for all projects** because project names don't match DeFiLlama API slugs, and the batch refresh is getting rate-limited (403s)
2. **DeFiLlama and OpenSSF appear "degraded"** due to false-positive error counting in the health dashboard

### Solution: Three-Part Fix

---

### Part 1: DeFiLlama Name Mapping Table

**File: `supabase/functions/analyze-tvl/index.ts`**

Add a static lookup map that translates `project_name` values to their correct DeFiLlama protocol slugs. This avoids relying on naive slugification.

```text
project_name in DB           -->  DeFiLlama slug
-------------------------------------------------
"Marinade Finance"           -->  "marinade-finance"
"Kamino Finance (KLend)"     -->  "kamino"  
"Kamino Lending"             -->  "kamino"
"Kamino Lend (KLend)"        -->  "kamino"
"Jupiter Aggregator V6"      -->  "jupiter"
"Jupiter DCA"                -->  "jupiter-dca"
"Jupiter Perpetuals"         -->  "jupiter-perps"
"Jupiter Limit Order V2"     -->  "jupiter-limit-order"
"Raydium CLMM"              -->  "raydium"
"Drift Protocol V2"         -->  "drift"
"Marginfi V2"               -->  "marginfi"
"MarginFi V2"               -->  "marginfi"
"Marginfi Lending"          -->  "marginfi"
"Mango V4"                  -->  "mango-markets"
"Meteora DLMM"              -->  "meteora"
"Lifinity V2"               -->  "lifinity"
"BlazeStake"                -->  "blazestake"
"Jito Stake Pool"           -->  "jito"
"Jito SPL Stake Pool"       -->  "jito"
"Hubble Protocol"           -->  "hubble-protocol"
"Phoenix V1"                -->  "phoenix"
"Invariant"                 -->  "invariant"
"Dual Finance"              -->  "dual-finance"
"Save (formerly Solend)"    -->  "solend"
"Sanctum"                   -->  "sanctum"
"Sanctum SPL Stake Pool"    -->  "sanctum"
"Sanctum Token Ratio"       -->  "sanctum"
"Hxro Dexterity"            -->  "hxro"
"Credix"                    -->  "credix-finance"
"Flash Trade"               -->  "flash-trade"
"Jet Protocol V2"           -->  "jet-protocol"
"Access Protocol"           -->  "access-protocol"
"OpenBook DEX V2"           -->  "openbook"
"Drift Keeper Bots V2"      -->  "drift"
(and others as needed)
```

The function will first check this map; if a match exists, use the mapped slug. Otherwise, fall back to the existing `normalizeProtocolName` slugification.

---

### Part 2: Rate Limiting Fix for Batch Refresh

**File: `supabase/functions/refresh-tvl-realtime/index.ts`**

- Increase the inter-request delay from **200ms to 1500ms** to avoid DeFiLlama 403 rate-limit blocks
- Add retry logic: if a 403 is returned, wait 3 seconds and retry once

---

### Part 3: Fix Health Dashboard False Alarms

**File: `supabase/functions/analyze-security-posture/index.ts`**
- When OpenSSF returns a 404 (repo not found / not scanned), log the health status as **200** with a note rather than logging the raw 404 as an error. A 404 from OpenSSF means "no data available" — it is not a service failure.

**File: `supabase/functions/analyze-tvl/index.ts`**
- When DeFiLlama returns a 404 (protocol not found), do not log it as a health error either. Only log actual failures (5xx, network errors) as errors.

---

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/analyze-tvl/index.ts` | Add name-mapping table, fix health logging for 404s |
| `supabase/functions/refresh-tvl-realtime/index.ts` | Increase delay to 1500ms, add 403 retry |
| `supabase/functions/analyze-security-posture/index.ts` | Don't log 404 as health error |

### Expected Outcome
- DeFi projects will show real TVL values (e.g., Marinade at ~$605M, Drift, Jupiter, etc.)
- DeFiLlama and OpenSSF will show as "Operational" in the admin dashboard
- Batch refreshes will complete without rate-limit blocks

