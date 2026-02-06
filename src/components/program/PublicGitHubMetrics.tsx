import { Star, GitFork, Users, Activity, Package, Code, ExternalLink, AlertCircle, Clock, Zap, GitPullRequest, MessageSquare, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { GitHubAnalytics, TopContributor } from '@/types';

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

const getHealthStatus = (
  lastActivity?: string, 
  pushEvents30d?: number,
  prEvents30d?: number,
  issueEvents30d?: number,
  commitsLast30d?: number
): { status: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
  // Calculate days since last activity (any type)
  const daysSinceLastActivity = lastActivity 
    ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  // Multi-signal weighted activity: pushes 1x, PRs 2x, issues 1x, commits 1x
  const totalActivity = (pushEvents30d || 0) + ((prEvents30d || 0) * 2) + (issueEvents30d || 0) + (commitsLast30d || 0);
  
  if (daysSinceLastActivity <= 14 && totalActivity >= 5) {
    return { status: 'ACTIVE', variant: 'default' };
  }
  if (daysSinceLastActivity <= 45) {
    return { status: 'STALE', variant: 'secondary' };
  }
  return { status: 'DECAYING', variant: 'destructive' };
};

const getVelocityInfo = (velocity?: number): { percent: number; label: string; color: string } => {
  const v = velocity || 0;
  // Normalize: 2 commits/day = 100% (realistic for solo/small teams)
  const percent = Math.min(v * 50, 100);
  
  if (percent > 50) return { percent, label: 'High', color: 'bg-primary' };
  if (percent > 20) return { percent, label: 'Moderate', color: 'bg-yellow-500' };
  if (percent > 0) return { percent, label: 'Active', color: 'bg-green-500' };
  return { percent: 0, label: 'None', color: 'bg-muted' };
};

export function PublicGitHubMetrics({ analytics, githubUrl }: PublicGitHubMetricsProps) {
  // Use the analytics directly - multi-signal fields now included in GitHubAnalytics type
  const extendedAnalytics = analytics;
  
  const healthStatus = getHealthStatus(
    extendedAnalytics?.github_last_activity || analytics?.github_last_commit,
    extendedAnalytics?.github_push_events_30d,
    extendedAnalytics?.github_pr_events_30d,
    extendedAnalytics?.github_issue_events_30d,
    analytics?.github_commits_30d
  );
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
                velocityInfo.label === 'Active' ? 'text-green-500' : 'text-muted-foreground'
              }`}>
                {velocityInfo.label} Activity
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Signal Activity Breakdown */}
        {(extendedAnalytics?.github_push_events_30d !== undefined || 
          extendedAnalytics?.github_pr_events_30d !== undefined || 
          extendedAnalytics?.github_issue_events_30d !== undefined) && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Activity Signals (Last 30 Days)
            </span>
            <div className="rounded-sm border border-border bg-muted/30 p-3 space-y-3">
              {/* Calculate max for relative bars */}
              {(() => {
                const pushEvents = extendedAnalytics?.github_push_events_30d || 0;
                const prEvents = extendedAnalytics?.github_pr_events_30d || 0;
                const issueEvents = extendedAnalytics?.github_issue_events_30d || 0;
                const commits = analytics?.github_commits_30d || 0;
                const maxActivity = Math.max(pushEvents, prEvents, issueEvents, commits, 1);

                const signals = [
                  { icon: Upload, label: 'Push Events (all branches)', value: pushEvents, color: 'bg-primary' },
                  { icon: GitPullRequest, label: 'Pull Requests', value: prEvents, color: 'bg-blue-500' },
                  { icon: MessageSquare, label: 'Issue Activity', value: issueEvents, color: 'bg-amber-500' },
                  { icon: Activity, label: 'Commits (main)', value: commits, color: 'bg-green-500' },
                ];

                return signals.map((signal) => (
                  <div key={signal.label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <signal.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{signal.label}</span>
                      </div>
                      <span className="font-mono text-xs font-medium text-foreground">{signal.value}</span>
                    </div>
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div 
                        className={`h-full transition-all ${signal.color}`}
                        style={{ width: `${(signal.value / maxActivity) * 100}%` }}
                      />
                    </div>
                  </div>
                ));
              })()}
              
              {/* Last Activity */}
              {extendedAnalytics?.github_last_activity && (
                <div className="pt-2 border-t border-border/50 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Last activity: {formatRelativeTime(extendedAnalytics.github_last_activity)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Contributors */}
        {analytics?.github_top_contributors && analytics.github_top_contributors.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Top Contributors
            </span>
            <div className="space-y-2 rounded-sm border border-border bg-muted/30 p-3">
              {(analytics.github_top_contributors as TopContributor[]).slice(0, 5).map((contributor, index) => {
                const maxContributions = (analytics.github_top_contributors as TopContributor[])?.[0]?.contributions || 1;
                const percentage = (contributor.contributions / maxContributions) * 100;
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

                return (
                  <div key={contributor.login} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {medal && <span className="text-sm">{medal}</span>}
                        <a
                          href={`https://github.com/${contributor.login}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          <img
                            src={contributor.avatar}
                            alt={contributor.login}
                            className="h-5 w-5 rounded-full"
                            onError={(e) => {
                              e.currentTarget.src = 'https://github.com/ghost.png';
                            }}
                          />
                          <span className="font-mono text-xs">@{contributor.login}</span>
                        </a>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {contributor.contributions} {contributor.contributions === 1 ? 'commit' : 'commits'}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-1" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
