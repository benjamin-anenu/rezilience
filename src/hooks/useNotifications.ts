import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Notification {
  id: string;
  recipient_x_user_id: string;
  type: string;
  title: string;
  body: string | null;
  bounty_id: string | null;
  profile_id: string | null;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();

  return useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.functions.invoke('manage-notifications', {
        body: { action: 'list', x_user_id: user.id },
      });
      if (error) throw error;
      return data?.notifications || [];
    },
    enabled: !!user?.id,
    refetchInterval: 60_000, // Poll every minute
    staleTime: 30_000,
  });
}

export function useUnreadCount() {
  const { user } = useAuth();

  return useQuery<number>({
    queryKey: ['notification-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { data, error } = await supabase.functions.invoke('manage-notifications', {
        body: { action: 'unread_count', x_user_id: user.id },
      });
      if (error) return 0;
      return data?.count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function useMarkNotificationsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds?: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.functions.invoke('manage-notifications', {
        body: {
          action: 'mark_read',
          x_user_id: user.id,
          notification_ids: notificationIds,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    },
  });
}
