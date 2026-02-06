
# Score History Chart Fix

## Problem Identified

The Score History chart is empty because of a **foreign key constraint violation**. From the edge function logs:

```
Error inserting score_history: {
  code: "23503",
  details: 'Key (project_id)=(6dcd6268-1ec4-4f40-bba2-760ee5a6e772) is not present in table "projects".',
  message: 'insert or update on table "score_history" violates foreign key constraint "score_history_project_id_fkey"'
}
```

### Root Cause

The `score_history` table has a foreign key constraint pointing to the `projects` table:

```sql
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
```

But your profile exists in `claimed_profiles`, NOT in `projects`. When the edge function tries to insert a score history record using the `claimed_profiles.id`, it fails because that ID doesn't exist in the `projects` table.

This is a **table architecture mismatch**:
- `projects` table: for indexed Solana programs (on-chain discovery)
- `claimed_profiles` table: for user-registered protocols via the Registry
- `score_history` table: currently only linked to `projects`, not `claimed_profiles`

---

## Solution

Modify the `score_history` table to allow references to EITHER `projects` OR `claimed_profiles`. There are two approaches:

### Recommended: Add a separate `claimed_profile_id` column

This approach maintains data integrity and allows history tracking for both tables independently.

### Database Changes

```sql
-- Add new column for claimed_profiles reference
ALTER TABLE score_history 
  ADD COLUMN claimed_profile_id UUID REFERENCES claimed_profiles(id) ON DELETE CASCADE;

-- Make project_id nullable (since we now have two possible foreign keys)
ALTER TABLE score_history 
  ALTER COLUMN project_id DROP NOT NULL;

-- Add check constraint to ensure at least one foreign key is set
ALTER TABLE score_history 
  ADD CONSTRAINT score_history_one_fk_required 
  CHECK (project_id IS NOT NULL OR claimed_profile_id IS NOT NULL);
```

### Edge Function Update

Update `analyze-github-repo/index.ts` to use `claimed_profile_id` instead of `project_id`:

```typescript
// Insert score history snapshot for tracking over time
const { error: historyError } = await supabase
  .from("score_history")
  .insert({
    claimed_profile_id: profile_id,  // Use claimed_profile_id instead of project_id
    score: result.resilienceScore,
    commit_velocity: result.commitVelocity,
    days_last_commit: result.daysSinceLastCommit,
    breakdown: { ... },
  });
```

### Frontend Hook Update

Update `useScoreHistory.ts` to query by `claimed_profile_id`:

```typescript
export function useScoreHistory(projectId: string, limit = 12) {
  return useQuery({
    queryKey: ['score-history', projectId, limit],
    queryFn: async (): Promise<DBScoreHistory[]> => {
      const { data, error } = await supabase
        .from('score_history')
        .select('*')
        .or(`project_id.eq.${projectId},claimed_profile_id.eq.${projectId}`)
        .order('snapshot_date', { ascending: false })
        .limit(limit);
      // ... rest of the function
    },
    // ...
  });
}
```

### Type Update

Add `claimed_profile_id` to `DBScoreHistory` in `src/types/database.ts`.

---

## Files to Modify

1. **Database Migration**: Add `claimed_profile_id` column and adjust constraints
2. **`supabase/functions/analyze-github-repo/index.ts`**: Use `claimed_profile_id` for insert
3. **`src/hooks/useScoreHistory.ts`**: Query by both `project_id` and `claimed_profile_id`
4. **`src/types/database.ts`**: Add new field to type definition

---

## Expected Outcome

After implementation:
1. Manual refresh will successfully insert a row into `score_history`
2. The Score History chart will display the current score point
3. Over time, as more refreshes occur, the chart will show the score trend line
