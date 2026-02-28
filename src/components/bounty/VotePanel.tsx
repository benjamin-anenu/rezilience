import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCastVote } from '@/hooks/useCastVote';

interface VotePanelProps {
  proposalAddress: string;
  realmAddress: string;
  disabled?: boolean;
}

export function VotePanel({ proposalAddress, realmAddress, disabled }: VotePanelProps) {
  const castVote = useCastVote();
  const [castDirection, setCastDirection] = useState<'yes' | 'no' | null>(null);

  const handleVote = (vote: 'yes' | 'no') => {
    setCastDirection(vote);
    castVote.mutate(
      { proposalAddress, realmAddress, vote },
      { onSettled: () => setCastDirection(null) }
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || castVote.isPending}
        onClick={() => handleVote('yes')}
        className="font-display text-xs uppercase tracking-wider border-primary/30 hover:bg-primary/10 hover:text-primary"
      >
        {castDirection === 'yes' ? (
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        ) : (
          <ThumbsUp className="mr-1 h-3 w-3" />
        )}
        YES
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || castVote.isPending}
        onClick={() => handleVote('no')}
        className="font-display text-xs uppercase tracking-wider border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
      >
        {castDirection === 'no' ? (
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        ) : (
          <ThumbsDown className="mr-1 h-3 w-3" />
        )}
        NO
      </Button>
    </div>
  );
}
