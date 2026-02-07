import { Calendar, CheckCircle, AlertTriangle, Lock, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Milestone } from '@/types';

interface RoadmapTabContentProps {
  milestones?: Milestone[];
  isVerified?: boolean;
}

function getMilestoneIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-primary" />;
    case 'overdue':
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    default:
      return <Clock className="h-5 w-5 text-muted-foreground" />;
  }
}

function getMilestoneColors(status: string) {
  switch (status) {
    case 'completed':
      return 'border-primary/30 bg-primary/5';
    case 'overdue':
      return 'border-destructive/30 bg-destructive/5';
    default:
      return 'border-border bg-muted/30';
  }
}

export function RoadmapTabContent({ milestones, isVerified }: RoadmapTabContentProps) {
  const hasMilestones = milestones && milestones.length > 0;

  // Sort milestones by target date
  const sortedMilestones = hasMilestones
    ? [...milestones].sort(
        (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      )
    : [];

  // Calculate progress
  const completedCount = sortedMilestones.filter((m) => m.status === 'completed').length;
  const progressPercent = hasMilestones ? (completedCount / sortedMilestones.length) * 100 : 0;

  if (!isVerified || !hasMilestones) {
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
              Milestone Progress
            </CardTitle>
            <Badge variant="outline" className="font-mono">
              {completedCount} / {sortedMilestones.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-0">
          {/* Progress Bar */}
          <div className="relative mb-6">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Progress glow - softened */}
            <div
              className="absolute top-0 h-2 bg-primary/20 blur-sm rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timeline - Desktop Horizontal */}
      <Card className="card-premium border-border bg-card hidden lg:block">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            Verified Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-6 h-0.5 bg-border" />
            <div
              className="absolute left-0 top-6 h-0.5 bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Milestones */}
            <div className="relative flex justify-between gap-4">
              {sortedMilestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="flex flex-col items-center"
                  style={{ flex: 1 }}
                >
                  {/* Dot */}
                  <div
                    className={cn(
                      'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-card transition-all',
                      milestone.status === 'completed'
                        ? 'border-primary'
                        : milestone.status === 'overdue'
                        ? 'border-destructive'
                        : 'border-border'
                    )}
                  >
                    {getMilestoneIcon(milestone.status)}
                    {milestone.isLocked && (
                      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="mt-3 text-center max-w-[140px]">
                    <h4 className="font-display text-xs font-semibold uppercase text-foreground line-clamp-2">
                      {milestone.title}
                    </h4>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(milestone.targetDate).toLocaleDateString()}
                    </p>
                    {milestone.varianceRequested && (
                      <Badge
                        variant="outline"
                        className="mt-1 text-[10px] border-amber-500/30 text-amber-500"
                      >
                        Update Requested
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline - Mobile Vertical */}
      <Card className="card-premium border-border bg-card lg:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            Verified Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-4 pl-8">
            {/* Vertical line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
            <div
              className="absolute left-3 top-0 w-0.5 bg-primary transition-all duration-500"
              style={{ height: `${progressPercent}%` }}
            />

            {sortedMilestones.map((milestone) => (
              <div key={milestone.id} className="relative">
                {/* Dot */}
                <div
                  className={cn(
                    'absolute -left-5 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-card',
                    milestone.status === 'completed'
                      ? 'border-primary'
                      : milestone.status === 'overdue'
                      ? 'border-destructive'
                      : 'border-border'
                  )}
                >
                  {milestone.status === 'completed' && (
                    <CheckCircle className="h-3 w-3 text-primary" />
                  )}
                  {milestone.status === 'overdue' && (
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                  )}
                </div>

                {/* Card */}
                <div
                  className={cn(
                    'rounded-sm border p-4 transition-all',
                    getMilestoneColors(milestone.status)
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-sm font-semibold uppercase text-foreground">
                      {milestone.title}
                    </h4>
                    {milestone.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(milestone.targetDate).toLocaleDateString()}</span>
                    {milestone.varianceRequested && (
                      <Badge
                        variant="outline"
                        className="text-[10px] border-amber-500/30 text-amber-500"
                      >
                        Update Requested
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
