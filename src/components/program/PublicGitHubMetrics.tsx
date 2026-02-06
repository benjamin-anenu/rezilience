import { Star, GitFork, Users, Activity, Package, Code, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { GitHubAnalytics } from '@/types';

interface PublicGitHubMetricsProps {
  analytics?: GitHubAnalytics;
  githubUrl?: string;
}

const formatNumber = (num?: number): string => {
  if (num === undefined || num === null) return '—';
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

export function PublicGitHubMetrics({ analytics, githubUrl }: PublicGitHubMetricsProps) {
  const metrics = [
    {
      icon: Star,
      value: formatNumber(analytics?.github_stars),
      label: 'Stars',
    },
    {
      icon: GitFork,
      value: formatNumber(analytics?.github_forks),
      label: 'Forks',
    },
    {
      icon: Users,
      value: formatNumber(analytics?.github_contributors),
      label: 'Contributors',
    },
    {
      icon: Activity,
      value: formatNumber(analytics?.github_commits_30d),
      label: 'Commits (30d)',
    },
    {
      icon: Package,
      value: formatNumber(analytics?.github_releases_30d),
      label: 'Releases (30d)',
    },
    {
      icon: Code,
      value: analytics?.github_language || '—',
      label: 'Language',
    },
  ];

  const hasData = analytics && (
    analytics.github_stars !== undefined ||
    analytics.github_forks !== undefined ||
    analytics.github_contributors !== undefined
  );

  if (!hasData) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            GitHub Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-24 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No GitHub data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            GitHub Metrics
          </CardTitle>
          {githubUrl && (
            <Button asChild variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
              <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                View Repository
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col items-center rounded-sm border border-border bg-muted/30 p-3 text-center"
            >
              <metric.icon className="mb-1.5 h-4 w-4 text-muted-foreground" />
              <div className="font-mono text-xl font-bold text-foreground">
                {metric.value}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
