
-- Add escrow/proposal columns to bounties table
ALTER TABLE public.bounties
  ADD COLUMN IF NOT EXISTS escrow_address text,
  ADD COLUMN IF NOT EXISTS escrow_tx_signature text,
  ADD COLUMN IF NOT EXISTS release_tx_signature text,
  ADD COLUMN IF NOT EXISTS proposal_address text,
  ADD COLUMN IF NOT EXISTS governance_pda text,
  ADD COLUMN IF NOT EXISTS funded_at timestamptz,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Update the bounty status validation trigger to include new statuses
CREATE OR REPLACE FUNCTION public.validate_bounty_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status NOT IN ('open', 'claimed', 'submitted', 'approved', 'rejected', 'paid', 'funded', 'voting') THEN
    RAISE EXCEPTION 'Invalid bounty status. Must be: open, claimed, submitted, approved, rejected, paid, funded, or voting';
  END IF;
  RETURN NEW;
END;
$function$;
