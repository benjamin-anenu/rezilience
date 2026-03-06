import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FeeData {
  current: {
    p50: number;
    p75: number;
    p90: number;
    p99: number;
    min: number;
    max: number;
    sampleSize: number;
    nonZeroCount: number;
  };
  slots: { slot: number; fee: number }[];
  fetchedAt: string;
}

const statCards = [
  { key: 'p50', label: 'P50 (Median)', color: 'text-primary' },
  { key: 'p75', label: 'P75', color: 'text-chart-4' },
  { key: 'p90', label: 'P90', color: 'text-chart-3' },
  { key: 'p99', label: 'P99', color: 'text-destructive' },
] as const;

function formatFee(micro: number): string {
  if (micro === 0) return '0';
  if (micro < 1000) return `${micro}`;
  if (micro < 1_000_000) return `${(micro / 1000).toFixed(1)}K`;
  return `${(micro / 1_000_000).toFixed(2)}M`;
}

export function PriorityFeeTracker() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['priority-fees'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-priority-fees');
      if (error) throw error;
      return data as FeeData;
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Priority Fee Trends</h2>
          <span className="font-mono text-xs text-muted-foreground">micro-lamports / CU</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 font-display uppercase tracking-wider text-xs"
        >
          <RefreshCw className={cn('h-3 w-3', isFetching && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statCards.map(({ key, label, color }) => (
              <div key={key} className="rounded-lg border border-border bg-card/50 p-4">
                <p className="font-mono text-xs text-muted-foreground mb-1">{label}</p>
                <p className={cn('font-display text-2xl font-bold', color)}>
                  {formatFee(data.current[key])}
                </p>
              </div>
            ))}
          </div>

          {/* Min/Max + sample info */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="rounded-sm border border-border px-2 py-1 font-mono">Min: {formatFee(data.current.min)}</span>
            <span className="rounded-sm border border-border px-2 py-1 font-mono">Max: {formatFee(data.current.max)}</span>
            <span className="rounded-sm border border-border px-2 py-1 font-mono">
              {data.current.nonZeroCount}/{data.current.sampleSize} slots with fees
            </span>
          </div>

          {/* Chart */}
          {data.slots.length > 0 && (
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <p className="font-mono text-xs text-muted-foreground mb-3">Fee per slot (recent 50 slots)</p>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.slots}>
                  <defs>
                    <linearGradient id="feeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="slot"
                    tickFormatter={(v: number) => `${(v % 10000)}`}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatFee}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                    labelFormatter={(v: number) => `Slot ${v.toLocaleString()}`}
                    formatter={(v: number) => [`${v.toLocaleString()} µ-lamports`, 'Fee']}
                  />
                  <Area
                    type="monotone"
                    dataKey="fee"
                    stroke="hsl(var(--primary))"
                    fill="url(#feeGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
