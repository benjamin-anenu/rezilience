
-- Create bounty_waitlist table
CREATE TABLE public.bounty_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  wallet_address text,
  x_user_id text,
  x_username text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bounty_waitlist_unique_email UNIQUE (email)
);

ALTER TABLE public.bounty_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON public.bounty_waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "No public reads"
  ON public.bounty_waitlist FOR SELECT
  USING (false);

-- Drop and recreate view with Realms columns
DROP VIEW IF EXISTS public.claimed_profiles_public;

CREATE VIEW public.claimed_profiles_public AS
SELECT
  id, project_id, media_assets, milestones, verified, verified_at,
  created_at, updated_at, resilience_score,
  github_stars, github_forks, github_contributors, github_languages,
  github_last_commit, github_commit_velocity, github_commits_30d,
  github_releases_30d, github_open_issues, github_topics,
  github_top_contributors, github_recent_events, github_is_fork,
  github_analyzed_at, github_push_events_30d, github_pr_events_30d,
  github_issue_events_30d, github_last_activity,
  bytecode_verified_at, bytecode_deploy_slot,
  build_in_public_videos,
  twitter_followers, twitter_engagement_rate, twitter_recent_tweets, twitter_last_synced,
  team_members,
  dependency_health_score, dependency_outdated_count, dependency_critical_count, dependency_analyzed_at,
  governance_tx_30d, governance_last_activity, governance_analyzed_at,
  tvl_usd, tvl_market_share, tvl_risk_ratio, tvl_analyzed_at,
  integrated_score, score_breakdown,
  vulnerability_count, vulnerability_details, vulnerability_analyzed_at,
  openssf_score, openssf_checks, openssf_analyzed_at,
  project_name, description, category,
  website_url, logo_url, program_id,
  github_org_url, github_username,
  x_user_id, x_username, discord_url, telegram_url,
  liveness_status, github_language, github_homepage,
  bytecode_hash, bytecode_match_status, bytecode_confidence, bytecode_on_chain_hash,
  staking_pitch, governance_address, claim_status, country, discovery_source,
  x_avatar_url, x_display_name,
  realms_dao_address, realms_delivery_rate, realms_proposals_total,
  realms_proposals_completed, realms_proposals_active,
  realms_last_proposal, realms_analyzed_at
FROM claimed_profiles;
