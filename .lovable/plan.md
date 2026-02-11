

# Fix: Governance Scoring for Realms and Similar Projects

## Problem

Realms (SPL Governance) scores ZERO on governance because:
- The governance pipeline requires `multisig_address` to be populated
- Realms has no `multisig_address` set, so it is completely skipped by the hourly refresh
- Its own program ID (`GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw`) should be analyzed for on-chain transaction activity

There is also a duplicate: both "SPL Governance" (score 20) and "Realms (SPL Governance)" (score 42) exist with the same program ID.

## Fix (2 parts)

### 1. Update the hourly governance refresh to fall back to `program_id`

In `supabase/functions/refresh-governance-hourly/index.ts`:
- Change the query filter to include profiles where EITHER `multisig_address` OR `program_id` is set (for `category = 'dao'` projects)
- When calling `analyze-governance`, use `multisig_address` if available, otherwise fall back to `program_id`

### 2. Remove the duplicate "SPL Governance" entry

Run a database query to delete the lower-scoring duplicate entry ("SPL Governance", id `275a9638-...`, score 20), keeping only "Realms (SPL Governance)" (id `e36e1c93-...`, score 42).

## Technical Details

### File: `supabase/functions/refresh-governance-hourly/index.ts`

Change the profile query from:
```sql
.not("multisig_address", "is", null)
```
To:
```sql
.or("multisig_address.not.is.null,category.eq.dao")
```

Then update the function call logic to use:
```typescript
const addressToAnalyze = profile.multisig_address || profile.program_id;
```

This ensures any project categorized as "dao" gets governance analysis using its program ID as a fallback.

### Database cleanup

Delete the duplicate entry:
```sql
DELETE FROM claimed_profiles WHERE id = '275a9638-0ac4-4445-b04c-0c93ae8f7ae7';
```

### Expected outcome

After deployment, the next governance refresh cycle will:
- Pick up Realms using its program ID `GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw`
- Fetch recent on-chain transaction signatures for that address
- Calculate a real governance health score based on 30d/90d activity
- Update `governance_tx_30d`, `governance_last_activity`, and `governance_analyzed_at`

