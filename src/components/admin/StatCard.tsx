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
}

export function StatCard({ title, value, subtitle, trend, trendValue, icon, className }: StatCardProps) {
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
