import { useState } from 'react';
import { Loader2, ExternalLink, Coins, Vote, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useCreateFundingProposal } from '@/hooks/useCreateFundingProposal';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/hooks/use-toast';
import type { Phase } from '@/types';

interface SubmitProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  projectName: string;
  realmsDaoAddress: string;
  fundingRequested: number;
  milestones: Phase[];
  onProposalCreated?: (proposalId: string) => void;
}

export const SubmitProposalDialog = ({
  open,
  onOpenChange,
  profileId,
  projectName,
  realmsDaoAddress,
  fundingRequested,
  milestones,
  onProposalCreated,
}: SubmitProposalDialogProps) => {
  const { toast } = useToast();
  const wallet = useWallet();
  const createProposal = useCreateFundingProposal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbProposalId, setDbProposalId] = useState<string | null>(null);

  const allMilestones = milestones.flatMap((phase) =>
    phase.milestones.map((ms) => ({
      id: ms.id,
      title: ms.title,
      phaseTitle: phase.title,
      solAllocation: ms.solAllocation || 0,
    }))
  );

  const allocatedTotal = allMilestones.reduce((sum, ms) => sum + ms.solAllocation, 0);

  const handleSubmitProposal = async () => {
    setIsSubmitting(true);
    try {
      // Step 1: Create DB record
      const milestoneAllocations = allMilestones.map((ms) => ({
        milestone_id: ms.id,
        phase_title: ms.phaseTitle,
        milestone_title: ms.title,
        sol_amount: ms.solAllocation,
      }));

      const { data, error } = await supabase.functions.invoke('manage-funding-proposal', {
        body: {
          action: 'create',
          profile_id: profileId,
          realm_dao_address: realmsDaoAddress,
          requested_sol: fundingRequested,
          milestone_allocations: milestoneAllocations,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const proposalId = data.proposal_id;
      setDbProposalId(proposalId);

      // Step 2: Attempt on-chain proposal creation if wallet connected
      if (wallet.connected && wallet.publicKey) {
        try {
          await createProposal.mutateAsync({
            profileId,
            proposalDbId: proposalId,
            realmAddress: realmsDaoAddress,
            projectName,
            requestedSol: fundingRequested,
            milestoneCount: allMilestones.length,
          });
        } catch (onChainErr) {
          // On-chain failed but DB record exists — show warning, don't block
          console.warn('On-chain proposal creation failed:', onChainErr);
          toast({
            title: 'Proposal recorded (off-chain)',
            description: 'DB record created. On-chain proposal can be submitted later via Realms.',
          });
        }
      } else {
        toast({
          title: 'Funding Proposal Created',
          description: 'Connect your wallet to submit the on-chain governance proposal.',
        });
      }

      onProposalCreated?.(proposalId);
      onOpenChange(false);
    } catch (err) {
      console.error('Proposal creation error:', err);
      toast({
        title: 'Failed to create proposal',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-tight flex items-center gap-2">
            <Vote className="h-5 w-5 text-primary" />
            Submit Funding Proposal
          </DialogTitle>
          <DialogDescription>
            This will create a governance proposal on the linked DAO for community voting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-sm border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display uppercase text-muted-foreground">Project</span>
              <span className="font-mono text-sm">{projectName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-display uppercase text-muted-foreground">DAO</span>
              <span className="font-mono text-xs truncate max-w-[180px]">{realmsDaoAddress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-display uppercase text-muted-foreground">Total Requested</span>
              <Badge variant="outline" className="font-mono">
                <Coins className="mr-1 h-3 w-3" />
                {fundingRequested} SOL
              </Badge>
            </div>
          </div>

          {/* Wallet Status */}
          {!wallet.connected && (
            <div className="flex items-center gap-2 rounded-sm border border-yellow-500/30 bg-yellow-500/5 p-3">
              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
              <p className="text-xs text-yellow-500">
                Connect your wallet to submit on-chain. Without a wallet, only a DB record will be created.
              </p>
            </div>
          )}

          {/* Milestone Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-display uppercase tracking-wider text-muted-foreground">
              Milestone Release Schedule
            </h4>
            {allMilestones.map((ms, i) => (
              <div
                key={ms.id}
                className="flex items-center justify-between rounded-sm bg-muted/20 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-mono text-primary">
                    {i + 1}
                  </span>
                  <span className="text-xs truncate max-w-[180px]">{ms.title}</span>
                </div>
                <span className="text-xs font-mono text-primary">{ms.solAllocation} SOL</span>
              </div>
            ))}
          </div>

          {/* Proposal Description Preview */}
          <div className="rounded-sm border border-dashed border-border p-3">
            <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Proposal Title</p>
            <p className="text-sm font-mono">
              "Accept {projectName} for {fundingRequested} SOL funding"
            </p>
          </div>

          {/* Realms Link */}
          <a
            href={`https://app.realms.today/dao/${realmsDaoAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            View DAO on Realms
          </a>

          <Button
            onClick={handleSubmitProposal}
            disabled={isSubmitting || createProposal.isPending || allocatedTotal !== fundingRequested}
            className="w-full font-display font-semibold uppercase tracking-wider"
          >
            {isSubmitting || createProposal.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {createProposal.isPending ? 'CREATING ON-CHAIN...' : 'SUBMITTING...'}
              </>
            ) : (
              wallet.connected ? 'SUBMIT ON-CHAIN PROPOSAL' : 'SUBMIT PROPOSAL TO DAO'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
