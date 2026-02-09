import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, CheckCircle, AlertCircle, ShieldCheck, 
  TrendingUp, TrendingDown, AlertTriangle, 
  Eye, Lock, Github, Globe, ExternalLink, Users, Network
} from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';
import { DimensionHealthIndicators } from './DimensionHealthIndicators';
import type { ExplorerProject } from '@/hooks/useExplorerProjects';
import type { LivenessStatus } from '@/types/database';
import type { MovementType } from '@/hooks/useRankMovement';

// Custom X icon since Lucide doesn't have one
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface LeaderboardRowProps {
  project: ExplorerProject;
  index: number;
  movement: MovementType | undefined;
  scoreHistory: number[];
}

// Helper functions defined outside component to avoid recreation
const getScoreColor = (score: number) => {
  if (score >= 70) return 'text-primary';
  if (score >= 40) return 'text-amber-500';
  return 'text-destructive';
};

const getStatusBadge = (status: LivenessStatus) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary">
          <Activity className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    case 'STALE':
      return (
        <Badge variant="outline" className="border-muted-foreground/50 bg-muted text-muted-foreground">
          Stale
        </Badge>
      );
    case 'DECAYING':
      return (
        <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
          <AlertCircle className="mr-1 h-3 w-3" />
          Decaying
        </Badge>
      );
  }
};

