import { useState, useMemo } from 'react';
import { Coins, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { Phase } from '@/types';

interface FundingRequestFormProps {
  phases: Phase[];
  setPhases: (phases: Phase[]) => void;
  fundingRequested: number;
  setFundingRequested: (value: number) => void;
  realmsDaoAddress: string;
}

export const FundingRequestForm = ({
  phases,
  setPhases,
  fundingRequested,
  setFundingRequested,
  realmsDaoAddress,
}: FundingRequestFormProps) => {
  const [enabled, setEnabled] = useState(fundingRequested > 0);

  const allMilestones = useMemo(() => {
    return phases.flatMap((phase, phaseIdx) =>
      phase.milestones.map((ms, msIdx) => ({
        ...ms,
        phaseId: phase.id,
        phaseTitle: phase.title,
        phaseIdx,
        msIdx,
      }))
    );
  }, [phases]);

  const allocatedTotal = useMemo(() => {
    return allMilestones.reduce((sum, ms) => sum + (ms.solAllocation || 0), 0);
  }, [allMilestones]);

  const remaining = fundingRequested - allocatedTotal;
  const isBalanced = Math.abs(remaining) < 0.001;

  const handleMilestoneAllocation = (phaseId: string, milestoneId: string, amount: number) => {
    setPhases(
      phases.map((p) =>
        p.id === phaseId
          ? {
              ...p,
              milestones: p.milestones.map((ms) =>
                ms.id === milestoneId ? { ...ms, solAllocation: amount } : ms
              ),
            }
          : p
      )
    );
  };

  const handleToggle = (val: boolean) => {
    setEnabled(val);
    if (!val) {
      setFundingRequested(0);
      // Clear all allocations
      setPhases(
        phases.map((p) => ({
          ...p,
          milestones: p.milestones.map((ms) => ({ ...ms, solAllocation: undefined })),
        }))
      );
    }
  };

  if (!realmsDaoAddress) {
    return (
      <Card className="border-dashed border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Want DAO Funding?
              </p>
              <p className="text-xs text-muted-foreground">
                Go back to <span className="font-semibold text-foreground">Step 2 (Identity)</span> and add your{' '}
                <span className="font-semibold text-foreground">Realms DAO Address</span> to unlock milestone-based funding requests. 
                This lets you request SOL from your DAO, with each milestone unlocking a portion of the funds via governance vote.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (allMilestones.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Coins className="h-5 w-5" />
            <p className="text-sm">
              Add milestones above to enable DAO funding requests. Each milestone can unlock a portion of your funding.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <span className="font-display text-lg uppercase tracking-tight">
              DAO Funding Request
            </span>
          </div>
          <Switch checked={enabled} onCheckedChange={handleToggle} />
        </CardTitle>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Request funding from the linked DAO. A governance proposal will be created for the community to vote on.
            Each milestone unlocks its allocated SOL upon DAO approval.
          </p>

          {/* Total SOL */}
          <div className="space-y-2">
            <Label className="font-display text-xs uppercase tracking-wider">
              Total Funding Requested (SOL)
            </Label>
            <Input
              type="number"
              min={0}
              step={0.1}
              placeholder="e.g. 50"
              value={fundingRequested || ''}
              onChange={(e) => setFundingRequested(parseFloat(e.target.value) || 0)}
              className="font-mono"
            />
          </div>

          {/* Per-milestone allocation */}
          {fundingRequested > 0 && (
            <div className="space-y-3">
              <Label className="font-display text-xs uppercase tracking-wider">
                SOL Allocation Per Milestone
              </Label>
              {allMilestones.map((ms) => (
                <div
                  key={ms.id}
                  className="flex items-center gap-3 rounded-sm border border-border/50 bg-background/50 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-medium truncate">{ms.phaseTitle}</p>
                    <p className="text-xs text-muted-foreground truncate">{ms.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={ms.solAllocation || ''}
                      onChange={(e) =>
                        handleMilestoneAllocation(ms.phaseId, ms.id, parseFloat(e.target.value) || 0)
                      }
                      className="w-24 font-mono text-sm"
                      placeholder="0"
                    />
                    <span className="text-xs font-mono text-muted-foreground">SOL</span>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="flex items-center justify-between rounded-sm border border-border p-3 bg-muted/20">
                <span className="font-display text-xs uppercase tracking-wider text-muted-foreground">
                  Allocated / Requested
                </span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm font-bold ${isBalanced ? 'text-primary' : 'text-destructive'}`}>
                    {allocatedTotal.toFixed(1)} / {fundingRequested.toFixed(1)} SOL
                  </span>
                  {isBalanced ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>

              {!isBalanced && fundingRequested > 0 && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Allocations must equal total requested ({remaining > 0 ? `${remaining.toFixed(1)} SOL remaining` : `${Math.abs(remaining).toFixed(1)} SOL over`})
                </p>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
