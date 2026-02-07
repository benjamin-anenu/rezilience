import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, CheckCircle, ShieldCheck, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';
import { PROJECT_CATEGORIES } from '@/types';
import type { ExplorerProject } from '@/hooks/useExplorerProjects';
import type { LivenessStatus } from '@/types/database';
import type { MovementType } from '@/hooks/useRankMovement';

interface MobileProgramCardProps {
  project: ExplorerProject;
  rank: number;
  movement?: MovementType;
  scoreHistory?: number[];
}

export function MobileProgramCard({ project, rank, movement, scoreHistory }: MobileProgramCardProps) {
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-primary';
    if (score >= 70) return 'text-foreground';
    return 'text-destructive';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-primary';
    if (score >= 70) return 'bg-foreground';
    return 'bg-destructive';
  };

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
            Stale
          </Badge>
        );
      case 'DECAYING':
        return (
          <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive text-xs">
            <AlertCircle className="mr-1 h-3 w-3" />
            Decaying
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
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const handleClick = () => {
    const routeId = project.program_id && project.program_id !== project.id 
      ? project.program_id 
      : project.id;
    navigate(`/program/${routeId}`);
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
          {getStatusBadge(project.liveness_status)}
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
            <Sparkline values={scoreHistory || [project.resilience_score]} width={50} height={16} />
            <span className={cn('font-mono text-lg font-bold', getScoreColor(project.resilience_score))}>
              {Math.round(project.resilience_score)}/100
            </span>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div 
            className={cn('h-full transition-all', getProgressColor(project.resilience_score))}
            style={{ width: `${project.resilience_score}%` }}
          />
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">
          {(project.total_staked / 1000).toFixed(0)}K SOL Staked
        </span>
        <span className="flex items-center gap-1">
          {project.verified ? (
            <>
              <CheckCircle className="h-3 w-3 text-primary" />
              <span className="text-primary">Verified</span>
            </>
          ) : project.is_fork ? (
            <span className="text-destructive">Fork</span>
          ) : (
            <span>Unverified</span>
          )}
        </span>
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
