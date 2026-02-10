import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEcosystemPulse, type EcosystemSnapshot } from '@/hooks/useEcosystemPulse';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Activity, TrendingUp, Shield, Code, Info } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const LIVENESS_COLORS = [
  'hsl(174, 100%, 38%)', // active - teal
  'hsl(45, 100%, 50%)',  // evolving - amber
  'hsl(212, 11%, 40%)',  // under observation - steel
];

const DEP_COLORS = [
  'hsl(174, 100%, 38%)', // healthy
  'hsl(45, 100%, 50%)',  // warning
  'hsl(0, 85%, 55%)',    // critical
  'hsl(212, 11%, 40%)',  // unknown
];

function formatTvl(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getPulseColor(avgScore: number): string {
  if (avgScore >= 70) return 'hsl(174, 100%, 38%)';
  if (avgScore >= 40) return 'hsl(45, 100%, 50%)';
  return 'hsl(0, 85%, 55%)';
}

function getPulseLabel(avgScore: number): string {
  if (avgScore >= 70) return 'HEALTHY';
  if (avgScore >= 40) return 'CAUTIOUS';
  return 'CRITICAL';
}

function SparseDataNotice() {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-border bg-card/50 p-3 text-xs text-muted-foreground">
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
      <span>Data accumulating — trend charts will populate over the coming weeks as daily snapshots are captured.</span>
    </div>
  );
}

