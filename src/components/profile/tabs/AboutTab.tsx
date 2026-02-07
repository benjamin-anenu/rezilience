import { Lock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PROJECT_CATEGORIES } from '@/types';
import { RoadmapManagement } from './RoadmapManagement';
import type { ClaimedProfile } from '@/types';

interface AboutTabProps {
  profile: ClaimedProfile;
  xUserId?: string;
}

export function AboutTab({ profile, xUserId }: AboutTabProps) {
  const categoryLabel = PROJECT_CATEGORIES.find(c => c.value === profile.category)?.label || profile.category;
  const isOwner = !!xUserId;

  return (
    <div className="space-y-6">
      {/* Protected Fields Notice */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 text-amber-500" />
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-tight text-amber-500">
                Protected Fields
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Project name, description, and category are locked after verification. 
                Contact support if you need to request changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Identity */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg uppercase tracking-tight">
            Core Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Project Name</p>
              <p className="mt-1 font-display text-lg font-semibold">{profile.projectName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Category</p>
              <Badge variant="outline" className="mt-1">{categoryLabel}</Badge>
            </div>
          </div>

          {profile.description && (
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Description</p>
              <div 
                className="mt-1 prose prose-sm prose-invert max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: profile.description }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg uppercase tracking-tight">
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-sm border border-border bg-muted/30 p-4 text-center">
              <div className="font-mono text-3xl font-bold text-primary">{profile.score}</div>
              <div className="mt-1 text-xs text-muted-foreground">Resilience Score</div>
            </div>
            <div className="rounded-sm border border-border bg-muted/30 p-4 text-center">
              <Badge
                className={`text-lg ${
                  profile.livenessStatus === 'active'
                    ? 'bg-primary/20 text-primary'
                    : profile.livenessStatus === 'degraded'
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : 'bg-destructive/20 text-destructive'
                }`}
              >
                {profile.livenessStatus.toUpperCase()}
              </Badge>
              <div className="mt-2 text-xs text-muted-foreground">Liveness Status</div>
            </div>
            <div className="rounded-sm border border-border bg-muted/30 p-4 text-center">
              {profile.verified ? (
                <CheckCircle className="mx-auto h-8 w-8 text-primary" />
              ) : (
                <AlertTriangle className="mx-auto h-8 w-8 text-yellow-500" />
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                {profile.verified ? 'Verified Titan' : 'Pending Verification'}
              </div>
            </div>
          </div>

          {profile.verifiedAt && (
            <p className="text-center text-sm text-muted-foreground">
              Verified on {new Date(profile.verifiedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Roadmap / Milestones - Interactive for Owner, Static for Public */}
      {isOwner ? (
        <RoadmapManagement profile={profile} xUserId={xUserId} />
      ) : (
        profile.milestones.length > 0 && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-lg uppercase tracking-tight">
                Verified Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.milestones.map((milestone) => {
                  const targetDate = new Date(milestone.targetDate);
                  const isOverdue = targetDate < new Date() && milestone.status !== 'completed';

                  return (
                    <div
                      key={milestone.id}
                      className={`flex items-center justify-between rounded-sm border p-3 ${
                        milestone.status === 'completed'
                          ? 'border-primary/30 bg-primary/5'
                          : isOverdue
                          ? 'border-destructive/30 bg-destructive/5'
                          : milestone.varianceRequested
                          ? 'border-yellow-500/30 bg-yellow-500/5'
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {milestone.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : isOverdue ? (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        ) : milestone.isLocked ? (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="font-mono text-sm">{milestone.title}</span>
                        {milestone.varianceRequested && (
                          <Badge className="bg-yellow-500/20 text-yellow-500">
                            TIMELINE VARIANCE
                          </Badge>
                        )}
                        {isOverdue && (
                          <Badge className="bg-destructive/20 text-destructive">
                            OVERDUE
                          </Badge>
                        )}
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {targetDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
