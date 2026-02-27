import { CheckCircle, Clock, AlertTriangle, ShieldCheck, ShieldX, ExternalLink, Play, Github } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Phase, PhaseMilestone } from '@/types';
import { cn } from '@/lib/utils';

interface MilestoneTimelineProps {
  phases: Phase[];
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  completed: { icon: CheckCircle, color: 'text-primary', label: 'COMPLETED' },
  dao_approved: { icon: ShieldCheck, color: 'text-green-500', label: 'DAO APPROVED' },
  dao_rejected: { icon: ShieldX, color: 'text-destructive', label: 'DAO REJECTED' },
  overdue: { icon: AlertTriangle, color: 'text-destructive', label: 'OVERDUE' },
  upcoming: { icon: Clock, color: 'text-muted-foreground', label: 'UPCOMING' },
};

export function MilestoneTimeline({ phases }: MilestoneTimelineProps) {
  if (!phases || phases.length === 0) {
    return (
      <div className="py-6 text-center">
        <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No milestones committed yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {phases.map((phase, idx) => (
        <div key={phase.id} className="rounded-sm border border-border/50 bg-muted/10">
          <div className="flex items-center justify-between border-b border-border/30 px-4 py-2">
            <span className="font-display text-xs font-semibold uppercase tracking-wider text-foreground">
              Phase {idx + 1}: {phase.title}
            </span>
            <div className="flex items-center gap-2">
              {phase.isLocked && (
                <Badge className="bg-primary/20 text-primary text-[10px]">LOCKED</Badge>
              )}
              <span className="font-mono text-[10px] text-muted-foreground">
                {phase.milestones?.filter((m) => m.status === 'completed' || m.status === 'dao_approved').length || 0}/
                {phase.milestones?.length || 0}
              </span>
            </div>
          </div>

          <div className="p-3 space-y-2">
            {(phase.milestones || []).map((ms) => (
              <MilestoneRow key={ms.id} milestone={ms} />
            ))}
            {(!phase.milestones || phase.milestones.length === 0) && (
              <p className="py-2 text-center text-xs text-muted-foreground">No milestones in this phase</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MilestoneRow({ milestone: ms }: { milestone: PhaseMilestone }) {
  const isOverdue = ms.status === 'upcoming' && ms.targetDate && new Date(ms.targetDate) < new Date();
  const effectiveStatus = isOverdue ? 'overdue' : ms.status;
  const config = statusConfig[effectiveStatus] || statusConfig.upcoming;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-sm border p-3',
        effectiveStatus === 'completed' || effectiveStatus === 'dao_approved'
          ? 'border-primary/20 bg-primary/5'
          : effectiveStatus === 'overdue' || effectiveStatus === 'dao_rejected'
          ? 'border-destructive/20 bg-destructive/5'
          : 'border-border/30 bg-background/30'
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', config.color)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium text-foreground">{ms.title}</span>
            <Badge className={cn('text-[9px]', 
              effectiveStatus === 'dao_approved' ? 'bg-primary/20 text-primary' :
              effectiveStatus === 'completed' ? 'bg-primary/20 text-primary' :
              effectiveStatus === 'overdue' || effectiveStatus === 'dao_rejected' ? 'bg-destructive/20 text-destructive' :
              'bg-muted text-muted-foreground'
            )}>
              {config.label}
            </Badge>
          </div>
          {ms.description && (
            <p className="mt-1 text-xs text-muted-foreground">{ms.description}</p>
          )}

          {/* Date info */}
          <div className="mt-1 flex flex-wrap gap-3">
            {ms.targetDate && (
              <span className="font-mono text-[10px] text-muted-foreground">
                Target: {new Date(ms.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {ms.completedAt && (
              <span className="font-mono text-[10px] text-primary">
                Completed: {new Date(ms.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* Delivery Evidence */}
          {ms.deliveryEvidence && (
            <div className="mt-2 rounded-sm border border-primary/20 bg-primary/5 p-2 space-y-1">
              <p className="text-[10px] font-semibold uppercase text-primary">Delivery Evidence</p>
              <p className="text-xs text-foreground">{ms.deliveryEvidence.summary}</p>
              {ms.deliveryEvidence.metricsAchieved && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">Metrics:</span> {ms.deliveryEvidence.metricsAchieved}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-1">
                {ms.deliveryEvidence.videoUrl && (
                  <Button variant="outline" size="sm" className="h-6 text-[10px]" asChild>
                    <a href={ms.deliveryEvidence.videoUrl} target="_blank" rel="noopener noreferrer">
                      <Play className="mr-1 h-3 w-3" />
                      VIDEO
                    </a>
                  </Button>
                )}
                {ms.deliveryEvidence.githubLinks?.map((link, i) => (
                  <Button key={i} variant="outline" size="sm" className="h-6 text-[10px]" asChild>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-1 h-3 w-3" />
                      PR #{i + 1}
                    </a>
                  </Button>
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground">
                Submitted {new Date(ms.deliveryEvidence.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}

          {/* Realms Proposal Link */}
          {ms.realmsProposalAddress && (
            <div className="mt-2 flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-6 font-display text-[10px] uppercase" asChild>
                <a
                  href={`https://app.realms.today/proposal/${ms.realmsProposalAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  VIEW PROPOSAL ON REALMS
                </a>
              </Button>
              {ms.realmsProposalState && (
                <span className="font-mono text-[10px] text-muted-foreground">
                  {ms.realmsProposalState}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