/* ─── Heartbeat Pulse ─── */
function HeartbeatPulse({ avgScore }: { avgScore: number }) {
  const color = getPulseColor(avgScore);
  const label = getPulseLabel(avgScore);

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <span className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
        Ecosystem Heartbeat
      </span>

      {/* Pulse rings */}
      <div className="relative flex h-44 w-44 items-center justify-center">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              border: `1.5px solid ${color}`,
              opacity: 0,
              animation: `pulse-ring 3s ease-out ${i * 1}s infinite`,
            }}
          />
        ))}
        {/* Static glow core */}
        <div
          className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
            boxShadow: `0 0 40px ${color}33`,
          }}
        >
          <span className="font-mono text-3xl font-bold" style={{ color }}>
            {Math.round(avgScore)}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
        </div>
      </div>

      {/* CSS for pulse-ring */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ─── Chart Tooltip ─── */
function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-sm border border-border bg-card p-2 text-xs shadow-lg">
      <p className="mb-1 font-mono text-muted-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="font-mono">
          {entry.name}: {typeof entry.value === 'number' && entry.value > 10000 ? formatTvl(entry.value) : entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
export function EcosystemPulse() {
  const { aggregates, snapshots, isLoading } = useEcosystemPulse();

  const isSparse = snapshots.length < 7;

  const chartSnapshots = useMemo(() =>
    snapshots.map((s: EcosystemSnapshot) => ({
      ...s,
      date: formatDate(s.snapshot_date),
    })),
    [snapshots]
  );

  const livenessData = useMemo(() => {
    if (!aggregates) return [];
    return [
      { name: 'Active', value: aggregates.activeProjects },
      { name: 'Evolving', value: aggregates.staleProjects },
      { name: 'Under Observation', value: aggregates.decayingProjects },
    ].filter(d => d.value > 0);
  }, [aggregates]);

  const categoryData = useMemo(() => {
    if (!aggregates) return [];
    return Object.entries(aggregates.categoryBreakdown)
      .map(([name, value]) => ({ name: name === 'uncategorized' ? 'Other' : name.charAt(0).toUpperCase() + name.slice(1), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [aggregates]);

  const depHealthData = useMemo(() => {
    if (!aggregates) return [];
    return [
      { name: 'Healthy', value: aggregates.depHealthDistribution.healthy },
      { name: 'Warning', value: aggregates.depHealthDistribution.warning },
      { name: 'Critical', value: aggregates.depHealthDistribution.critical },
      { name: 'Unknown', value: aggregates.depHealthDistribution.unknown },
    ].filter(d => d.value > 0);
  }, [aggregates]);

  const languageData = useMemo(() => {
    if (!aggregates) return [];
    return aggregates.languageBreakdown;
  }, [aggregates]);

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
      </div>
    );
  }

  if (!aggregates) return null;

  return (
    <div className="space-y-4">
      {/* Registry Data Disclaimer */}
      <div className="flex items-center gap-2 rounded-sm border border-border bg-card/50 p-3 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
        <span>Data reflects only projects indexed in the Resilience Registry and does not represent the entire Solana ecosystem.</span>
      </div>

      {isSparse && <SparseDataNotice />}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ─── LEFT: Charts (2 cols) ─── */}
        <div className="space-y-4 lg:col-span-2">

          {/* Aggregate Score Trend */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-display uppercase tracking-wide">
                <TrendingUp className="h-4 w-4 text-primary" />
                Aggregate Resilience Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartSnapshots.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartSnapshots}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(174, 100%, 38%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(174, 100%, 38%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 25%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(212, 11%, 58%)' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(212, 11%, 58%)' }} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="avg_resilience_score" name="Avg Score" stroke="hsl(174, 100%, 38%)" fill="url(#scoreGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">No trend data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Development Activity */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-display uppercase tracking-wide">
                <Activity className="h-4 w-4 text-primary" />
                Development Activity Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartSnapshots.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartSnapshots}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 25%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(212, 11%, 58%)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(212, 11%, 58%)' }} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="total_commits_30d" name="Commits (30d)" fill="hsl(174, 100%, 38%)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="total_contributors" name="Contributors" fill="hsl(212, 11%, 58%)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">No activity data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Bottom row: Liveness + Category + Dep Health */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Liveness Distribution */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-display uppercase tracking-wide">Liveness</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={livenessData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                      {livenessData.map((_, i) => <Cell key={i} fill={LIVENESS_COLORS[i]} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-3 text-[10px]">
                  {livenessData.map((d, i) => (
                    <span key={d.name} className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: LIVENESS_COLORS[i] }} />
                      {d.name} ({d.value})
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-display uppercase tracking-wide">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {categoryData.map(c => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.max(8, (c.value / (categoryData[0]?.value || 1)) * 100)}%` }} />
                    <span className="shrink-0 text-[10px] text-muted-foreground">{c.name} ({c.value})</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dependency Health */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1 text-xs font-display uppercase tracking-wide">
                  <Shield className="h-3 w-3 text-primary" /> Supply Chain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={depHealthData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                      {depHealthData.map((_, i) => <Cell key={i} fill={DEP_COLORS[i]} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-2 text-[10px]">
                  {depHealthData.map((d, i) => (
                    <span key={d.name} className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: DEP_COLORS[i] }} />
                      {d.name} ({d.value})
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Languages */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1 text-xs font-display uppercase tracking-wide">
                  <Code className="h-3 w-3 text-primary" /> Top Languages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {languageData.length > 0 ? languageData.map(l => (
                  <div key={l.name} className="flex items-center gap-2">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.max(8, (l.count / (languageData[0]?.count || 1)) * 100)}%` }} />
                    <span className="shrink-0 text-[10px] text-muted-foreground">{l.name} ({l.count})</span>
                  </div>
                )) : (
                  <p className="py-4 text-center text-[10px] text-muted-foreground">No language data</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ─── RIGHT: Pulse + TVL (1 col) ─── */}
        <div className="space-y-4">
          {/* Heartbeat Pulse */}
          <Card className="border-border">
            <CardContent className="p-0">
              <HeartbeatPulse avgScore={aggregates.avgResilienceScore} />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-border">
            <CardContent className="grid grid-cols-2 gap-3 p-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Projects</p>
                <p className="font-mono text-lg font-bold text-foreground">{aggregates.totalProjects}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active</p>
                <p className="font-mono text-lg font-bold text-primary">{aggregates.activeProjects}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Commits (30d)</p>
                <p className="font-mono text-lg font-bold text-foreground">{aggregates.totalCommits30d.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Contributors</p>
                <p className="font-mono text-lg font-bold text-foreground">{aggregates.totalContributors.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* TVL */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-display uppercase tracking-wide">Indexed TVL</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 font-mono text-2xl font-bold text-primary">{formatTvl(aggregates.totalTvlUsd)}</p>
              {chartSnapshots.length > 0 ? (
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={chartSnapshots}>
                    <defs>
                      <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(174, 100%, 38%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(174, 100%, 38%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(212, 11%, 58%)' }} />
                    <YAxis tick={{ fontSize: 9, fill: 'hsl(212, 11%, 58%)' }} tickFormatter={(v) => formatTvl(v)} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="total_tvl_usd" name="TVL" stroke="hsl(174, 100%, 38%)" fill="url(#tvlGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-6 text-center text-xs text-muted-foreground">TVL trend data accumulating</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
