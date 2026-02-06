import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DBScoreHistory } from '@/types/database';

/**
 * Fetch score history for a project
 */
export function useScoreHistory(projectId: string, limit = 12) {
  return useQuery({
    queryKey: ['score-history', projectId, limit],
    queryFn: async (): Promise<DBScoreHistory[]> => {
      const { data, error } = await supabase
        .from('score_history')
        .select('*')
        .or(`project_id.eq.${projectId},claimed_profile_id.eq.${projectId}`)
        .order('snapshot_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching score history:', error);
        throw error;
      }

      // Transform breakdown from Json to typed object
      return (data || []).map(item => ({
        ...item,
        breakdown: item.breakdown as DBScoreHistory['breakdown'],
      }));
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Get chart data format for score history
 */
export function useScoreHistoryChart(projectId: string) {
  const { data: history, ...rest } = useScoreHistory(projectId);

  const chartData = (history || [])
    .reverse()
    .map(entry => {
      const date = new Date(entry.snapshot_date);
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        score: entry.score,
        velocity: entry.commit_velocity || 0,
      };
    });

  return {
    data: chartData,
    ...rest,
  };
}