const getOriginalityBadge = (project: ExplorerProject) => {
  if (project.claimStatus === 'unclaimed') {
    return (
      <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-500">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Unclaimed
      </Badge>
    );
  }
  
  if (project.is_fork) {
    return (
      <Badge variant="outline" className="border-destructive/50 text-destructive">
        Fork
      </Badge>
    );
  }
  if (project.verified) {
    return (
      <Badge variant="outline" className="border-primary/50 text-primary">
        <CheckCircle className="mr-1 h-3 w-3" />
        Verified
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-muted-foreground/50 text-muted-foreground">
      Unverified
    </Badge>
  );
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getMovementIndicator = (movement: MovementType | undefined) => {
  switch (movement) {
    case 'up':
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-3 w-3 text-destructive" />;
    default:
      return null;
  }
};

const isPrivateRepo = (project: ExplorerProject): boolean => {
  return project.claimStatus === 'unclaimed' && !project.github_analyzed_at;
};

export const LeaderboardRow = React.memo(function LeaderboardRow({
  project,
  index,
  movement,
  scoreHistory,
}: LeaderboardRowProps) {
  const navigate = useNavigate();
  const isPrivate = isPrivateRepo(project);

  const handleRowClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    
    if (project.claimStatus === 'unclaimed') {
      const params = new URLSearchParams({
        profile_id: project.id,
        project: project.program_name,
      });
      navigate(`/claim-profile?${params.toString()}`);
      return;
    }
    
    const routeId = project.program_id && project.program_id !== project.id 
      ? project.program_id 
      : project.id;
    navigate(`/program/${routeId}`);
  }, [navigate, project.claimStatus, project.id, project.program_id, project.program_name]);

  const handleClaimClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const params = new URLSearchParams({
      profile_id: project.id,
      project: project.program_name,
    });
    navigate(`/claim-profile?${params.toString()}`);
  }, [navigate, project.id, project.program_name]);

  return (
    <React.Fragment>
      <TableRow
        className="cursor-pointer border-border transition-colors hover:bg-muted/50"
        onClick={handleRowClick}
      >
        {/* Rank */}
        <TableCell className="font-mono text-muted-foreground w-14">
          <div className="flex items-center gap-1">
            <span>#{index + 1}</span>
            {getMovementIndicator(movement)}
          </div>
        </TableCell>
        {/* Project */}
        <TableCell className="max-w-[140px]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-primary/10">
              <span className="font-display text-xs font-bold text-primary">
                {project.program_name.charAt(0)}
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate font-medium text-foreground cursor-default">
                  {project.program_name}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{project.program_name}</p>
              </TooltipContent>
            </Tooltip>
            {project.verified && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="shrink-0">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Verified Project</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TableCell>
        {/* Score + Health inline */}
        <TableCell className="text-right w-24">
          {isPrivate ? (
            <Lock className="h-4 w-4 text-muted-foreground ml-auto" />
          ) : (
            <div className="flex items-center justify-end gap-2">
              <DimensionHealthIndicators
                dependencyScore={project.dependency_health_score}
                governanceTx30d={project.governance_tx_30d}
                tvlUsd={project.tvl_usd}
                compact
              />
              <span className={cn('font-mono text-lg font-bold', getScoreColor(project.resilience_score))}>
                {Math.round(project.resilience_score)}
              </span>
            </div>
          )}
        </TableCell>
        {/* Trend */}
        <TableCell className="w-20">
          {isPrivate ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Sparkline values={scoreHistory} />
          )}
        </TableCell>
        {/* Liveness */}
        <TableCell className="hidden md:table-cell">
          {isPrivate ? (
            <Badge variant="outline" className="border-muted-foreground/50 text-muted-foreground">
              <Lock className="mr-1 h-3 w-3" />
              Private
            </Badge>
          ) : (
            getStatusBadge(project.liveness_status)
          )}
        </TableCell>
        {/* Status */}
        <TableCell className="hidden lg:table-cell">
          {getOriginalityBadge(project)}
        </TableCell>
        {/* Staked */}
        <TableCell className="hidden lg:table-cell text-right">
          <span className="font-mono text-sm text-foreground">
            {(project.total_staked / 1000).toFixed(0)}K
          </span>
          <span className="ml-1 text-xs text-muted-foreground">SOL</span>
        </TableCell>
        {/* Activity */}
        <TableCell className="hidden xl:table-cell">
          {project.claimStatus === 'unclaimed' ? (
            <Button
              size="sm"
              variant="outline"
              className="h-6 border-amber-500/50 text-amber-500 hover:bg-amber-500/10 font-display text-[10px] uppercase"
              onClick={handleClaimClick}
            >
              Claim
            </Button>
          ) : (
            <span className="font-mono text-xs text-muted-foreground">
              {formatDate(project.github_last_commit)}
            </span>
          )}
        </TableCell>
        {/* Details Popover */}
        <TableCell className="text-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-72 p-3 bg-popover border-border" 
              align="end" 
              side="left"
              sideOffset={8}
            >
              <div className="space-y-3">
                {/* GitHub Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={isPrivate 
                      ? 'border-amber-500/50 text-amber-500' 
                      : 'border-primary/50 text-primary'
                    }
                  >
                    {isPrivate ? 'PRIVATE' : 'PUBLIC'}
                  </Badge>
                </div>
                
                {/* Website */}
                {project.website_url && (
                  <a 
                    href={project.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between text-sm hover:text-primary transition-colors"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </div>
                    <div className="flex items-center gap-1 text-foreground">
                      <span className="truncate max-w-[120px]">
                        {new URL(project.website_url).hostname}
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </a>
                )}
                
                {/* Contributors */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Contributors</span>
                  </div>
                  <span className="text-foreground">
                    {project.github_contributors || '—'}
                  </span>
                </div>
                
                {/* Source/Hackathon */}
                {project.discovery_source && (
                  <div className="flex items-center justify-between text-sm gap-3">
                    <span className="text-muted-foreground shrink-0">Source</span>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-500 max-w-[140px] truncate">
                      {project.discovery_source}
                    </Badge>
                  </div>
                )}
                
                {/* X Handle */}
                {project.x_username && (
                  <a 
                    href={`https://x.com/${project.x_username}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm hover:text-primary transition-colors"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <XIcon className="h-4 w-4" />
                      <span>X Handle</span>
                    </div>
                    <span className="text-foreground">@{project.x_username}</span>
                  </a>
                )}
                
                {/* Dependency Tree Link */}
                <div className="pt-3 mt-3 border-t border-border">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/deps/${project.id}`);
                    }}
                    className="flex items-center justify-between w-full text-sm hover:text-primary transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary">
                      <Network className="h-4 w-4" />
                      <span>View Dependency Tree</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
});
