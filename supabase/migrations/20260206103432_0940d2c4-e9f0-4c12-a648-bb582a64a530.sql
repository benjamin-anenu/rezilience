-- Add extended GitHub analytics columns to claimed_profiles table
ALTER TABLE public.claimed_profiles
ADD COLUMN IF NOT EXISTS github_stars integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_forks integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_contributors integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_language varchar,
ADD COLUMN IF NOT EXISTS github_last_commit timestamptz,
ADD COLUMN IF NOT EXISTS github_commit_velocity numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_commits_30d integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_releases_30d integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_open_issues integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_topics jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS github_top_contributors jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS github_recent_events jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS github_is_fork boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS github_homepage varchar,
ADD COLUMN IF NOT EXISTS github_analyzed_at timestamptz;