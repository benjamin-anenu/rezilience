
-- Add release_mode and milestones columns to bounties
ALTER TABLE public.bounties
  ADD COLUMN release_mode text NOT NULL DEFAULT 'dao_governed',
  ADD COLUMN milestones jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Validation trigger for release_mode
CREATE OR REPLACE FUNCTION public.validate_bounty_release_mode()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.release_mode NOT IN ('dao_governed', 'direct', 'multisig') THEN
    RAISE EXCEPTION 'Invalid release_mode. Must be: dao_governed, direct, or multisig';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_validate_bounty_release_mode
  BEFORE INSERT OR UPDATE ON public.bounties
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_bounty_release_mode();
