import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const C = {
  teal: 'hsl(174, 100%, 38%)',
  orange: 'hsl(24, 100%, 38%)',
  steel: 'hsl(212, 11%, 58%)',
  light: 'hsl(216, 33%, 94%)',
  grid: 'hsl(214, 18%, 20%)',
};

const tip = {
  contentStyle: {
    background: 'hsl(214, 18%, 12%)',
    border: '1px solid hsl(214, 18%, 22%)',
    borderRadius: '4px',
    fontSize: 11,
    fontFamily: 'JetBrains Mono, monospace',
  },
};

async function fetchRegistryData() {
  const { data: profiles } = await supabase
    .from('claimed_profiles_public')
    .select('claim_status, verified, github_analyzed_at, dependency_analyzed_at, governance_analyzed_at, resilience_score, liveness_status, created_at');

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

  const { count: blacklistCount } = await supabase.from('claim_blacklist').select('*', { count: 'exact', head: true });

  // Score trend over time from score_history
  const { data: scoreHistory } = await supabase
    .from('score_history')
    .select('snapshot_date, score')
    .order('snapshot_date', { ascending: true })
    .limit(500);

  const dailyScores: Record<string, { sum: number; count: number }> = {};
  (scoreHistory || []).forEach(s => {
    const d = s.snapshot_date.substring(0, 10);
    if (!dailyScores[d]) dailyScores[d] = { sum: 0, count: 0 };
    dailyScores[d].sum += s.score;
    dailyScores[d].count++;
  });
  const scoreTrend = Object.entries(dailyScores)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({ date, avg: Math.round((d.sum / d.count) * 10) / 10 }));

  const funnelStages = [
    { stage: 'Unclaimed', value: unclaimed, pct: total > 0 ? (unclaimed / total) * 100 : 0 },
    { stage: 'Pending', value: pending, pct: total > 0 ? (pending / total) * 100 : 0 },
    { stage: 'Claimed', value: claimed, pct: total > 0 ? (claimed / total) * 100 : 0 },
    { stage: 'Verified', value: verified, pct: total > 0 ? (verified / total) * 100 : 0 },
  ];

  const coverageItems = [
    { name: 'GitHub Analysis', pct: githubCoverage, count: withGithub },
    { name: 'Dependencies', pct: depsCoverage, count: withDeps },
    { name: 'Governance', pct: govCoverage, count: withGov },
  ];

  return { total, funnelStages, coverageItems, verificationRate, blacklistCount: blacklistCount || 0, scoreTrend };
}

export function AdminRegistry() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-registry'], queryFn: fetchRegistryData, staleTime: 60_000 });

  if (isLoading || !data) return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 lg:p-8 space-y-5 admin-gradient-bg min-h-full">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground">Registry Health</h1>
        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">CLAIM FUNNEL • VERIFICATION RATES • ANALYSIS COVERAGE</p>
      </div>

      {/* KPI Strip */}
      <div className="glass-card rounded-sm kpi-strip divide-x divide-border/20">
        <StatCard compact title="Total Profiles" value={data.total} />
        <StatCard compact title="Verified" value={`${data.verificationRate}%`} trend="up" trendValue="rate" />
        <StatCard compact title="Blacklisted" value={data.blacklistCount} trend={data.blacklistCount > 0 ? 'down' : 'stable'} />
      </div>

      {/* Claim Funnel — gradient horizontal flow */}
      <div className="glass-chart p-5">
        <h3 className="mb-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Claim Funnel</h3>
        <div className="space-y-3">
          {data.funnelStages.map((s, i) => {
            const maxVal = data.funnelStages[0]?.value || 1;
            const widthPct = Math.max((s.value / maxVal) * 100, 3);
            const colors = [C.steel, C.orange, C.teal, C.light];
            return (
              <div key={s.stage} className="flex items-center gap-4 animate-card-enter" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="text-[10px] font-mono text-muted-foreground w-20 text-right">{s.stage}</span>
                <div className="flex-1 h-8 bg-card/30 rounded-sm overflow-hidden relative">
                  <div
                    className="h-full rounded-sm flex items-center px-3 transition-all duration-1000 ease-out"
                    style={{ width: `${widthPct}%`, background: `linear-gradient(90deg, ${colors[i]}, ${colors[i]}80)` }}
                  >
                    <span className="text-[10px] font-mono text-background font-bold">{s.value}</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground w-10 text-right">{Math.round(s.pct)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: Coverage Radials + Score Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Coverage Radials */}
        <div className="lg:col-span-2 glass-chart p-5">
          <h3 className="mb-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Analysis Coverage</h3>
          <div className="flex justify-around items-center h-48">
            {data.coverageItems.map(c => (
              <div key={c.name} className="flex flex-col items-center gap-2">
                {/* Radial ring */}
                <div className="relative h-20 w-20">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(214, 18%, 20%)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15" fill="none"
                      stroke={C.teal}
                      strokeWidth="3"
                      strokeDasharray={`${c.pct * 0.942} 94.2`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-foreground">{c.pct}%</span>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground text-center">{c.name}</span>
                <span className="text-[8px] font-mono text-muted-foreground/50">{c.count}/{data.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score Trend */}
        <div className="lg:col-span-3 glass-chart p-5">
          <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Avg Score Over Time</h3>
          <div className="h-48">
            {data.scoreTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.scoreTrend}>
                  <defs>
                    <linearGradient id="scoreTrFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.teal} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={C.teal} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 8, fill: C.steel }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
                  <Tooltip {...tip} />
                  <Area type="monotone" dataKey="avg" stroke={C.teal} fill="url(#scoreTrFill)" strokeWidth={2.5} name="Avg Score" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] font-mono text-muted-foreground/50">NO SCORE HISTORY</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
