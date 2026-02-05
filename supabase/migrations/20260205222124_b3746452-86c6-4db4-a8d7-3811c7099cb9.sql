-- Create claimed_profiles table to persist verified project profiles
CREATE TABLE public.claimed_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Identity
  project_name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR,
  website_url VARCHAR,
  logo_url VARCHAR,
  
  -- On-chain identity (optional)
  program_id VARCHAR,
  wallet_address VARCHAR,
  
  -- GitHub verification (required)
  github_org_url VARCHAR,
  github_username VARCHAR,
  
  -- X/Twitter verification
  x_user_id VARCHAR,
  x_username VARCHAR,
  
  -- Social links
  discord_url VARCHAR,
  telegram_url VARCHAR,
  
  -- Media assets stored as JSONB array
  media_assets JSONB DEFAULT '[]'::jsonb,
  
  -- Roadmap milestones stored as JSONB array
  milestones JSONB DEFAULT '[]'::jsonb,
  
  -- Verification status
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Claiming wallet (who claimed this profile)
  claimer_wallet VARCHAR,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.claimed_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read verified profiles
CREATE POLICY "Verified profiles are publicly readable"
ON public.claimed_profiles
FOR SELECT
USING (verified = true);

-- Claimer can read their own unverified profiles
CREATE POLICY "Claimers can read their own profiles"
ON public.claimed_profiles
FOR SELECT
USING (claimer_wallet IS NOT NULL);

-- Anyone can insert (claim) a profile
CREATE POLICY "Anyone can claim a profile"
ON public.claimed_profiles
FOR INSERT
WITH CHECK (true);

-- Claimer can update their own profile
CREATE POLICY "Claimers can update their own profiles"
ON public.claimed_profiles
FOR UPDATE
USING (claimer_wallet IS NOT NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_claimed_profiles_updated_at
BEFORE UPDATE ON public.claimed_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_claimed_profiles_project_id ON public.claimed_profiles(project_id);
CREATE INDEX idx_claimed_profiles_program_id ON public.claimed_profiles(program_id);
CREATE INDEX idx_claimed_profiles_github_username ON public.claimed_profiles(github_username);