
-- Create project_subscribers table for email collection
CREATE TABLE public.project_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.claimed_profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz
);

-- Unique constraint to prevent duplicate subscriptions
ALTER TABLE public.project_subscribers ADD CONSTRAINT unique_profile_email UNIQUE (profile_id, email);

-- Enable RLS
ALTER TABLE public.project_subscribers ENABLE ROW LEVEL SECURITY;

-- Public INSERT policy: anyone can subscribe with a valid email
CREATE POLICY "Anyone can subscribe"
  ON public.project_subscribers
  FOR INSERT
  WITH CHECK (email IS NOT NULL AND email <> '' AND length(email) <= 255);

-- No public SELECT/UPDATE/DELETE - subscriber lists are private
-- Service role bypasses RLS for future email sending
