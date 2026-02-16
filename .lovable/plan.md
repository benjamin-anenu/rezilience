

# Make Country Required in Claim Flow + TLD-Based Country Enrichment

## Part 1: Make Country Required in Claim Profile Flow

Currently, the "Next" button on Step 2 (Core Identity) only checks for `projectName` and `category`. Country is optional. We need to make it required so every new profile has a country set.

### Changes

| File | Change |
|------|--------|
| `src/pages/ClaimProfile.tsx` (line 461) | Add `country` to the `canProceedFromStep2` validation: `projectName.trim() && category && country` |
| `src/components/claim/CoreIdentityForm.tsx` | Move the Country/Region field from the optional "grid" layout into the required section, add a `*` indicator, and match the REQUIRED badge styling |

---

## Part 2: TLD-Based Country Enrichment for Remaining 174 Profiles

174 profiles still have no country. Most have no GitHub location set, but many have `website_url` values with country-specific TLDs we can use as a signal.

### Approach

Update `supabase/functions/enrich-countries/index.ts` to add a **second pass** that targets profiles where `country IS NULL` and `website_url IS NOT NULL`. It will:

1. Extract the TLD from each `website_url` (e.g., `https://example.de` -> `de`)
2. Map country-code TLDs to the standardized codes using a lookup table:

```text
TLD   -> Code
.de   -> de
.uk / .co.uk -> uk
.sg   -> sg
.jp   -> jp
.kr   -> kr
.in   -> in
.br   -> br
.ng   -> ng
.fr   -> fr
.nl   -> nl
.pt   -> pt
.es   -> es
.it   -> it
.pl   -> pl
.ch   -> ch
.au / .com.au -> au
.ca   -> ca
.ae   -> ae
.hk   -> hk
```

3. Generic TLDs (`.com`, `.io`, `.xyz`, `.app`, `.fi`, `.dev`, `.org`, `.net`) are skipped -- they don't indicate a country.
4. The function will support a `mode` parameter: `mode: "tld"` runs only the TLD pass, `mode: "github"` runs only the GitHub pass (current behavior), and default runs both sequentially.

### Files

| File | Change |
|------|--------|
| `supabase/functions/enrich-countries/index.ts` | Add TLD extraction logic and a second enrichment pass for website URLs |
| `src/pages/ClaimProfile.tsx` | Update `canProceedFromStep2` validation |
| `src/components/claim/CoreIdentityForm.tsx` | Mark Country as required in the UI |

### Expected Impact

Based on the data, most of the 174 profiles use generic TLDs (`.io`, `.com`, `.xyz`), so TLD analysis will likely fill in only a small number (perhaps 5-15). The remaining profiles will need manual assignment or will be filled in when project owners claim their profiles (now that country is required).

