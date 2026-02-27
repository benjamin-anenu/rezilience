import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Bounty {
  id: string;
  realm_dao_address: string;
  title: string;
  description: string | null;
  reward_sol: number;
  status: 'open' | 'claimed' | 'submitted' | 'approved' | 'rejected' | 'paid';
  creator_profile_id: string;
  creator_x_user_id: string;
  claimer_profile_id: string | null;
  claimer_x_user_id: string | null;
  claimer_wallet: string | null;
  evidence_summary: string | null;
  evidence_links: string[];
  linked_milestone_id: string | null;
  created_at: string;
  claimed_at: string | null;
  submitted_at: string | null;
  resolved_at: string | null;
}

export function useBounties(realmDaoAddress?: string) {
  return useQuery({
    queryKey: ['bounties', realmDaoAddress],
    queryFn: async () => {
      let query = supabase
        .from('bounties')
        .select('*')
        .order('created_at', { ascending: false });

      if (realmDaoAddress) {
        query = query.eq('realm_dao_address', realmDaoAddress);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Bounty[];
    },
  });
}

export function useMyBounties() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-bounties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('bounties')
        .select('*')
        .or(`creator_x_user_id.eq.${user.id},claimer_x_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Bounty[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateBounty() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      realm_dao_address: string;
      title: string;
      description?: string;
      reward_sol: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase.functions.invoke('manage-bounty', {
        body: { action: 'create', x_user_id: user.id, ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.bounty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bounties'] });
      queryClient.invalidateQueries({ queryKey: ['my-bounties'] });
      toast.success('Bounty created successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create bounty');
    },
  });
}

export function useClaimBounty() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: { bounty_id: string; wallet_address: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase.functions.invoke('manage-bounty', {
        body: { action: 'claim', x_user_id: user.id, ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.bounty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bounties'] });
      queryClient.invalidateQueries({ queryKey: ['my-bounties'] });
      toast.success('Bounty claimed! Submit your work when ready.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to claim bounty');
    },
  });
}

export function useSubmitEvidence() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      bounty_id: string;
      evidence_summary: string;
      evidence_links?: string[];
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase.functions.invoke('manage-bounty', {
        body: { action: 'submit', x_user_id: user.id, ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.bounty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bounties'] });
      queryClient.invalidateQueries({ queryKey: ['my-bounties'] });
      toast.success('Evidence submitted for review');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to submit evidence');
    },
  });
}

export function useResolveBounty() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: { bounty_id: string; action: 'approve' | 'reject' }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase.functions.invoke('manage-bounty', {
        body: { action: params.action, x_user_id: user.id, bounty_id: params.bounty_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.bounty;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bounties'] });
      queryClient.invalidateQueries({ queryKey: ['my-bounties'] });
      toast.success(`Bounty ${variables.action === 'approve' ? 'approved' : 'rejected'}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to resolve bounty');
    },
  });
}

export function useUserProfiles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-profiles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('claimed_profiles')
        .select('id, project_name, realms_dao_address, x_user_id, logo_url')
        .eq('x_user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}
