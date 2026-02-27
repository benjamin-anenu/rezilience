import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, User, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import type { Bounty } from '@/hooks/useBounties';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Coins }> = {
  open: { label: 'OPEN', variant: 'default', icon: Coins },
  claimed: { label: 'CLAIMED', variant: 'secondary', icon: User },
  submitted: { label: 'SUBMITTED', variant: 'outline', icon: FileText },
  approved: { label: 'APPROVED', variant: 'default', icon: CheckCircle2 },
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
}

export function BountyCard({ bounty, isCreator, isClaimer, onClaim, onSubmitEvidence, onApprove, onReject }: BountyCardProps) {
  const config = statusConfig[bounty.status] || statusConfig.open;
  const StatusIcon = config.icon;

  return (
    <Card className="border-border bg-card/50 transition-colors hover:border-primary/20">
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-display text-sm font-semibold uppercase tracking-tight text-foreground line-clamp-2">
            {bounty.title}
          </h3>
          <Badge variant={config.variant} className="shrink-0 font-mono text-[10px]">
            <StatusIcon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
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
          {bounty.status === 'approved' && (
            <Badge variant="outline" className="border-primary/30 text-[10px] font-mono">
              🔒 SOL Release · Requires On-Chain Program
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
