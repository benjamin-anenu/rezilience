import { Calendar, CheckCircle, AlertTriangle, Lock, Clock, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { UnclaimedBanner } from '../UnclaimedBanner';
import type { Phase } from '@/types';
import { useState } from 'react';

interface RoadmapTabContentProps {
  milestones?: Phase[];
  isVerified?: boolean;
  claimStatus?: string;
}

function getMilestoneStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-primary" />;
    case 'overdue':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

export function RoadmapTabContent({ milestones, isVerified, claimStatus }: RoadmapTabContentProps) {
  const hasPhases = milestones && milestones.length > 0;
  const isUnclaimed = claimStatus === 'unclaimed';
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(milestones?.map((p) => p.id) || []));

  const togglePhase = (id: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Sort by order
  const sortedPhases = hasPhases
    ? [...milestones].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  // Calculate overall progress
  const totalMilestones = sortedPhases.reduce((sum, p) => sum + p.milestones.length, 0);
  const completedMilestones = sortedPhases.reduce(
    (sum, p) => sum + p.milestones.filter((m) => m.status === 'completed').length,
    0
  );
  const progressPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  if (!isVerified || !hasPhases) {
    if (isUnclaimed) {
      return (
        <UnclaimedBanner reason="Claim this project to publish your roadmap, set delivery commitments, and demonstrate long-term vision to stakers and users." />
      );
    }
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 relative">
            <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center">
              <MapPin className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            Roadmap Coming Soon
          </h3>
          <p className="text-muted-foreground max-w-sm">
            The project team hasn't published their roadmap yet. Check back later for milestone
            updates and delivery commitments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="card-premium border-border bg-card overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
              Roadmap Progress
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono">
                {completedMilestones} / {totalMilestones} milestones
              </Badge>
              <Badge variant="outline" className="font-mono">
                {sortedPhases.length} phase{sortedPhases.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="relative">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div
              className="absolute top-0 h-2 bg-primary/20 blur-sm rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      <div className="space-y-4">
        {sortedPhases.map((phase, index) => {
          const phaseCompleted = phase.milestones.length > 0 && phase.milestones.every((m) => m.status === 'completed');
          const phaseProgress = phase.milestones.length > 0
            ? phase.milestones.filter((m) => m.status === 'completed').length / phase.milestones.length
            : 0;
          const isExpanded = expandedPhases.has(phase.id);

          return (
            <Collapsible key={phase.id} open={isExpanded} onOpenChange={() => togglePhase(phase.id)}>
              <Card
                className={cn(
                  'card-premium border-border bg-card overflow-hidden transition-all',
                  phaseCompleted && 'border-primary/30'
                )}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <CardTitle className="font-display text-sm uppercase tracking-wider">
                            Phase {index + 1}: {phase.title}
                          </CardTitle>
                          <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${phaseProgress * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {phase.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                        {phase.varianceRequested && (
                          <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500">
                            Update Requested
                          </Badge>
                        )}
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {phase.milestones.filter((m) => m.status === 'completed').length}/{phase.milestones.length}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-2">
                    {phase.milestones.map((ms) => (
                      <div
                        key={ms.id}
                        className={cn(
                          'rounded-sm border p-3 transition-all',
                          ms.status === 'completed'
                            ? 'border-primary/20 bg-primary/5'
                            : ms.status === 'overdue'
                            ? 'border-destructive/20 bg-destructive/5'
                            : 'border-border bg-muted/20'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {getMilestoneStatusIcon(ms.status)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-display text-sm font-semibold uppercase text-foreground">
                              {ms.title}
                            </h4>
                            {ms.description && (
                              <p className="mt-1 text-xs text-muted-foreground">{ms.description}</p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {ms.targetDate && (
                                <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(ms.targetDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              )}
                              {ms.completedAt && (
                                <span className="text-[10px] font-mono text-primary">
                                  Completed {new Date(ms.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {phase.milestones.length === 0 && (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        No milestones defined for this phase yet.
                      </p>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
