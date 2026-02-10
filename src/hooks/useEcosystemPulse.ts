import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EcosystemAggregates {
  totalProjects: number;
  activeProjects: number;
  staleProjects: number;
  decayingProjects: number;
  healthyProjects: number;
  avgResilienceScore: number;
  totalCommits30d: number;
  totalContributors: number;
  totalTvlUsd: number;
  avgDependencyHealth: number;
  categoryBreakdown: Record<string, number>;
  depHealthDistribution: { healthy: number; warning: number; critical: number; unknown: number };
  languageBreakdown: { name: string; count: number }[];
}

export interface EcosystemSnapshot {
  snapshot_date: string;
  total_projects: number;
  active_projects: number;
  avg_resilience_score: number;
  total_commits_30d: number;
  total_contributors: number;
  total_tvl_usd: number;
  avg_dependency_health: number;
  healthy_count: number;
  stale_count: number;
  decaying_count: number;
}

function computeAggregates(profiles: any[]): EcosystemAggregates {
  const total = profiles.length;
  const active = profiles.filter(p => p.liveness_status === 'ACTIVE').length;
  const stale = profiles.filter(p => p.liveness_status === 'STALE').length;
  const decaying = profiles.filter(p => p.liveness_status === 'DECAYING').length;
  const healthy = profiles.filter(p => (p.resilience_score || 0) >= 70).length;
  const avgScore = total > 0 ? profiles.reduce((s, p) => s + (p.resilience_score || 0), 0) / total : 0;
  const totalCommits = profiles.reduce((s, p) => s + (p.github_commits_30d || 0), 0);
  const totalContributors = profiles.reduce((s, p) => s + (p.github_contributors || 0), 0);
  const totalTvl = profiles.reduce((s, p) => s + (p.tvl_usd || 0), 0);
  const avgDepHealth = total > 0 ? profiles.reduce((s, p) => s + (p.dependency_health_score || 0), 0) / total : 0;

  const categoryBreakdown: Record<string, number> = {};
  profiles.forEach(p => {
    const cat = p.category || 'uncategorized';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  });

  const depHealthDistribution = {
    healthy: profiles.filter(p => (p.dependency_health_score || 0) >= 70).length,
    warning: profiles.filter(p => { const s = p.dependency_health_score || 0; return s >= 40 && s < 70; }).length,
    critical: profiles.filter(p => { const s = p.dependency_health_score || 0; return s > 0 && s < 40; }).length,
    unknown: profiles.filter(p => !p.dependency_health_score || p.dependency_health_score === 0).length,
  };

  // Aggregate language usage: count how many projects use each language
  const langCounts: Record<string, number> = {};
  profiles.forEach(p => {
    const langs = p.github_languages;
    if (langs && typeof langs === 'object' && !Array.isArray(langs)) {
      Object.keys(langs).forEach(lang => {
        langCounts[lang] = (langCounts[lang] || 0) + 1;
      });
    }
  });
  const languageBreakdown = Object.entries(langCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    totalProjects: total,
    activeProjects: active,
    staleProjects: stale,
    decayingProjects: decaying,
    healthyProjects: healthy,
    avgResilienceScore: Math.round(avgScore * 10) / 10,
    totalCommits30d: totalCommits,
    totalContributors: totalContributors,
    totalTvlUsd: totalTvl,
    avgDependencyHealth: Math.round(avgDepHealth * 10) / 10,
    categoryBreakdown,
    depHealthDistribution,
    languageBreakdown,
  };
}

export function useEcosystemPulse() {
  const aggregatesQuery = useQuery({
    queryKey: ['ecosystem-pulse-aggregates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claimed_profiles')
        .select('resilience_score, github_commits_30d, github_contributors, tvl_usd, dependency_health_score, governance_tx_30d, liveness_status, category, github_languages');
      if (error) throw error;
      return computeAggregates(data || []);
    },
    staleTime: 5 * 60 * 1000,
  });

  const snapshotsQuery = useQuery({
    queryKey: ['ecosystem-pulse-snapshots'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ecosystem_snapshots')
        .select('snapshot_date, total_projects, active_projects, avg_resilience_score, total_commits_30d, total_contributors, total_tvl_usd, avg_dependency_health, healthy_count, stale_count, decaying_count')
        .order('snapshot_date', { ascending: true })
        .limit(90);
      if (error) throw error;
      return (data || []) as EcosystemSnapshot[];
    },
    staleTime: 10 * 60 * 1000,
  });

  return {
    aggregates: aggregatesQuery.data,
    snapshots: snapshotsQuery.data || [],
    isLoading: aggregatesQuery.isLoading || snapshotsQuery.isLoading,
    error: aggregatesQuery.error || snapshotsQuery.error,
  };
}
