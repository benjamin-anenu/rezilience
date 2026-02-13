

# Fix: Subscriber Email & Wallet Address Exposure

## Analysis

### Finding 1: Subscriber Emails
**Current state**: The `project_subscribers` table has RLS enabled with only an INSERT policy. There is **no SELECT policy**, which means no client can read emails. This is already secure by default (RLS denies all operations without an explicit ALLOW policy). However, adding an explicit deny-all SELECT policy makes the intent crystal clear and prevents accidental future changes from opening access.

### Finding 2: Wallet Addresses in `claimed_profiles`
**Current state**: Three SELECT policies allow public reads: verified profiles, unclaimed profiles, and claimer-owned profiles. All queries use `select('*')`, which returns **all 80+ columns** including `claimer_wallet`, `wallet_address`, `authority_wallet`, `authority_signature`, `multisig_address`, and `governance_address`. While no profiles currently have wallet data populated, once profiles are claimed and verified these fields will be exposed.

**Root cause**: Every frontend query fetches `select('*')` instead of explicitly listing needed columns. A database view solves this cleanly -- the frontend queries the view (which excludes sensitive columns), while edge functions using `service_role` can still access the base table directly.

---

## Solution

### Step 1: Database Migration

Add one explicit deny-all SELECT policy and create a public view:

```sql
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
  -- EXCLUDED: claimer_wallet, wallet_address, authority_wallet,
  --           authority_signature, authority_type, multisig_address,
  --           multisig_verified_via, squads_version,
  --           github_access_token, github_token_scope
```

The view inherits RLS from the base table via `security_invoker = on`, so the same read policies apply. Sensitive wallet/auth fields are simply not in the view.

### Step 2: Frontend Changes

Replace `select('*')` queries on `claimed_profiles` with queries on the `claimed_profiles_public` view in these files:

**`src/hooks/useClaimedProfiles.ts`** (6 queries):
- `useClaimedProfile` -- change `.from('claimed_profiles')` to `.from('claimed_profiles_public' as any)`
- `useClaimedProfileByProgramId` -- same
- `useClaimedProfileByProjectId` -- same
- `useMyVerifiedProfiles` -- same
- `useExistingProfile` -- same (only selects `id, verified`, but still routes through view for consistency)
- `useVerifiedProfiles` -- same
- `useUnclaimedProfile` -- same

**`src/hooks/useExplorerProjects.ts`** (1 query):
- Change `.from('claimed_profiles')` to `.from('claimed_profiles_public' as any)`

**`src/hooks/useHeroStats.ts`** (1 query):
- Change `.from('claimed_profiles')` to `.from('claimed_profiles_public' as any)`

**`src/hooks/useEcosystemPulse.ts`** (1 query):
- Change `.from('claimed_profiles')` to `.from('claimed_profiles_public' as any)`

**`src/hooks/useBuildersFeed.ts`** (1 query):
- Change `.from('claimed_profiles')` to `.from('claimed_profiles_public' as any)`

**`src/hooks/useDependencyGraph.ts`** (1 query):
- Change `.from('claimed_profiles')` to `.from('claimed_profiles_public' as any)`

**`src/hooks/useRoadmapStats.ts`** (1 query):
- Change `.from('claimed_profiles')` to `.from('claimed_profiles_public' as any)`

### What Does NOT Change

- **`src/pages/ClaimProfile.tsx`** -- writes via `.insert()` / `.update()` on the base table (needs wallet fields for claim flow) -- unchanged
- **Edge functions** -- all use `service_role` which bypasses RLS and accesses the base table directly -- unchanged
- **Realtime subscription** in `useExplorerProjects` -- subscribes to the base table `claimed_profiles` for change notifications, which is correct -- unchanged
- **`src/hooks/useUpdateProfile.ts`** -- calls the `update-profile` edge function, not direct DB -- unchanged

### Security Finding Updates

- Delete the "subscriber emails exposed" finding (resolved by explicit deny-all policy)
- Update the "wallet addresses exposed" finding to resolved (view excludes sensitive columns)

