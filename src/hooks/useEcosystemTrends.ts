import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EcosystemTrend {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  profile_id: string | null;
  metadata: Record<string, unknown>;
  priority: string;
  created_at: string;
  expires_at: string | null;
  created_by: string;
}

export function useEcosystemTrends(limit = 10) {
  return useQuery({
    queryKey: ['ecosystem-trends', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ecosystem_trends')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as EcosystemTrend[];
    },
    refetchInterval: 60000, // refresh every minute
  });
}
