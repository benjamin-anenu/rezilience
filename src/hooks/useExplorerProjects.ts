import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { LivenessStatus } from '@/types/database';

// Explorer project type - unified view from claimed_profiles
export interface ExplorerProject {
  id: string;
  program_id: string;
  program_name: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  verified: boolean;
  github_org_url: string | null;
  github_last_commit: string | null;
  resilience_score: number;
  liveness_status: LivenessStatus;
  is_fork: boolean;
  total_staked: number;
  // Source tracking for routing
  isRegisteredProtocol: true;
}

/**
 * Fetches verified registered protocols from claimed_profiles for the Explorer.
 * Includes real-time subscription to automatically refresh when profiles change.
 */
export function useExplorerProjects() {
  const queryClient = useQueryClient();

  // Set up real-time subscription to claimed_profiles changes
  useEffect(() => {
    const channel = supabase
      .channel('explorer-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'claimed_profiles',
        },
        (payload) => {
          console.log('Explorer: Detected claimed_profiles change', payload.eventType);
          // Invalidate the query to trigger a refetch
          queryClient.invalidateQueries({ queryKey: ['explorer-projects'] });
        }
      )
      .subscribe((status) => {
        console.log('Explorer realtime subscription:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['explorer-projects'],
    queryFn: async (): Promise<ExplorerProject[]> => {
      const { data, error } = await supabase
        .from('claimed_profiles')
        .select('*')
        .eq('verified', true)
        .order('resilience_score', { ascending: false });

      if (error) {
        console.error('Error fetching explorer projects:', error);
        throw error;
      }

      // Transform claimed_profiles to ExplorerProject format
      return (data || []).map((profile) => ({
        id: profile.id,
        program_id: profile.program_id || profile.id,
        program_name: profile.project_name,
        description: profile.description,
        website_url: profile.website_url,
        logo_url: profile.logo_url,
        verified: profile.verified,
        github_org_url: profile.github_org_url,
        github_last_commit: profile.github_last_commit,
        resilience_score: profile.resilience_score || 0,
        liveness_status: (profile.liveness_status as LivenessStatus) || 'STALE',
        is_fork: profile.github_is_fork || false,
        total_staked: 0, // Phase 2 feature
        isRegisteredProtocol: true as const,
      }));
    },
  });
}
