import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ClaimedProfile, MediaAsset, Milestone, BuildInPublicVideo, TwitterTweet, TeamMember } from '@/types';
import type { Json } from '@/integrations/supabase/types';

interface DBClaimedProfile {
  id: string;
  project_name: string;
  description: string | null;
  category: string | null;
  website_url: string | null;
  logo_url: string | null;
  program_id: string | null;
  project_id: string | null;
  wallet_address: string | null;
  claimer_wallet: string | null;
  github_org_url: string | null;
  github_username: string | null;
  x_user_id: string | null;
  x_username: string | null;
  discord_url: string | null;
  telegram_url: string | null;
  media_assets: Json | null;
  milestones: Json | null;
  verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  resilience_score: number | null;
  liveness_status: string | null;
  // Extended GitHub analytics
  github_stars: number | null;
  github_forks: number | null;
  github_contributors: number | null;
  github_language: string | null;
  github_languages: Record<string, number> | null;
  github_last_commit: string | null;
  github_commit_velocity: number | null;
  github_commits_30d: number | null;
  github_releases_30d: number | null;
  github_open_issues: number | null;
  github_topics: Json | null;
  github_top_contributors: Json | null;
  github_recent_events: Json | null;
  github_is_fork: boolean | null;
  github_homepage: string | null;
  github_analyzed_at: string | null;
  // Multi-signal activity fields
  github_push_events_30d: number | null;
  github_pr_events_30d: number | null;
  github_issue_events_30d: number | null;
  github_last_activity: string | null;
  // Bytecode verification (hardened)
  bytecode_hash: string | null;
  bytecode_verified_at: string | null;
  bytecode_match_status: string | null;
  bytecode_confidence: string | null;
  bytecode_deploy_slot: number | null;
  bytecode_on_chain_hash: string | null;
  // Twitter integration (Phase 2)
  build_in_public_videos: Json | null;
  twitter_followers: number | null;
  twitter_engagement_rate: number | null;
  twitter_recent_tweets: Json | null;
  twitter_last_synced: string | null;
  // Team fields
  team_members: Json | null;
  staking_pitch: string | null;
  // Intelligence metrics
  dependency_health_score: number | null;
  dependency_outdated_count: number | null;
  dependency_critical_count: number | null;
  dependency_analyzed_at: string | null;
  governance_tx_30d: number | null;
  governance_address: string | null;
  governance_last_activity: string | null;
  governance_analyzed_at: string | null;
  tvl_usd: number | null;
  tvl_market_share: number | null;
  tvl_risk_ratio: number | null;
  tvl_analyzed_at: string | null;
  integrated_score: number | null;
  score_breakdown: Json | null;
  claim_status: string | null;
}

