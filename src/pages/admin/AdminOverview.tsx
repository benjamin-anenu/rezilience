import { useAdminStats } from '@/hooks/useAdminStats';
import { StatCard } from '@/components/admin/StatCard';
import { Loader2, Database, Users, Activity, TrendingUp, GitBranch, DollarSign, BarChart3, Clock } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const CHART_COLORS = {
  teal: 'hsl(174, 100%, 38%)',
  orange: 'hsl(24, 100%, 38%)',
  steel: 'hsl(212, 11%, 58%)',
  light: 'hsl(216, 33%, 94%)',
  concrete: 'hsl(214, 18%, 35%)',
};

const LIVENESS_COLORS = [CHART_COLORS.teal, CHART_COLORS.steel, CHART_COLORS.orange];

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
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Platform Overview
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            REAL-TIME OPERATIONAL INTELLIGENCE
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-sm border border-primary/30 bg-primary/5 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-mono text-primary">LIVE</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={stats.totalProfiles}
          icon={<Database className="h-4 w-4" />}
          subtitle="registered in registry"
        />
        <StatCard
          title="Claimed / Unclaimed"
          value={`${stats.claimedCount} / ${stats.unclaimedCount}`}
          icon={<Users className="h-4 w-4" />}
          trend={stats.claimedCount > stats.unclaimedCount ? 'up' : 'stable'}
          trendValue={`${stats.totalProfiles > 0 ? Math.round((stats.claimedCount / stats.totalProfiles) * 100) : 0}% claimed`}
        />
        <StatCard
          title="Avg Rezilience Score"
          value={stats.avgScore}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={stats.avgScore > 50 ? 'up' : stats.avgScore > 30 ? 'stable' : 'down'}
          trendValue="ecosystem avg"
        />
        <StatCard
          title="Total Contributors"
          value={stats.totalContributors.toLocaleString()}
          icon={<GitBranch className="h-4 w-4" />}
          subtitle="across all projects"
        />
        <StatCard
          title="Total TVL Tracked"
          value={`$${(stats.totalTvl / 1_000_000).toFixed(2)}M`}
          icon={<DollarSign className="h-4 w-4" />}
          subtitle="USD equivalent"
        />
        <StatCard
          title="Active / Stale / Decaying"
          value={`${stats.activeCount} / ${stats.staleCount} / ${stats.decayingCount}`}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          title="Score Snapshots"
          value={stats.scoreHistoryCount.toLocaleString()}
          icon={<BarChart3 className="h-4 w-4" />}
          subtitle="history entries"
        />
        <StatCard
          title="Platform Status"
          value="OPERATIONAL"
          icon={<Clock className="h-4 w-4" />}
          trend="up"
          trendValue="all systems go"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registry Growth */}
        <div className="rounded-sm border border-border bg-card/80 p-5">
          <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Registry Growth
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.recentProfiles}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.teal} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 25%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: CHART_COLORS.steel }} />
                <YAxis tick={{ fontSize: 10, fill: CHART_COLORS.steel }} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(214, 18%, 19%)',
                    border: '1px solid hsl(214, 18%, 25%)',
                    borderRadius: '2px',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={CHART_COLORS.teal}
                  fill="url(#growthGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="rounded-sm border border-border bg-card/80 p-5">
          <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Score Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 25%)" />
                <XAxis dataKey="bucket" tick={{ fontSize: 9, fill: CHART_COLORS.steel }} />
                <YAxis tick={{ fontSize: 10, fill: CHART_COLORS.steel }} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(214, 18%, 19%)',
                    border: '1px solid hsl(214, 18%, 25%)',
                    borderRadius: '2px',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill={CHART_COLORS.teal} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Liveness Breakdown */}
        <div className="rounded-sm border border-border bg-card/80 p-5">
          <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Liveness Breakdown
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={livenessData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {livenessData.map((_, index) => (
                    <Cell key={index} fill={LIVENESS_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(214, 18%, 19%)',
                    border: '1px solid hsl(214, 18%, 25%)',
                    borderRadius: '2px',
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {livenessData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: LIVENESS_COLORS[i] }} />
                <span className="text-xs font-mono text-muted-foreground">
                  {entry.name} ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="rounded-sm border border-border bg-card/80 p-5">
          <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Category Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 25%)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: CHART_COLORS.steel }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: CHART_COLORS.steel }} width={100} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(214, 18%, 19%)',
                    border: '1px solid hsl(214, 18%, 25%)',
                    borderRadius: '2px',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill={CHART_COLORS.teal} radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
