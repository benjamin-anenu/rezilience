import { useAdminStats } from '@/hooks/useAdminStats';
import { StatCard } from '@/components/admin/StatCard';
import { Loader2, Database, Users, TrendingUp, GitBranch, DollarSign, Activity } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Line,
} from 'recharts';

const C = {
  teal: 'hsl(174, 100%, 38%)',
  orange: 'hsl(24, 100%, 38%)',
  steel: 'hsl(212, 11%, 58%)',
  light: 'hsl(216, 33%, 94%)',
  concrete: 'hsl(214, 18%, 35%)',
  grid: 'hsl(214, 18%, 20%)',
};

const tip = {
  contentStyle: {
    background: 'hsl(214, 18%, 12%)',
    border: '1px solid hsl(214, 18%, 22%)',
    borderRadius: '4px',
    fontSize: 11,
    fontFamily: 'JetBrains Mono, monospace',
    backdropFilter: 'blur(12px)',
  },
};

const LIVENESS_COLORS = [C.teal, C.steel, C.orange];

export default function AdminOverview() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading || !stats) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const livenessData = [
    { name: 'Active', value: stats.activeCount },
    { name: 'Stale', value: stats.staleCount },
    { name: 'Decaying', value: stats.decayingCount },
  ];

  const categoryData = Object.entries(stats.categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // Compute cumulative growth
  let cumulative = 0;
  const growthData = stats.recentProfiles.map(p => {
    cumulative += p.count;
    return { date: p.date, count: p.count, total: cumulative };
  });

  return (
    <div className="p-6 lg:p-8 space-y-5 admin-gradient-bg min-h-full">
      {/* Header + LIVE badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            Platform Overview
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            REAL-TIME OPERATIONAL INTELLIGENCE
          </p>
        </div>
        <div className="flex items-center gap-2 glass-card rounded-sm px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-primary pulse-subtle" />
          <span className="text-[10px] font-mono text-primary tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Compact KPI Strip */}
      <div className="glass-card rounded-sm kpi-strip divide-x divide-border/20">
        <StatCard compact title="Projects" value={stats.totalProfiles} icon={<Database className="h-3.5 w-3.5" />} />
        <StatCard compact title="Claimed" value={stats.claimedCount} icon={<Users className="h-3.5 w-3.5" />} trend="up" trendValue={`${stats.totalProfiles > 0 ? Math.round((stats.claimedCount / stats.totalProfiles) * 100) : 0}%`} />
        <StatCard compact title="Avg Score" value={stats.avgScore} icon={<TrendingUp className="h-3.5 w-3.5" />} trend={stats.avgScore > 50 ? 'up' : 'stable'} />
        <StatCard compact title="Contributors" value={stats.totalContributors.toLocaleString()} icon={<GitBranch className="h-3.5 w-3.5" />} />
        <StatCard compact title="TVL Tracked" value={`$${(stats.totalTvl / 1e6).toFixed(1)}M`} icon={<DollarSign className="h-3.5 w-3.5" />} />
        <StatCard compact title="Active" value={stats.activeCount} icon={<Activity className="h-3.5 w-3.5" />} subtitle={`${stats.staleCount} stale · ${stats.decayingCount} decay`} />
      </div>

      {/* HERO: Registry Growth — full width, tall */}
      <div className="glass-chart p-5 glow-pulse">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Registry Growth & Cumulative
          </h3>
          <span className="text-[9px] font-mono text-muted-foreground/50">{growthData.length} periods</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={growthData}>
              <defs>
                <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.teal} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: C.steel, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
              <Tooltip {...tip} />
              <Area yAxisId="left" type="monotone" dataKey="count" stroke={C.teal} fill="url(#growthFill)" strokeWidth={2.5} name="New Projects" />
              <Line yAxisId="right" type="monotone" dataKey="total" stroke={C.light} strokeWidth={2} dot={false} name="Cumulative" strokeDasharray="5 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Score Distribution + Liveness Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Score Distribution — 3 cols */}
        <div className="lg:col-span-3 glass-chart p-5">
          <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Score Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.scoreDistribution}>
                <defs>
                  <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.teal} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={C.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
                <Tooltip {...tip} />
                <Area type="monotone" dataKey="count" stroke={C.teal} fill="url(#scoreFill)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Liveness Donut — 2 cols */}
        <div className="lg:col-span-2 glass-chart p-5">
          <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Liveness Status
          </h3>
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={livenessData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {livenessData.map((_, i) => (
                    <Cell key={i} fill={LIVENESS_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip {...tip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-1">
            {livenessData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: LIVENESS_COLORS[i] }} />
                <span className="text-[10px] font-mono text-muted-foreground">
                  {entry.name} <span className="text-foreground font-semibold">{entry.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Category Distribution — horizontal bar */}
      <div className="glass-chart p-5">
        <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Category Distribution
        </h3>
        <div className="space-y-2">
          {categoryData.map((cat, i) => {
            const maxVal = categoryData[0]?.value || 1;
            const pct = (cat.value / maxVal) * 100;
            return (
              <div key={cat.name} className="flex items-center gap-3 animate-card-enter" style={{ animationDelay: `${i * 40}ms` }}>
                <span className="text-[10px] font-mono text-muted-foreground w-24 truncate text-right">{cat.name}</span>
                <div className="flex-1 h-6 bg-card/40 rounded-sm overflow-hidden relative">
                  <div
                    className="h-full rounded-sm transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, hsl(174, 100%, 38%) 0%, hsl(174, 80%, 28%) 100%)`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-foreground font-semibold w-8 text-right">{cat.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
