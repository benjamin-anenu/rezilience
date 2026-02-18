import { ArrowUp, ArrowDown, Minus, RefreshCw } from 'lucide-react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useScoreHistoryChart } from '@/hooks/useScoreHistory';

function formatLastSynced(dateString: string | null): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface ScoreTrendChartProps {
  projectId: string;
}

export function ScoreTrendChart({ projectId }: ScoreTrendChartProps) {
  const {
    data: chartData,
    lastSyncedAt,
    currentScore,
    scoreDelta,
    avgVelocity,
    dataPoints,
    isLoading,
  } = useScoreHistoryChart(projectId);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  const hasData = chartData && chartData.length > 0;

  return (
    <div className="space-y-3">
      {/* Header row: score badge + delta + synced */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display text-3xl font-bold tracking-tight text-foreground">
            {currentScore !== null ? currentScore : '—'}
            <span className="text-lg text-muted-foreground">/100</span>
          </span>
          {scoreDelta && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-xs font-medium ${
                scoreDelta.direction === 'up'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : scoreDelta.direction === 'down'
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {scoreDelta.direction === 'up' && <ArrowUp className="h-3 w-3" />}
              {scoreDelta.direction === 'down' && <ArrowDown className="h-3 w-3" />}
              {scoreDelta.direction === 'stable' && <Minus className="h-3 w-3" />}
              {scoreDelta.direction !== 'stable' && `${Math.abs(scoreDelta.value)}`}
            </span>
          )}
        </div>
        <TooltipProvider>
          <TooltipUI>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 cursor-help font-mono text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3" />
                <span>{formatLastSynced(lastSyncedAt)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {lastSyncedAt
                  ? `Data captured on ${new Date(lastSyncedAt).toLocaleString()}`
                  : 'No data captured yet. Use Refresh Data to sync.'}
              </p>
            </TooltipContent>
          </TooltipUI>
        </TooltipProvider>
      </div>

      {/* Chart */}
      {!hasData ? (
        <div className="flex h-[220px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Score history will appear once the project is tracked
          </p>
        </div>
      ) : (
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '4px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value}/100`, 'Score']}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#scoreGradient)"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer stats */}
      {hasData && (
        <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
          <span>Avg velocity: {avgVelocity} commits/day</span>
          <span>·</span>
          <span>{dataPoints} data point{dataPoints !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}
