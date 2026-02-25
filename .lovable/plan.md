

# Realms DAO Accountability Layer Integration

## Summary

Build a "DAO Accountability" feature that reads governance proposals from Realms (spl-governance) and maps them to Rezilience's existing milestone/scoring system. This creates the "Commitment Lock" narrative needed for the hackathon submission: DAOs fund projects via proposals, Rezilience tracks whether those funded projects actually deliver.

No existing functionality is broken. All changes are additive.

---

## Architecture Overview

```text
+---------------------+       +------------------------+       +------------------+
| Realms On-Chain      | --->  | fetch-realms-governance | --->  | claimed_profiles |
| (spl-governance)     |       | (Edge Function)        |       | + new columns    |
| - Proposals          |       | - Deserializes accts   |       | - realms_dao_id  |
| - Vote records       |       | - Counts proposals     |       | - realms_data    |
| - Execution status   |       | - Tracks execution     |       +------------------+
+---------------------+       +------------------------+              |
                                                                       v
                                                            +---------------------+
                                                            | UI Components        |
                                                            | - DAOAccountability  |
                                                            |   Card (program pg)  |
                                                            | - Readme section     |
                                                            | - Pitch deck slide   |
                                                            +---------------------+
```

---

## Part 1: Database Changes

Add columns to `claimed_profiles` for Realms integration:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `realms_dao_address` | text | null | The Realms DAO (realm) address to track |
| `realms_proposals_total` | integer | 0 | Total proposal count |
| `realms_proposals_completed` | integer | 0 | Proposals that were executed |
| `realms_proposals_active` | integer | 0 | Currently voting proposals |
| `realms_delivery_rate` | numeric | null | Completed/Total ratio (0-100) |
| `realms_last_proposal` | timestamptz | null | Most recent proposal timestamp |
| `realms_analyzed_at` | timestamptz | null | Last analysis time |
| `realms_raw_data` | jsonb | '[]' | Raw proposal summaries for UI |

Migration SQL will use `ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS ...` to avoid breaking anything.

---

## Part 2: Edge Function -- `fetch-realms-governance`

**File:** `supabase/functions/fetch-realms-governance/index.ts`

This function:
1. Accepts `{ realm_address, profile_id }` via POST
2. Uses Solana RPC (`getMultipleAccounts` + `getProgramAccounts`) to fetch governance accounts owned by the realm
3. For each governance account, fetches its proposals using `getProgramAccounts` with the `governance` pubkey as a filter
4. Deserializes proposal accounts using borsh-compatible manual parsing (to avoid npm dependency issues in Deno edge functions)
5. Categorizes proposals: Draft, Voting, Succeeded, Executing, Completed, Defeated, Cancelled
6. Calculates a "Delivery Rate" = (Completed + Executing) / (Total - Draft - Cancelled)
7. Updates `claimed_profiles` with the results
8. Logs service health via the existing `logServiceHealth` utility

**Key technical details:**
- The spl-governance program ID is `GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw`
- Proposal account layout is documented in spl-governance; we parse the first ~100 bytes to extract `state`, `name`, `votingAt`, `signingOffAt`, `votingCompletedAt`
- Uses `getProgramAccounts` with memcmp filters on the governance pubkey for efficient querying
- Falls back to Helius RPC (via `RPC_URL` secret) if the public RPC rate-limits

**Proposal state mapping:**
```text
0 = Draft
1 = SigningOff  
2 = Voting
3 = Succeeded
4 = Executing
5 = Completed
6 = Cancelled
7 = Defeated
```

---

## Part 3: Wire Into Existing Governance Refresh

**File:** `supabase/functions/refresh-governance-hourly/index.ts`

Add a second pass after the existing Squads/multisig analysis:
- If a profile has `realms_dao_address` set, call `fetch-realms-governance` for it
- Same delay/retry pattern as existing governance refresh (1500ms between calls)

**File:** `supabase/functions/analyze-governance/index.ts`

No changes needed -- Realms analysis is a separate function. The existing `analyze-governance` handles Squads/multisig only.

---

## Part 4: UI -- DAO Accountability Card

**File:** `src/components/program/DAOAccountabilityCard.tsx`

A new card component displayed on the Program Detail page (in the Development or Community tab) when a project has `realms_dao_address` set.

Shows:
- Delivery Rate as a large percentage with color coding (green >70%, amber 40-70%, red <40%)
- Proposal breakdown: Total / Active / Completed / Defeated
- Last proposal date
- Link to the Realms DAO page (`https://app.realms.today/dao/{address}`)

Design follows the existing card pattern from `GovernanceHealthCard.tsx` and `TVLMetricsCard.tsx`.

**File:** `src/components/program/tabs/DevelopmentTabContent.tsx`

Add `<DAOAccountabilityCard />` below the existing `GovernanceHealthCard` when `realms_dao_address` is present.

---

## Part 5: Claim Flow -- Add Realms DAO Field

**File:** `src/components/claim/CoreIdentityForm.tsx`

Add an optional "Realms DAO Address" input field in the Core Identity step, shown when category is "dao" or "governance". This allows builders to link their Realms governance to their Rezilience profile during claim.

Validation: standard Solana address format (32-44 base58 characters).

**File:** `src/components/profile/tabs/SettingsTab.tsx`

Add the same field to the settings tab for existing claimed profiles to add/update their Realms DAO address.

