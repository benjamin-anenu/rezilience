-- Add country column to claimed_profiles
ALTER TABLE claimed_profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Create function to get score changes for movement indicators
CREATE OR REPLACE FUNCTION get_score_changes(profile_ids UUID[])
RETURNS TABLE(profile_id UUID, movement TEXT) 
LANGUAGE SQL
STABLE
AS $$
  WITH ranked_scores AS (
    SELECT 
      claimed_profile_id,
      score,
      ROW_NUMBER() OVER (PARTITION BY claimed_profile_id ORDER BY snapshot_date DESC) as rn
    FROM score_history
    WHERE claimed_profile_id = ANY(profile_ids)
  ),
  current_scores AS (
    SELECT claimed_profile_id, score FROM ranked_scores WHERE rn = 1
  ),
  previous_scores AS (
    SELECT claimed_profile_id, score FROM ranked_scores WHERE rn = 2
  )
  SELECT 
    curr.claimed_profile_id as profile_id,
    CASE 
      WHEN prev.score IS NULL THEN 'new'
      WHEN curr.score > prev.score THEN 'up'
      WHEN curr.score < prev.score THEN 'down'
      ELSE 'stable'
    END as movement
  FROM current_scores curr
  LEFT JOIN previous_scores prev ON curr.claimed_profile_id = prev.claimed_profile_id;
$$;