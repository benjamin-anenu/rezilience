import { useState } from 'react';
import { Plus, Trash2, Lock, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { Phase, PhaseMilestone } from '@/types';

interface RoadmapFormProps {
  phases: Phase[];
  setPhases: (phases: Phase[]) => void;
}

export const RoadmapForm = ({ phases, setPhases }: RoadmapFormProps) => {
  const [newPhaseTitle, setNewPhaseTitle] = useState('');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [addingMilestoneTo, setAddingMilestoneTo] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', targetDate: '' });

  const toggleExpanded = (id: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddPhase = () => {
    if (!newPhaseTitle.trim()) return;
    const phase: Phase = {
      id: `phase_${Date.now()}`,
      title: newPhaseTitle,
      isLocked: false,
      milestones: [],
      order: phases.length,
    };
    setPhases([...phases, phase]);
    setNewPhaseTitle('');
    setExpandedPhases((prev) => new Set(prev).add(phase.id));
  };

  const handleRemovePhase = (id: string) => {
    setPhases(phases.filter((p) => p.id !== id));
  };

  const handleAddMilestone = (phaseId: string) => {
    if (!newMilestone.title.trim()) return;
    const milestone: PhaseMilestone = {
      id: `ms_${Date.now()}`,
      title: newMilestone.title,
      description: newMilestone.description,
      targetDate: newMilestone.targetDate || undefined,
      status: 'upcoming',
    };
    setPhases(
      phases.map((p) =>
        p.id === phaseId ? { ...p, milestones: [...p.milestones, milestone] } : p
      )
    );
    setNewMilestone({ title: '', description: '', targetDate: '' });
    setAddingMilestoneTo(null);
  };

  const handleRemoveMilestone = (phaseId: string, milestoneId: string) => {
    setPhases(
      phases.map((p) =>
        p.id === phaseId
          ? { ...p, milestones: p.milestones.filter((m) => m.id !== milestoneId) }
          : p
      )
    );
  };

  const handleLockPhases = () => {
    setPhases(phases.map((p) => ({ ...p, isLocked: true })));
  };

  const hasUnlocked = phases.some((p) => !p.isLocked);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="font-display text-lg uppercase tracking-tight">The Roadmap</span>
          <span className="rounded-sm bg-muted px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
            OPTIONAL
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Organize your roadmap into <span className="font-semibold text-foreground">Phases</span>,
          each containing specific milestones with descriptions. Once locked, changes require an{' '}
          <span className="font-semibold text-foreground">Update Request</span>.
        </p>

        {/* Existing Phases */}
        {phases.length > 0 && (
          <div className="space-y-3">
            {phases.map((phase, index) => {
              const isExpanded = expandedPhases.has(phase.id);
              return (
                <Collapsible key={phase.id} open={isExpanded} onOpenChange={() => toggleExpanded(phase.id)}>
                  <div
                    className={cn(
                      'rounded-sm border',
                      phase.isLocked ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/20'
                    )}
                  >
                    {/* Phase Header */}
                    <CollapsibleTrigger asChild>
                      <div className="flex cursor-pointer items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-display text-sm font-semibold uppercase tracking-wide">
                            Phase {index + 1}: {phase.title}
                          </span>
                          {phase.isLocked && <Lock className="h-3 w-3 text-primary" />}
                          {phase.varianceRequested && (
                            <span className="rounded-sm bg-yellow-500/20 px-2 py-0.5 text-[10px] font-mono uppercase text-yellow-500">
                              VARIANCE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {phase.milestones.length} milestone{phase.milestones.length !== 1 ? 's' : ''}
                          </span>
                          {!phase.isLocked && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhase(phase.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    {/* Milestones */}
                    <CollapsibleContent>
                      <div className="border-t border-border/50 px-3 pb-3 pt-2 space-y-2">
                        {phase.milestones.map((ms) => (
                          <div
                            key={ms.id}
                            className="rounded-sm border border-border/50 bg-background/50 p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-mono text-sm font-medium">{ms.title}</h5>
                                {ms.description && (
                                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                    {ms.description}
                                  </p>
                                )}
                                {ms.targetDate && (
                                  <span className="mt-1 inline-block text-[10px] font-mono text-muted-foreground/70">
                                    Target:{' '}
                                    {new Date(ms.targetDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                )}
                              </div>
                              {!phase.isLocked && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleRemoveMilestone(phase.id, ms.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Add Milestone inline */}
                        {!phase.isLocked && (
                          <>
                            {addingMilestoneTo === phase.id ? (
                              <div className="space-y-2 rounded-sm border border-dashed border-border p-3">
                                <Input
                                  placeholder="Milestone title"
                                  value={newMilestone.title}
                                  onChange={(e) =>
                                    setNewMilestone((p) => ({ ...p, title: e.target.value }))
                                  }
                                  className="font-mono text-sm"
                                />
                                <Textarea
                                  placeholder="Description (what does this milestone deliver?)"
                                  value={newMilestone.description}
                                  onChange={(e) =>
                                    setNewMilestone((p) => ({ ...p, description: e.target.value }))
                                  }
                                  className="font-mono text-sm min-h-[60px]"
                                />
                                <Input
                                  type="date"
                                  placeholder="Target date (optional)"
                                  value={newMilestone.targetDate}
                                  onChange={(e) =>
                                    setNewMilestone((p) => ({ ...p, targetDate: e.target.value }))
                                  }
                                  className="font-mono text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddMilestone(phase.id)}
                                    disabled={!newMilestone.title.trim()}
                                    className="font-display text-xs uppercase"
                                  >
                                    <Plus className="mr-1 h-3 w-3" />
                                    Add
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setAddingMilestoneTo(null);
                                      setNewMilestone({ title: '', description: '', targetDate: '' });
                                    }}
                                    className="text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full border border-dashed border-border/50 font-display text-xs uppercase text-muted-foreground"
                                onClick={() => setAddingMilestoneTo(phase.id)}
                              >
                                <Plus className="mr-1 h-3 w-3" />
                                Add Milestone
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}

            {hasUnlocked && phases.length > 0 && (
              <Button
                variant="outline"
                className="w-full font-display text-xs uppercase tracking-wider"
                onClick={handleLockPhases}
              >
                <Lock className="mr-2 h-4 w-4" />
                COMMITMENT LOCK: SET ALL PHASES
              </Button>
            )}
          </div>
        )}

        {/* Add New Phase */}
        <div className="space-y-3 rounded-sm border border-dashed border-border p-4">
          <Input
            placeholder="Phase title (e.g., 'Phase 1: Foundation')"
            value={newPhaseTitle}
            onChange={(e) => setNewPhaseTitle(e.target.value)}
            className="font-mono text-sm"
          />
          <Button
            onClick={handleAddPhase}
            disabled={!newPhaseTitle.trim()}
            variant="outline"
            size="sm"
            className="w-full font-display text-xs uppercase tracking-wider"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Phase
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
