-- Deny all direct access to claim_blacklist (service_role bypasses RLS)
CREATE POLICY "No public access to blacklist"
  ON public.claim_blacklist FOR SELECT
  USING (false);

-- Deny all direct access to profile_secrets (service_role bypasses RLS)
CREATE POLICY "No public access to secrets"
  ON public.profile_secrets FOR SELECT
  USING (false);