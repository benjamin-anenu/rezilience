import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import {
  getGovernanceProgramVersion,
  getProposal,
} from '@solana/spl-governance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const GOVERNANCE_PROGRAM_ID = new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw');

interface ExecuteProposalParams {
  proposalAddress: string;
  proposalDbId: string;
}

/**
 * Execute a succeeded proposal.
 * For now this simply marks the proposal as funded in the DB.
 * Full on-chain execution with embedded CPI instructions can be added
 * when the escrow program supports governance-triggered releases.
 */
export function useExecuteProposal() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalAddress, proposalDbId }: ExecuteProposalParams) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected');
      }

      // Verify proposal is in Succeeded state
      const proposalPk = new PublicKey(proposalAddress);
      const proposal = await getProposal(connection, proposalPk);

      // ProposalState.Succeeded = 4
      if (proposal.account.state !== 4) {
        throw new Error('Proposal must be in Succeeded state to execute');
      }

      // Update DB to funded
      await supabase.functions.invoke('manage-funding-proposal', {
        body: {
          action: 'update_status',
          proposal_id: proposalDbId,
          status: 'funded',
        },
      });

      return { status: 'funded' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal-state'] });
      toast.success('Proposal executed! Funding approved.');
    },
    onError: (err: Error) => {
      toast.error('Failed to execute proposal', { description: err.message });
    },
  });
}
