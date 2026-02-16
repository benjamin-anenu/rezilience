

# Populate Country Fields from GitHub Org/User Locations

## Problem
190 out of 231 profiles have no `country` field set. Additionally, the 41 that do have it use inconsistent formats (e.g., "USA" vs "us", "India" vs "in").

## Approach

Create a new edge function `enrich-countries` that:

1. Fetches all profiles missing a `country` value (or with non-standardized values)
2. Extracts the GitHub org/user from each `github_org_url` (e.g., `https://github.com/helium/helium-program-library` -> org `helium`)
3. Calls the GitHub API `GET /orgs/{org}` or `GET /users/{user}` to read the `location` field
4. Maps the free-text location to one of the standardized country codes from `src/lib/countries.ts` using keyword matching (e.g., "San Francisco, CA" -> `us`, "Berlin" -> `de`, "Singapore" -> `sg`)
5. Updates the `country` field in `claimed_profiles` with the standardized code
6. Also normalizes the 41 existing entries to use codes instead of full names ("USA" -> "us", "India" -> "in", etc.)

## New File: `supabase/functions/enrich-countries/index.ts`

The function will:

- Use the existing `GITHUB_TOKEN` secret for API calls
- Use `SUPABASE_SERVICE_ROLE_KEY` for DB writes
- Process all profiles in a single invocation (190 is well within limits)
- Return a summary of how many were updated, skipped, or had no location data

**Location-to-country mapping logic:**

```text
Location string             -> Country code
"San Francisco, CA"         -> us
"Berlin, Germany"           -> de
"Singapore"                 -> sg
"London, UK"                -> uk
"Dubai, UAE"                -> ae
"Tokyo, Japan"              -> jp
(unknown/unmappable)        -> null (skip, don't override)
```

The mapping will check for country names, city names, state abbreviations, and country codes in the location string.

## Fix: Normalize Existing Country Values

The function will also fix the 41 existing entries that use full names:

| Current DB value | Normalized to |
|-----------------|---------------|
| USA | us |
| United Kingdom | uk |
| India | in |
| Germany | de |
| France | fr |
| Poland | pl |
| Portugal | pt |
| South Korea | kr |
| Hong Kong | hk |
| Brazil | br |
| Canada | ca |
| Ireland | other |
| Israel | other |
| Indonesia | other |
| Vietnam | other |
| ng | ng (already a code, but should be "other" since ng isn't in the COUNTRIES list) |

Wait -- `ng` IS in the COUNTRIES list (Nigeria). So `ng` stays as `ng`.

## Summary

| File | Change |
|------|--------|
| `supabase/functions/enrich-countries/index.ts` | New edge function: fetches GitHub org locations, maps to country codes, updates DB |

After deployment, the function can be invoked once to backfill all 190 missing countries and normalize the 41 existing ones. No frontend changes needed since the Explorer already reads the `country` field.

