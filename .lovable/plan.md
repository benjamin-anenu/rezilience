

# Consolidate Seeders into a Single Generic `seed-registry-profiles` Function

## What Changes
Merge the existing `seed-colosseum-profiles` function and the planned batch seeder into one unified edge function called **`seed-registry-profiles`**. This single function handles seeding ANY batch of programs into the registry, regardless of source (Colosseum cohorts, ecosystem batches, manual additions).

## How It Works

The new function accepts a POST body with a `programs` array in a simple, universal format:

```json
{
  "discovery_source": "Solana Ecosystem Batch 1",
  "trigger_refresh": true,
  "programs": [
    {
      "name": "Kamino Lend",
      "category": "DeFi/Lending",
      "description": "...",
      "program_id": "KLend...",
      "github_url": "https://github.com/...",
      "website": "https://...",
      "contributors_approx": 20,
      "x_handle": "@kamaboricux",
      "location": "USA"
    }
  ]
}
```

- `discovery_source` at the top level sets a default for all programs (individual programs can override via their own fields like `hackathon`/`prize`)
- `trigger_refresh` (default `true`) fires the `refresh-all-profiles` pipeline after seeding
- The existing Colosseum data stays embedded inside the function, accessible via `POST { "source": "colosseum" }` for backward compatibility

## Technical Details

### Step 1 -- Rename and Rewrite the Edge Function

**Delete:** `supabase/functions/seed-colosseum-profiles/index.ts`
**Create:** `supabase/functions/seed-registry-profiles/index.ts`

The new function supports two modes:

1. **Embedded mode** (`{ "source": "colosseum" }`): Uses the same hardcoded Colosseum data that currently lives in the old function. No behavior change.
2. **Payload mode** (`{ "programs": [...] }`): Accepts any array of programs in the standard format shown above.

Both modes share the same `transformProgram()` helper that maps input fields to `claimed_profiles` columns:
- `project_name` = name
- `category` = category
- `program_id` = null if empty/TBD/N/A
- `github_org_url` = null if "private" or empty
- `x_username` = stripped of `@` prefix
- `country` = location
- `claim_status` = "unclaimed", `verified` = false
- `discovery_source` = per-program or top-level default

Upserts on `project_name` conflict key (existing behavior preserved).

After successful upsert, if `trigger_refresh` is true, fires `refresh-all-profiles` as fire-and-forget to run the full analysis pipeline (GitHub, dependencies, governance, TVL, integrated score).

### Step 2 -- Update `supabase/config.toml`

Remove the `seed-colosseum-profiles` entry and add:
```toml
[functions.seed-registry-profiles]
verify_jwt = false
```

### Step 3 -- Delete Old Function

Remove the `supabase/functions/seed-colosseum-profiles/` directory entirely and delete the deployed function.

### Step 4 -- Invoke with the New Batch

Call the new function with the 20 programs from `solana_programs_batch1.json` to seed them and trigger analysis.

## Files Modified
1. `supabase/functions/seed-registry-profiles/index.ts` (new)
2. `supabase/config.toml` (swap config entry)
3. `supabase/functions/seed-colosseum-profiles/index.ts` (deleted)

