import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface HeroStats {
  registryCount: number;
  averageScore: number;
  activeCount: number;
  displayMode: 'launching' | 'early' | 'growing';
}

/**
 * Fetch dynamic stats for the landing page hero section
 * Replaces hardcoded values with real database counts
 */
export function useHeroStats() {
  return useQuery({
    queryKey: ['hero-stats'],
    queryFn: async (): Promise<HeroStats> => {
      // Fetch verified profiles for registry count
      const { data: profiles, error } = await supabase
        .from('claimed_profiles')
        .select('resilience_score, liveness_status')
        .eq('verified', true);

      if (error) {
        console.error('Error fetching hero stats:', error);
        throw error;
      }

      const registryCount = profiles?.length || 0;
      
      // Calculate average score
      const averageScore = registryCount > 0
        ? profiles.reduce((sum, p) => sum + (p.resilience_score || 0), 0) / registryCount
        : 0;
      
      // Count active programs
      const activeCount = profiles?.filter(p => p.liveness_status === 'ACTIVE').length || 0;

      // Determine display mode based on count
      let displayMode: 'launching' | 'early' | 'growing';
      if (registryCount < 10) {
        displayMode = 'launching';
      } else if (registryCount < 100) {
        displayMode = 'early';
      } else {
        displayMode = 'growing';
      }

      return {
        registryCount,
        averageScore: Math.round(averageScore * 10) / 10,
        activeCount,
        displayMode,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
