-- Add multisig tracking fields to claimed_profiles
ALTER TABLE public.claimed_profiles
ADD COLUMN IF NOT EXISTS multisig_address TEXT,
ADD COLUMN IF NOT EXISTS squads_version TEXT,
ADD COLUMN IF NOT EXISTS multisig_verified_via TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.claimed_profiles.multisig_address IS 'Squads multisig PDA if program is controlled by a multisig';
COMMENT ON COLUMN public.claimed_profiles.squads_version IS 'Squads protocol version: v3, v4, or null';
COMMENT ON COLUMN public.claimed_profiles.multisig_verified_via IS 'Verification method: member_signature, transaction_proof, or manual_review';