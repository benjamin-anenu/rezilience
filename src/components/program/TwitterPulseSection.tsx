import { Users, Heart, MessageCircle, Repeat2, ExternalLink, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export interface Tweet {
  id: string;
  text: string;
  createdAt: string;
  likes: number;
  retweets: number;
  replies: number;
  url: string;
}

interface TwitterPulseSectionProps {
  xUsername?: string;
  followers?: number;
  engagementRate?: number;
  recentTweets?: Tweet[];
  lastSynced?: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function TweetCard({ tweet }: { tweet: Tweet }) {
  return (
    <a
      href={tweet.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-sm border border-border bg-muted/30 p-3 transition-all hover:border-primary/30 hover:bg-muted/50"
    >
      <p className="mb-2 line-clamp-3 text-sm text-foreground group-hover:text-foreground/90">
        {tweet.text}
      </p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {formatNumber(tweet.likes)}
          </span>
          <span className="flex items-center gap-1">
            <Repeat2 className="h-3 w-3" />
            {formatNumber(tweet.retweets)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {formatNumber(tweet.replies)}
          </span>
        </div>
        <span className="text-muted-foreground/70">
          {formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })}
        </span>
      </div>
    </a>
  );
}

export function TwitterPulseSection({ 
  xUsername, 
  followers = 0, 
  engagementRate = 0, 
  recentTweets = [],
  lastSynced 
}: TwitterPulseSectionProps) {
  // Don't render if no Twitter connection
  if (!xUsername) {
    return null;
  }

  // Empty state when connected but no data yet
  const hasData = followers > 0 || recentTweets.length > 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display text-sm uppercase tracking-wider text-muted-foreground">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-primary">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Twitter Pulse
          </CardTitle>
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
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg viewBox="0 0 24 24" className="h-10 w-10 fill-current text-muted-foreground/30">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <p className="mt-3 text-sm text-muted-foreground">
              Engagement data syncing...
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Check back soon for Twitter activity
            </p>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-sm border border-border bg-muted/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">Followers</span>
                </div>
                <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                  {formatNumber(followers)}
                </p>
              </div>
              <div className="rounded-sm border border-border bg-muted/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">Engagement</span>
                </div>
                <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                  {engagementRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Recent Tweets */}
            {recentTweets.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Recent Activity
                </h4>
                <div className="space-y-2">
                  {recentTweets.slice(0, 3).map((tweet) => (
                    <TweetCard key={tweet.id} tweet={tweet} />
                  ))}
                </div>
              </div>
            )}

            {/* Last synced indicator */}
            {lastSynced && (
              <p className="mt-3 text-center text-xs text-muted-foreground/50">
                Last updated {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
              </p>
            )}

            {/* Follow CTA */}
            <div className="mt-4 flex justify-center border-t border-border pt-4">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a 
                  href={`https://x.com/${xUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Follow on X
                </a>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
