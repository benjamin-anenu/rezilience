import { TrendingUp, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContributorsPieChart } from './ContributorsPieChart';
import { ActivityAreaChart } from './ActivityAreaChart';
import { ScoreTrendChart } from './ScoreTrendChart';
import type { TopContributor, RecentEvent } from '@/types';

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
            <ScoreTrendChart projectId={projectId} />
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
