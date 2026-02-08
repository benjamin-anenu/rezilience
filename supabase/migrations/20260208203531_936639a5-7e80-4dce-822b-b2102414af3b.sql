-- Create claim_blacklist table to track failed claim attempts
CREATE TABLE public.claim_blacklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.claimed_profiles(id) ON DELETE CASCADE,
  wallet_address VARCHAR NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  first_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_permanent_ban BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint: one record per wallet per profile
  CONSTRAINT unique_wallet_profile UNIQUE (profile_id, wallet_address)
);

-- Enable Row Level Security
ALTER TABLE public.claim_blacklist ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (edge functions)
-- No client-side access policies

-- Create index for fast lookups
CREATE INDEX idx_claim_blacklist_wallet ON public.claim_blacklist(wallet_address);
CREATE INDEX idx_claim_blacklist_profile ON public.claim_blacklist(profile_id);

-- Insert Drift Protocol as first unclaimed profile
INSERT INTO public.claimed_profiles (
  project_name,
  description,
  category,
  program_id,
  github_org_url,
  website_url,
  claim_status,
  verified,
  resilience_score,
  liveness_status
) VALUES (
  'Drift Protocol V2',
  'Perpetual futures, spot DEX, and lending with cross-margin',
  'defi',
  'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH',
  'https://github.com/drift-labs/protocol-v2',
  'https://drift.trade',
  'unclaimed',
  false,
  0,
  'STALE'
);