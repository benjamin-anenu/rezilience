-- Add multi-signal activity tracking columns to claimed_profiles
ALTER TABLE public.claimed_profiles
ADD COLUMN IF NOT EXISTS github_push_events_30d integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_pr_events_30d integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_issue_events_30d integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_last_activity timestamp with time zone;