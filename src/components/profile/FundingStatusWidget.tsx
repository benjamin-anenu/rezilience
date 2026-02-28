import { useQuery } from '@tanstack/react-query';
import { Coins, CheckCircle2, Clock, XCircle, ExternalLink, Loader2, Vote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

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

  if (!fundingStatus || !fundingRequestedSol) return null;

  const statusConfig = STATUS_CONFIG[fundingStatus] || STATUS_CONFIG.pending_signature;
  const latestProposal = proposals?.[0];

  // Calculate milestone progress from allocations
  const milestoneAllocations = (latestProposal?.milestone_allocations as any[]) || [];
  const totalAllocated = milestoneAllocations.reduce((sum: number, a: any) => sum + (a.sol_amount || 0), 0);
  const releasedAmount = 0; // TODO: track released per milestone
  const progressPercent = totalAllocated > 0 ? (releasedAmount / totalAllocated) * 100 : 0;

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
          <Badge variant="outline" className={`font-mono text-xs ${statusConfig.color}`}>
            {statusConfig.icon}
            <span className="ml-1">{statusConfig.label}</span>
          </Badge>
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

        {/* Progress */}
        {fundingStatus !== 'rejected' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Released</span>
              <span className="font-mono">{releasedAmount} / {fundingRequestedSol} SOL</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
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
