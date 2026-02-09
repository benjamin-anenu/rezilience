import { Database, TrendingUp, Coins, Activity, Info } from 'lucide-react';
import { useEcosystemStats } from '@/hooks/useProjects';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

export function EcosystemStats() {
  const { data: stats, isLoading, error } = useEcosystemStats();

  const formatTvl = (tvl: number): string => {
    if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(1)}B`;
    if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(1)}M`;
    if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(0)}K`;
    return `$${tvl.toFixed(0)}`;
  };

  const statItems = [
    {
      icon: Database,
      label: 'Initial Registry',
      value: stats?.programsIndexed.toLocaleString() ?? '—',
      tooltip: 'Curated cohort of active Solana programs identified via on-chain history and public GitHub repositories.',
      showBadge: true,
    },
    {
      icon: TrendingUp,
      label: 'Beta Benchmark',
      value: stats?.averageScore.toFixed(1) ?? '—',
      tooltip: 'Mean average Resilience Score from our Phase 0 audit across the initial registry cohort.',
      showBadge: true,
    },
    {
      icon: Coins,
      label: 'Projected TVL',
      value: '$0K',
      tooltip: 'Estimated total value locked based on current staking commitments from early partners.',
      showBadge: true,
    },
    {
      icon: Coins,
      label: 'Indexed TVL',
      value: stats ? formatTvl(stats.totalTvl) : '—',
      tooltip: 'Total value locked across all indexed projects with available TVL data from DeFiLlama.',
      showBadge: false,
    },
    {
      icon: Activity,
      label: 'Verified Active',
      value: stats?.activePrograms.toLocaleString() ?? '—',
      tooltip: 'Projects with verified on-chain activity within the last 30 days.',
      showBadge: false,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-sm border border-border bg-card p-4">
            <Skeleton className="h-10 w-10 rounded-sm" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-center">
        <p className="text-sm text-destructive">Failed to load ecosystem stats</p>
      </div>
    );
  }
 
  return (
    <TooltipProvider>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-sm border border-border bg-card p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-mono text-xl font-bold text-foreground">{stat.value}</p>
                {stat.showBadge && (
                  <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono text-primary">
                    PHASE 0
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs border-primary/20">
                    <p className="text-xs">{stat.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
