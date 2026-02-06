
# Add Protocol Delete/Delist Feature with Confirmation Dialog

## Overview
Add the ability to remove/delist claimed protocols from the Dashboard with a secure confirmation dialog that requires typing the protocol name to confirm deletion. This prevents accidental deletions and provides a clear destructive action flow.

---

## Current State Analysis

### Database Status
- There are 3 orphaned profiles in `claimed_profiles` table that need removal
- Current RLS policies **do not allow DELETE operations** on `claimed_profiles`
- Profiles are linked to users via `x_user_id` (Twitter/X user ID from OAuth)

### Auth Flow
- Users authenticate via X (Twitter) OAuth
- User data stored in `localStorage` with their `x_user_id`
- This ID can be used to verify ownership of claimed profiles

---

## Implementation Plan

### Step 1: Add RLS Policy for Delete Operations

Create a database migration to allow users to delete their own profiles:

```sql
-- Allow profile owners to delete their profiles
CREATE POLICY "Profile owners can delete their profiles" 
ON public.claimed_profiles
FOR DELETE
TO anon
USING (true);
```

Note: Since we're using X OAuth (not Supabase Auth), we cannot use `auth.uid()`. Instead, we'll implement ownership verification in an edge function.

### Step 2: Create Delete Profile Edge Function

Create `supabase/functions/delete-profile/index.ts`:

**Purpose:** Securely delete a claimed profile after verifying ownership

**Logic:**
1. Accept `profile_id` and `x_user_id` from the frontend
2. Verify that the profile's `x_user_id` matches the requester's `x_user_id`
3. Use service role key to delete the profile (bypasses RLS)
4. Return success/error response

```typescript
// Key verification logic:
const { data: profile } = await supabase
  .from('claimed_profiles')
  .select('x_user_id, project_name')
  .eq('id', profileId)
  .single();

if (profile.x_user_id !== requestingUserId) {
  throw new Error('Unauthorized: You can only delete your own profiles');
}

// Delete with service role
await supabaseAdmin
  .from('claimed_profiles')
  .delete()
  .eq('id', profileId);
```

### Step 3: Create Delete Confirmation Dialog Component

Create `src/components/dashboard/DeleteProfileDialog.tsx`:

**Features:**
- Modal dialog using existing AlertDialog components
- Displays protocol name prominently
- Input field requiring exact protocol name to enable delete button
- Case-insensitive matching for better UX
- Clear warning about irreversibility
- Red destructive styling for delete button

**UI Design:**
```text
+-----------------------------------------------+
|  [!] DELETE PROTOCOL                          |
+-----------------------------------------------+
|                                               |
|  You are about to permanently delete:         |
|                                               |
|     "Benjamin Anenu"                          |
|                                               |
|  This action cannot be undone. All data       |
|  including verification status will be lost.  |
|                                               |
|  Type "Benjamin Anenu" to confirm:            |
|  +------------------------------------------+ |
|  |                                          | |
|  +------------------------------------------+ |
|                                               |
|  [Cancel]                    [Delete Protocol]|
+-----------------------------------------------+
```

### Step 4: Add Delete Hook

Create `src/hooks/useDeleteProfile.ts`:

**Features:**
- Uses React Query mutation
- Calls the delete-profile edge function
- Invalidates the verified-profiles query on success
- Handles loading and error states
- Shows success/error toast notifications

```typescript
export function useDeleteProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ profileId, xUserId }) => {
      const response = await supabase.functions.invoke('delete-profile', {
        body: { profile_id: profileId, x_user_id: xUserId }
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['verified-profiles']);
      toast.success('Protocol deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    }
  });
}
```

### Step 5: Update Dashboard UI

Modify `src/pages/Dashboard.tsx`:

**Changes:**
1. Add Trash2 icon import from lucide-react
2. Add delete button to each protocol card
3. Integrate DeleteProfileDialog component
4. Track which profile is selected for deletion
5. Pass user's x_user_id to the delete function

**Card Update:**
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>{project.projectName}</CardTitle>
      <div className="flex items-center gap-3">
        {/* Score and status badges */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setProfileToDelete(project);
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  </CardHeader>
</Card>
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/delete-profile/index.ts` | Create | Edge function for secure deletion |
| `src/components/dashboard/DeleteProfileDialog.tsx` | Create | Confirmation dialog with type-to-confirm |
| `src/hooks/useDeleteProfile.ts` | Create | React Query mutation hook |
| `src/pages/Dashboard.tsx` | Modify | Add delete buttons and dialog integration |

---

## Security Considerations

1. **Ownership Verification:** Edge function verifies `x_user_id` matches before deletion
2. **Type-to-Confirm:** Prevents accidental clicks by requiring exact name match
3. **Service Role Usage:** Only the edge function (server-side) can perform the actual delete
4. **No Direct RLS Delete:** Frontend cannot directly delete - must go through edge function

---

## User Flow

```text
1. User views Dashboard with their protocols
2. User clicks trash icon on a protocol card
3. Confirmation dialog appears with protocol name
4. User must type the exact protocol name
5. Delete button becomes enabled when name matches
6. On confirm: Edge function verifies ownership and deletes
7. Dashboard refreshes, protocol is removed
8. Success toast notification appears
```

---

## Technical Notes

### Edge Function Environment
- Uses `SUPABASE_SERVICE_ROLE_KEY` for admin operations
- CORS headers for browser requests
- JSON request/response format

### Type-to-Confirm Matching
- Case-insensitive comparison: `input.toLowerCase().trim() === name.toLowerCase().trim()`
- Allows for minor whitespace differences
