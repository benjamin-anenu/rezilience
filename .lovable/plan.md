

# Remaining Work: Realms Delivery Rate Scoring Modifier

## Status Check

All 10 parts of the plan are implemented EXCEPT **Part 6: Scoring Integration** in `admin-recalibrate`. Here is the status:

| Part | Status |
|------|--------|
| 1. Database columns | Done |
| 2. `fetch-realms-governance` edge function | Done |
| 3. Governance refresh (Realms pass) | Done |
| 4. DAOAccountabilityCard + tab integration | Done |
| 5. Claim flow + Settings field | Done |
| 6. Scoring integration (delivery rate modifier) | **Not done** |
| 7. README.md updates | Done |
| 8. Readme UI page section | Done |
| 9. Pitch deck slide updates | Done |
| 10. Hackathon Demo page + /demo route | Done |

## What Needs to Change

**File:** `supabase/functions/admin-recalibrate/index.ts`

Add the Realms delivery rate modifier to the governance score calculation (around line 71):

1. After calculating `govScore` from `governance_tx_30d`, check if the profile has `realms_delivery_rate`
2. Apply modifier:
   - Delivery rate >= 70%: `govScore += 10`
   - Delivery rate 40-70%: no change
   - Delivery rate < 40%: `govScore -= 15` (clamped to 0 minimum)
3. Cap `govScore` at 100 maximum
4. Include `realms_modifier` in the `scoreBreakdown` object for transparency

This is a ~10-line addition. No structural changes needed.

## Technical Detail

Current governance score line (line 71):
```typescript
const govScore = profile.governance_tx_30d ? Math.min(profile.governance_tx_30d * 5, 80) : 0;
```

Will become:
```typescript
let govScore = profile.governance_tx_30d ? Math.min(profile.governance_tx_30d * 5, 80) : 0;

// Realms DAO Accountability modifier
let realmsModifier = 0;
if (profile.realms_dao_address && profile.realms_delivery_rate !== null && profile.realms_delivery_rate !== undefined) {
  if (profile.realms_delivery_rate >= 70) realmsModifier = 10;
  else if (profile.realms_delivery_rate < 40) realmsModifier = -15;
  govScore = Math.max(0, Math.min(100, govScore + realmsModifier));
}
```

The `select` query on line 31 also needs `realms_dao_address, realms_delivery_rate` added to the column list.

The `scoreBreakdown` object gets a `realms_modifier` field added.

No breaking changes -- projects without Realms data get `realmsModifier = 0`.

