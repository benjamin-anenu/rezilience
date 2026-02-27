import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useClaimBounty, type Bounty } from '@/hooks/useBounties';

interface ClaimBountyDialogProps {
  bounty: Bounty | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClaimBountyDialog({ bounty, open, onOpenChange }: ClaimBountyDialogProps) {
  const { publicKey, connected } = useWallet();
  const claimBounty = useClaimBounty();

  const handleClaim = async () => {
    if (!bounty || !publicKey) return;
    await claimBounty.mutateAsync({
      bounty_id: bounty.id,
      wallet_address: publicKey.toBase58(),
    });
    onOpenChange(false);
  };

  if (!bounty) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-tight">Claim Bounty</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{bounty.title}</p>
            <p className="mt-1 font-mono text-lg font-bold text-primary">{bounty.reward_sol} SOL</p>
          </div>

          {!connected ? (
            <div className="text-center">
              <p className="mb-3 text-sm text-muted-foreground">Connect your wallet to claim this bounty</p>
              <WalletMultiButton />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-sm border border-border/50 bg-muted/20 p-3">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="font-mono text-xs text-muted-foreground truncate">
                  {publicKey?.toBase58()}
                </span>
              </div>
              <Button
                onClick={handleClaim}
                disabled={claimBounty.isPending}
                className="w-full font-display uppercase tracking-wider"
              >
                {claimBounty.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Claim'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
