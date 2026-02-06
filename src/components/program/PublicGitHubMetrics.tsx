import { Star, GitFork, Users, Activity, Package, Code, ExternalLink, AlertCircle, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
};

const getHealthStatus = (lastCommit?: string, commitVelocity?: number): { status: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
  if (!lastCommit) return { status: 'UNKNOWN', variant: 'outline' };
  
  const daysSince = Math.floor((Date.now() - new Date(lastCommit).getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSince <= 30 && (commitVelocity || 0) > 0.5) {
    return { status: 'ACTIVE', variant: 'default' };
  }
  if (daysSince <= 90) {
    return { status: 'STALE', variant: 'secondary' };
  }
  return { status: 'DECAYING', variant: 'destructive' };
};

const getVelocityInfo = (velocity?: number): { percent: number; label: string; color: string } => {
  const v = velocity || 0;
  // Normalize: 5 commits/day = 100%
  const percent = Math.min(v * 20, 100);
  
  if (percent > 60) return { percent, label: 'High', color: 'bg-primary' };
  if (percent > 30) return { percent, label: 'Moderate', color: 'bg-yellow-500' };
  if (percent > 0) return { percent, label: 'Low', color: 'bg-orange-500' };
  return { percent: 0, label: 'None', color: 'bg-muted' };
};

export function PublicGitHubMetrics({ analytics, githubUrl }: PublicGitHubMetricsProps) {
  const healthStatus = getHealthStatus(analytics?.github_last_commit, analytics?.github_commit_velocity);
  const velocityInfo = getVelocityInfo(analytics?.github_commit_velocity);
  
  const coreMetrics = [
    {
      icon: Star,
      value: formatNumber(analytics?.github_stars),
      label: 'Stars',
      iconColor: 'text-yellow-500',
    },
    {
      icon: GitFork,
      value: formatNumber(analytics?.github_forks),
      label: 'Forks',
      iconColor: 'text-blue-400',
    },
    {
      icon: Users,
      value: formatNumber(analytics?.github_contributors),
      label: 'Contributors',
      iconColor: 'text-green-400',
    },
    {
      icon: AlertCircle,
      value: formatNumber(analytics?.github_open_issues),
      label: 'Open Issues',
      iconColor: 'text-amber-500',
    },
    {
      icon: Activity,
      value: formatNumber(analytics?.github_commits_30d),
      label: 'Commits (30d)',
      iconColor: 'text-primary',
    },
  ];

  const secondaryMetrics = [
    {
      icon: Package,
      value: formatNumber(analytics?.github_releases_30d),
      label: 'Releases (30d)',
      iconColor: 'text-purple-400',
    },
    {
      icon: Code,
      value: analytics?.github_language || '—',
      label: 'Language',
      iconColor: 'text-muted-foreground',
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

  const topics = analytics?.github_topics as string[] | undefined;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
              GitHub Metrics
            </CardTitle>
            <Badge variant={healthStatus.variant} className="text-[10px] font-mono">
              {healthStatus.status}
            </Badge>
          </div>
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
      <CardContent className="space-y-4">
        {/* Core Metrics Row */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {coreMetrics.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col items-center rounded-sm border border-border bg-muted/30 p-3 text-center"
            >
              <metric.icon className={`mb-1.5 h-4 w-4 ${metric.iconColor}`} />
              <div className="font-mono text-lg font-bold text-foreground">
                {metric.value}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Row: Releases, Language, Velocity Bar */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {secondaryMetrics.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col items-center rounded-sm border border-border bg-muted/30 p-3 text-center"
            >
              <metric.icon className={`mb-1.5 h-4 w-4 ${metric.iconColor}`} />
              <div className="font-mono text-lg font-bold text-foreground">
                {metric.value}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {metric.label}
              </div>
            </div>
          ))}
          
          {/* Velocity Bar - spans 2 columns */}
          <div className="col-span-2 flex flex-col justify-center rounded-sm border border-border bg-muted/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Commit Velocity
                </span>
              </div>
              <span className="font-mono text-xs text-foreground">
                {(analytics?.github_commit_velocity || 0).toFixed(1)} commits/day
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className={`h-full transition-all ${velocityInfo.color}`}
                style={{ width: `${velocityInfo.percent}%` }}
              />
            </div>
            <div className="mt-1 text-right">
              <span className={`text-[10px] font-medium ${
                velocityInfo.label === 'High' ? 'text-primary' :
                velocityInfo.label === 'Moderate' ? 'text-yellow-500' :
                velocityInfo.label === 'Low' ? 'text-orange-500' : 'text-muted-foreground'
              }`}>
                {velocityInfo.label} Activity
              </span>
            </div>
          </div>
        </div>

        {/* Topics */}
        {topics && topics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">
              Topics:
            </span>
            {topics.slice(0, 8).map((topic) => (
              <Badge 
                key={topic} 
                variant="outline" 
                className="h-5 px-2 text-[10px] font-normal"
              >
                {topic}
              </Badge>
            ))}
            {topics.length > 8 && (
              <span className="text-[10px] text-muted-foreground">
                +{topics.length - 8} more
              </span>
            )}
          </div>
        )}

        {/* Footer Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Last commit: {formatRelativeTime(analytics?.github_last_commit)}</span>
          </div>
          {analytics?.github_analyzed_at && (
            <span>Data synced: {formatRelativeTime(analytics.github_analyzed_at)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
