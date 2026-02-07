import { Star, GitFork, Users, Activity, Package, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GitHubAnalytics } from '@/types';

interface QuickStatsProps {
  analytics?: GitHubAnalytics;
  totalStaked?: number;
  className?: string;
}

const formatNumber = (num?: number): string => {
  if (num === undefined || num === null) return '—';
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

interface StatPillProps {
  icon: React.ElementType;
  value: string;
  label: string;
  iconColor?: string;
  highlight?: boolean;
}

function StatPill({ icon: Icon, value, label, iconColor = 'text-muted-foreground', highlight = false }: StatPillProps) {
  return (
    <div className={cn(
      "flex items-center gap-2.5 rounded-sm border px-3 py-2.5 transition-colors",
      highlight 
        ? "border-primary/40 bg-primary/10" 
        : "border-border bg-muted/30 hover:bg-muted/50"
    )}>
      <Icon className={cn("h-4 w-4 flex-shrink-0", iconColor)} />
      <div className="flex flex-col">
        <span className={cn(
          "font-mono text-base font-bold leading-none",
          highlight ? "text-primary" : "text-foreground"
        )}>
          {value}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

export function QuickStats({ analytics, totalStaked, className }: QuickStatsProps) {
  const stats = [
    {
      icon: Star,
      value: formatNumber(analytics?.github_stars),
      label: 'Stars',
      iconColor: 'text-yellow-500',
    },
    {
      icon: GitFork,
      value: formatNumber(analytics?.github_forks),
      label: 'Forks',
      iconColor: 'text-blue-400',
    },
    {
      icon: Users,
      value: formatNumber(analytics?.github_contributors),
      label: 'Contributors',
      iconColor: 'text-green-400',
    },
    {
      icon: Activity,
      value: formatNumber(analytics?.github_commits_30d),
      label: '30d Commits',
      iconColor: 'text-primary',
    },
    {
      icon: Package,
      value: formatNumber(analytics?.github_releases_30d),
      label: 'Releases',
      iconColor: 'text-purple-400',
    },
  ];

  // Only show staked amount if there's actual staking data
  if (totalStaked && totalStaked > 0) {
    stats.push({
      icon: Zap,
      value: `${formatNumber(totalStaked)} SOL`,
      label: 'Staked',
      iconColor: 'text-primary',
    });
  }

  const hasAnyData = analytics && (
    analytics.github_stars !== undefined ||
    analytics.github_forks !== undefined ||
    analytics.github_contributors !== undefined
  );

  if (!hasAnyData) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Horizontal scrollable on mobile, grid on desktop */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-6">
        {stats.map((stat, index) => (
          <div key={stat.label} className="flex-shrink-0">
            <StatPill
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              iconColor={stat.iconColor}
              highlight={index === 3} // Highlight commits as key activity metric
            />
          </div>
        ))}
      </div>
    </div>
  );
}
