import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DimensionHealthIndicatorsProps {
  dependencyScore: number;
  governanceTx30d: number;
  tvlUsd: number;
  className?: string;
  compact?: boolean;
}

type HealthLevel = 'healthy' | 'warning' | 'critical' | 'none';

interface IndicatorConfig {
  level: HealthLevel;
  color: string;
  bgColor: string;
  label: string;
}

function getDependencyHealth(score: number): IndicatorConfig {
  if (score >= 70) return { level: 'healthy', color: 'text-primary', bgColor: 'bg-primary', label: 'Healthy' };
  if (score >= 40) return { level: 'warning', color: 'text-amber-500', bgColor: 'bg-amber-500', label: 'Warning' };
  if (score > 0) return { level: 'critical', color: 'text-destructive', bgColor: 'bg-destructive', label: 'Critical' };
  return { level: 'none', color: 'text-muted-foreground', bgColor: 'bg-muted-foreground', label: 'Unknown' };
}

function getGovernanceHealth(txCount: number): IndicatorConfig {
  if (txCount >= 5) return { level: 'healthy', color: 'text-primary', bgColor: 'bg-primary', label: 'Active' };
  if (txCount >= 1) return { level: 'warning', color: 'text-amber-500', bgColor: 'bg-amber-500', label: 'Dormant' };
  return { level: 'none', color: 'text-muted-foreground', bgColor: 'bg-muted-foreground', label: 'None' };
}

function getTvlHealth(tvlUsd: number): IndicatorConfig {
  if (tvlUsd > 10_000_000) return { level: 'healthy', color: 'text-primary', bgColor: 'bg-primary', label: `$${(tvlUsd / 1_000_000).toFixed(1)}M` };
  if (tvlUsd > 100_000) return { level: 'warning', color: 'text-amber-500', bgColor: 'bg-amber-500', label: `$${(tvlUsd / 1_000).toFixed(0)}K` };
  if (tvlUsd > 0) return { level: 'critical', color: 'text-destructive', bgColor: 'bg-destructive', label: `$${tvlUsd.toFixed(0)}` };
  return { level: 'none', color: 'text-muted-foreground', bgColor: 'bg-muted-foreground', label: 'N/A' };
}

function HealthDot({ config, dimension, compact }: { config: IndicatorConfig; dimension: string; compact?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'rounded-full transition-all',
            compact ? 'h-2 w-2' : 'h-2.5 w-2.5',
            config.bgColor,
            config.level === 'none' && 'opacity-30'
          )}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p className="font-medium">{dimension}</p>
        <p className={cn('text-xs', config.color)}>{config.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function DimensionHealthIndicators({
  dependencyScore,
  governanceTx30d,
  tvlUsd,
  className,
  compact = false,
}: DimensionHealthIndicatorsProps) {
  const deps = getDependencyHealth(dependencyScore);
  const gov = getGovernanceHealth(governanceTx30d);
  const tvl = getTvlHealth(tvlUsd);

  return (
    <div className={cn('flex items-center', compact ? 'gap-0.5' : 'gap-1', className)}>
      <HealthDot config={deps} dimension="Dependencies" compact={compact} />
      <HealthDot config={gov} dimension="Governance" compact={compact} />
      <HealthDot config={tvl} dimension="TVL" compact={compact} />
    </div>
  );
}
