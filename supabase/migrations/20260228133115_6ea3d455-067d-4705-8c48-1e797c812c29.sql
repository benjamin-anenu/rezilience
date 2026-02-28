
-- 1. Create funding_proposals table
CREATE TABLE public.funding_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.claimed_profiles(id),
  realm_dao_address TEXT NOT NULL,
  requested_sol NUMERIC NOT NULL DEFAULT 0,
  milestone_allocations JSONB NOT NULL DEFAULT '[]'::jsonb,
  proposal_address TEXT,
  proposal_tx TEXT,
  status TEXT NOT NULL DEFAULT 'pending_signature',
  funded_at TIMESTAMPTZ,
  escrow_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.funding_proposals ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Funding proposals are publicly readable"
  ON public.funding_proposals FOR SELECT
  USING (true);

-- No direct client writes (service role only)
CREATE POLICY "No direct inserts"
  ON public.funding_proposals FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct updates"
  ON public.funding_proposals FOR UPDATE
  USING (false);

CREATE POLICY "No direct deletes"
  ON public.funding_proposals FOR DELETE
  USING (false);

-- Trigger for updated_at
CREATE TRIGGER update_funding_proposals_updated_at
  BEFORE UPDATE ON public.funding_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Validate status
CREATE OR REPLACE FUNCTION public.validate_funding_proposal_status()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('pending_signature', 'voting', 'accepted', 'rejected', 'funded', 'completed') THEN
    RAISE EXCEPTION 'Invalid funding proposal status';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_funding_proposal_status_trigger
  BEFORE INSERT OR UPDATE ON public.funding_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_funding_proposal_status();

-- 2. Add columns to claimed_profiles
ALTER TABLE public.claimed_profiles
  ADD COLUMN IF NOT EXISTS funding_requested_sol NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS funding_status TEXT DEFAULT NULL;

-- 3. Recreate public view with new columns
DROP VIEW IF EXISTS public.claimed_profiles_public;
CREATE VIEW public.claimed_profiles_public AS
SELECT
  id, project_id, project_name, description, category,
  website_url, logo_url, program_id,
  github_org_url, github_username, x_user_id, x_username,
  discord_url, telegram_url,
  liveness_status, github_language, github_homepage,
  media_assets, milestones, verified, verified_at,
  created_at, updated_at, resilience_score,
  github_stars, github_forks, github_contributors, github_languages,
  github_last_commit, github_commit_velocity, github_commits_30d,
  github_releases_30d, github_open_issues, github_topics,
  github_top_contributors, github_recent_events, github_is_fork,
  github_analyzed_at, github_push_events_30d, github_pr_events_30d,
  github_issue_events_30d, github_last_activity,
  bytecode_hash, bytecode_match_status, bytecode_verified_at,
  bytecode_deploy_slot, bytecode_confidence, bytecode_on_chain_hash,
  build_in_public_videos, twitter_followers, twitter_engagement_rate,
  twitter_recent_tweets, twitter_last_synced, team_members,
  dependency_health_score, dependency_outdated_count, dependency_critical_count,
  dependency_analyzed_at,
  governance_address, governance_tx_30d, governance_last_activity, governance_analyzed_at,
  tvl_usd, tvl_market_share, tvl_risk_ratio, tvl_analyzed_at,
  integrated_score, score_breakdown,
  staking_pitch, claim_status, country, discovery_source,
  x_avatar_url, x_display_name,
  vulnerability_count, vulnerability_details, vulnerability_analyzed_at,
  openssf_score, openssf_checks, openssf_analyzed_at,
  realms_dao_address, realms_proposals_total, realms_proposals_completed,
  realms_proposals_active, realms_delivery_rate, realms_last_proposal,
  realms_analyzed_at,
  funding_requested_sol, funding_status
FROM public.claimed_profiles
WHERE verified = true OR claim_status = 'unclaimed';
