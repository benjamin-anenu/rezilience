
-- 1. Explicit deny-all SELECT on project_subscribers
CREATE POLICY "No public read access"
  ON public.project_subscribers FOR SELECT
  USING (false);

-- 2. Create a public view that excludes sensitive wallet/auth fields
CREATE VIEW public.claimed_profiles_public
WITH (security_invoker = on) AS
  SELECT
    id, project_name, description, category, website_url, logo_url,
    program_id, project_id, github_org_url, github_username,
    x_user_id, x_username, discord_url, telegram_url,
    media_assets, milestones, verified, verified_at,
    created_at, updated_at, resilience_score, liveness_status,
    github_stars, github_forks, github_contributors, github_language,
    github_languages, github_last_commit, github_commit_velocity,
    github_commits_30d, github_releases_30d, github_open_issues,
    github_topics, github_top_contributors, github_recent_events,
    github_is_fork, github_homepage, github_analyzed_at,
    github_push_events_30d, github_pr_events_30d, github_issue_events_30d,
    github_last_activity, bytecode_hash, bytecode_verified_at,
    bytecode_match_status, bytecode_confidence, bytecode_deploy_slot,
    bytecode_on_chain_hash, build_in_public_videos,
    twitter_followers, twitter_engagement_rate, twitter_recent_tweets,
    twitter_last_synced, team_members, staking_pitch,
    dependency_health_score, dependency_outdated_count,
    dependency_critical_count, dependency_analyzed_at,
    governance_tx_30d, governance_address, governance_last_activity,
    governance_analyzed_at, tvl_usd, tvl_market_share, tvl_risk_ratio,
    tvl_analyzed_at, integrated_score, score_breakdown, claim_status,
    vulnerability_count, vulnerability_details, vulnerability_analyzed_at,
    openssf_score, openssf_checks, openssf_analyzed_at,
    country, discovery_source
  FROM public.claimed_profiles;
