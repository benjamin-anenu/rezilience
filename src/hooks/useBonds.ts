import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DBBond } from '@/types/database';

/**
 * Fetch bonds for a specific project
 */
export function useProjectBonds(projectId: string) {
  return useQuery({
    queryKey: ['bonds', 'project', projectId],
    queryFn: async (): Promise<DBBond[]> => {
      const { data, error } = await supabase
        .from('bonds')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

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
 * Fetch bonds for a specific wallet address
 */
export function useWalletBonds(walletAddress: string) {
  return useQuery({
    queryKey: ['bonds', 'wallet', walletAddress],
    queryFn: async (): Promise<DBBond[]> => {
      const { data, error } = await supabase
        .from('bonds')
        .select('*')
        .eq('user_wallet', walletAddress)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wallet bonds:', error);
        throw error;
      }

      return data || [];
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
