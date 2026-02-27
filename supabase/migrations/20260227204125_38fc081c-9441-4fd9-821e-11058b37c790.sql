
-- Create bounties table for the Bounty Board
CREATE TABLE public.bounties (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  realm_dao_address text NOT NULL,
  title text NOT NULL,
  description text,
  reward_sol numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  creator_profile_id uuid NOT NULL,
  creator_x_user_id text NOT NULL,
  claimer_profile_id uuid,
  claimer_x_user_id text,
  claimer_wallet text,
  evidence_summary text,
  evidence_links jsonb DEFAULT '[]'::jsonb,
  linked_milestone_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  submitted_at timestamptz,
  resolved_at timestamptz
);

-- Enable RLS
ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;

-- Public read for all bounties
CREATE POLICY "Bounties are publicly readable"
  ON public.bounties FOR SELECT
  USING (true);

-- Deny direct writes (all mutations go through edge function with service role)
CREATE POLICY "No direct inserts"
  ON public.bounties FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct updates"
  ON public.bounties FOR UPDATE
  USING (false);

CREATE POLICY "No direct deletes"
  ON public.bounties FOR DELETE
  USING (false);

-- Status validation trigger
CREATE OR REPLACE FUNCTION public.validate_bounty_status()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('open', 'claimed', 'submitted', 'approved', 'rejected', 'paid') THEN
    RAISE EXCEPTION 'Invalid bounty status. Must be: open, claimed, submitted, approved, rejected, or paid';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_bounty_status
  BEFORE INSERT OR UPDATE ON public.bounties
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_bounty_status();

-- Rate limit trigger for bounty_waitlist (5 per email per hour)
CREATE OR REPLACE FUNCTION public.check_bounty_waitlist_rate_limit()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
BEGIN
  IF NEW.email IS NOT NULL THEN
    SELECT count(*) INTO recent_count
    FROM public.bounty_waitlist
    WHERE email = NEW.email
      AND created_at > now() - interval '1 hour';

    IF recent_count >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded: max 5 waitlist signups per hour per email';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_waitlist_rate_limit
  BEFORE INSERT ON public.bounty_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.check_bounty_waitlist_rate_limit();

-- Index for common queries
CREATE INDEX idx_bounties_realm ON public.bounties (realm_dao_address);
CREATE INDEX idx_bounties_status ON public.bounties (status);
CREATE INDEX idx_bounties_creator ON public.bounties (creator_x_user_id);
