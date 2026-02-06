import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ExplorerProject } from '@/hooks/useExplorerProjects';
import type { LivenessStatus } from '@/types/database';

interface MobileProgramCardProps {
  project: ExplorerProject;
  rank: number;
}

export function MobileProgramCard({ project, rank }: MobileProgramCardProps) {
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
      {/* Top Row: Rank + Status */}
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-muted-foreground">#{rank}</span>
        {getStatusBadge(project.liveness_status)}
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
          {project.program_id && project.program_id !== project.id && (
            <code className="font-mono text-xs text-muted-foreground">
              {project.program_id.slice(0, 4)}...{project.program_id.slice(-4)}
            </code>
          )}
        </div>
      </div>

      {/* Score Section */}
      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Resilience Score
          </span>
          <span className={cn('font-mono text-lg font-bold', getScoreColor(project.resilience_score))}>
            {Math.round(project.resilience_score)}/100
          </span>
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
}

export function MobileProgramCards({ projects }: MobileProgramCardsProps) {
  return (
    <div className="space-y-3">
      {projects.map((project, index) => (
        <MobileProgramCard key={project.id} project={project} rank={index + 1} />
      ))}
    </div>
  );
}
