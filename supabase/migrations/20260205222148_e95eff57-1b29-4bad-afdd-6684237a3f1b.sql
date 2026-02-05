-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "Anyone can claim a profile" ON public.claimed_profiles;

-- Create a more restrictive insert policy - must provide a claimer_wallet
CREATE POLICY "Users can claim profiles with their wallet"
ON public.claimed_profiles
FOR INSERT
WITH CHECK (claimer_wallet IS NOT NULL AND claimer_wallet != '');