// Transform database format to frontend ClaimedProfile format
function transformToClaimedProfile(db: DBClaimedProfile): ClaimedProfile {
  return {
    id: db.id,
    projectName: db.project_name,
    description: db.description || undefined,
    category: (db.category as ClaimedProfile['category']) || 'other',
    websiteUrl: db.website_url || undefined,
    logoUrl: db.logo_url || undefined,
    programId: db.program_id || undefined,
    walletAddress: db.wallet_address || undefined,
    xUserId: db.x_user_id || '',
    xUsername: db.x_username || '',
    githubOrgUrl: db.github_org_url || '',
    githubUsername: db.github_username || undefined,
    socials: {
      xHandle: db.x_username || undefined,
      discordUrl: db.discord_url || undefined,
      telegramUrl: db.telegram_url || undefined,
    },
    mediaAssets: (Array.isArray(db.media_assets) ? db.media_assets : []) as unknown as MediaAsset[],
    milestones: (Array.isArray(db.milestones) ? db.milestones : []) as unknown as Milestone[],
    verified: db.verified,
    verifiedAt: db.verified_at || db.created_at,
    score: db.resilience_score ?? 0,
    livenessStatus: (db.liveness_status?.toLowerCase() as 'active' | 'dormant' | 'degraded') || 'active',
    // Extended GitHub analytics
    githubAnalytics: {
      github_org_url: db.github_org_url || undefined,
      github_stars: db.github_stars ?? undefined,
      github_forks: db.github_forks ?? undefined,
      github_contributors: db.github_contributors ?? undefined,
      github_language: db.github_language || undefined,
      github_languages: (db.github_languages && typeof db.github_languages === 'object' && !Array.isArray(db.github_languages))
        ? db.github_languages as Record<string, number>
        : undefined,
      github_last_commit: db.github_last_commit || undefined,
      github_commit_velocity: db.github_commit_velocity ?? undefined,
      github_commits_30d: db.github_commits_30d ?? undefined,
      github_releases_30d: db.github_releases_30d ?? undefined,
      github_open_issues: db.github_open_issues ?? undefined,
      github_topics: (Array.isArray(db.github_topics) ? db.github_topics : []) as string[],
      github_top_contributors: (Array.isArray(db.github_top_contributors) ? db.github_top_contributors : []) as Array<{ login: string; contributions: number; avatar: string }>,
      github_recent_events: (Array.isArray(db.github_recent_events) ? db.github_recent_events : []).map((e: any) => ({ ...e, createdAt: e.date || e.createdAt })) as Array<{ type: string; actor: string; date: string; createdAt: string; message?: string }>,
      github_analyzed_at: db.github_analyzed_at || undefined,
      github_is_fork: db.github_is_fork ?? undefined,
      // Multi-signal activity fields
      github_push_events_30d: db.github_push_events_30d ?? undefined,
      github_pr_events_30d: db.github_pr_events_30d ?? undefined,
      github_issue_events_30d: db.github_issue_events_30d ?? undefined,
      github_last_activity: db.github_last_activity || undefined,
    },
    // Bytecode verification (hardened)
    bytecodeHash: db.bytecode_hash || undefined,
    bytecodeVerifiedAt: db.bytecode_verified_at || undefined,
    bytecodeMatchStatus: (db.bytecode_match_status as ClaimedProfile['bytecodeMatchStatus']) || undefined,
    bytecodeConfidence: (db.bytecode_confidence as ClaimedProfile['bytecodeConfidence']) || undefined,
    bytecodeDeploySlot: db.bytecode_deploy_slot ?? undefined,
    bytecodeOnChainHash: db.bytecode_on_chain_hash || undefined,
    // Build In Public & Twitter Integration
    buildInPublicVideos: (Array.isArray(db.build_in_public_videos) ? db.build_in_public_videos : []) as unknown as BuildInPublicVideo[],
    twitterMetrics: {
      followers: db.twitter_followers ?? 0,
      engagementRate: db.twitter_engagement_rate ?? 0,
      recentTweets: (Array.isArray(db.twitter_recent_tweets) ? db.twitter_recent_tweets : []) as unknown as TwitterTweet[],
      lastSynced: db.twitter_last_synced || undefined,
    },
    // Team Section
    teamMembers: (Array.isArray(db.team_members) ? db.team_members : []) as unknown as TeamMember[],
    stakingPitch: db.staking_pitch || undefined,
    // Intelligence metrics
    scoreBreakdown: (db.score_breakdown && typeof db.score_breakdown === 'object' && !Array.isArray(db.score_breakdown)) 
      ? db.score_breakdown as unknown as ClaimedProfile['scoreBreakdown']
      : undefined,
    dependencyMetrics: {
      dependency_health_score: db.dependency_health_score ?? 50,
      dependency_outdated_count: db.dependency_outdated_count ?? 0,
      dependency_critical_count: db.dependency_critical_count ?? 0,
      dependency_analyzed_at: db.dependency_analyzed_at || undefined,
    },
    governanceMetrics: {
      governance_address: db.governance_address || undefined,
      governance_tx_30d: db.governance_tx_30d ?? 0,
      governance_last_activity: db.governance_last_activity || undefined,
      governance_analyzed_at: db.governance_analyzed_at || undefined,
    },
    tvlMetrics: {
      tvl_usd: db.tvl_usd ?? 0,
      tvl_market_share: db.tvl_market_share ?? 0,
      tvl_risk_ratio: db.tvl_risk_ratio ?? 0,
      tvl_analyzed_at: db.tvl_analyzed_at || undefined,
    },
    integratedScore: db.integrated_score ?? db.resilience_score ?? 0,
    claimStatus: (db.claim_status as 'claimed' | 'unclaimed' | 'pending') || 'claimed',
  };
}

/**
 * Fetch a claimed profile by its UUID
 */
