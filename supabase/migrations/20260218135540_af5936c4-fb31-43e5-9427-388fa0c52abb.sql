-- Drop the function-based index that JS client can't target
DROP INDEX IF EXISTS idx_score_history_profile_day;

-- Add a date column for clean deduplication
ALTER TABLE score_history ADD COLUMN IF NOT EXISTS snapshot_day date 
  GENERATED ALWAYS AS ((snapshot_date AT TIME ZONE 'UTC')::date) STORED;

-- Create unique constraint on the generated column (JS client can target this)
CREATE UNIQUE INDEX idx_score_history_profile_day 
  ON score_history (claimed_profile_id, snapshot_day) 
  WHERE claimed_profile_id IS NOT NULL;