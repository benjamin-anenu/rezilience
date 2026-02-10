
-- Add bytecode hardening columns to claimed_profiles
ALTER TABLE public.claimed_profiles 
  ADD COLUMN IF NOT EXISTS bytecode_deploy_slot bigint,
  ADD COLUMN IF NOT EXISTS bytecode_on_chain_hash text,
  ADD COLUMN IF NOT EXISTS bytecode_confidence text;

-- Add a comment for documentation
COMMENT ON COLUMN public.claimed_profiles.bytecode_deploy_slot IS 'Last deployment slot from programData account, used for upgrade detection';
COMMENT ON COLUMN public.claimed_profiles.bytecode_on_chain_hash IS 'SHA-256 hash of actual on-chain executable bytecode from programData';
COMMENT ON COLUMN public.claimed_profiles.bytecode_confidence IS 'Verification confidence tier: HIGH, MEDIUM, LOW, SUSPICIOUS, NOT_DEPLOYED';
