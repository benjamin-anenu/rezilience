import { Video, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tweet } from 'react-tweet';

export interface BuildInPublicVideo {
  id: string;
  url: string;
  tweetUrl?: string;  // Optional - legacy field, new entries use url
  thumbnailUrl?: string;
  title?: string;
  timestamp?: string;
}

interface BuildInPublicSectionProps {
  videos: BuildInPublicVideo[];
  xUsername?: string;
}

// Get tweet ID from URL for embed
const getTweetId = (url: string | undefined): string | null => {
  if (!url) return null;
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
};

export function BuildInPublicSection({ videos, xUsername }: BuildInPublicSectionProps) {
  // Empty state - don't render section if no videos
  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display text-sm uppercase tracking-wider text-muted-foreground">
            <Video className="h-4 w-4 text-primary" />
            Build In Public
          </CardTitle>
          {xUsername && (
            <Button asChild variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
              <a 
                href={`https://x.com/${xUsername}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                @{xUsername}
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Embedded Tweets Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            // Handle both field names for backwards compatibility
            const videoUrl = video.tweetUrl || video.url;
            const tweetId = getTweetId(videoUrl);
            
            if (!tweetId) {
              // Fallback for non-tweet URLs - show link card
              return (
                <a 
                  key={video.id}
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-sm border border-border bg-muted/30 p-4 transition-all hover:border-primary/50 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Video className="h-8 w-8 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {video.title || 'Video Update'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click to view
                      </p>
                    </div>
                  </div>
                </a>
              );
            }
            
            return (
              <div 
                key={video.id} 
                className="overflow-hidden rounded-sm border border-border bg-card"
                data-theme="dark"
              >
                {/* Embedded Tweet with native video playback */}
                <div className="[&_.react-tweet-theme]:!bg-transparent [&_article]:!border-0 [&_article]:!shadow-none">
                  <Tweet id={tweetId} />
                </div>
                
                {/* Optional title overlay */}
                {video.title && (
                  <div className="border-t border-border bg-muted/30 px-3 py-2">
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {video.title}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Follow CTA */}
        {xUsername && (
          <div className="mt-4 flex items-center justify-center border-t border-border pt-4">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <a 
                href={`https://x.com/${xUsername}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Follow for Updates
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
