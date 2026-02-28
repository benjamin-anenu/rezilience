import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import {
  getGovernanceProgramVersion,
  getProposal,
  getProposalTransactions,
  withExecuteTransaction,
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
 * Execute a succeeded proposal's transactions.
 * This triggers release_escrow CPI if the proposal contains that instruction.
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

      const proposalPk = new PublicKey(proposalAddress);
      const programVersion = await getGovernanceProgramVersion(connection, GOVERNANCE_PROGRAM_ID);
      const proposal = await getProposal(connection, proposalPk);
      const governancePk = proposal.account.governance;

      // Get proposal transactions
      const proposalTransactions = await getProposalTransactions(
        connection,
        GOVERNANCE_PROGRAM_ID,
        proposalPk
      );

      if (proposalTransactions.length === 0) {
        // No embedded instructions — just mark as funded in DB
        await supabase.functions.invoke('manage-funding-proposal', {
          body: {
            action: 'update_status',
            proposal_id: proposalDbId,
            status: 'funded',
          },
        });
        return { txSignature: null, status: 'funded' };
      }

      // Execute each proposal transaction
      const instructions: TransactionInstruction[] = [];
      for (const proposalTx of proposalTransactions) {
        await withExecuteTransaction(
          instructions,
          GOVERNANCE_PROGRAM_ID,
          programVersion,
          governancePk,
          proposalPk,
          proposalTx.pubkey,
          proposalTx.account.instructions.map((ix) => ({
            programId: new PublicKey(ix.programId),
            keys: ix.accounts.map((a) => ({
              pubkey: new PublicKey(a.pubkey),
              isSigner: a.isSigner,
              isWritable: a.isWritable,
            })),
            data: Buffer.from(ix.data),
          }))
        );
      }

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = new Transaction({ feePayer: wallet.publicKey, blockhash, lastValidBlockHeight });
      tx.add(...instructions);

      const signed = await wallet.signTransaction(tx);
      const txSig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction({ signature: txSig, blockhash, lastValidBlockHeight }, 'confirmed');

      // Update DB
      await supabase.functions.invoke('manage-funding-proposal', {
        body: {
          action: 'update_status',
          proposal_id: proposalDbId,
          status: 'funded',
        },
      });

      return { txSignature: txSig, status: 'funded' };
    },
    onSuccess: ({ txSignature }) => {
      queryClient.invalidateQueries({ queryKey: ['funding-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal-state'] });
      toast.success('Proposal executed! Funds released.', {
        action: txSignature
          ? {
              label: 'View Tx',
              onClick: () =>
                window.open(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`, '_blank'),
            }
          : undefined,
      });
    },
    onError: (err: Error) => {
      toast.error('Failed to execute proposal', { description: err.message });
    },
  });
}
