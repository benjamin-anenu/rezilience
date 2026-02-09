
# Add Unclaimed Profiles from Solana Programs Directory

## Overview

This plan adds 149 unclaimed profiles from the provided JSON file to the Resilience Registry. Each profile will be seeded with:
- Valid GitHub URL for automatic metric analysis
- Program ID (where available)
- Category and description
- Status: `claim_status = 'unclaimed'`, `verified = false`

After seeding, the 30-minute cron job will automatically analyze each profile's GitHub repository and populate resilience scores, liveness status, and trend data.

---

## Data Filtering Strategy

From the 150 programs in the JSON, we need to filter:

**Include (approx 90-100 programs):**
- Programs with valid GitHub URLs (not "N/A")
- Programs with valid program IDs (not "N/A" patterns)

**Exclude:**
- Drift Protocol V2 (already exists)
- Programs with "N/A (closed source)" GitHub URLs (e.g., Pump.fun)
- Programs with "N/A" program IDs (SDKs, frameworks, validator clients)
- Programs pointing to the same parent repo (e.g., multiple anza-xyz/agave entries)

---

## Implementation Approach

### Option 1: Database Migration (Recommended)
Create a migration SQL file with INSERT statements for all valid programs. Benefits:
- Atomic transaction - all or nothing
- Easily auditable
- Can be rolled back if needed

### Option 2: Edge Function for Bulk Seeding
Create a one-time edge function to seed from JSON. Less preferred as migrations are more reliable.

---

## Technical Details

### Category Mapping
The JSON uses categories like "DeFi / DEX", "DeFi / Derivatives", etc. We'll normalize these to match the existing category format in the database:
- "DeFi / DEX" -> "defi"
- "DeFi / Derivatives" -> "defi"
- "NFT / Marketplace" -> "nft"
- "Infrastructure / Oracle" -> "infrastructure"
- "Gaming / Infrastructure" -> "gaming"
- etc.

### Deduplication Strategy
Many programs in the JSON share the same GitHub repo (e.g., multiple programs from anza-xyz/agave). To avoid duplicate analysis:
- Group by unique GitHub URL
- Select the most specific/relevant program when duplicates exist

### Programs to Seed (High-Value Selection)

Based on analysis, here are the key programs to add:

| Program | Category | GitHub |
|---------|----------|--------|
| SPL Token Program | Core | solana-program/token |
| Token-2022 | Core | solana-program/token-2022 |
| Jupiter Aggregator V6 | DeFi | jup-ag/jupiter-core |
| Raydium AMM V4 | DeFi | raydium-io/raydium-amm |
| Orca Whirlpools | DeFi | orca-so/whirlpools |
| Meteora DLMM | DeFi | MeteoraAg/dlmm-sdk |
| Phoenix V1 | DeFi | Ellipsis-Labs/phoenix-v1 |
| OpenBook V2 | DeFi | openbook-dex/openbook-v2 |
| Marinade Finance | DeFi | marinade-finance/liquid-staking-program |
| Kamino Finance | DeFi | Kamino-Finance/klend |
| MarginFi V2 | DeFi | mrgnlabs/marginfi-v2 |
| Pyth Network | Infrastructure | pyth-network/pyth-sdk-solana |
| Switchboard V2 | Infrastructure | switchboard-xyz/switchboard-v2 |
| Wormhole Core Bridge | Infrastructure | wormhole-foundation/wormhole |
| Squads Multisig V4 | Infrastructure | Squads-Protocol/v4 |
| Metaplex Token Metadata | NFT | metaplex-foundation/mpl-token-metadata |
| Metaplex Bubblegum | NFT | metaplex-foundation/mpl-bubblegum |
| Magic Eden V2 | NFT | magiceden-oss |
| Tensor Swap | NFT | tensor-foundation |
| Realms (SPL Governance) | Governance | Mythic-Project/solana-program-library |
| Helium Network | DePIN | helium/helium-program-library |
| And 70+ more... |  |  |

---

## Implementation Steps

### Step 1: Create Database Migration
Generate SQL INSERT statements for all valid programs from the JSON file.

```sql
INSERT INTO claimed_profiles (
  project_name, description, category, program_id, 
  github_org_url, website_url, claim_status, verified,
  resilience_score, liveness_status
) VALUES 
  ('SPL Token Program', 'Standard token program...', 'infrastructure', 'TokenkegQ...', 'https://github.com/solana-program/token', 'https://spl.solana.com', 'unclaimed', false, 0, 'STALE'),
  -- ... 90+ more entries
```

### Step 2: Deploy Migration
Run the migration to insert all unclaimed profiles.

### Step 3: Trigger Initial Analysis
The existing 30-minute cron job (`refresh-all-profiles`) will automatically:
1. Detect all new unclaimed profiles with GitHub URLs
2. Call `analyze-github-repo` for each
3. Populate resilience scores, liveness status, metrics
4. Create score_history entries for trend charts

### Step 4: Verify in Explorer
Confirm all new profiles appear with:
- "UNCLAIMED" badge
- "Claim This" CTA
- Populated metrics (after first refresh cycle)

---

## Files to Modify

| File | Change |
|------|--------|
| New Migration | INSERT 90+ unclaimed profiles |

---

## Post-Implementation Verification

After the cron runs (or manual trigger):
- All profiles should show real resilience scores
- Liveness badges should reflect actual GitHub activity
- Sparkline trends will populate over subsequent cycles
- "UNCLAIMED" badge visible for all new entries

---

## Risk Mitigation

1. **Duplicate Prevention**: Check for existing program_id before insert
2. **Invalid GitHub URLs**: Skip entries with "N/A" or malformed URLs
3. **Rate Limiting**: The cron job already handles GitHub API limits gracefully
4. **Rollback**: Can DELETE FROM claimed_profiles WHERE claim_status = 'unclaimed' AND project_name IN (...) if needed

---

## Estimated Impact

- **Registry Growth**: From 2 profiles to 90-100+ profiles
- **Active Monitoring**: All profiles with valid GitHub URLs get automatic refresh
- **User Value**: Builders see real-time health of major Solana protocols
- **Claim Incentive**: Prominent projects visible but unclaimed creates urgency

---

## Summary

This implementation seeds the Resilience Registry with the majority of active Solana programs from the provided directory. The existing auto-refresh infrastructure will keep all profiles current, and builders will be incentivized to claim their projects by seeing them listed as "UNCLAIMED" with real metrics.
