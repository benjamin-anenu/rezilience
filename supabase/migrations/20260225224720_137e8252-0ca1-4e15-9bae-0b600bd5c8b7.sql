
-- Add Realms DAO accountability columns to claimed_profiles
ALTER TABLE public.claimed_profiles
  ADD COLUMN IF NOT EXISTS realms_dao_address text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS realms_proposals_total integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS realms_proposals_completed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS realms_proposals_active integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS realms_delivery_rate numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS realms_last_proposal timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS realms_analyzed_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS realms_raw_data jsonb DEFAULT '[]'::jsonb;
