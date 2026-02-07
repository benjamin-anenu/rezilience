import { Video, ExternalLink, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export interface BuildInPublicVideo {
  id: string;
  url: string;
  tweetUrl: string;
  thumbnailUrl?: string;
  title?: string;
  timestamp?: string;
}

interface BuildInPublicSectionProps {
  videos: BuildInPublicVideo[];
  xUsername?: string;
}

// Extract Twitter video embed URL from tweet URL
const getTwitterEmbedUrl = (tweetUrl: string): string => {
  // Twitter doesn't support direct video embeds, so we link to the tweet
  return tweetUrl;
};

// Get tweet ID from URL for embed
const getTweetId = (url: string): string | null => {
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
        <Carousel className="w-full">
          <CarouselContent className="-ml-2">
            {videos.map((video) => {
              const tweetId = getTweetId(video.tweetUrl);
              
              return (
                <CarouselItem key={video.id} className="pl-2 sm:basis-1/2 lg:basis-1/3">
                  <a 
                    href={video.tweetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="relative aspect-video overflow-hidden rounded-sm border border-border bg-muted/50 transition-all group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10">
                      {/* Thumbnail or placeholder */}
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title || 'Build in public video'}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Video className="h-8 w-8" />
                            <span className="text-xs">Video Update</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
                          <Play className="h-5 w-5 ml-0.5" />
                        </div>
                      </div>
                      
                      {/* X/Twitter badge */}
                      <div className="absolute bottom-2 right-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-white">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Title */}
                    {video.title && (
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground group-hover:text-foreground">
                        {video.title}
                      </p>
                    )}
                    
                    {/* Timestamp */}
                    {video.timestamp && (
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {new Date(video.timestamp).toLocaleDateString()}
                      </p>
                    )}
                  </a>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          {videos.length > 3 && (
            <>
              <CarouselPrevious className="-left-3 h-8 w-8" />
              <CarouselNext className="-right-3 h-8 w-8" />
            </>
          )}
        </Carousel>
        
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
