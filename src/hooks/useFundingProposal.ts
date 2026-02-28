import { useQuery } from '@tanstack/react-query';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProposal, ProposalState } from '@solana/spl-governance';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface ProposalVoteState {
  state: 'Draft' | 'SigningOff' | 'Voting' | 'Succeeded' | 'Defeated' | 'Completed' | 'Cancelled' | 'Executing' | 'Unknown';
  yesVotes: number;
  noVotes: number;
  votingEndTime: number | null;
  isFinalized: boolean;
}

const STATE_MAP: Record<number, ProposalVoteState['state']> = {
  [ProposalState.Draft]: 'Draft',
  [ProposalState.SigningOff]: 'SigningOff',
  [ProposalState.Voting]: 'Voting',
  [ProposalState.Succeeded]: 'Succeeded',
  [ProposalState.Defeated]: 'Defeated',
  [ProposalState.Completed]: 'Completed',
  [ProposalState.Cancelled]: 'Cancelled',
  [ProposalState.Executing]: 'Executing',
};

/**
 * Poll on-chain proposal state via RPC.
 * Returns live vote counts, status, and timing.
 */
export function useFundingProposalState(proposalAddress?: string | null) {
  const { connection } = useConnection();

  const query = useQuery<ProposalVoteState | null>({
    queryKey: ['proposal-state', proposalAddress],
    queryFn: async () => {
      if (!proposalAddress) return null;

      try {
        const proposalPk = new PublicKey(proposalAddress);
        const proposal = await getProposal(connection, proposalPk);
        const account = proposal.account;

        const yesVotes = account.options?.[0]?.voteWeight
          ? Number(account.options[0].voteWeight) / 1e9
          : 0;
        const noVotes = account.denyVoteWeight
          ? Number(account.denyVoteWeight) / 1e9
          : 0;

        // Estimate voting end time
        const votingEndTime = account.votingCompletedAt
          ? Number(account.votingCompletedAt)
          : account.votingAt
          ? Number(account.votingAt) + 259200 // 3 days default
          : null;

        const state = STATE_MAP[account.state] || 'Unknown';
        const isFinalized = ['Succeeded', 'Defeated', 'Completed', 'Cancelled'].includes(state);

        return { state, yesVotes, noVotes, votingEndTime, isFinalized };
      } catch (err) {
        console.warn('Failed to fetch proposal state:', err);
        return null;
      }
    },
    enabled: !!proposalAddress,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.isFinalized) return false;
      return 30_000; // Poll every 30s while voting
    },
    staleTime: 15_000,
  });

  // Sync state to DB when proposal finalizes
  useEffect(() => {
    if (!query.data || !proposalAddress) return;
    const { state } = query.data;

    if (state === 'Succeeded' || state === 'Defeated') {
      syncStatusToDb(proposalAddress, state === 'Succeeded' ? 'accepted' : 'rejected');
    }
  }, [query.data?.state, proposalAddress]);

  return query;
}

async function syncStatusToDb(proposalAddress: string, status: string) {
  try {
    const { data: proposals } = await supabase
      .from('funding_proposals')
      .select('id, status')
      .eq('proposal_address', proposalAddress)
      .limit(1);

    if (!proposals?.length) return;
    const proposal = proposals[0];
    if (proposal.status === status) return;

    await supabase.functions.invoke('manage-funding-proposal', {
      body: {
        action: 'update_status',
        proposal_id: proposal.id,
        status,
      },
    });
  } catch (err) {
    console.warn('Failed to sync proposal status to DB:', err);
  }
}
