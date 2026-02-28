import { useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, BN, web3 } from '@coral-xyz/anchor';
import { ESCROW_IDL, ESCROW_PROGRAM_ID } from '@/lib/escrow-idl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

/** Convert a UUID (with dashes) to 32-char hex string (without dashes) */
function uuidToHex(uuid: string): string {
  return uuid.replace(/-/g, '');
}

/** Derive the escrow PDA from a bounty UUID */
function deriveEscrowPda(bountyId: string): [PublicKey, number] {
  const hex = uuidToHex(bountyId);
  return PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), Buffer.from(hex)],
    new PublicKey(ESCROW_PROGRAM_ID)
  );
}

function useAnchorProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    return null;
  }

  const provider = new AnchorProvider(
    connection,
    {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    },
    { commitment: 'confirmed' }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Program(ESCROW_IDL as any, provider);
}

export function useFundEscrow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const program = useAnchorProgram();
  const wallet = useWallet();

  return useMutation({
    mutationFn: async (params: {
      bounty_id: string;
      claimer_wallet: string;
      realm_dao_address: string;
      reward_sol: number;
      governance_pda?: string; // If provided, use governance PDA as authority; otherwise creator
    }) => {
      if (!program || !wallet.publicKey) throw new Error('Wallet not connected');
      if (!user?.id) throw new Error('Not authenticated');

      const bountyHex = uuidToHex(params.bounty_id);
      const claimerKey = new PublicKey(params.claimer_wallet);
      const realmKey = new PublicKey(params.realm_dao_address);
      const authorityKey = params.governance_pda
        ? new PublicKey(params.governance_pda)
        : wallet.publicKey;
      const rewardLamports = new BN(Math.round(params.reward_sol * LAMPORTS_PER_SOL));

      const [escrowPda] = deriveEscrowPda(params.bounty_id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tx = await (program.methods as any)
        .createEscrow(bountyHex, claimerKey, authorityKey, realmKey, rewardLamports)
        .accounts({
          creator: wallet.publicKey,
          escrowAccount: escrowPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Update DB via edge function
      const { error } = await supabase.functions.invoke('manage-bounty', {
        body: {
          action: 'fund',
          x_user_id: user.id,
          bounty_id: params.bounty_id,
          escrow_address: escrowPda.toBase58(),
          escrow_tx_signature: tx,
          governance_pda: authorityKey.toBase58(),
        },
      });

      if (error) throw error;
      return { tx, escrowAddress: escrowPda.toBase58() };
    },
    onSuccess: ({ tx }) => {
      queryClient.invalidateQueries({ queryKey: ['bounties'] });
      queryClient.invalidateQueries({ queryKey: ['my-bounties'] });
      toast.success('Escrow funded!', {
        description: `Tx: ${tx.slice(0, 8)}…`,
        action: {
          label: 'View',
          onClick: () => window.open(`https://explorer.solana.com/tx/${tx}?cluster=devnet`, '_blank'),
        },
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to fund escrow');
    },
  });
}

export function useCancelEscrow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const program = useAnchorProgram();
  const wallet = useWallet();

  return useMutation({
    mutationFn: async (params: { bounty_id: string }) => {
      if (!program || !wallet.publicKey) throw new Error('Wallet not connected');
      if (!user?.id) throw new Error('Not authenticated');

      const bountyHex = uuidToHex(params.bounty_id);
      const [escrowPda] = deriveEscrowPda(params.bounty_id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tx = await (program.methods as any)
        .cancelEscrow(bountyHex)
        .accounts({
          creator: wallet.publicKey,
          escrowAccount: escrowPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Update DB
      const { error } = await supabase.functions.invoke('manage-bounty', {
        body: {
          action: 'cancel_escrow',
          x_user_id: user.id,
          bounty_id: params.bounty_id,
          release_tx_signature: tx,
        },
      });

      if (error) throw error;
      return { tx };
    },
    onSuccess: ({ tx }) => {
      queryClient.invalidateQueries({ queryKey: ['bounties'] });
      queryClient.invalidateQueries({ queryKey: ['my-bounties'] });
      toast.success('Escrow cancelled. SOL returned.', {
        action: {
          label: 'View',
          onClick: () => window.open(`https://explorer.solana.com/tx/${tx}?cluster=devnet`, '_blank'),
        },
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to cancel escrow');
    },
  });
}

export { deriveEscrowPda, uuidToHex };
