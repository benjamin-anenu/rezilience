-- Add vulnerability and security posture columns to claimed_profiles
ALTER TABLE public.claimed_profiles
  ADD COLUMN IF NOT EXISTS vulnerability_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vulnerability_details jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS vulnerability_analyzed_at timestamptz,
  ADD COLUMN IF NOT EXISTS openssf_score numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS openssf_checks jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS openssf_analyzed_at timestamptz;