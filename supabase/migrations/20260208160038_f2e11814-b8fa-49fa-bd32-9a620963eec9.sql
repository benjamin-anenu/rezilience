-- Phase 1: Add claim_status column for unclaimed registry support
ALTER TABLE claimed_profiles 
ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'claimed';

-- Add check constraint for valid claim_status values
-- Using a trigger instead of CHECK constraint for better flexibility
CREATE OR REPLACE FUNCTION public.validate_claim_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.claim_status NOT IN ('claimed', 'unclaimed', 'pending') THEN
    RAISE EXCEPTION 'Invalid claim_status value. Must be: claimed, unclaimed, or pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for claim_status validation
DROP TRIGGER IF EXISTS validate_claim_status_trigger ON claimed_profiles;
CREATE TRIGGER validate_claim_status_trigger
BEFORE INSERT OR UPDATE ON claimed_profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_claim_status();

-- Add discovered_at timestamp for tracking when unclaimed programs were indexed
ALTER TABLE claimed_profiles 
ADD COLUMN IF NOT EXISTS discovered_at TIMESTAMPTZ;