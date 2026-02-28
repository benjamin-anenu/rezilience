import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const REALMS_GOVERNANCE_PROGRAM_ID = new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw');

/**
 * Hook to create a Realms governance proposal containing the release_escrow instruction.
 * 
 * NOTE: Full Realms SDK integration requires @solana/spl-governance which is a heavy
 * dependency. For MVP, this hook deep-links users to app.realms.today to create proposals
 * and records the proposal address manually. The full on-chain proposal creation
 * can be wired in Phase 3b when spl-governance SDK is integrated.
 */
export function useCreateRealmsProposal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      bounty_id: string;
      realm_dao_address: string;
      proposal_address: string; // User pastes from Realms UI
      bounty_title: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase.functions.invoke('manage-bounty', {
        body: {
          action: 'set_voting',
          x_user_id: user.id,
          bounty_id: params.bounty_id,
          proposal_address: params.proposal_address,
        },
      });

      if (error) throw error;
      return { proposal_address: params.proposal_address };
    },
    onSuccess: ({ proposal_address }) => {
      queryClient.invalidateQueries({ queryKey: ['bounties'] });
      queryClient.invalidateQueries({ queryKey: ['my-bounties'] });
      toast.success('Proposal linked! Bounty is now in voting.', {
        action: {
          label: 'View on Realms',
          onClick: () => window.open(`https://app.realms.today/proposal/${proposal_address}`, '_blank'),
        },
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to link proposal');
    },
  });
}

/**
 * Hook to mark a bounty as paid after the governance vote passed and
 * executeTransaction was called (either via Realms UI or programmatically).
 */
export function useMarkBountyPaid() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      bounty_id: string;
      release_tx_signature: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase.functions.invoke('manage-bounty', {
        body: {
          action: 'mark_paid',
          x_user_id: user.id,
          bounty_id: params.bounty_id,
          release_tx_signature: params.release_tx_signature,
        },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bounties'] });
      queryClient.invalidateQueries({ queryKey: ['my-bounties'] });
      toast.success('Bounty marked as paid!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to mark as paid');
    },
  });
}

/** Build a Realms deep link for a specific DAO */
export function getRealmsUrl(realmAddress: string): string {
  return `https://app.realms.today/dao/${realmAddress}`;
}
