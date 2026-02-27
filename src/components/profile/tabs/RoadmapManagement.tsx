import { useState } from 'react';
import { CheckCircle, Calendar, Lock, AlertTriangle, Plus, Loader2, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import type { ClaimedProfile, Phase, PhaseMilestone } from '@/types';
import { cn } from '@/lib/utils';

interface RoadmapManagementProps {
  profile: ClaimedProfile;
  xUserId: string;
}

export function RoadmapManagement({ profile, xUserId }: RoadmapManagementProps) {
  const updateProfile = useUpdateProfile();
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [varianceDialogOpen, setVarianceDialogOpen] = useState(false);
  const [addPhaseDialogOpen, setAddPhaseDialogOpen] = useState(false);
  const [addMilestonePhaseId, setAddMilestonePhaseId] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<{ phaseId: string; milestone: PhaseMilestone } | null>(null);
  const [newPhaseTitle, setNewPhaseTitle] = useState('');
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', targetDate: '' });
  const [evidence, setEvidence] = useState({ summary: '', metricsAchieved: '', videoUrl: '', githubLinks: '' });
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set((profile.milestones || []).map((p) => p.id))
  );

  const phases: Phase[] = profile.milestones || [];

  const togglePhase = (id: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const savePhases = (updated: Phase[], onSuccess?: () => void) => {
    updateProfile.mutate(
      { profileId: profile.id, xUserId, updates: { milestones: updated as any } },
      { onSuccess }
    );
  };

  const handleMarkComplete = () => {
    if (!selectedMilestone) return;
    if (!evidence.summary.trim()) return;
    
    const deliveryEvidence = {
      summary: evidence.summary.trim(),
      metricsAchieved: evidence.metricsAchieved.trim(),
      videoUrl: evidence.videoUrl.trim() || undefined,
      githubLinks: evidence.githubLinks.trim() 
        ? evidence.githubLinks.split(',').map((l) => l.trim()).filter(Boolean)
        : undefined,
      submittedAt: new Date().toISOString(),
    };

    const updated = phases.map((p) =>
      p.id === selectedMilestone.phaseId
        ? {
            ...p,
            milestones: p.milestones.map((m) =>
              m.id === selectedMilestone.milestone.id
                ? { ...m, status: 'completed' as const, completedAt: new Date().toISOString(), deliveryEvidence }
                : m
            ),
          }
        : p
    );
    savePhases(updated, () => {
      setCompleteDialogOpen(false);
      setEvidence({ summary: '', metricsAchieved: '', videoUrl: '', githubLinks: '' });
    });
  };

  const handleRequestVariance = () => {
    if (!selectedMilestone) return;
    const updated = phases.map((p) =>
      p.id === selectedMilestone.phaseId ? { ...p, varianceRequested: true } : p
    );
    savePhases(updated, () => setVarianceDialogOpen(false));
  };

  const handleAddPhase = () => {
    if (!newPhaseTitle.trim()) return;
    const newPhase: Phase = {
      id: crypto.randomUUID(),
      title: newPhaseTitle,
      isLocked: false,
      milestones: [],
      order: phases.length,
    };
    savePhases([...phases, newPhase], () => {
      setAddPhaseDialogOpen(false);
      setNewPhaseTitle('');
      setExpandedPhases((prev) => new Set(prev).add(newPhase.id));
    });
  };

  const handleAddMilestone = () => {
    if (!addMilestonePhaseId || !newMilestone.title.trim()) return;
    const ms: PhaseMilestone = {
      id: crypto.randomUUID(),
      title: newMilestone.title,
      description: newMilestone.description,
      targetDate: newMilestone.targetDate || undefined,
      status: 'upcoming',
    };
    const updated = phases.map((p) =>
      p.id === addMilestonePhaseId ? { ...p, milestones: [...p.milestones, ms] } : p
    );
    savePhases(updated, () => {
      setAddMilestonePhaseId(null);
      setNewMilestone({ title: '', description: '', targetDate: '' });
    });
  };

  const handleRemovePhase = (phaseId: string) => {
    savePhases(phases.filter((p) => p.id !== phaseId));
  };

  const handleRemoveMilestone = (phaseId: string, msId: string) => {
    const updated = phases.map((p) =>
      p.id === phaseId ? { ...p, milestones: p.milestones.filter((m) => m.id !== msId) } : p
    );
    savePhases(updated);
  };

  const handleLockAll = () => {
    savePhases(phases.map((p) => ({ ...p, isLocked: true })));
  };

  const hasUnlocked = phases.some((p) => !p.isLocked);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg uppercase tracking-tight">
            Roadmap Management
          </CardTitle>
          <div className="flex gap-2">
            {hasUnlocked && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLockAll}
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
              onClick={() => setAddPhaseDialogOpen(true)}
              className="font-display text-xs uppercase"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Phase
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {phases.length === 0 ? (
          <div className="py-8 text-center">
            <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No phases yet</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Add phases with milestones to track your project's progress
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {phases.map((phase, index) => {
              const isExpanded = expandedPhases.has(phase.id);
              return (
                <Collapsible key={phase.id} open={isExpanded} onOpenChange={() => togglePhase(phase.id)}>
                  <div
                    className={cn(
                      'rounded-sm border',
                      phase.isLocked ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/20'
                    )}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex cursor-pointer items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          <span className="font-display text-sm font-semibold uppercase tracking-wide">
                            Phase {index + 1}: {phase.title}
                          </span>
                          {phase.isLocked && <Lock className="h-3 w-3 text-primary" />}
                          {phase.varianceRequested && (
                            <Badge className="bg-yellow-500/20 text-yellow-500 text-[10px]">VARIANCE</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {phase.milestones.filter((m) => m.status === 'completed').length}/{phase.milestones.length}
                          </span>
                          {!phase.isLocked && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); handleRemovePhase(phase.id); }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t border-border/50 px-3 pb-3 pt-2 space-y-2">
                        {phase.milestones.map((ms) => {
                          const isCompleted = ms.status === 'completed';
                          const isOverdue = ms.targetDate && new Date(ms.targetDate) < new Date() && !isCompleted;

                          return (
                            <div
                              key={ms.id}
                              className={cn(
                                'rounded-sm border p-3',
                                isCompleted ? 'border-primary/20 bg-primary/5' : isOverdue ? 'border-destructive/20 bg-destructive/5' : 'border-border/50 bg-background/50'
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  {isCompleted ? (
                                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                  ) : isOverdue ? (
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                                  ) : (
                                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <span className="font-mono text-sm font-medium">{ms.title}</span>
                                    {ms.description && (
                                      <p className="mt-1 text-xs text-muted-foreground">{ms.description}</p>
                                    )}
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                      {ms.targetDate && (
                                        <span className="font-mono text-[10px] text-muted-foreground">
                                          Target: {new Date(ms.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                      )}
                                      {ms.completedAt && (
                                        <span className="text-[10px] text-primary">
                                          Completed {new Date(ms.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                      )}
                                      {isOverdue && !isCompleted && (
                                        <Badge className="bg-destructive/20 text-destructive text-[10px]">OVERDUE</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {!isCompleted && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => {
                                        setSelectedMilestone({ phaseId: phase.id, milestone: ms });
                                        setCompleteDialogOpen(true);
                                      }}
                                      className="h-7 font-display text-[10px] uppercase"
                                    >
                                      Complete
                                    </Button>
                                  )}
                                  {!phase.isLocked && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleRemoveMilestone(phase.id, ms.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Add milestone button */}
                        {!phase.isLocked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full border border-dashed border-border/50 font-display text-xs uppercase text-muted-foreground"
                            onClick={() => {
                              setAddMilestonePhaseId(phase.id);
                              setNewMilestone({ title: '', description: '', targetDate: '' });
                            }}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Milestone
                          </Button>
                        )}

                        {/* Variance request for locked phases */}
                        {phase.isLocked && !phase.varianceRequested && phase.milestones.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full font-display text-xs uppercase"
                            onClick={() => {
                              setSelectedMilestone({ phaseId: phase.id, milestone: phase.milestones[0] });
                              setVarianceDialogOpen(true);
                            }}
                          >
                            Request Phase Update
                          </Button>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Mark Complete Dialog — with Delivery Evidence */}
      <Dialog open={completeDialogOpen} onOpenChange={(open) => {
        setCompleteDialogOpen(open);
        if (!open) setEvidence({ summary: '', metricsAchieved: '', videoUrl: '', githubLinks: '' });
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">Submit Delivery Evidence</DialogTitle>
            <DialogDescription>
              Provide evidence of what was delivered. This is publicly visible and required for DAO accountability.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-sm border border-border bg-muted/30 p-3 mb-2">
            <p className="font-mono text-sm font-medium">{selectedMilestone?.milestone.title}</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="font-display text-xs uppercase tracking-wider">Summary of Work Done *</Label>
              <Textarea
                placeholder="Describe what was built, shipped, or achieved..."
                value={evidence.summary}
                onChange={(e) => setEvidence((p) => ({ ...p, summary: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-display text-xs uppercase tracking-wider">Metrics Achieved *</Label>
              <Input
                placeholder="e.g., 1000 users, $2M TVL, 99.9% uptime"
                value={evidence.metricsAchieved}
                onChange={(e) => setEvidence((p) => ({ ...p, metricsAchieved: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="font-display text-xs uppercase tracking-wider">Video Evidence URL</Label>
              <Input
                placeholder="YouTube or X video link"
                value={evidence.videoUrl}
                onChange={(e) => setEvidence((p) => ({ ...p, videoUrl: e.target.value }))}
              />
              <p className="text-[10px] text-muted-foreground">Optional — YouTube, X, or Loom link</p>
            </div>
            <div className="space-y-1">
              <Label className="font-display text-xs uppercase tracking-wider">GitHub Links</Label>
              <Input
                placeholder="PR or commit URLs, comma-separated"
                value={evidence.githubLinks}
                onChange={(e) => setEvidence((p) => ({ ...p, githubLinks: e.target.value }))}
              />
              <p className="text-[10px] text-muted-foreground">Optional — separate multiple links with commas</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMarkComplete} disabled={updateProfile.isPending || !evidence.summary.trim()}>
              {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Evidence & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Variance Dialog */}
      <Dialog open={varianceDialogOpen} onOpenChange={setVarianceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">Request Phase Update</DialogTitle>
            <DialogDescription>
              Request an update to this locked phase. A "Timeline Variance" badge will be shown on your public profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVarianceDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRequestVariance} disabled={updateProfile.isPending}>
              {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Phase Dialog */}
      <Dialog open={addPhaseDialogOpen} onOpenChange={setAddPhaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">Add New Phase</DialogTitle>
            <DialogDescription>
              Create a new phase for your project roadmap. Add milestones to it after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="phase-title">Phase Title</Label>
            <Input
              id="phase-title"
              placeholder="e.g., Foundation"
              value={newPhaseTitle}
              onChange={(e) => setNewPhaseTitle(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPhaseDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPhase} disabled={updateProfile.isPending || !newPhaseTitle.trim()}>
              {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Phase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Milestone Dialog */}
      <Dialog open={!!addMilestonePhaseId} onOpenChange={(open) => !open && setAddMilestonePhaseId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">Add Milestone</DialogTitle>
            <DialogDescription>
              Add a milestone to this phase. Target date is optional.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g., Smart Contract Audit"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="What does this milestone deliver?"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone((p) => ({ ...p, description: e.target.value }))}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Target Date (optional)</Label>
              <Input
                type="date"
                value={newMilestone.targetDate}
                onChange={(e) => setNewMilestone((p) => ({ ...p, targetDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMilestonePhaseId(null)}>Cancel</Button>
            <Button onClick={handleAddMilestone} disabled={updateProfile.isPending || !newMilestone.title.trim()}>
              {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
