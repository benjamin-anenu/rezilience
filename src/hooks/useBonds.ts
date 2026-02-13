import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Public bond data (excludes user_wallet for privacy)
export interface PublicBond {
  id: string;
  project_id: string;
  staked_amount: number;
  locked_until: string;
  created_at: string;
  yield_earned: number;
}

/**
 * Fetch bonds for a specific project (uses public view, no wallet data)
 */
export function useProjectBonds(projectId: string) {
  return useQuery({
    queryKey: ['bonds', 'project', projectId],
    queryFn: async (): Promise<PublicBond[]> => {
      const { data, error } = await (supabase
        .from('bonds_public' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }) as any);

      if (error) {
        console.error('Error fetching project bonds:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch bonds for a specific wallet address.
 * Currently returns empty — wallet-specific queries require an authenticated
 * edge function (Phase 2). The view excludes user_wallet so client-side
 * filtering is not possible.
 */
export function useWalletBonds(walletAddress: string) {
  return useQuery({
    queryKey: ['bonds', 'wallet', walletAddress],
    queryFn: async (): Promise<PublicBond[]> => {
      // Phase 2: replace with edge function call that authenticates via SIWS
      return [];
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Calculate bond statistics for a wallet
 */
export function useWalletBondStats(walletAddress: string) {
  const { data: bonds, ...rest } = useWalletBonds(walletAddress);

  const stats = {
    totalStaked: 0,
    totalYieldEarned: 0,
    activeBonds: 0,
    claimableNow: 0,
  };

  if (bonds) {
    const now = new Date();
    bonds.forEach(bond => {
      stats.totalStaked += bond.staked_amount;
      stats.totalYieldEarned += bond.yield_earned;
      
      const unlockDate = new Date(bond.locked_until);
      if (unlockDate <= now) {
        stats.claimableNow += bond.staked_amount + bond.yield_earned;
      } else {
        stats.activeBonds += 1;
      }
    });
  }

  return {
    data: stats,
    bonds,
    ...rest,
  };
}
