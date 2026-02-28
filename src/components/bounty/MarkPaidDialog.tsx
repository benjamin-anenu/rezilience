import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useMarkBountyPaid } from '@/hooks/useRealmsProposal';
import type { Bounty } from '@/hooks/useBounties';

interface MarkPaidDialogProps {
  bounty: Bounty | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarkPaidDialog({ bounty, open, onOpenChange }: MarkPaidDialogProps) {
  const [txSignature, setTxSignature] = useState('');
  const markPaid = useMarkBountyPaid();

  const handleSubmit = async () => {
    if (!bounty || !txSignature.trim()) return;
    await markPaid.mutateAsync({
      bounty_id: bounty.id,
      release_tx_signature: txSignature.trim(),
    });
    setTxSignature('');
    onOpenChange(false);
  };

  if (!bounty) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-tight">Confirm Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            After executing the release transaction on Realms, paste the transaction signature below
            to confirm payment of <strong>{bounty.reward_sol} SOL</strong>.
          </p>

          <div className="space-y-2">
            <Label htmlFor="tx-sig" className="text-xs uppercase font-mono">
              Release Transaction Signature
            </Label>
            <Input
              id="tx-sig"
              placeholder="Paste the Solana transaction signature"
              value={txSignature}
              onChange={e => setTxSignature(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!txSignature.trim() || markPaid.isPending}
            className="w-full font-display uppercase tracking-wider"
          >
            {markPaid.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Confirm Paid
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
