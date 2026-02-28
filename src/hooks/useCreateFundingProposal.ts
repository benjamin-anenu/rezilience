import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import {
  getGovernanceProgramVersion,
  getTokenOwnerRecordForRealm,
  withCreateProposal,
  VoteType,
  getAllGovernances,
  getRealm,
} from '@solana/spl-governance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const GOVERNANCE_PROGRAM_ID = new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw');

interface CreateProposalParams {
  profileId: string;
  proposalDbId: string;
  realmAddress: string;
  projectName: string;
  requestedSol: number;
  milestoneCount: number;
}

/**
 * Hook to create a Realms governance proposal on-chain for a funding request.
 * Falls back gracefully if the builder lacks governance tokens.
 */
export function useCreateFundingProposal() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateProposalParams) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected');
      }

      const realmPk = new PublicKey(params.realmAddress);

      // 1. Get governance program version
      const programVersion = await getGovernanceProgramVersion(
        connection,
        GOVERNANCE_PROGRAM_ID
      );

      // 2. Get realm and its community mint
      const realm = await getRealm(connection, realmPk);
      const communityMint = realm.account.communityMint;

      // 3. Find governance accounts under this realm
      const governances = await getAllGovernances(
        connection,
        GOVERNANCE_PROGRAM_ID,
        realmPk
      );

      if (governances.length === 0) {
        throw new Error(
          'No governance accounts found for this Realm. Please create a governance on Realms first.'
        );
      }

      const governance = governances[0];
      const governancePk = governance.pubkey;

      // 4. Check if user has a TokenOwnerRecord (i.e. deposited governance tokens)
      let tokenOwnerRecord;
      try {
        tokenOwnerRecord = await getTokenOwnerRecordForRealm(
          connection,
          GOVERNANCE_PROGRAM_ID,
          realmPk,
          communityMint,
          wallet.publicKey
        );
      } catch {
        throw new Error(
          'You need governance tokens deposited in this Realm to create proposals. ' +
          'Visit app.realms.today to deposit tokens first.'
        );
      }

      // 5. Build proposal transaction
      const instructions: TransactionInstruction[] = [];

      const proposalTitle = `Accept ${params.projectName} for ${params.requestedSol} SOL funding`;
      const proposalDescription =
        `Funding proposal for ${params.projectName}.\n` +
        `Requested: ${params.requestedSol} SOL across ${params.milestoneCount} milestones.\n` +
        `View on Rezilience: https://rezilience.lovable.app/profile/${params.profileId}`;

      const proposalAddress = await withCreateProposal(
        instructions,
        GOVERNANCE_PROGRAM_ID,
        programVersion,
        realmPk,
        governancePk,
        tokenOwnerRecord.pubkey,
        proposalTitle,
        proposalDescription,
        communityMint,
        wallet.publicKey,
        undefined, // proposalIndex - auto
        VoteType.SINGLE_CHOICE,
        ['Approve'],
        true, // useDenyOption
        wallet.publicKey
      );

      // 6. Send transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const transaction = new Transaction({
        feePayer: wallet.publicKey,
        blockhash,
        lastValidBlockHeight,
      });
      transaction.add(...instructions);

      const signed = await wallet.signTransaction(transaction);
      const txSig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(
        { signature: txSig, blockhash, lastValidBlockHeight },
        'confirmed'
      );

      // 7. Update DB with proposal address
      await supabase.functions.invoke('manage-funding-proposal', {
        body: {
          action: 'update_status',
          proposal_id: params.proposalDbId,
          status: 'voting',
          proposal_address: proposalAddress.toBase58(),
          proposal_tx: txSig,
        },
      });

      return {
        proposalAddress: proposalAddress.toBase58(),
        txSignature: txSig,
      };
    },
    onSuccess: ({ proposalAddress }) => {
      queryClient.invalidateQueries({ queryKey: ['funding-proposals'] });
      toast.success('Proposal created on-chain!', {
        description: `Proposal: ${proposalAddress.slice(0, 8)}…`,
        action: {
          label: 'View on Realms',
          onClick: () =>
            window.open(
              `https://app.realms.today/proposal/${proposalAddress}`,
              '_blank'
            ),
        },
      });
    },
    onError: (err: Error) => {
      toast.error('Proposal creation failed', {
        description: err.message,
      });
    },
  });
}
