

# Fix Remaining Security Vulnerabilities

## Analysis of the Three Findings

### Finding 1: "Project Owner Contact Information Could Be Harvested"
**Status: Already resolved.** GitHub tokens were migrated to `profile_secrets` in a previous fix. A database query confirms zero tokens remain in `claimed_profiles`. Wallet addresses were already reviewed and marked as accepted (public blockchain data required for SIWS verification). No action needed.

### Finding 2: "Subscriber Email Addresses Could Be Stolen"
**Status: Already secure.** The `project_subscribers` table has no SELECT policy -- meaning no client can read emails. Only INSERT is allowed (for subscription). No action needed.

### Finding 3: "Chat History Could Be Accessed by Wrong Users" -- CRITICAL
**Status: Actively vulnerable.** This is a real, exploitable bug.

The RLS policies on `chat_conversations` use `user_id = user_id`, which is a **column comparing to itself** (always true when not null). This means **any request can read, update, or delete ALL conversations**. The `chat_messages` policies similarly check only `c.user_id IS NOT NULL`, granting universal access.

Additionally, the app uses X (Twitter) OAuth with localStorage-based sessions -- **not** Supabase Auth. This means `auth.uid()` returns null for all requests, making traditional RLS comparisons impossible.

---

## Fix for Finding 3: Secure Chat via Edge Function

Since there is no Supabase Auth session, RLS alone cannot verify user identity. The fix is to:

1. **Lock down both chat tables** with deny-all policies (like we did for `claim_blacklist`)
2. **Create one new edge function** (`chat-history`) that handles all chat CRUD operations using `service_role`, verifying the user's X identity from the request
3. **Update the frontend** to call the edge function instead of querying the tables directly

### Database Migration

```sql
-- Drop broken policies on chat_conversations
DROP POLICY IF EXISTS "Users can read own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.chat_conversations;

-- Drop broken policies on chat_messages
DROP POLICY IF EXISTS "Users can read messages of own conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages to own conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update own messages feedback" ON public.chat_messages;

-- Deny all direct client access (service_role bypasses RLS)
CREATE POLICY "No direct access" ON public.chat_conversations FOR ALL USING (false);
CREATE POLICY "No direct access" ON public.chat_messages FOR ALL USING (false);
```

### New Edge Function: `chat-history`

Handles these operations via query parameter `action`:

- `GET ?action=list&user_id=X` -- List user's conversations
- `GET ?action=messages&conversation_id=X&user_id=X` -- Load messages (verifies ownership)
- `POST ?action=create` -- Create conversation (body: `{user_id, title}`)
- `POST ?action=message` -- Save a message (body: `{conversation_id, user_id, role, content}`)
- `POST ?action=feedback` -- Update feedback (body: `{message_id, user_id, feedback}`)
- `DELETE ?action=delete&conversation_id=X&user_id=X` -- Delete conversation (verifies ownership)

All operations verify that the `user_id` in the request matches the `user_id` on the conversation record before allowing access.

### Frontend Changes

**Files modified:**
- `src/components/gpt/ChatSidebar.tsx` -- Replace direct Supabase queries with edge function calls
- `src/pages/ResilienceGPT.tsx` -- Replace `saveMessageToDb`, `createConversation`, `loadConversation`, and `handleFeedback` to use edge function

**New file:**
- `supabase/functions/chat-history/index.ts`

**Config update:**
- `supabase/config.toml` -- Add `[functions.chat-history]` with `verify_jwt = false`

### What Does NOT Change

- The `chat-gpt` edge function (handles AI responses) remains untouched
- Chat streaming logic stays the same
- Anonymous/guest localStorage chat is unaffected
- No changes to the claim flow, profiles, or any other feature

### Security Note

This approach is not cryptographically verified (the X user ID is passed from the client). However, it is a significant improvement over the current state where **any** request can access **all** conversations. A proper solution would require server-side session tokens, which is a larger architectural change that can be planned separately.

