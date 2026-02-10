import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, AlertCircle, CheckCircle, ShieldCheck, TrendingUp, 
  TrendingDown, Sparkles, TrendingDownIcon, ChevronDown, ChevronUp,
  Globe, Users, ExternalLink, Lock, Github
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface MobileProgramCardProps {
  project: ExplorerProject;
  rank: number;
  movement?: MovementType;
  scoreHistory?: number[];
}

export function MobileProgramCard({ project, rank, movement, scoreHistory }: MobileProgramCardProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  // Detect private repo (unclaimed + no github analysis)
  const isPrivateRepo = project.claimStatus === 'unclaimed' && !project.github_analyzed_at;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-primary';
    if (score >= 40) return 'text-amber-500';
    return 'text-destructive';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-primary';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-destructive';
  };

  // Calculate decay percentage from github_last_activity
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

  const decayPercentage = calculateDecayPercentage(project.github_last_activity);

  const getStatusBadge = (status: LivenessStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary text-xs">
            <Activity className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case 'STALE':
        return (
          <Badge variant="outline" className="border-muted-foreground/50 bg-muted text-muted-foreground text-xs">
            Evolving
          </Badge>
        );
      case 'DECAYING':
        return (
          <Badge variant="outline" className="border-[hsl(212,11%,40%)]/50 bg-[hsl(212,11%,40%)]/10 text-[hsl(212,11%,40%)] text-xs">
            Observing
          </Badge>
        );
    }
  };

  const getCategoryLabel = (value: string | null) => {
    if (!value) return null;
    const cat = PROJECT_CATEGORIES.find(c => c.value === value);
    return cat?.label || value;
  };

  const getMovementIndicator = () => {
    switch (movement) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-destructive" />;
      case 'new':
        return <Sparkles className="h-3 w-3 text-amber-500" />;
      default:
        return null;
    }
  };

  const handleClick = () => {
    const routeId = project.program_id && project.program_id !== project.id 
      ? project.program_id 
      : project.id;
    navigate(`/program/${routeId}`);
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-sm border border-border bg-card p-4 transition-all hover:border-primary/50 active:scale-[0.99] cursor-pointer touch-feedback"
    >
      {/* Top Row: Rank + Movement + Status */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-muted-foreground">#{rank}</span>
          {getMovementIndicator()}
        </div>
        <div className="flex items-center gap-2">
          {project.category && (
            <Badge variant="outline" className="border-border text-xs">
              {getCategoryLabel(project.category)}
            </Badge>
          )}
          {isPrivateRepo ? (
            <Badge variant="outline" className="border-muted-foreground/50 text-muted-foreground text-xs">
              <Lock className="mr-1 h-3 w-3" />
              Private
            </Badge>
          ) : (
            getStatusBadge(project.liveness_status)
          )}
        </div>
      </div>

      {/* Program Identity */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 shrink-0">
          <span className="font-display text-lg font-bold text-primary">
            {project.program_name.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-semibold text-foreground truncate">
              {project.program_name}
            </h3>
            {project.verified && (
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            )}
          </div>
          {project.program_id && project.program_id !== project.id && !project.program_id.includes('-') && (
            <code className="font-mono text-xs text-muted-foreground">
              {project.program_id.slice(0, 4)}...{project.program_id.slice(-4)}
            </code>
          )}
          {(!project.program_id || project.program_id === project.id || project.program_id.includes('-')) && (
            <span className="text-xs text-muted-foreground">Off-chain</span>
          )}
        </div>
      </div>

      {/* Score Section with Sparkline */}
      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Resilience Score
          </span>
          <div className="flex items-center gap-3">
            {isPrivateRepo ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <>
                <Sparkline values={scoreHistory || [project.resilience_score]} width={50} height={16} />
                <span className={cn('font-mono text-lg font-bold', getScoreColor(project.resilience_score))}>
                  {Math.round(project.resilience_score)}/100
                </span>
              </>
            )}
          </div>
        </div>
        {!isPrivateRepo && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className={cn('h-full transition-all', getProgressColor(project.resilience_score))}
              style={{ width: `${project.resilience_score}%` }}
            />
          </div>
        )}
      </div>

      {/* Decay Rate and Health Indicators */}
      <div className="mb-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wider text-muted-foreground">Health</span>
          {isPrivateRepo ? (
            <Lock className="h-3 w-3 text-muted-foreground" />
          ) : (
            <DimensionHealthIndicators
              dependencyScore={project.dependency_health_score}
              governanceTx30d={project.governance_tx_30d}
              tvlUsd={project.tvl_usd}
            />
          )}
        </div>
        {isPrivateRepo ? (
          <Lock className="h-3 w-3 text-muted-foreground" />
        ) : (
          <div className={cn('flex items-center gap-1 font-mono', getDecayColor(decayPercentage))}>
            <TrendingDownIcon className="h-3 w-3" />
            <span>{decayPercentage.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Bottom Stats Row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">
          {(project.total_staked / 1000).toFixed(0)}K SOL Staked
        </span>
        <span className="flex items-center gap-1">
          {project.is_fork ? (
            <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive text-xs">
              Forked
            </Badge>
          ) : (
            <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary text-xs">
              <CheckCircle className="mr-1 h-3 w-3" />
              Owned
            </Badge>
          )}
          {project.claimStatus === 'unclaimed' ? (
            <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-500 text-xs">
              <AlertCircle className="mr-1 h-3 w-3" />
              Unclaimed
            </Badge>
          ) : (
            <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary text-xs">
              <CheckCircle className="mr-1 h-3 w-3" />
              Claimed
            </Badge>
          )}
        </span>
      </div>

      {/* Details Toggle Button */}
      <div className="mt-3 pt-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-7 text-xs text-muted-foreground hover:text-primary"
          onClick={toggleExpand}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show Details
            </>
          )}
        </Button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-border space-y-3" onClick={(e) => e.stopPropagation()}>
            {/* GitHub Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Github className="h-4 w-4" />
                <span className="text-xs">GitHub</span>
              </div>
              <Badge 
                variant="outline" 
                className={isPrivateRepo 
                  ? 'border-amber-500/50 text-amber-500 text-xs' 
                  : 'border-primary/50 text-primary text-xs'
                }
              >
                {isPrivateRepo ? 'PRIVATE' : 'PUBLIC'}
              </Badge>
            </div>

            {/* Website */}
            {project.website_url && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs">Website</span>
                </div>
                <a 
                  href={project.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Visit
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* Contributors */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-xs">Contributors</span>
              </div>
              <span className="text-xs text-foreground">
                {project.github_contributors || '—'}
              </span>
            </div>

            {/* Source/Hackathon */}
            {project.discovery_source && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-xs">Source</span>
                </div>
                <Badge variant="outline" className="border-amber-500/50 text-amber-500 text-xs">
                  {project.discovery_source}
                </Badge>
              </div>
            )}

            {/* X Handle */}
            {project.x_username && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <XIcon className="h-4 w-4" />
                  <span className="text-xs">X Handle</span>
                </div>
                <a 
                  href={`https://x.com/${project.x_username}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  @{project.x_username}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MobileProgramCardsProps {
  projects: ExplorerProject[];
  rankData?: {
    movements: Record<string, MovementType>;
    scoreHistories: Record<string, number[]>;
  };
}

export function MobileProgramCards({ projects, rankData }: MobileProgramCardsProps) {
  return (
    <div className="space-y-3">
      {projects.map((project, index) => (
        <MobileProgramCard 
          key={project.id} 
          project={project} 
          rank={index + 1}
          movement={rankData?.movements[project.id]}
          scoreHistory={rankData?.scoreHistories[project.id]}
        />
      ))}
    </div>
  );
}
