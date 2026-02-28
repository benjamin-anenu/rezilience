import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, User, Clock, CheckCircle2, XCircle, FileText, Lock, Vote, ExternalLink, Loader2 } from 'lucide-react';
import type { Bounty } from '@/hooks/useBounties';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Coins }> = {
  open: { label: 'OPEN', variant: 'default', icon: Coins },
  claimed: { label: 'CLAIMED', variant: 'secondary', icon: User },
  submitted: { label: 'SUBMITTED', variant: 'outline', icon: FileText },
  approved: { label: 'APPROVED', variant: 'default', icon: CheckCircle2 },
  funded: { label: 'FUNDED', variant: 'default', icon: Lock },
  voting: { label: 'VOTING', variant: 'secondary', icon: Vote },
  rejected: { label: 'REJECTED', variant: 'destructive', icon: XCircle },
  paid: { label: 'PAID', variant: 'default', icon: CheckCircle2 },
};

interface BountyCardProps {
  bounty: Bounty;
  isCreator: boolean;
  isClaimer: boolean;
  onClaim?: () => void;
  onSubmitEvidence?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onFundEscrow?: () => void;
  onCreateProposal?: () => void;
  onMarkPaid?: () => void;
  onCancelEscrow?: () => void;
  isPendingEscrow?: boolean;
}

export function BountyCard({
  bounty, isCreator, isClaimer,
  onClaim, onSubmitEvidence, onApprove, onReject,
  onFundEscrow, onCreateProposal, onMarkPaid, onCancelEscrow,
  isPendingEscrow,
}: BountyCardProps) {
  const config = statusConfig[bounty.status] || statusConfig.open;
  const StatusIcon = config.icon;

  return (
    <Card className="border-border bg-card/50 transition-colors hover:border-primary/20">
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-display text-sm font-semibold uppercase tracking-tight text-foreground line-clamp-2">
            {bounty.title}
          </h3>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={config.variant} className="font-mono text-[10px]">
              <StatusIcon className="mr-1 h-3 w-3" />
              {config.label}
            </Badge>
            {bounty.release_mode && bounty.release_mode !== 'dao_governed' && (
              <Badge variant="outline" className="font-mono text-[9px] border-primary/20">
                {bounty.release_mode === 'direct' ? 'Direct' : 'Multi-sig'}
              </Badge>
            )}
          </div>
        </div>

        {bounty.description && (
          <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{bounty.description}</p>
        )}

        <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-mono font-semibold text-primary">
            <Coins className="h-3.5 w-3.5" />
            {bounty.reward_sol} SOL
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(bounty.created_at).toLocaleDateString()}
          </span>
        </div>

        {bounty.claimer_wallet && (
          <p className="mb-3 text-[10px] font-mono text-muted-foreground/70 truncate">
            Claimer: {bounty.claimer_wallet.slice(0, 4)}…{bounty.claimer_wallet.slice(-4)}
          </p>
        )}

        {/* Escrow address link */}
        {bounty.escrow_address && (
          <a
            href={`https://explorer.solana.com/address/${bounty.escrow_address}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 flex items-center gap-1 text-[10px] font-mono text-primary/70 hover:text-primary transition-colors"
          >
            <Lock className="h-3 w-3" />
            Escrow: {bounty.escrow_address.slice(0, 4)}…{bounty.escrow_address.slice(-4)}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}

        {/* Proposal link */}
        {bounty.proposal_address && (
          <a
            href={`https://app.realms.today/proposal/${bounty.proposal_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 flex items-center gap-1 text-[10px] font-mono text-primary/70 hover:text-primary transition-colors"
          >
            <Vote className="h-3 w-3" />
            Proposal: {bounty.proposal_address.slice(0, 4)}…{bounty.proposal_address.slice(-4)}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}

        {bounty.evidence_summary && bounty.status === 'submitted' && (
          <div className="mb-3 rounded-sm border border-border/50 bg-muted/20 p-2">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">Evidence</p>
            <p className="text-xs text-foreground line-clamp-2">{bounty.evidence_summary}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {bounty.status === 'open' && !isCreator && onClaim && (
            <Button size="sm" onClick={onClaim} className="font-display text-xs uppercase tracking-wider">
              Claim Bounty
            </Button>
          )}
          {bounty.status === 'claimed' && isClaimer && onSubmitEvidence && (
            <Button size="sm" variant="outline" onClick={onSubmitEvidence} className="font-display text-xs uppercase tracking-wider">
              Submit Evidence
            </Button>
          )}
          {bounty.status === 'submitted' && isCreator && (
            <>
              {onApprove && (
                <Button size="sm" onClick={onApprove} className="font-display text-xs uppercase tracking-wider">
                  Approve
                </Button>
              )}
              {onReject && (
                <Button size="sm" variant="destructive" onClick={onReject} className="font-display text-xs uppercase tracking-wider">
                  Reject
                </Button>
              )}
            </>
          )}

          {/* Escrow lifecycle buttons */}
          {bounty.status === 'approved' && isCreator && onFundEscrow && (
            <Button
              size="sm"
              onClick={onFundEscrow}
              disabled={isPendingEscrow}
              className="font-display text-xs uppercase tracking-wider"
            >
              {isPendingEscrow ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Lock className="mr-1 h-3 w-3" />}
              Fund Escrow
            </Button>
          )}

          {bounty.status === 'funded' && isCreator && onCreateProposal && (
            <Button size="sm" variant="outline" onClick={onCreateProposal} className="font-display text-xs uppercase tracking-wider">
              <Vote className="mr-1 h-3 w-3" />
              Link Proposal
            </Button>
          )}

          {bounty.status === 'voting' && (isCreator || isClaimer) && onMarkPaid && (
            <Button size="sm" onClick={onMarkPaid} className="font-display text-xs uppercase tracking-wider">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Mark Paid
            </Button>
          )}

          {(bounty.status === 'funded' || bounty.status === 'voting') && isCreator && onCancelEscrow && (
            <Button
              size="sm"
              variant="destructive"
              onClick={onCancelEscrow}
              disabled={isPendingEscrow}
              className="font-display text-xs uppercase tracking-wider"
            >
              {isPendingEscrow ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <XCircle className="mr-1 h-3 w-3" />}
              Cancel Escrow
            </Button>
          )}

          {bounty.status === 'paid' && bounty.release_tx_signature && (
            <a
              href={`https://explorer.solana.com/tx/${bounty.release_tx_signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Badge variant="outline" className="border-primary/30 text-[10px] font-mono cursor-pointer hover:bg-primary/10">
                ✅ PAID · View Tx <ExternalLink className="ml-1 h-2.5 w-2.5 inline" />
              </Badge>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
