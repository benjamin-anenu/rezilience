import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RoadmapStats {
  scoredProjects: number;
  claimedProfiles: number;
  unclaimedProfiles: number;
}

export function useRoadmapStats() {
  return useQuery({
    queryKey: ['roadmap-stats'],
    queryFn: async (): Promise<RoadmapStats> => {
      const { data: profiles, error } = await (supabase
        .from('claimed_profiles_public' as any)
        .select('resilience_score, claim_status') as any);

      if (error) {
        console.error('Error fetching roadmap stats:', error);
        throw error;
      }

      const scoredProjects = profiles?.filter((p: any) => p.resilience_score && p.resilience_score > 0).length || 0;
      const claimedProfiles = profiles?.filter((p: any) => p.claim_status === 'claimed').length || 0;
      const unclaimedProfiles = profiles?.filter((p: any) => p.claim_status === 'unclaimed').length || 0;

      return { scoredProjects, claimedProfiles, unclaimedProfiles };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
