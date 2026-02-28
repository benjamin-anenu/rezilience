import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle2, XCircle, Vote, Loader2 } from 'lucide-react';
import type { ProposalVoteState } from '@/hooks/useFundingProposal';

interface ProposalStatusBadgeProps {
  state: ProposalVoteState | null | undefined;
  isLoading?: boolean;
  compact?: boolean;
}

const STATE_CONFIG: Record<string, { label: string; icon: typeof Vote; className: string }> = {
  Voting: { label: 'VOTING', icon: Vote, className: 'text-blue-400 border-blue-400/30' },
  Succeeded: { label: 'PASSED', icon: CheckCircle2, className: 'text-primary border-primary/30' },
  Defeated: { label: 'DEFEATED', icon: XCircle, className: 'text-destructive border-destructive/30' },
  Completed: { label: 'COMPLETED', icon: CheckCircle2, className: 'text-primary border-primary/30' },
  Executing: { label: 'EXECUTING', icon: Loader2, className: 'text-yellow-500 border-yellow-500/30' },
  Draft: { label: 'DRAFT', icon: Clock, className: 'text-muted-foreground border-border' },
  SigningOff: { label: 'SIGNING', icon: Clock, className: 'text-yellow-500 border-yellow-500/30' },
  Cancelled: { label: 'CANCELLED', icon: XCircle, className: 'text-muted-foreground border-border' },
  Unknown: { label: 'UNKNOWN', icon: Clock, className: 'text-muted-foreground border-border' },
};

export function ProposalStatusBadge({ state, isLoading, compact }: ProposalStatusBadgeProps) {
  if (isLoading) {
    return (
      <Badge variant="outline" className="font-mono text-[10px]">
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        LOADING
      </Badge>
    );
  }

  if (!state) return null;

  const config = STATE_CONFIG[state.state] || STATE_CONFIG.Unknown;
  const Icon = config.icon;
  const totalVotes = state.yesVotes + state.noVotes;
  const yesPercent = totalVotes > 0 ? (state.yesVotes / totalVotes) * 100 : 0;

  if (compact) {
    return (
      <Badge variant="outline" className={`font-mono text-[10px] ${config.className}`}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={`font-mono text-[10px] ${config.className}`}>
          <Icon className="mr-1 h-3 w-3" />
          {config.label}
        </Badge>
        {totalVotes > 0 && (
          <span className="text-[10px] font-mono text-muted-foreground">
            {state.yesVotes.toFixed(1)} YES / {state.noVotes.toFixed(1)} NO
          </span>
        )}
      </div>

      {state.state === 'Voting' && totalVotes > 0 && (
        <Progress value={yesPercent} className="h-1.5" />
      )}

      {state.state === 'Voting' && state.votingEndTime && (
        <VotingCountdown endTime={state.votingEndTime} />
      )}
    </div>
  );
}

function VotingCountdown({ endTime }: { endTime: number }) {
  const now = Math.floor(Date.now() / 1000);
  const remaining = endTime - now;

  if (remaining <= 0) {
    return <span className="text-[10px] font-mono text-muted-foreground">Voting ended</span>;
  }

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);

  return (
    <span className="text-[10px] font-mono text-muted-foreground">
      <Clock className="mr-1 inline h-3 w-3" />
      {hours}h {minutes}m remaining
    </span>
  );
}
