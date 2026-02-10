

# Seed 20 Solana Programs (Batch 2) into the Registry

## GitHub Verification Summary

All 20 repositories were checked. **19 are publicly accessible**, 1 is not:

- **Perena Numeraire AMM** (`https://github.com/perena-finance`) -- returns a 404. The URL points to a non-existent GitHub organization page. This project will still be seeded but with `github_org_url` set to null so it doesn't trigger failed analysis attempts.
- **2 archived repos** (SPL and Voter Stake Registry) are still publicly readable and will be seeded normally.
- **2 forks** (Sanctum SPL Stake Pool, Voter Stake Registry) will be flagged with `github_is_fork: true`.

## Implementation

### Step 1: Call the `seed-registry-profiles` edge function

Invoke the existing `seed-registry-profiles` edge function with a payload containing the 20 projects mapped to the `claimed_profiles` schema:

- `project_name` -- from `name`
- `description` -- from `description`
- `category` -- normalized (e.g., "DeFi / Liquid Staking" becomes "defi")
- `github_org_url` -- from `github_url` (null for Perena)
- `website_url` -- from `website`
- `program_id` -- from `program_id` (empty string becomes null)
- `claim_status` -- "unclaimed"
- `verified` -- false
- `discovery_source` -- "Solana Programs Batch 2"

### Step 2: Trigger `refresh-all-profiles`

After seeding, optionally trigger the refresh pipeline so the 19 public repos get their GitHub metrics, dependency analysis, governance, and TVL data populated automatically.

### No code changes required

The existing `seed-registry-profiles` edge function already supports generic JSON payloads with this exact field mapping. The implementation consists of two edge function calls -- no frontend or backend code modifications needed.

## Technical Details

The edge function will be called with:
```text
POST /seed-registry-profiles
Body: {
  "source": "batch2_solana_programs",
  "programs": [ ...20 mapped records... ],
  "trigger_refresh": true
}
```

Each record is UPSERT'd by `project_name` (unique constraint), so re-running is safe and idempotent. The `trigger_refresh: true` flag will chain into the `refresh-all-profiles` function to kick off GitHub analysis for all 19 accessible repos.

