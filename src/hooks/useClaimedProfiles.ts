import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ClaimedProfile, MediaAsset, Milestone } from '@/types';
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
    },
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
 * Fetch all verified claimed profiles
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
