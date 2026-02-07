import { useState } from 'react';
import { CheckCircle, Calendar, Lock, AlertTriangle, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import type { ClaimedProfile, Milestone } from '@/types';

interface RoadmapManagementProps {
  profile: ClaimedProfile;
  xUserId: string;
}

export function RoadmapManagement({ profile, xUserId }: RoadmapManagementProps) {
  const updateProfile = useUpdateProfile();
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [varianceDialogOpen, setVarianceDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  const milestones = profile.milestones || [];

  const handleMarkComplete = () => {
    if (!selectedMilestone) return;

    const updatedMilestones = milestones.map((m) =>
      m.id === selectedMilestone.id
        ? { ...m, status: 'completed' as const, completedAt: new Date().toISOString() }
        : m
    );

    updateProfile.mutate(
      { profileId: profile.id, xUserId, updates: { milestones: updatedMilestones } },
      { onSuccess: () => setCompleteDialogOpen(false) }
    );
  };

  const handleRequestVariance = () => {
    if (!selectedMilestone || !newTargetDate) return;

    const updatedMilestones = milestones.map((m) =>
      m.id === selectedMilestone.id
        ? {
            ...m,
            varianceRequested: true,
            originalTargetDate: m.originalTargetDate || m.targetDate,
            targetDate: newTargetDate,
          }
        : m
    );

    updateProfile.mutate(
      { profileId: profile.id, xUserId, updates: { milestones: updatedMilestones } },
      {
        onSuccess: () => {
          setVarianceDialogOpen(false);
          setNewTargetDate('');
        },
      }
    );
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle || !newMilestoneDate) return;

    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      title: newMilestoneTitle,
      targetDate: newMilestoneDate,
      isLocked: false,
      status: 'upcoming',
    };

    const updatedMilestones = [...milestones, newMilestone];

    updateProfile.mutate(
      { profileId: profile.id, xUserId, updates: { milestones: updatedMilestones } },
      {
        onSuccess: () => {
          setAddDialogOpen(false);
          setNewMilestoneTitle('');
          setNewMilestoneDate('');
        },
      }
    );
  };

  const handleLockAllMilestones = () => {
    const updatedMilestones = milestones.map((m) => ({ ...m, isLocked: true }));

    updateProfile.mutate({
      profileId: profile.id,
      xUserId,
      updates: { milestones: updatedMilestones },
    });
  };

  const hasUnlockedMilestones = milestones.some((m) => !m.isLocked);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg uppercase tracking-tight">
            Roadmap Management
          </CardTitle>
          <div className="flex gap-2">
            {hasUnlockedMilestones && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLockAllMilestones}
                disabled={updateProfile.isPending}
                className="font-display text-xs uppercase"
              >
                <Lock className="mr-1 h-3 w-3" />
                Lock All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              className="font-display text-xs uppercase"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Milestone
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <div className="py-8 text-center">
            <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No milestones yet</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Add milestones to track your protocol's progress
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone) => {
              const targetDate = new Date(milestone.targetDate);
              const isOverdue =
                targetDate < new Date() && milestone.status !== 'completed';
              const isCompleted = milestone.status === 'completed';

              return (
                <div
                  key={milestone.id}
                  className={`rounded-sm border p-4 ${
                    isCompleted
                      ? 'border-primary/30 bg-primary/5'
                      : isOverdue
                      ? 'border-destructive/30 bg-destructive/5'
                      : milestone.varianceRequested
                      ? 'border-yellow-500/30 bg-yellow-500/5'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      {isCompleted ? (
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      ) : isOverdue ? (
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                      ) : milestone.isLocked ? (
                        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      ) : (
                        <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      )}
                      <div>
                        <span className="font-mono text-sm font-medium">
                          {milestone.title}
                        </span>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            Target:{' '}
                            {targetDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          {milestone.varianceRequested && (
                            <Badge className="bg-yellow-500/20 text-yellow-500">
                              TIMELINE VARIANCE
                            </Badge>
                          )}
                          {isOverdue && !isCompleted && (
                            <Badge className="bg-destructive/20 text-destructive">
                              OVERDUE
                            </Badge>
                          )}
                          {!milestone.isLocked && (
                            <Badge variant="outline" className="text-xs">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        {milestone.completedAt && (
                          <p className="mt-1 text-xs text-primary">
                            Completed on{' '}
                            {new Date(milestone.completedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isCompleted && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedMilestone(milestone);
                            setCompleteDialogOpen(true);
                          }}
                          className="font-display text-xs uppercase"
                        >
                          Mark Complete
                        </Button>
                        {milestone.isLocked && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedMilestone(milestone);
                              setNewTargetDate(milestone.targetDate);
                              setVarianceDialogOpen(true);
                            }}
                            className="font-display text-xs uppercase"
                          >
                            Request Update
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Mark Complete Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">
              Mark Milestone Complete
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The milestone will be publicly marked as
              completed with today's date.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-sm border border-border bg-muted/30 p-4">
            <p className="font-mono text-sm font-medium">{selectedMilestone?.title}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Target:{' '}
              {selectedMilestone &&
                new Date(selectedMilestone.targetDate).toLocaleDateString()}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkComplete} disabled={updateProfile.isPending}>
              {updateProfile.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Variance Dialog */}
      <Dialog open={varianceDialogOpen} onOpenChange={setVarianceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">
              Request Timeline Update
            </DialogTitle>
            <DialogDescription>
              Update the target date for this milestone. A "Timeline Variance" badge will
              be shown on your public profile to maintain transparency.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-sm border border-border bg-muted/30 p-4">
              <p className="font-mono text-sm font-medium">{selectedMilestone?.title}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Original Target:{' '}
                {selectedMilestone &&
                  new Date(
                    selectedMilestone.originalTargetDate || selectedMilestone.targetDate
                  ).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-date">New Target Date</Label>
              <Input
                id="new-date"
                type="date"
                value={newTargetDate}
                onChange={(e) => setNewTargetDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVarianceDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestVariance}
              disabled={updateProfile.isPending || !newTargetDate}
            >
              {updateProfile.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Timeline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Milestone Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">
              Add New Milestone
            </DialogTitle>
            <DialogDescription>
              Create a new milestone for your protocol roadmap. New milestones are
              unlocked until you explicitly lock them.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-title">Milestone Title</Label>
              <Input
                id="milestone-title"
                placeholder="e.g., Mainnet V2 Launch"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-date">Target Date</Label>
              <Input
                id="milestone-date"
                type="date"
                value={newMilestoneDate}
                onChange={(e) => setNewMilestoneDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMilestone}
              disabled={
                updateProfile.isPending || !newMilestoneTitle || !newMilestoneDate
              }
            >
              {updateProfile.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
