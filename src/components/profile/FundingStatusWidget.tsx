import { useQuery } from '@tanstack/react-query';
import { Coins, CheckCircle2, Clock, XCircle, ExternalLink, Loader2, Vote, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useFundingProposalState } from '@/hooks/useFundingProposal';
import { useExecuteProposal } from '@/hooks/useExecuteProposal';
import { ProposalStatusBadge } from '@/components/bounty/ProposalStatusBadge';
import { VotePanel } from '@/components/bounty/VotePanel';

interface FundingStatusWidgetProps {
  profileId: string;
  fundingStatus?: string | null;
  fundingRequestedSol?: number | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_signature: { label: 'Pending Submission', color: 'text-yellow-500', icon: <Clock className="h-4 w-4" /> },
  voting: { label: 'DAO Voting', color: 'text-blue-400', icon: <Vote className="h-4 w-4" /> },
  accepted: { label: 'Accepted', color: 'text-primary', icon: <CheckCircle2 className="h-4 w-4" /> },
  rejected: { label: 'Rejected', color: 'text-destructive', icon: <XCircle className="h-4 w-4" /> },
  funded: { label: 'Funded', color: 'text-primary', icon: <Coins className="h-4 w-4" /> },
  completed: { label: 'Completed', color: 'text-primary', icon: <CheckCircle2 className="h-4 w-4" /> },
};

export const FundingStatusWidget = ({ profileId, fundingStatus, fundingRequestedSol }: FundingStatusWidgetProps) => {
  const { data: proposals, isLoading } = useQuery({
    queryKey: ['funding-proposals', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funding_proposals')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profileId && !!fundingStatus,
  });

  const latestProposal = proposals?.[0];

  // Live on-chain polling for proposal state
  const { data: onChainState, isLoading: stateLoading } = useFundingProposalState(
    latestProposal?.proposal_address
  );

  const executeProposal = useExecuteProposal();

  if (!fundingStatus || !fundingRequestedSol) return null;

  const statusConfig = STATUS_CONFIG[fundingStatus] || STATUS_CONFIG.pending_signature;

  // Calculate milestone progress from allocations
  const milestoneAllocations = (latestProposal?.milestone_allocations as any[]) || [];
  const totalAllocated = milestoneAllocations.reduce((sum: number, a: any) => sum + (a.sol_amount || 0), 0);
  // Derive released amount from milestone statuses if available, otherwise show pending state
  const completedAllocations = milestoneAllocations.filter((a: any) => a.status === 'completed' || a.released === true);
  const releasedAmount = completedAllocations.reduce((sum: number, a: any) => sum + (a.sol_amount || 0), 0);
  const progressPercent = totalAllocated > 0 ? (releasedAmount / totalAllocated) * 100 : 0;
  const isProgressKnown = milestoneAllocations.some((a: any) => a.status !== undefined || a.released !== undefined);

  const showVotePanel = onChainState?.state === 'Voting' && latestProposal?.realm_dao_address;
  const showExecuteButton = onChainState?.state === 'Succeeded' && latestProposal;

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <span className="font-display text-base uppercase tracking-tight">
              DAO Funding
            </span>
          </div>
          {/* Show on-chain badge if available, else DB status */}
          {onChainState ? (
            <ProposalStatusBadge state={onChainState} isLoading={stateLoading} compact />
          ) : (
            <Badge variant="outline" className={`font-mono text-xs ${statusConfig.color}`}>
              {statusConfig.icon}
              <span className="ml-1">{statusConfig.label}</span>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-display uppercase text-muted-foreground">Requested</span>
          <span className="font-mono text-lg font-bold text-primary">
            {fundingRequestedSol} SOL
          </span>
        </div>

        {/* Live Vote Counts */}
        {onChainState && !onChainState.isFinalized && (
          <ProposalStatusBadge state={onChainState} />
        )}

        {/* Progress */}
        {fundingStatus !== 'rejected' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Released</span>
              <span className="font-mono">
                {isProgressKnown 
                  ? `${releasedAmount} / ${fundingRequestedSol} SOL`
                  : `Pending · ${fundingRequestedSol} SOL total`
                }
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            {!isProgressKnown && fundingStatus !== 'pending_signature' && (
              <p className="text-[10px] text-muted-foreground italic">
                Release tracking activates after on-chain escrow is funded.
              </p>
            )}
          </div>
        )}

        {/* Vote Panel for DAO members */}
        {showVotePanel && latestProposal?.proposal_address && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
              Cast Your Vote
            </h4>
            <VotePanel
              proposalAddress={latestProposal.proposal_address}
              realmAddress={latestProposal.realm_dao_address}
            />
          </div>
        )}

        {/* Execute Release button */}
        {showExecuteButton && (
          <Button
            size="sm"
            onClick={() => executeProposal.mutate({
              proposalAddress: latestProposal.proposal_address!,
              proposalDbId: latestProposal.id,
            })}
            disabled={executeProposal.isPending}
            className="w-full font-display text-xs uppercase tracking-wider"
          >
            {executeProposal.isPending ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <Zap className="mr-2 h-3 w-3" />
            )}
            EXECUTE RELEASE
          </Button>
        )}

        {/* Milestone Breakdown */}
        {milestoneAllocations.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
              Milestone Schedule
            </h4>
            {milestoneAllocations.map((ms: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-sm bg-muted/20 px-2.5 py-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[9px] font-mono text-primary">
                    {i + 1}
                  </span>
                  <span className="text-xs truncate max-w-[160px]">{ms.milestone_title}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{ms.sol_amount} SOL</span>
              </div>
            ))}
          </div>
        )}

        {/* Realms Link */}
        {latestProposal?.realm_dao_address && (
          <a
            href={`https://app.realms.today/dao/${latestProposal.realm_dao_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            View DAO on Realms
          </a>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading proposal data...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
