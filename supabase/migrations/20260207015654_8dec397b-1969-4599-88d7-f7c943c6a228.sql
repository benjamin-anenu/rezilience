-- Phase 2: Twitter Integration Schema
-- Add columns for Build In Public videos and Twitter engagement metrics

ALTER TABLE claimed_profiles
ADD COLUMN IF NOT EXISTS build_in_public_videos JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS twitter_followers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS twitter_engagement_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS twitter_recent_tweets JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS twitter_last_synced TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN claimed_profiles.build_in_public_videos IS 'Array of Twitter video URLs curated by the builder for public showcase';
COMMENT ON COLUMN claimed_profiles.twitter_followers IS 'Cached follower count from Twitter/X API';
COMMENT ON COLUMN claimed_profiles.twitter_engagement_rate IS 'Calculated engagement rate from recent tweets';
COMMENT ON COLUMN claimed_profiles.twitter_recent_tweets IS 'Array of recent tweets with engagement metrics';
COMMENT ON COLUMN claimed_profiles.twitter_last_synced IS 'Last sync timestamp for Twitter data';