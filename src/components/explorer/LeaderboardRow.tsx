import React, { useCallback } from 'react';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, CheckCircle, AlertCircle, Copy, ShieldCheck, 
  TrendingUp, TrendingDown, Cloud, AlertTriangle, TrendingDownIcon,
  Eye, Lock, Github, Globe, ExternalLink, Users, Network
} from 'lucide-react';
import { IntelligenceGrid } from './IntelligenceGrid';
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
  velocityHistory: number[];
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
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-primary/50 bg-primary/10 text-primary">
          <Activity className="mr-0.5 h-2.5 w-2.5" />
          Active
        </Badge>
      );
    case 'STALE':
      return (
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-muted-foreground/50 bg-muted text-muted-foreground">
          Evolving
        </Badge>
      );
    case 'DECAYING':
      return (
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-[hsl(212,11%,40%)]/50 bg-[hsl(212,11%,40%)]/10 text-[hsl(212,11%,40%)]">
          Observing
        </Badge>
      );
  }
};

const getOriginalityBadge = (project: ExplorerProject) => {
  if (project.is_fork) {
    return (
      <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-destructive/50 bg-destructive/10 text-destructive">
        Forked
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-primary/50 bg-primary/10 text-primary">
      <CheckCircle className="mr-0.5 h-2.5 w-2.5" />
      Main
    </Badge>
  );
};

const getClaimStatusBadge = (project: ExplorerProject) => {
  if (project.claimStatus === 'unclaimed') {
    return (
      <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-amber-500/50 bg-amber-500/10 text-amber-500">
        <AlertTriangle className="mr-0.5 h-2.5 w-2.5" />
        Unclaimed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-primary/50 bg-primary/10 text-primary">
      <CheckCircle className="mr-0.5 h-2.5 w-2.5" />
      Claimed
    </Badge>
  );
};

const getCategoryLabel = (value: string | null) => {
  if (!value) return '—';
  // Short labels for compact display
  const shortLabels: Record<string, string> = {
    'defi': 'DeFi',
    'nft': 'NFT',
    'gaming': 'Game',
    'infrastructure': 'Infra',
    'social': 'Social',
    'dao': 'DAO',
    'payments': 'Pay',
    'other': 'Other',
  };
  return shortLabels[value] || value.slice(0, 5);
};

const formatProgramId = (programId: string, projectId: string) => {
  if (!programId || programId === projectId || programId.includes('-')) {
    return { display: '—', isOnChain: false };
  }
  return { 
    display: `${programId.slice(0, 3)}..${programId.slice(-3)}`, 
    isOnChain: true 
  };
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
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
  velocityHistory,
}: LeaderboardRowProps) {
  const navigate = useNavigate();
  const { trackEvent } = useAnalyticsTracker();
  const isPrivate = isPrivateRepo(project);
  const programIdInfo = formatProgramId(project.program_id, project.id);
  const decayPercentage = calculateDecayPercentage(project.github_last_activity);

  const copyToClipboard = useCallback((text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  }, []);

  const handleRowClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    trackEvent('click', 'leaderboard_row', { program: project.program_name });
    navigate(`/program/${project.id}`);
  }, [navigate, project.id, project.program_name, trackEvent]);

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
        <TableCell className="font-mono text-muted-foreground px-2 w-12">
          <div className="flex items-center gap-0.5">
            <span className="text-xs">#{index + 1}</span>
            {getMovementIndicator(movement)}
          </div>
        </TableCell>
        {/* Project */}
        <TableCell className="max-w-[120px] px-2">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-primary/10 overflow-hidden">
              {project.logo_url ? (
                <img src={project.logo_url} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling && ((e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="font-display text-[10px] font-bold text-primary">${project.program_name.charAt(0)}</span>`); }} />
              ) : (
                <span className="font-display text-[10px] font-bold text-primary">
                  {project.program_name.charAt(0)}
                </span>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate text-sm font-medium text-foreground cursor-default">
                  {project.program_name}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{project.program_name}</p>
              </TooltipContent>
            </Tooltip>
            {project.verified && (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
            )}
          </div>
        </TableCell>
        {/* Type */}
        <TableCell className="hidden lg:table-cell px-2 w-20">
          <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-border">
            {getCategoryLabel(project.category)}
          </Badge>
        </TableCell>
        {/* Program ID */}
        <TableCell className="hidden lg:table-cell px-2 w-24">
          {programIdInfo.isOnChain ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => copyToClipboard(project.program_id, e)}
                >
                  <span>{programIdInfo.display}</span>
                  <Copy className="h-2.5 w-2.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono text-xs">{project.program_id}</p>
                <p className="text-xs text-muted-foreground">Click to copy</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Cloud className="h-3 w-3" />
              Off-chain
            </span>
          )}
        </TableCell>
        {/* Score */}
        <TableCell className="text-right px-2 w-14">
          {isPrivate ? (
            <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
          ) : (
            <span className={cn('font-mono text-sm font-bold', getScoreColor(project.resilience_score))}>
              {Math.round(project.resilience_score)}
            </span>
          )}
        </TableCell>
        {/* Health */}
        <TableCell className="hidden xl:table-cell px-1 w-14">
          <DimensionHealthIndicators
            dependencyScore={project.dependency_health_score}
            governanceTx30d={project.governance_tx_30d}
            tvlUsd={project.tvl_usd}
          />
        </TableCell>
        {/* Trend (commit velocity preferred, fallback to score) */}
        <TableCell className="hidden xl:table-cell px-1 w-16">
          {isPrivate ? (
            <Lock className="h-3 w-3 text-muted-foreground" />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Sparkline 
                    values={velocityHistory.some(v => v > 0) ? velocityHistory : scoreHistory} 
                    width={50} 
                    height={16} 
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-medium">
                  {velocityHistory.some(v => v > 0) ? '7-day commit velocity' : '7-day score trend'}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </TableCell>
        {/* Liveness */}
        <TableCell className="hidden md:table-cell px-2 w-16">
          {isPrivate ? (
            <Lock className="h-3 w-3 text-muted-foreground" />
          ) : (
            getStatusBadge(project.liveness_status)
          )}
        </TableCell>
        {/* Decay */}
        <TableCell className="hidden xl:table-cell px-1 w-14">
          {isPrivate ? (
            <Lock className="h-3 w-3 text-muted-foreground" />
          ) : (
            <div className="flex items-center gap-0.5">
              <TrendingDownIcon className={cn('h-3 w-3', getDecayColor(decayPercentage))} />
              <span className={cn('font-mono text-[10px]', getDecayColor(decayPercentage))}>
                {decayPercentage.toFixed(0)}%
              </span>
            </div>
          )}
        </TableCell>
        {/* Originality */}
        <TableCell className="hidden lg:table-cell px-2 w-16">
          {getOriginalityBadge(project)}
        </TableCell>
        {/* Claim Status */}
        <TableCell className="hidden lg:table-cell px-2 w-20">
          {getClaimStatusBadge(project)}
        </TableCell>
        {/* Staked */}
        <TableCell className="hidden md:table-cell text-right px-2 w-16">
          <span className="font-mono text-xs text-foreground">
            {(project.total_staked / 1000).toFixed(0)}K
          </span>
        </TableCell>
        {/* Last Commit */}
        <TableCell className="hidden lg:table-cell px-2 w-20">
          {isPrivate ? (
            <Lock className="h-3 w-3 text-muted-foreground" />
          ) : (
            <span className="font-mono text-[10px] text-muted-foreground">
              {formatDate(project.github_last_commit)}
            </span>
          )}
        </TableCell>
        {/* Action */}
        <TableCell className="text-center px-1 w-16">
          <div className="flex items-center justify-center gap-1">
            {project.claimStatus === 'unclaimed' && (
              <Button
                size="sm"
                variant="outline"
                className="h-5 px-2 border-amber-500/50 text-amber-500 hover:bg-amber-500/10 font-display text-[9px] uppercase"
                onClick={handleClaimClick}
              >
                Claim
              </Button>
            )}
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
                className="w-80 p-3 bg-popover border-border" 
                align="end" 
                side="left"
                sideOffset={8}
              >
                <div className="space-y-3">
                  {/* Identity Section */}
                  <div className="space-y-2">
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
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Contributors</span>
                      </div>
                      <span className="text-foreground">
                        {project.github_contributors || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Intelligence Grid */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Intelligence</p>
                    <IntelligenceGrid
                      commitVelocity={project.github_commit_velocity}
                      commits30d={project.github_commits_30d}
                      dependencyScore={project.dependency_health_score}
                      outdatedCount={project.dependency_outdated_count}
                      criticalCount={project.dependency_critical_count}
                      governanceTx30d={project.governance_tx_30d}
                      tvlUsd={project.tvl_usd}
                      vulnerabilityCount={project.vulnerability_count}
                      openssfScore={project.openssf_score}
                      bytecodeStatus={project.bytecode_match_status}
                      decayPercentage={decayPercentage}
                      lastAnalyzedAt={project.github_analyzed_at}
                      isPrivate={isPrivate}
                    />
                  </div>
                  
                  {/* Actions */}
                  <div className="pt-2 border-t border-border">
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
          </div>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
});
