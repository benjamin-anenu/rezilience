import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DBProject, DBEcosystemStats, LivenessStatus } from '@/types/database';

// Transform database liveness_status to frontend format
function mapLivenessStatus(status: string | null): LivenessStatus {
  if (status === 'ACTIVE') return 'ACTIVE';
  if (status === 'DECAYING') return 'DECAYING';
  return 'STALE';
}

/**
 * Fetch all projects for the explorer leaderboard
 */
export function useProjects(options?: { limit?: number; offset?: number }) {
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;

  return useQuery({
    queryKey: ['projects', limit, offset],
    queryFn: async (): Promise<DBProject[]> => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('resilience_score', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      return (data || []).map(project => ({
        ...project,
        liveness_status: mapLivenessStatus(project.liveness_status),
      })) as DBProject[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single project by program_id (on-chain address)
 */
export function useProject(programId: string) {
  return useQuery({
    queryKey: ['project', programId],
    queryFn: async (): Promise<DBProject | null> => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('program_id', programId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching project:', error);
        throw error;
      }

      if (!data) return null;

      return {
        ...data,
        liveness_status: mapLivenessStatus(data.liveness_status),
      } as DBProject;
    },
    enabled: !!programId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch a project by internal UUID
 */
export function useProjectById(id: string) {
  return useQuery({
    queryKey: ['project-by-id', id],
    queryFn: async (): Promise<DBProject | null> => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching project by ID:', error);
        throw error;
      }

      if (!data) return null;

      return {
        ...data,
        liveness_status: mapLivenessStatus(data.liveness_status),
      } as DBProject;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Calculate and fetch ecosystem statistics
 */
export function useEcosystemStats() {
  return useQuery({
    queryKey: ['ecosystem-stats'],
    queryFn: async (): Promise<DBEcosystemStats> => {
      // Fetch all profiles in the registry (not just verified ones)
      const { data, error } = await supabase
        .from('claimed_profiles')
        .select('resilience_score, liveness_status, verified, tvl_usd');

      if (error) {
        console.error('Error fetching ecosystem stats:', error);
        throw error;
      }

      const profiles = data || [];
      const programsIndexed = profiles.length;
      const totalStaked = 0; // Phase 2 feature - no staking data yet
      
      // Calculate average score across all profiles with a score
      const profilesWithScore = profiles.filter(p => p.resilience_score && p.resilience_score > 0);
      const averageScore = profilesWithScore.length > 0
        ? profilesWithScore.reduce((sum, p) => sum + (p.resilience_score || 0), 0) / profilesWithScore.length
        : 0;
      
      const activePrograms = profiles.filter(p => p.liveness_status === 'ACTIVE').length;
      
      // Sum up TVL from all projects that have TVL data
      const totalTvl = profiles
        .filter(p => p.tvl_usd && p.tvl_usd > 0)
        .reduce((sum, p) => sum + (p.tvl_usd || 0), 0);

      return {
        programsIndexed,
        averageScore: Math.round(averageScore * 10) / 10,
        totalStaked,
        activePrograms,
        totalTvl,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Search projects by name or program ID
 */
export function useSearchProjects(query: string) {
  return useQuery({
    queryKey: ['search-projects', query],
    queryFn: async (): Promise<DBProject[]> => {
      if (!query.trim()) {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('resilience_score', { ascending: false })
          .limit(50);

        if (error) throw error;
        return (data || []).map(project => ({
          ...project,
          liveness_status: mapLivenessStatus(project.liveness_status),
        })) as DBProject[];
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or(`program_name.ilike.%${query}%,program_id.ilike.%${query}%`)
        .order('resilience_score', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error searching projects:', error);
        throw error;
      }

      return (data || []).map(project => ({
        ...project,
        liveness_status: mapLivenessStatus(project.liveness_status),
      })) as DBProject[];
    },
    enabled: true,
    staleTime: 1000 * 60,
  });
}