export function useClaimedProfile(profileId: string) {
  return useQuery({
    queryKey: ['claimed-profile', profileId],
    queryFn: async (): Promise<ClaimedProfile | null> => {
      const { data, error } = await supabase
        .from('claimed_profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching claimed profile:', error);
        throw error;
      }

      if (!data) return null;

      return transformToClaimedProfile(data as unknown as DBClaimedProfile);
    },
    enabled: !!profileId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch a claimed profile by program_id (Solana address)
 */
export function useClaimedProfileByProgramId(programId: string) {
  return useQuery({
    queryKey: ['claimed-profile-by-program', programId],
    queryFn: async (): Promise<ClaimedProfile | null> => {
      const { data, error } = await supabase
        .from('claimed_profiles')
        .select('*')
        .eq('program_id', programId)
        .eq('verified', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching claimed profile by program:', error);
        throw error;
      }

      if (!data) return null;

      return transformToClaimedProfile(data as unknown as DBClaimedProfile);
    },
    enabled: !!programId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch a claimed profile by project_id (internal UUID link to projects table)
 */
export function useClaimedProfileByProjectId(projectId: string) {
  return useQuery({
    queryKey: ['claimed-profile-by-project-id', projectId],
    queryFn: async (): Promise<ClaimedProfile | null> => {
      const { data, error } = await supabase
        .from('claimed_profiles')
        .select('*')
        .eq('project_id', projectId)
        .eq('verified', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching claimed profile by project ID:', error);
        throw error;
      }

      if (!data) return null;

      return transformToClaimedProfile(data as unknown as DBClaimedProfile);
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch verified profiles for a specific X user (MY profiles)
 * This is the correct hook to use in Dashboard - filters by owner
 */
export function useMyVerifiedProfiles(xUserId: string | undefined) {
  return useQuery({
    queryKey: ['my-verified-profiles', xUserId],
    queryFn: async (): Promise<ClaimedProfile[]> => {
      if (!xUserId) return [];

      const { data, error } = await supabase
        .from('claimed_profiles')
        .select('*')
        .eq('x_user_id', xUserId)
        .eq('verified', true)
        .order('verified_at', { ascending: false });

      if (error) {
        console.error('Error fetching my verified profiles:', error);
        throw error;
      }

      return (data || []).map(d => transformToClaimedProfile(d as unknown as DBClaimedProfile));
    },
    enabled: !!xUserId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Check if user has any existing profile (verified or not)
 * Used to detect if user should skip onboarding
 */
export function useExistingProfile(xUserId: string | undefined) {
  return useQuery({
    queryKey: ['existing-profile-check', xUserId],
    queryFn: async (): Promise<{ hasProfile: boolean; profileId?: string }> => {
      if (!xUserId) return { hasProfile: false };

      const { data, error } = await supabase
        .from('claimed_profiles')
        .select('id, verified')
        .eq('x_user_id', xUserId)
        .maybeSingle();

      if (error) {
        console.error('Error checking existing profile:', error);
        return { hasProfile: false };
      }

      return {
        hasProfile: !!data,
        profileId: data?.id,
      };
    },
    enabled: !!xUserId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Fetch all verified claimed profiles (PUBLIC - for explorer, leaderboards)
 * WARNING: Do NOT use in Dashboard - use useMyVerifiedProfiles instead!
 */
export function useVerifiedProfiles() {
  return useQuery({
    queryKey: ['verified-profiles'],
    queryFn: async (): Promise<ClaimedProfile[]> => {
      const { data, error } = await supabase
        .from('claimed_profiles')
        .select('*')
        .eq('verified', true)
        .order('verified_at', { ascending: false });

      if (error) {
        console.error('Error fetching verified profiles:', error);
        throw error;
      }

      return (data || []).map(d => transformToClaimedProfile(d as unknown as DBClaimedProfile));
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch an unclaimed profile by its UUID (for claim flow)
 */
export function useUnclaimedProfile(profileId: string | undefined) {
  return useQuery({
    queryKey: ['unclaimed-profile', profileId],
    queryFn: async (): Promise<ClaimedProfile | null> => {
      if (!profileId) return null;

      const { data, error } = await supabase
        .from('claimed_profiles')
        .select('*')
        .eq('id', profileId)
        .eq('claim_status', 'unclaimed')
        .maybeSingle();

      if (error) {
        console.error('Error fetching unclaimed profile:', error);
        throw error;
      }

      if (!data) return null;

      return transformToClaimedProfile(data as unknown as DBClaimedProfile);
    },
    enabled: !!profileId,
    staleTime: 1000 * 60 * 2,
  });
}
