import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, CheckCircle, AlertCircle, Copy, ShieldCheck, 
  TrendingUp, TrendingDown, Cloud, AlertTriangle, 
  TrendingDownIcon, Eye, Lock, Github, Globe, ExternalLink, Users, Sparkles
} from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';
import { DimensionHealthIndicators } from './DimensionHealthIndicators';
import { PROJECT_CATEGORIES } from '@/types';
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

const getCategoryLabel = (value: string | null) => {
  if (!value) return '—';
  const cat = PROJECT_CATEGORIES.find(c => c.value === value);
  return cat?.label || value;
};

const formatProgramId = (programId: string, projectId: string) => {
  if (!programId || programId === projectId || programId.includes('-')) {
    return { display: 'Off-chain', isOnChain: false };
  }
  return { 
    display: `${programId.slice(0, 4)}...${programId.slice(-4)}`, 
    isOnChain: true 
  };
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const calculateDecayPercentage = (lastActivityDate: string | null): number => {
  if (!lastActivityDate) return 100;
  const days = (Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24);
  return (1 - Math.exp(-0.00167 * days)) * 100;
};

const getDecayColor = (percentage: number): string => {
  if (percentage <= 2) return 'text-primary';
  if (percentage <= 10) return 'text-amber-500';
  return 'text-destructive';
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
  
  const programIdInfo = formatProgramId(project.program_id, project.id);
  const decayPercentage = calculateDecayPercentage(project.github_last_activity);
  const isPrivate = isPrivateRepo(project);

  const copyToClipboard = useCallback((text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  }, []);

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
        <TableCell className="font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span>#{index + 1}</span>
            {getMovementIndicator(movement)}
          </div>
        </TableCell>
        <TableCell className="max-w-[140px]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary/10">
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
        <TableCell className="hidden lg:table-cell">
          <Badge variant="outline" className="border-border text-xs">
            {getCategoryLabel(project.category)}
          </Badge>
        </TableCell>
        <TableCell className="hidden lg:table-cell">
          <div className="flex items-center gap-2">
            {programIdInfo.isOnChain ? (
              <>
                <code className="font-mono text-xs text-muted-foreground">
                  {programIdInfo.display}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => copyToClipboard(project.program_id, e)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground text-xs">
                <Cloud className="mr-1 h-3 w-3" />
                {programIdInfo.display}
              </Badge>
            )}
          </div>
        </TableCell>
        {/* Score */}
        <TableCell className="text-right">
          {isPrivate ? (
            <Lock className="h-4 w-4 text-muted-foreground ml-auto" />
          ) : (
            <span className={cn('font-mono text-lg font-bold', getScoreColor(project.resilience_score))}>
              {Math.round(project.resilience_score)}
            </span>
          )}
        </TableCell>
        {/* Health */}
        <TableCell className="hidden xl:table-cell">
          <DimensionHealthIndicators
            dependencyScore={project.dependency_health_score}
            governanceTx30d={project.governance_tx_30d}
            tvlUsd={project.tvl_usd}
          />
        </TableCell>
        {/* Trend */}
        <TableCell className="hidden xl:table-cell">
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
              Private Repo
            </Badge>
          ) : (
            getStatusBadge(project.liveness_status)
          )}
        </TableCell>
        {/* Decay */}
        <TableCell className="hidden xl:table-cell">
          {isPrivate ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : (
            <div className="flex items-center gap-1">
              <TrendingDownIcon className={cn('h-3 w-3', getDecayColor(decayPercentage))} />
              <span className={cn('font-mono text-sm', getDecayColor(decayPercentage))}>
                {decayPercentage.toFixed(1)}%
              </span>
            </div>
          )}
        </TableCell>
        <TableCell className="hidden lg:table-cell">
          {getOriginalityBadge(project)}
        </TableCell>
        <TableCell className="hidden md:table-cell text-right">
          <span className="font-mono text-sm text-foreground">
            {(project.total_staked / 1000).toFixed(0)}K
          </span>
          <span className="ml-1 text-xs text-muted-foreground">SOL</span>
        </TableCell>
        <TableCell className="hidden lg:table-cell">
          {project.claimStatus === 'unclaimed' ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 border-amber-500/50 text-amber-500 hover:bg-amber-500/10 font-display text-[10px] uppercase"
              onClick={handleClaimClick}
            >
              Claim This
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
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>Source</span>
                    </div>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-500">
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
              </div>
            </PopoverContent>
          </Popover>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
});