---

## Part 6: Scoring Integration

**File:** `supabase/functions/admin-recalibrate/index.ts` (or wherever the integrated score is calculated)

When `realms_dao_address` is set and `realms_delivery_rate` is available:
- Factor it into the Governance dimension (Heart) as a bonus/penalty modifier
- Delivery rate >70% = +10 bonus to governance sub-score
- Delivery rate 40-70% = no modifier
- Delivery rate <40% = -15 penalty to governance sub-score

This is additive -- projects without Realms data are unaffected.

---

## Part 7: README.md (GitHub)

Add a new section under "Edge Functions" table:

```markdown
| `fetch-realms-governance` | Reads spl-governance proposals from Realms DAOs and tracks delivery rates |
```

Add to the Roadmap section:

```markdown
- **DAO Accountability Layer** -- Realms governance proposal tracking with delivery rate scoring and milestone mapping
```

---

## Part 8: Readme UI Page

**File:** `src/pages/Readme.tsx`

Add a new section between "Platform Features" and "For Solana Builders" (or within the scoring section):

**Section: "DAO Accountability (Realms Integration)"**

Content:
- Explains that Rezilience reads governance proposals from Realms-powered DAOs
- Shows how Delivery Rate is calculated
- Documents the proposal state mapping
- Explains the scoring impact (+10/-15 governance modifier)
- Links to the Realms documentation

**File:** `src/components/readme/TableOfContents.tsx`

Add entry: `{ id: 'realms-accountability', label: 'DAO Accountability', level: 2 }` under the governance scoring section.

---

## Part 9: Pitch Deck Updates

**File:** `src/components/pitch/slides.tsx`

### Changes to existing slides:

**HowItWorksSlide (Slide 5) -- COMMIT step:**
Update the description from:
> "Economic commitment through staked assurance bonds..."

To:
> "Economic commitment through staked assurance bonds. DAO Accountability tracks Realms governance proposals against actual delivery -- exposing which funded projects ship and which stall."

**RoadmapSlide (Slide 9) -- Phase 2:**
Update Phase 2 items to include:
- "Realms DAO Accountability Layer"
- "Proposal-to-Delivery Rate tracking"

**PossibilitiesSlide (Slide 7):**
Add a new item:
```
{ icon: Heart, title: 'DAO Accountability', desc: 'Track whether governance-funded projects actually deliver. Realms proposal execution mapped to Rezilience scores.' }
```

---

## Part 10: Hackathon Demo Flow

**File:** `src/pages/HackathonDemo.tsx` (new page)
**Route:** `/demo`

A guided walkthrough page that:
1. Shows a hero with "Rezilience x Realms -- DAO Accountability Layer"
2. Step-by-step demo: Pick a real Realms DAO address -> fetch live data -> show delivery rate -> show how it maps to Rezilience score
3. Side-by-side: Realms proposal list vs Rezilience milestone status
4. Call-to-action: "This is what accountability looks like"

Design: Full-page, clean, presentation-ready. Uses the existing `SlideLayout` pattern from PitchDeck.

---

## Edge Cases and Failure Modes

| Scenario | Handling |
|----------|----------|
| Invalid Realms address | Validate base58 format, return clear error |
| DAO has 0 proposals | Show "No proposals yet" state, delivery rate = null |
| Public RPC rate limiting | Fall back to Helius RPC via existing `RPC_URL` secret |
| DAO uses governance v1 vs v3 | Parse proposal state byte which is consistent across versions |
| Proposal in "Voting" state for months | Not counted in delivery rate denominator |
| Profile has both Squads multisig AND Realms DAO | Both are tracked independently; governance score uses the higher signal |
| Very large DAOs (1000+ proposals) | Paginate `getProgramAccounts`, process in batches of 100 |

---

## Files Changed (Summary)

| File | Action | Risk |
|------|--------|------|
| Database migration | ADD COLUMNS (additive) | None |
| `supabase/functions/fetch-realms-governance/index.ts` | NEW | None |
| `supabase/functions/refresh-governance-hourly/index.ts` | EDIT (add Realms pass) | Low |
| `src/components/program/DAOAccountabilityCard.tsx` | NEW | None |
| `src/components/program/tabs/DevelopmentTabContent.tsx` | EDIT (add card) | Low |
| `src/components/claim/CoreIdentityForm.tsx` | EDIT (add field) | Low |
| `src/components/profile/tabs/SettingsTab.tsx` | EDIT (add field) | Low |
| `src/components/pitch/slides.tsx` | EDIT (update 3 slides) | Low |
| `src/pages/Readme.tsx` | EDIT (add section) | Low |
| `src/components/readme/TableOfContents.tsx` | EDIT (add entry) | None |
| `src/pages/HackathonDemo.tsx` | NEW | None |
| `src/App.tsx` | EDIT (add /demo route) | None |
| `README.md` | EDIT (add entries) | None |

**Zero breaking changes.** All modifications are additive. Existing scoring, governance, and profile flows remain untouched.

---

## Implementation Order

1. Database migration (columns)
2. Edge function (`fetch-realms-governance`)
3. Wire into governance refresh
4. UI card + tab integration
5. Claim flow field addition
6. Readme page section
7. Pitch deck slide updates
8. Demo page
9. README.md updates
10. Test end-to-end with a real Realms DAO (e.g., Marinade DAO: `GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw`)

