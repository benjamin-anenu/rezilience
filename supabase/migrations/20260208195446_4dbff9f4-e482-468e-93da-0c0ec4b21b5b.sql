-- Add authority verification fields to claimed_profiles
ALTER TABLE public.claimed_profiles 
ADD COLUMN IF NOT EXISTS authority_wallet TEXT,
ADD COLUMN IF NOT EXISTS authority_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS authority_signature TEXT,
ADD COLUMN IF NOT EXISTS authority_type TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.claimed_profiles.authority_wallet IS 'The verified on-chain upgrade authority wallet address';
COMMENT ON COLUMN public.claimed_profiles.authority_verified_at IS 'Timestamp when authority was cryptographically verified';
COMMENT ON COLUMN public.claimed_profiles.authority_signature IS 'SIWS signature for audit trail';
COMMENT ON COLUMN public.claimed_profiles.authority_type IS 'Type: direct, multisig, or immutable';