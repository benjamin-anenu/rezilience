import { useState } from 'react';
import {
  Star,
  GitFork,
  Users,
  Activity,
  Package,
  Clock,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  GitCommit,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useGitHubAnalysis } from '@/hooks/useGitHubAnalysis';
import { useToast } from '@/hooks/use-toast';

interface GitHubAnalytics {
  github_org_url?: string;
  github_stars?: number;
  github_forks?: number;
  github_contributors?: number;
  github_language?: string;
  github_last_commit?: string;
  github_commit_velocity?: number;
  github_commits_30d?: number;
  github_releases_30d?: number;
  github_open_issues?: number;
  github_topics?: string[];
  github_top_contributors?: Array<{ login: string; contributions: number; avatar: string }>;
  github_recent_events?: Array<{ type: string; actor: string; date: string; message?: string }>;
  github_analyzed_at?: string;
  resilience_score?: number;
  liveness_status?: string;
}

interface GitHubAnalyticsCardProps {
  profileId: string;
  analytics: GitHubAnalytics;
  onRefresh?: () => void;
}

export const GitHubAnalyticsCard = ({ profileId, analytics, onRefresh }: GitHubAnalyticsCardProps) => {
  const { analyzeRepository, isAnalyzing } = useGitHubAnalysis();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasAnalytics = analytics.github_analyzed_at || analytics.github_stars !== undefined;

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return '—';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleRefresh = async () => {
    if (!analytics.github_org_url) {
      toast({
        title: 'No Repository Linked',
        description: 'Please link a GitHub repository first.',
        variant: 'destructive',
      });
      return;
    }

    setIsRefreshing(true);
    const result = await analyzeRepository(analytics.github_org_url, profileId);
    setIsRefreshing(false);

    if (result) {
      toast({
        title: 'Analytics Updated',
        description: `Score: ${result.resilienceScore}/100 | Status: ${result.livenessStatus}`,
      });
      onRefresh?.();
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PushEvent':
        return <GitCommit className="h-3 w-3" />;
      case 'ReleaseEvent':
        return <Package className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-primary/20 text-primary';
      case 'STALE':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'DECAYING':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!hasAnalytics) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-display text-lg uppercase tracking-tight">
            GitHub Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No GitHub analytics available yet.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Link a repository to see detailed metrics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="font-display text-lg uppercase tracking-tight">
            GitHub Analytics
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isAnalyzing}
            className="font-display text-xs uppercase tracking-wider"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-sm border border-border bg-muted/30 p-3 text-center">
            <Star className="mx-auto mb-1 h-4 w-4 text-yellow-500" />
            <div className="font-mono text-xl font-bold">
              {formatNumber(analytics.github_stars)}
            </div>
            <div className="text-[10px] text-muted-foreground">Stars</div>
          </div>
          <div className="rounded-sm border border-border bg-muted/30 p-3 text-center">
            <GitFork className="mx-auto mb-1 h-4 w-4 text-blue-500" />
            <div className="font-mono text-xl font-bold">
              {formatNumber(analytics.github_forks)}
            </div>
            <div className="text-[10px] text-muted-foreground">Forks</div>
          </div>
          <div className="rounded-sm border border-border bg-muted/30 p-3 text-center">
            <Users className="mx-auto mb-1 h-4 w-4 text-green-500" />
            <div className="font-mono text-xl font-bold">
              {formatNumber(analytics.github_contributors)}
            </div>
            <div className="text-[10px] text-muted-foreground">Contributors</div>
          </div>
          <div className="rounded-sm border border-border bg-muted/30 p-3 text-center">
            <Activity className="mx-auto mb-1 h-4 w-4 text-primary" />
            <div className="font-mono text-xl font-bold">
              {formatNumber(analytics.github_commits_30d)}
            </div>
            <div className="text-[10px] text-muted-foreground">Commits (30d)</div>
          </div>
        </div>

        {/* Commit Velocity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-display text-xs uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Commit Velocity
            </span>
            <span className="font-mono text-primary">
              {(analytics.github_commit_velocity || 0).toFixed(1)} commits/day
            </span>
          </div>
          <Progress
            value={Math.min((analytics.github_commit_velocity || 0) * 20, 100)}
            className="h-2"
          />
        </div>

        {/* Top Contributors */}
        {analytics.github_top_contributors && analytics.github_top_contributors.length > 0 && (
          <div className="space-y-3">
            <span className="font-display text-xs uppercase tracking-wider text-muted-foreground">
              Top Contributors
            </span>
            <div className="space-y-2">
              {analytics.github_top_contributors.slice(0, 3).map((contributor, index) => {
                const maxContributions = analytics.github_top_contributors?.[0]?.contributions || 1;
                const percentage = (contributor.contributions / maxContributions) * 100;

                return (
                  <div key={contributor.login} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                        <img
                          src={contributor.avatar}
                          alt={contributor.login}
                          className="h-5 w-5 rounded-full"
                        />
                        <span className="font-mono text-xs">@{contributor.login}</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {contributor.contributions} commits
                      </span>
                    </div>
                    <Progress value={percentage} className="h-1" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {analytics.github_recent_events && analytics.github_recent_events.length > 0 && (
          <div className="space-y-3">
            <span className="font-display text-xs uppercase tracking-wider text-muted-foreground">
              Recent Activity
            </span>
            <div className="space-y-2 rounded-sm border border-border bg-muted/30 p-3">
              {analytics.github_recent_events.slice(0, 5).map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.type)}
                    <span className="font-mono text-muted-foreground">
                      @{event.actor}
                    </span>
                    {event.message && (
                      <span className="max-w-[150px] truncate text-foreground">
                        {event.message}
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {formatDate(event.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Last synced: {formatDate(analytics.github_analyzed_at)}</span>
          </div>
          {analytics.github_org_url && (
            <a
              href={analytics.github_org_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary"
            >
              View on GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
