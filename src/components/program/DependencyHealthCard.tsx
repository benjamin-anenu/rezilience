import { Package, AlertTriangle, CheckCircle, RefreshCw, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

interface DependencyHealthCardProps {
  healthScore: number;
  outdatedCount: number;
  criticalCount: number;
  analyzedAt?: string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  profileId?: string;
}

export function DependencyHealthCard({
  healthScore,
  outdatedCount,
  criticalCount,
  analyzedAt,
  onRefresh,
  isRefreshing,
  profileId,
}: DependencyHealthCardProps) {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-primary';
    if (score >= 50) return 'text-amber-500';
    return 'text-destructive';
  };

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Healthy', icon: CheckCircle };
    if (score >= 50) return { label: 'Needs Attention', icon: AlertTriangle };
    return { label: 'Critical', icon: AlertTriangle };
  };

  const status = getHealthStatus(healthScore);
  const StatusIcon = status.icon;

  return (
    <Card className="card-premium card-lift border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-chart-5/10">
              <Package className="h-5 w-5 text-chart-5" />
            </div>
            <div>
              <CardTitle className="font-display text-sm uppercase tracking-tight">
                DEPENDENCY HEALTH
              </CardTitle>
              <CardDescription className={`flex items-center gap-1.5 ${getHealthColor(healthScore)}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {profileId && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <Link to={`/deps/${profileId}`}>
                        <Network className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Dependency Tree</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onRefresh && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onRefresh}
                      disabled={isRefreshing}
                      className="h-8 w-8"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRefreshing ? 'Analyzing...' : 'Re-analyze dependencies'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Health Score Progress */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Health Score</span>
            <span className={`font-mono text-sm font-bold ${getHealthColor(healthScore)}`}>
              {healthScore}/100
            </span>
          </div>
          <Progress
            value={healthScore}
            className={`h-2 ${healthScore < 50 ? '[&>div]:bg-destructive' : healthScore < 80 ? '[&>div]:bg-amber-500' : ''}`}
          />
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-xs">
              {outdatedCount}
            </Badge>
            <span className="text-muted-foreground">Outdated</span>
          </div>
          
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Badge variant="destructive" className="font-mono text-xs">
                {criticalCount}
              </Badge>
              <span className="text-destructive">Critical</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mt-3 text-xs text-muted-foreground">
          Supply chain health based on Cargo.toml dependency versions vs. latest crates.io releases.
        </p>

        {/* Last Analyzed */}
        {analyzedAt && (
          <p className="mt-2 text-[10px] text-muted-foreground/70">
            Last analyzed: {formatDistanceToNow(new Date(analyzedAt), { addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
