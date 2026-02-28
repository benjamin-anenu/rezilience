
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_x_user_id text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  bounty_id uuid,
  profile_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications (matched via X user ID in JWT or passed param)
-- Since we use X auth (not Supabase auth), we use service-role for writes
-- and allow public read filtered by recipient (edge function will handle auth)
CREATE POLICY "No direct client reads" ON public.notifications FOR SELECT USING (false);
CREATE POLICY "No direct client inserts" ON public.notifications FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct client updates" ON public.notifications FOR UPDATE USING (false);
CREATE POLICY "No direct client deletes" ON public.notifications FOR DELETE USING (false);

-- Index for fast unread queries
CREATE INDEX idx_notifications_recipient_read ON public.notifications (recipient_x_user_id, read);
CREATE INDEX idx_notifications_created_at ON public.notifications (created_at DESC);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
