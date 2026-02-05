import { useState } from 'react';
import { Plus, Trash2, Lock, AlertTriangle, Calendar, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Milestone } from '@/types';

interface RoadmapFormProps {
  milestones: Milestone[];
  setMilestones: (milestones: Milestone[]) => void;
}

export const RoadmapForm = ({ milestones, setMilestones }: RoadmapFormProps) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddMilestone = () => {
    if (!newTitle.trim() || !newDate) return;

    const newMilestone: Milestone = {
      id: `milestone_${Date.now()}`,
      title: newTitle,
      targetDate: newDate,
      isLocked: false,
      status: 'upcoming',
    };

    setMilestones([...milestones, newMilestone]);
    setNewTitle('');
    setNewDate('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleRequestUpdate = (id: string) => {
    setMilestones(
      milestones.map((m) =>
        m.id === id ? { ...m, varianceRequested: true } : m
      )
    );
    setEditingId(id);
  };

  const handleUpdateDate = (id: string, newDate: string) => {
    setMilestones(
      milestones.map((m) =>
        m.id === id ? { ...m, targetDate: newDate } : m
      )
    );
    setEditingId(null);
  };

  const handleLockMilestones = () => {
    setMilestones(
      milestones.map((m) => ({ ...m, isLocked: true }))
    );
  };

  const hasUnlockedMilestones = milestones.some((m) => !m.isLocked);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="font-display text-lg uppercase tracking-tight">
            The Roadmap
          </span>
          <span className="rounded-sm bg-muted px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
            OPTIONAL
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Set project milestones. Once locked, dates can only be changed via{' '}
          <span className="font-semibold text-foreground">Update Request</span>, 
          triggering a Timeline Variance alert on your public profile.
        </p>

        {/* Current Milestones */}
        {milestones.length > 0 && (
          <div className="space-y-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={cn(
                  'rounded-sm border p-3',
                  milestone.varianceRequested
                    ? 'border-yellow-500/50 bg-yellow-500/5'
                    : milestone.isLocked
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-muted/30'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {milestone.isLocked ? (
                      <Lock className="h-4 w-4 text-primary" />
                    ) : (
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-mono text-sm">{milestone.title}</span>
                    {milestone.varianceRequested && (
                      <span className="flex items-center gap-1 rounded-sm bg-yellow-500/20 px-2 py-0.5 text-[10px] font-mono uppercase text-yellow-500">
                        <AlertTriangle className="h-3 w-3" />
                        VARIANCE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {editingId === milestone.id ? (
                      <Input
                        type="date"
                        defaultValue={milestone.targetDate}
                        className="h-8 w-36 font-mono text-xs"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleUpdateDate(milestone.id, e.target.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">
                        {new Date(milestone.targetDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}

                    {milestone.isLocked ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRequestUpdate(milestone.id)}
                        className="h-7 text-[10px] uppercase"
                      >
                        <Edit2 className="mr-1 h-3 w-3" />
                        Request Update
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveMilestone(milestone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Lock Button */}
            {hasUnlockedMilestones && milestones.length > 0 && (
              <Button
                variant="outline"
                className="w-full font-display text-xs uppercase tracking-wider"
                onClick={handleLockMilestones}
              >
                <Lock className="mr-2 h-4 w-4" />
                COMMITMENT LOCK: SET ALL MILESTONES
              </Button>
            )}
          </div>
        )}

        {/* Add New Milestone */}
        <div className="space-y-3 rounded-sm border border-dashed border-border p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Milestone title (e.g., 'Mainnet V2 Launch')"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="font-mono text-sm"
            />
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <Button
            onClick={handleAddMilestone}
            disabled={!newTitle.trim() || !newDate}
            variant="outline"
            size="sm"
            className="w-full font-display text-xs uppercase tracking-wider"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Milestone
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
