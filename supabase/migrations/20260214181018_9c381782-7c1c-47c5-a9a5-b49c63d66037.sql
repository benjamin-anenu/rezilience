
-- 1. Create project-logos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('project-logos', 'project-logos', true);

-- Storage RLS policies for project-logos
CREATE POLICY "Anyone can read logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-logos');

CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-logos');

CREATE POLICY "Users can update their own logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-logos');

CREATE POLICY "Users can delete their own logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-logos');

-- 2. Create ecosystem_trends table
CREATE TABLE public.ecosystem_trends (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  title text NOT NULL,
  description text,
  profile_id uuid REFERENCES public.claimed_profiles(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  priority text NOT NULL DEFAULT 'normal',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_by text NOT NULL DEFAULT 'system'
);

-- RLS for ecosystem_trends
ALTER TABLE public.ecosystem_trends ENABLE ROW LEVEL SECURITY;

-- Public read (excluding expired)
CREATE POLICY "Trends are publicly readable"
ON public.ecosystem_trends FOR SELECT
USING (expires_at IS NULL OR expires_at > now());

-- Only service role / edge functions can insert (no direct client insert)
-- Admin inserts will go through edge function
