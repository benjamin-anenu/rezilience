import { Database, TrendingUp, Coins, Activity, Info } from 'lucide-react';
import { ecosystemStats } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const stats = [
  {
    icon: Database,
    label: 'Initial Registry',
    value: ecosystemStats.programsIndexed.toLocaleString(),
    tooltip: 'Curated cohort of active Solana programs identified via on-chain history and public GitHub repositories.',
    showBadge: true,
  },
  {
    icon: TrendingUp,
    label: 'Beta Benchmark',
    value: ecosystemStats.averageScore.toFixed(1),
    tooltip: 'Mean average Resilience Score from our Phase 0 audit across the initial registry cohort.',
    showBadge: true,
  },
  {
    icon: Coins,
    label: 'Projected TVL',
    value: `$${(ecosystemStats.totalStaked / 1000).toFixed(0)}K`,
    tooltip: 'Estimated total value locked based on current staking commitments from early partners.',
    showBadge: true,
  },
  {
    icon: Activity,
    label: 'Verified Active',
    value: ecosystemStats.activePrograms.toLocaleString(),
    tooltip: 'Programs with verified on-chain activity within the last 30 days.',
    showBadge: false,
  },
];
 
export function EcosystemStats() {
  return (
    <TooltipProvider>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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