import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BuilderPost {
  postId: string;
  profileId: string;
  projectName: string;
  logoUrl: string | null;
  category: string | null;
  xUsername: string | null;
  tweetUrl: string;
  title?: string;
  timestamp: string;
}

export function useBuildersFeed() {
  return useQuery({
    queryKey: ['builders-feed'],
    queryFn: async (): Promise<BuilderPost[]> => {
      const { data, error } = await (supabase
        .from('claimed_profiles_public' as any)
        .select('id, project_name, logo_url, category, x_username, build_in_public_videos, claim_status')
        .eq('claim_status', 'claimed')
        .not('build_in_public_videos', 'is', null) as any);

      if (error) throw error;

      const posts: BuilderPost[] = [];

      for (const profile of data || []) {
        const videos = profile.build_in_public_videos as any[];
        if (!Array.isArray(videos) || videos.length === 0) continue;

        for (const video of videos) {
          const url = video.tweetUrl || video.url;
          if (!url) continue;

          posts.push({
            postId: video.id || `${profile.id}-${url}`,
            profileId: profile.id,
            projectName: profile.project_name,
            logoUrl: profile.logo_url,
            category: profile.category,
            xUsername: profile.x_username,
            tweetUrl: url,
            title: video.title,
            timestamp: video.uploadedAt || video.timestamp || profile.id,
          });
        }
      }

      // Sort by X post date (snowflake ID), newest first
      const getSnowflakeTimestamp = (url: string): number => {
        const match = url.match(/status\/(\d+)/);
        if (!match) return 0;
        try {
          return Number(BigInt(match[1]) >> 22n) + 1288834974657;
        } catch {
          return 0;
        }
      };

      posts.sort((a, b) => {
        const tsA = getSnowflakeTimestamp(a.tweetUrl);
        const tsB = getSnowflakeTimestamp(b.tweetUrl);
        if (!tsA && !tsB) return 0;
        if (!tsA) return 1;
        if (!tsB) return -1;
        return tsB - tsA;
      });

      return posts;
    },
  });
}
