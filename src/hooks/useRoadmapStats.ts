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
      const { data: profiles, error } = await supabase
        .from('claimed_profiles')
        .select('resilience_score, claimer_wallet');

      if (error) {
        console.error('Error fetching roadmap stats:', error);
        throw error;
      }

      const scoredProjects = profiles?.filter(p => p.resilience_score && p.resilience_score > 0).length || 0;
      const claimedProfiles = profiles?.filter(p => p.claimer_wallet !== null).length || 0;
      const unclaimedProfiles = profiles?.filter(p => p.claimer_wallet === null).length || 0;

      return { scoredProjects, claimedProfiles, unclaimedProfiles };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
