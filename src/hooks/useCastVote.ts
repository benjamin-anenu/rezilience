import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import {
  getGovernanceProgramVersion,
  getTokenOwnerRecordForRealm,
  getProposal,
  getRealm,
  withCastVote,
  Vote,
  YesNoVote,
} from '@solana/spl-governance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const GOVERNANCE_PROGRAM_ID = new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw');

interface CastVoteParams {
  proposalAddress: string;
  realmAddress: string;
  vote: 'yes' | 'no';
}

/**
 * Cast a Yes/No vote on a Realms governance proposal.
 * Requires the user to have deposited governance tokens.
 */
export function useCastVote() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalAddress, realmAddress, vote }: CastVoteParams) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected');
      }

      const realmPk = new PublicKey(realmAddress);
      const proposalPk = new PublicKey(proposalAddress);

      const programVersion = await getGovernanceProgramVersion(connection, GOVERNANCE_PROGRAM_ID);
      const realm = await getRealm(connection, realmPk);
      const communityMint = realm.account.communityMint;

      // Get proposal to find its governance
      const proposal = await getProposal(connection, proposalPk);
      const governancePk = proposal.account.governance;

      // Get token owner record
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
          'You need governance tokens deposited in this Realm to vote. Visit app.realms.today to deposit tokens.'
        );
      }

      const instructions: TransactionInstruction[] = [];

      const voteChoice = vote === 'yes'
        ? Vote.fromYesNoVote(YesNoVote.Yes)
        : Vote.fromYesNoVote(YesNoVote.No);

      await withCastVote(
        instructions,
        GOVERNANCE_PROGRAM_ID,
        programVersion,
        realmPk,
        governancePk,
        proposalPk,
        proposal.account.tokenOwnerRecord,
        tokenOwnerRecord.pubkey,
        wallet.publicKey,
        communityMint,
        voteChoice,
        wallet.publicKey
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = new Transaction({ feePayer: wallet.publicKey, blockhash, lastValidBlockHeight });
      tx.add(...instructions);

      const signed = await wallet.signTransaction(tx);
      const txSig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction({ signature: txSig, blockhash, lastValidBlockHeight }, 'confirmed');

      return { txSignature: txSig, vote };
    },
    onSuccess: ({ txSignature, vote }, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposal-state', variables.proposalAddress] });
      toast.success(`Vote "${vote.toUpperCase()}" cast successfully!`, {
        action: {
          label: 'View Tx',
          onClick: () => window.open(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`, '_blank'),
        },
      });
    },
    onError: (err: Error) => {
      toast.error('Failed to cast vote', { description: err.message });
    },
  });
}
