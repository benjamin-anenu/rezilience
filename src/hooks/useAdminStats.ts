import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OverviewStats {
  totalProfiles: number;
  claimedCount: number;
  unclaimedCount: number;
  activeCount: number;
  staleCount: number;
  decayingCount: number;
  avgScore: number;
  totalContributors: number;
  totalTvl: number;
  scoreHistoryCount: number;
  categories: Record<string, number>;
  recentProfiles: { date: string; count: number }[];
  scoreDistribution: { bucket: string; count: number }[];
}

async function fetchOverviewStats(): Promise<OverviewStats> {
  // Fetch all claimed profiles public data
  const { data: profiles, error } = await supabase
    .from('claimed_profiles_public')
    .select('claim_status, liveness_status, resilience_score, github_contributors, tvl_usd, category, created_at');

  if (error) throw error;

  const all = profiles || [];
  const totalProfiles = all.length;
  const claimedCount = all.filter(p => p.claim_status === 'claimed').length;
  const unclaimedCount = all.filter(p => p.claim_status === 'unclaimed').length;
  const activeCount = all.filter(p => p.liveness_status === 'ACTIVE').length;
  const staleCount = all.filter(p => p.liveness_status === 'STALE').length;
  const decayingCount = all.filter(p => p.liveness_status === 'DECAYING').length;

  const scores = all.map(p => Number(p.resilience_score) || 0);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const totalContributors = all.reduce((sum, p) => sum + (Number(p.github_contributors) || 0), 0);
  const totalTvl = all.reduce((sum, p) => sum + (Number(p.tvl_usd) || 0), 0);

  // Score history count
  const { count: scoreHistoryCount } = await supabase
    .from('score_history')
    .select('*', { count: 'exact', head: true });

  // Category distribution
  const categories: Record<string, number> = {};
  all.forEach(p => {
    const cat = p.category || 'Uncategorized';
    categories[cat] = (categories[cat] || 0) + 1;
  });

  // Registry growth (profiles by month)
  const monthBuckets: Record<string, number> = {};
  all.forEach(p => {
    if (p.created_at) {
      const month = p.created_at.substring(0, 7); // YYYY-MM
      monthBuckets[month] = (monthBuckets[month] || 0) + 1;
    }
  });
  const recentProfiles = Object.entries(monthBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Score distribution buckets
  const buckets = ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'];
  const scoreDist = buckets.map(bucket => {
    const [min, max] = bucket.split('-').map(Number);
    return {
      bucket,
      count: scores.filter(s => s >= min && s < (max === 100 ? 101 : max)).length,
    };
  });

  return {
    totalProfiles,
    claimedCount,
    unclaimedCount,
    activeCount,
    staleCount,
    decayingCount,
    avgScore: Math.round(avgScore * 10) / 10,
    totalContributors,
    totalTvl,
    scoreHistoryCount: scoreHistoryCount || 0,
    categories,
    recentProfiles,
    scoreDistribution: scoreDist,
  };
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: fetchOverviewStats,
    staleTime: 60_000,
  });
}
