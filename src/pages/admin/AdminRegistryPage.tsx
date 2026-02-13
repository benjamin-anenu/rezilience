import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Database, ShieldCheck, Ban, GitBranch, Network, Vote } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = {
  teal: 'hsl(174, 100%, 38%)',
  orange: 'hsl(24, 100%, 38%)',
  steel: 'hsl(212, 11%, 58%)',
  light: 'hsl(216, 33%, 94%)',
};

const tooltipStyle = {
  background: 'hsl(214, 18%, 19%)',
  border: '1px solid hsl(214, 18%, 25%)',
  borderRadius: '2px',
  fontSize: 12,
};

async function fetchRegistryData() {
  const { data: profiles } = await supabase
    .from('claimed_profiles_public')
    .select('claim_status, verified, github_analyzed_at, dependency_analyzed_at, governance_analyzed_at, resilience_score, liveness_status');

  const all = profiles || [];
  const total = all.length;

  const unclaimed = all.filter(p => p.claim_status === 'unclaimed').length;
  const claimed = all.filter(p => p.claim_status === 'claimed').length;
  const pending = all.filter(p => p.claim_status === 'pending').length;
  const verified = all.filter(p => p.verified).length;

  const verificationRate = claimed > 0 ? Math.round((verified / claimed) * 100) : 0;

  const withGithub = all.filter(p => p.github_analyzed_at).length;
  const withDeps = all.filter(p => p.dependency_analyzed_at).length;
  const withGov = all.filter(p => p.governance_analyzed_at).length;

  const githubCoverage = total > 0 ? Math.round((withGithub / total) * 100) : 0;
  const depsCoverage = total > 0 ? Math.round((withDeps / total) * 100) : 0;
  const govCoverage = total > 0 ? Math.round((withGov / total) * 100) : 0;

  // Blacklist stats
  const { count: blacklistCount } = await supabase
    .from('claim_blacklist')
    .select('*', { count: 'exact', head: true });

  // Claim funnel
  const funnelData = [
    { stage: 'Unclaimed', value: unclaimed },
    { stage: 'Pending', value: pending },
    { stage: 'Claimed', value: claimed },
    { stage: 'Verified', value: verified },
  ];

  // Liveness pie
  const activeCount = all.filter(p => p.liveness_status === 'ACTIVE').length;
  const staleCount = all.filter(p => p.liveness_status === 'STALE').length;
  const decayingCount = all.filter(p => p.liveness_status === 'DECAYING').length;

  // Coverage bars
  const coverageData = [
    { name: 'GitHub', pct: githubCoverage },
    { name: 'Dependencies', pct: depsCoverage },
    { name: 'Governance', pct: govCoverage },
  ];

  return {
    total,
    unclaimed,
    claimed,
    pending,
    verified,
    verificationRate,
    githubCoverage,
    depsCoverage,
    govCoverage,
    blacklistCount: blacklistCount || 0,
    funnelData,
    coverageData,
    activeCount,
    staleCount,
    decayingCount,
  };
}

export function AdminRegistry() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-registry'],
    queryFn: fetchRegistryData,
    staleTime: 60_000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const FUNNEL_COLORS = [COLORS.steel, COLORS.orange, COLORS.teal, COLORS.light];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Registry Health
        </h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          CLAIM FUNNEL • VERIFICATION RATES • ANALYSIS COVERAGE
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Profiles" value={data.total} icon={<Database className="h-4 w-4" />} />
        <StatCard title="Verified" value={data.verified} icon={<ShieldCheck className="h-4 w-4" />} trend="up" trendValue={`${data.verificationRate}% rate`} />
        <StatCard title="Claimed" value={data.claimed} subtitle={`${data.pending} pending`} />
        <StatCard title="Blacklisted" value={data.blacklistCount} icon={<Ban className="h-4 w-4" />} trend={data.blacklistCount > 0 ? 'down' : 'stable'} trendValue={data.blacklistCount > 0 ? 'failed attempts' : 'clean'} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="GitHub Coverage" value={`${data.githubCoverage}%`} icon={<GitBranch className="h-4 w-4" />} subtitle={`${data.total > 0 ? Math.round((data.githubCoverage / 100) * data.total) : 0} analyzed`} />
        <StatCard title="Dependency Coverage" value={`${data.depsCoverage}%`} icon={<Network className="h-4 w-4" />} />
        <StatCard title="Governance Coverage" value={`${data.govCoverage}%`} icon={<Vote className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claim Funnel */}
        <div className="rounded-sm border border-border bg-card/80 p-5">
          <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Claim Funnel
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.funnelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 25%)" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: COLORS.steel }} />
                <YAxis tick={{ fontSize: 10, fill: COLORS.steel }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {data.funnelData.map((_, i) => (
                    <Cell key={i} fill={FUNNEL_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analysis Coverage */}
        <div className="rounded-sm border border-border bg-card/80 p-5">
          <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Analysis Coverage
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.coverageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 25%)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: COLORS.steel }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: COLORS.steel }} width={100} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
                <Bar dataKey="pct" fill={COLORS.teal} radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
