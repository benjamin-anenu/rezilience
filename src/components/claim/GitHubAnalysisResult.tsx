import { Star, GitFork, Users, Activity, Package, Clock, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { GitHubAnalysisResult } from '@/hooks/useGitHubAnalysis';

interface GitHubAnalysisResultCardProps {
  result: GitHubAnalysisResult;
  showDetailed?: boolean;
}

export const GitHubAnalysisResultCard = ({ result, showDetailed = false }: GitHubAnalysisResultCardProps) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
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

  return (
    <div className="space-y-4 rounded-sm border border-primary/30 bg-primary/5 p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold uppercase tracking-tight">
              {result.name}
            </h3>
            <a
              href={result.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="font-mono text-xs text-muted-foreground">{result.fullName}</p>
          {result.language && (
            <Badge variant="outline" className="mt-1">
              {result.language}
            </Badge>
          )}
        </div>
        <div className="text-right">
          <div className="font-mono text-3xl font-bold text-primary">
            {result.resilienceScore}
          </div>
          <div className="text-[10px] text-muted-foreground">RESILIENCE SCORE</div>
          <Badge className={`mt-1 ${getStatusColor(result.livenessStatus)}`}>
            {result.livenessStatus}
          </Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-sm border border-border bg-card p-3 text-center">
          <Star className="mx-auto mb-1 h-4 w-4 text-yellow-500" />
          <div className="font-mono text-lg font-bold">{formatNumber(result.stars)}</div>
          <div className="text-[10px] text-muted-foreground">Stars</div>
        </div>
        <div className="rounded-sm border border-border bg-card p-3 text-center">
          <GitFork className="mx-auto mb-1 h-4 w-4 text-blue-500" />
          <div className="font-mono text-lg font-bold">{formatNumber(result.forks)}</div>
          <div className="text-[10px] text-muted-foreground">Forks</div>
        </div>
        <div className="rounded-sm border border-border bg-card p-3 text-center">
          <Users className="mx-auto mb-1 h-4 w-4 text-green-500" />
          <div className="font-mono text-lg font-bold">{result.contributors}</div>
          <div className="text-[10px] text-muted-foreground">Contributors</div>
        </div>
        <div className="rounded-sm border border-border bg-card p-3 text-center">
          <Activity className="mx-auto mb-1 h-4 w-4 text-primary" />
          <div className="font-mono text-lg font-bold">{result.commitsLast30Days}</div>
          <div className="text-[10px] text-muted-foreground">Commits (30d)</div>
        </div>
      </div>

      {/* Commit Velocity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-display text-xs uppercase tracking-wider text-muted-foreground">
            Commit Velocity
          </span>
          <span className="font-mono text-primary">
            {result.commitVelocity.toFixed(1)} commits/day
          </span>
        </div>
        <Progress value={Math.min(result.commitVelocity * 20, 100)} className="h-2" />
      </div>

      {/* Last Activity */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last Push</span>
        </div>
        <span className="font-mono text-foreground">{formatDate(result.pushedAt)}</span>
      </div>

      {/* Releases */}
      {(result.releasesLast30Days > 0 || result.latestRelease) && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>Releases (30d)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-foreground">{result.releasesLast30Days}</span>
            {result.latestRelease && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {result.latestRelease.tag}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Top Contributors */}
      {showDetailed && result.topContributors.length > 0 && (
        <div className="space-y-2">
          <span className="font-display text-xs uppercase tracking-wider text-muted-foreground">
            Top Contributors
          </span>
          <div className="flex flex-wrap gap-2">
            {result.topContributors.slice(0, 5).map((contributor, index) => (
              <div
                key={contributor.login}
                className="flex items-center gap-2 rounded-sm border border-border bg-card px-2 py-1"
              >
                {index < 3 && (
                  <span className="text-sm">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                )}
                <img
                  src={contributor.avatar}
                  alt={contributor.login}
                  className="h-5 w-5 rounded-full"
                />
                <span className="font-mono text-xs">@{contributor.login}</span>
                <span className="text-[10px] text-muted-foreground">
                  {contributor.contributions}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topics */}
      {result.topics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {result.topics.slice(0, 6).map((topic) => (
            <Badge key={topic} variant="secondary" className="text-[10px]">
              {topic}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
