import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { MediaAsset, Phase } from '@/types';

interface BuildInPublicEntry {
  id: string;
  url: string;
  title: string;
  description?: string;
  uploadedAt: string;
  thumbnailUrl?: string;
}


interface TeamMemberUpdate {
  id: string;
  imageUrl?: string;
  name: string;
  nickname?: string;
  jobTitle: string;
  whyFit: string;
  role: 'developer' | 'founder' | 'other';
  customRole?: string;
  order: number;
}

interface UpdateProfileParams {
  profileId: string;
  xUserId: string;
  updates: {
    website_url?: string;
    discord_url?: string;
    telegram_url?: string;
    media_assets?: MediaAsset[];
    build_in_public_videos?: BuildInPublicEntry[];
    milestones?: Phase[];
    team_members?: TeamMemberUpdate[];
    staking_pitch?: string;
    logo_url?: string;
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profileId, xUserId, updates }: UpdateProfileParams) => {
      const response = await supabase.functions.invoke('update-profile', {
        body: {
          profile_id: profileId,
          x_user_id: xUserId,
          updates,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to update profile');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['claimed-profile', variables.profileId] });
      queryClient.invalidateQueries({ queryKey: ['my-verified-profiles'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}
