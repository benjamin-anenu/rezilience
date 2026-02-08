-- Update RLS policy to allow reading unclaimed profiles
DROP POLICY IF EXISTS "Unclaimed profiles are publicly readable" ON public.claimed_profiles;

CREATE POLICY "Unclaimed profiles are publicly readable"
ON public.claimed_profiles
FOR SELECT
USING (claim_status = 'unclaimed');