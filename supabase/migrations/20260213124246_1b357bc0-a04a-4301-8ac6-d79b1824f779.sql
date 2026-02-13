
-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Bonds are publicly readable" ON public.bonds;

-- Deny all direct reads
CREATE POLICY "No direct bond reads"
  ON public.bonds FOR SELECT
  USING (false);

-- Public view excluding user_wallet
CREATE VIEW public.bonds_public
WITH (security_invoker = on) AS
  SELECT id, project_id, staked_amount, locked_until, created_at, yield_earned
  FROM public.bonds;

-- Rate-limit subscriber inserts per email
CREATE OR REPLACE FUNCTION public.check_subscriber_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.project_subscribers
  WHERE email = NEW.email
    AND subscribed_at > now() - interval '1 hour';

  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 5 subscriptions per hour per email';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_subscriber_rate_limit
  BEFORE INSERT ON public.project_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_subscriber_rate_limit();
