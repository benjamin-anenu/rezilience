
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
