import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: ReactNode;
  className?: string;
  /** Compact mode for KPI strip inline layout */
  compact?: boolean;
}

export function StatCard({ title, value, subtitle, trend, trendValue, icon, className, compact }: StatCardProps) {
  if (compact) {
    return (
      <div className={cn('relative flex items-center gap-3 px-5 py-3 min-w-0', className)}>
        {icon && <div className="text-primary/60 shrink-0">{icon}</div>}
        <div className="min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 truncate">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-foreground tracking-tight">{value}</span>
            {trend && (
              <span className={cn(
                'flex items-center gap-0.5 text-[10px] font-mono',
                trend === 'up' && 'text-primary',
                trend === 'down' && 'text-destructive',
                trend === 'stable' && 'text-muted-foreground'
              )}>
                {trend === 'up' && <TrendingUp className="h-2.5 w-2.5" />}
                {trend === 'down' && <TrendingDown className="h-2.5 w-2.5" />}
                {trend === 'stable' && <Minus className="h-2.5 w-2.5" />}
                {trendValue}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[9px] font-mono text-muted-foreground/50 truncate">{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-sm border border-border bg-card/80 p-5 transition-all hover:border-primary/20 hover:shadow-[0_0_20px_hsl(var(--primary)/0.05)]',
      className
    )}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>

      <p className="mt-2 font-display text-2xl font-bold text-foreground tracking-tight">
        {value}
      </p>

      <div className="mt-1.5 flex items-center gap-2">
        {trend && (
          <span className={cn(
            'flex items-center gap-1 text-xs font-mono',
            trend === 'up' && 'text-primary',
            trend === 'down' && 'text-destructive',
            trend === 'stable' && 'text-muted-foreground'
          )}>
            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {trend === 'stable' && <Minus className="h-3 w-3" />}
            {trendValue}
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
