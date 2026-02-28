import { useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { ESCROW_IDL, ESCROW_PROGRAM_ID } from '@/lib/escrow-idl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/** 
 * Generate a 32-char bounty_id for a milestone escrow.
 * Format: profile_id hex (first 24 chars) + milestone_index zero-padded (8 chars)
 */
function milestoneEscrowId(profileId: string, milestoneIndex: number): string {
  const profileHex = profileId.replace(/-/g, '').slice(0, 24);
  const indexStr = milestoneIndex.toString().padStart(8, '0');
  return profileHex + indexStr;
}

function deriveEscrowPda(bountyId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), Buffer.from(bountyId)],
    new PublicKey(ESCROW_PROGRAM_ID)
  );
}

function useAnchorProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) return null;

  const provider = new AnchorProvider(
    connection,
    { publicKey: wallet.publicKey, signTransaction: wallet.signTransaction, signAllTransactions: wallet.signAllTransactions },
    { commitment: 'confirmed' }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Program(ESCROW_IDL as any, provider);
}

interface FundMilestoneParams {
  profileId: string;
  milestoneIndex: number;
  claimerWallet: string;
  realmDaoAddress: string;
  solAmount: number;
  governancePda?: string;
}

/**
 * Create a per-milestone escrow PDA and fund it.
 */
export function useFundMilestoneEscrow() {
  const program = useAnchorProgram();
  const wallet = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: FundMilestoneParams) => {
      if (!program || !wallet.publicKey) throw new Error('Wallet not connected');

      const bountyId = milestoneEscrowId(params.profileId, params.milestoneIndex);
      const [escrowPda] = deriveEscrowPda(bountyId);
      const claimerKey = new PublicKey(params.claimerWallet);
      const realmKey = new PublicKey(params.realmDaoAddress);
      const authorityKey = params.governancePda
        ? new PublicKey(params.governancePda)
        : wallet.publicKey;
      const rewardLamports = new BN(Math.round(params.solAmount * LAMPORTS_PER_SOL));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tx = await (program.methods as any)
        .createEscrow(bountyId, claimerKey, authorityKey, realmKey, rewardLamports)
        .accounts({
          creator: wallet.publicKey,
          escrowAccount: escrowPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { tx, escrowAddress: escrowPda.toBase58(), milestoneIndex: params.milestoneIndex };
    },
    onSuccess: ({ tx, milestoneIndex }) => {
      queryClient.invalidateQueries({ queryKey: ['funding-proposals'] });
      toast.success(`Milestone ${milestoneIndex + 1} escrow funded!`, {
        action: {
          label: 'View',
          onClick: () => window.open(`https://explorer.solana.com/tx/${tx}?cluster=devnet`, '_blank'),
        },
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to fund milestone escrow');
    },
  });
}

export { milestoneEscrowId, deriveEscrowPda };
