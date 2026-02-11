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
      const { data, error } = await supabase
        .from('claimed_profiles')
        .select('id, project_name, logo_url, category, x_username, build_in_public_videos, claim_status')
        .eq('claim_status', 'claimed')
        .not('build_in_public_videos', 'is', null);

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

      // Sort newest first
      posts.sort((a, b) => {
        const da = new Date(a.timestamp).getTime();
        const db = new Date(b.timestamp).getTime();
        if (isNaN(da) && isNaN(db)) return 0;
        if (isNaN(da)) return 1;
        if (isNaN(db)) return -1;
        return db - da;
      });

      return posts;
    },
  });
}
