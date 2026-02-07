-- Add team_members and staking_pitch columns to claimed_profiles
ALTER TABLE public.claimed_profiles 
ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS staking_pitch TEXT;