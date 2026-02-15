
-- Remove duplicate rows first (keep the latest per profile per day)
DELETE FROM score_history a USING score_history b
WHERE a.id < b.id
  AND a.claimed_profile_id IS NOT NULL
  AND a.claimed_profile_id = b.claimed_profile_id
  AND date_trunc('day', a.snapshot_date) = date_trunc('day', b.snapshot_date);

-- Create an immutable helper function for extracting date
CREATE OR REPLACE FUNCTION public.snapshot_date_day(ts timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = 'public'
AS $$
  SELECT (ts AT TIME ZONE 'UTC')::date;
$$;

-- Add unique index using the immutable function
CREATE UNIQUE INDEX idx_score_history_profile_day
  ON score_history (claimed_profile_id, snapshot_date_day(snapshot_date))
  WHERE claimed_profile_id IS NOT NULL;
