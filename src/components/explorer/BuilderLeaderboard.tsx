import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Users, GitCommit, ArrowUpRight, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ExplorerProject } from '@/hooks/useExplorerProjects';

interface BuilderLeaderboardProps {
  projects: ExplorerProject[];
}

type SortMetric = 'velocity' | 'commits' | 'contributors';

const metrics: { key: SortMetric; label: string; icon: typeof TrendingUp }[] = [
  { key: 'velocity', label: 'Commit Velocity', icon: TrendingUp },
  { key: 'commits', label: 'Commits (30d)', icon: GitCommit },
  { key: 'contributors', label: 'Contributors', icon: Users },
];

const medalColors = [
  'text-yellow-400',   // 🥇
  'text-gray-300',     // 🥈
  'text-amber-600',    // 🥉
];

function getMetricValue(p: ExplorerProject, metric: SortMetric): number {
  switch (metric) {
    case 'velocity': return p.github_commit_velocity || 0;
    case 'commits': return p.github_commits_30d || 0;
    case 'contributors': return p.github_contributors || 0;
  }
}

function formatValue(val: number, metric: SortMetric): string {
  if (metric === 'velocity') return `${val.toFixed(1)}/wk`;
  return val.toLocaleString();
}

export function BuilderLeaderboard({ projects }: BuilderLeaderboardProps) {
  const [sortBy, setSortBy] = useState<SortMetric>('velocity');

  const ranked = useMemo(() => {
    return [...projects]
      .filter((p) => getMetricValue(p, sortBy) > 0)
      .sort((a, b) => getMetricValue(b, sortBy) - getMetricValue(a, sortBy))
      .slice(0, 20);
  }, [projects, sortBy]);

  if (ranked.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            Weekly Builder Leaderboard
          </h3>
        </div>
        <div className="flex gap-1">
          {metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => setSortBy(m.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-mono text-[11px] transition-colors',
                sortBy === m.key
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              <m.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-border/50">
        {ranked.map((project, idx) => {
          const value = getMetricValue(project, sortBy);
          const maxValue = getMetricValue(ranked[0], sortBy);
          const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <Link
              key={project.id}
              to={`/profile/${project.id}`}
              className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/30"
            >
              {/* Rank */}
              <div className="w-7 shrink-0 text-center">
                {idx < 3 ? (
                  <Crown className={cn('h-4 w-4 mx-auto', medalColors[idx])} />
                ) : (
                  <span className="font-mono text-xs text-muted-foreground">{idx + 1}</span>
                )}
              </div>

              {/* Logo + Name */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {project.logo_url ? (
                  <img src={project.logo_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-muted" />
                )}
                <span className="font-display text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {project.program_name}
                </span>
                {project.verified && (
                  <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 border-primary/20 text-primary">
                    ✓
                  </Badge>
                )}
              </div>

              {/* Bar + Value */}
              <div className="hidden sm:flex items-center gap-3 w-40">
                <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-foreground w-16 text-right">
                  {formatValue(value, sortBy)}
                </span>
              </div>

              {/* Mobile value */}
              <span className="sm:hidden font-mono text-xs text-primary shrink-0">
                {formatValue(value, sortBy)}
              </span>

              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
