import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeleteProfileParams {
  profileId: string;
  xUserId: string;
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profileId, xUserId }: DeleteProfileParams) => {
      const { data, error } = await supabase.functions.invoke('delete-profile', {
        body: { profile_id: profileId, x_user_id: xUserId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to delete profile');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['verified-profiles'] });
      toast.success(data?.message || 'Protocol deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });
}
