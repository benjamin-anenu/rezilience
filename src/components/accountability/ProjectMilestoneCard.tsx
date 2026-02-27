import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MilestoneTimeline } from './MilestoneTimeline';
import type { Phase } from '@/types';

interface ProjectMilestoneCardProps {
  project: {
    id: string;
    projectName: string;
    logoUrl: string | null;
    resilienceScore: number;
    livenessStatus: string | null;
    milestones: Phase[];
    realmsDeliveryRate: number | null;
    realmsProposalsTotal: number;
    realmsProposalsCompleted: number;
    category: string | null;
    description?: string | null;
  };
}

export function ProjectMilestoneCard({ project }: ProjectMilestoneCardProps) {
  const scoreBadgeClass =
    project.resilienceScore >= 70
      ? 'bg-primary/20 text-primary'
      : project.resilienceScore >= 40
      ? 'bg-yellow-500/20 text-yellow-500'
      : 'bg-destructive/20 text-destructive';

  const statusClass =
    project.livenessStatus === 'ACTIVE'
      ? 'bg-primary/20 text-primary'
      : project.livenessStatus === 'DECAYING'
      ? 'bg-destructive/20 text-destructive'
      : 'bg-muted text-muted-foreground';

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {project.logoUrl ? (
            <img
              src={project.logoUrl}
              alt={project.projectName}
              className="h-10 w-10 rounded-sm object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-muted font-display text-sm font-bold text-muted-foreground">
              {project.projectName.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/profile/${project.id}`}
                className="font-display text-base font-bold uppercase tracking-tight text-foreground hover:text-primary transition-colors"
              >
                {project.projectName}
              </Link>
              <Badge className={scoreBadgeClass}>{project.resilienceScore}</Badge>
              {project.livenessStatus && (
                <Badge className={`${statusClass} text-[10px]`}>{project.livenessStatus}</Badge>
              )}
            </div>
            {project.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{project.description}</p>
            )}
            <div className="mt-1 flex gap-3 text-[10px] font-mono text-muted-foreground">
              {project.realmsDeliveryRate !== null && (
                <span>Delivery Rate: {Math.round(project.realmsDeliveryRate * 100)}%</span>
              )}
              <span>Proposals: {project.realmsProposalsCompleted}/{project.realmsProposalsTotal}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <MilestoneTimeline phases={project.milestones} />
      </CardContent>
    </Card>
  );
}
