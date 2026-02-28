import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Vote, ExternalLink } from 'lucide-react';
import { useCreateRealmsProposal, getRealmsUrl } from '@/hooks/useRealmsProposal';
import type { Bounty } from '@/hooks/useBounties';

interface LinkProposalDialogProps {
  bounty: Bounty | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LinkProposalDialog({ bounty, open, onOpenChange }: LinkProposalDialogProps) {
  const [proposalAddress, setProposalAddress] = useState('');
  const createProposal = useCreateRealmsProposal();

  const handleSubmit = async () => {
    if (!bounty || !proposalAddress.trim()) return;
    await createProposal.mutateAsync({
      bounty_id: bounty.id,
      realm_dao_address: bounty.realm_dao_address,
      proposal_address: proposalAddress.trim(),
      bounty_title: bounty.title,
    });
    setProposalAddress('');
    onOpenChange(false);
  };

  if (!bounty) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-tight">Link Realms Proposal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create a proposal on Realms to release <strong>{bounty.reward_sol} SOL</strong> for
            "{bounty.title}", then paste the proposal address here.
          </p>

          <a
            href={getRealmsUrl(bounty.realm_dao_address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Vote className="h-4 w-4" />
            Open Realms DAO
            <ExternalLink className="h-3 w-3" />
          </a>

          <div className="space-y-2">
            <Label htmlFor="proposal-address" className="text-xs uppercase font-mono">
              Proposal Address
            </Label>
            <Input
              id="proposal-address"
              placeholder="Paste the Realms proposal public key"
              value={proposalAddress}
              onChange={e => setProposalAddress(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!proposalAddress.trim() || createProposal.isPending}
            className="w-full font-display uppercase tracking-wider"
          >
            {createProposal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Link Proposal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
