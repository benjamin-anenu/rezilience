import { TrendingUp, Users, Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContributorsPieChart } from './ContributorsPieChart';
import { ActivityAreaChart } from './ActivityAreaChart';
import { useScoreHistoryChart } from '@/hooks/useScoreHistory';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { TopContributor, RecentEvent } from '@/types';

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

interface AnalyticsChartsProps {
  projectId: string;
  topContributors?: TopContributor[];
  recentEvents?: RecentEvent[];
}

const chartTabs = [
  { value: 'score', label: 'Score History', icon: TrendingUp },
  { value: 'contributors', label: 'Contributors', icon: Users },
  { value: 'activity', label: 'Activity', icon: Activity },
];

function ScoreHistoryChart({ projectId }: { projectId: string }) {
  const { data: chartData, lastSyncedAt, isLoading } = useScoreHistoryChart(projectId);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  const hasData = chartData && chartData.length > 0;

  return (
    <div className="space-y-2">
      {/* Last Synced Indicator */}
      <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <TooltipProvider>
          <TooltipUI>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 cursor-help">
                <RefreshCw className="h-3 w-3" />
                <span>Last synced: {formatLastSynced(lastSyncedAt)}</span>
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

      {!hasData ? (
        <div className="flex h-[280px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Score history will appear once the project is tracked
          </p>
        </div>
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                domain={[0, 20]}
                label={{
                  value: 'Velocity',
                  angle: -90,
                  position: 'insideLeft',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 10,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                domain={[0, 100]}
                label={{
                  value: 'Score',
                  angle: 90,
                  position: 'insideRight',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 10,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '2px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar
                yAxisId="left"
                dataKey="velocity"
                fill="hsl(var(--primary) / 0.3)"
                radius={[2, 2, 0, 0]}
                name="Commit Velocity"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                name="Score"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function AnalyticsCharts({
  projectId,
  topContributors,
  recentEvents,
}: AnalyticsChartsProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
          Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="score" className="w-full">
          <TabsList className="mb-4 w-full justify-start bg-muted/50">
            {chartTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5 data-[state=active]:bg-background"
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="score" className="mt-0">
            <ScoreHistoryChart projectId={projectId} />
          </TabsContent>

          <TabsContent value="contributors" className="mt-0">
            <ContributorsPieChart data={topContributors} />
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            <ActivityAreaChart events={recentEvents} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
