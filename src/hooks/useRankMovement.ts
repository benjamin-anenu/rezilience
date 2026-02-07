import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type MovementType = 'up' | 'down' | 'stable' | 'new';

interface RankMovementResult {
  movements: Record<string, MovementType>;
  scoreHistories: Record<string, number[]>;
}

/**
 * Fetches score movement data for a list of profile IDs.
 * Uses the get_score_changes database function for efficient calculation.
 * Also fetches the last 7 score snapshots for sparkline visualization.
 */
export function useRankMovement(profileIds: string[]) {
  return useQuery({
    queryKey: ['rank-movement', profileIds],
    queryFn: async (): Promise<RankMovementResult> => {
      if (profileIds.length === 0) {
        return { movements: {}, scoreHistories: {} };
      }

      // Fetch movement data using RPC function
      const { data: movementData, error: movementError } = await supabase
        .rpc('get_score_changes', { profile_ids: profileIds });

      if (movementError) {
        console.error('Error fetching rank movements:', movementError);
        // Don't throw - return empty data so UI still works
      }

      // Convert to map
      const movements: Record<string, MovementType> = {};
      if (movementData) {
        for (const row of movementData) {
          movements[row.profile_id] = row.movement as MovementType;
        }
      }

      // Fetch last 7 score snapshots for sparklines
      const { data: historyData, error: historyError } = await supabase
        .from('score_history')
        .select('claimed_profile_id, score, snapshot_date')
        .in('claimed_profile_id', profileIds)
        .order('snapshot_date', { ascending: true });

      if (historyError) {
        console.error('Error fetching score history:', historyError);
      }

      // Group by profile and get last 7 scores
      const scoreHistories: Record<string, number[]> = {};
      if (historyData) {
        for (const row of historyData) {
          if (!row.claimed_profile_id) continue;
          
          if (!scoreHistories[row.claimed_profile_id]) {
            scoreHistories[row.claimed_profile_id] = [];
          }
          scoreHistories[row.claimed_profile_id].push(Number(row.score));
        }

        // Keep only last 7 snapshots per profile
        for (const id of Object.keys(scoreHistories)) {
          scoreHistories[id] = scoreHistories[id].slice(-7);
        }
      }

      return { movements, scoreHistories };
    },
    enabled: profileIds.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
