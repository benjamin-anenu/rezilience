import { Link } from 'react-router-dom';
import { Tweet } from 'react-tweet';
import { Badge } from '@/components/ui/badge';
import { SubscribePopover } from './SubscribePopover';
import { ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { BuilderPost } from '@/hooks/useBuildersFeed';

interface BuilderPostCardProps {
  post: BuilderPost;
  index: number;
  isSubscribed: boolean;
  onSubscribe: (profileId: string, email: string, projectName: string) => Promise<boolean>;
}

const getTweetId = (url: string): string | null => {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
};

const formatRelativeTime = (timestamp: string): string | null => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return null;
  return formatDistanceToNow(date, { addSuffix: true });
};

export function BuilderPostCard({ post, index, isSubscribed, onSubscribe }: BuilderPostCardProps) {
  const tweetId = getTweetId(post.tweetUrl);
  const relativeTime = formatRelativeTime(post.timestamp);

  return (
    <div
      className="group overflow-hidden rounded-sm border border-primary/10 bg-card/80 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.15)] card-lift animate-fade-in"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/50 px-4 py-3">
        <Link to={`/program/${post.profileId}`} className="flex min-w-0 items-center gap-2.5 hover:opacity-80">
          {post.logoUrl ? (
            <img src={post.logoUrl} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-border/50" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted ring-1 ring-border/50" />
          )}
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground">{post.projectName}</span>
            {relativeTime && (
              <span className="text-[10px] text-muted-foreground">{relativeTime}</span>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-1.5">
          {post.category && (
            <Badge variant="secondary" className="text-[10px] border-primary/20 bg-primary/5 text-primary">
              {post.category}
            </Badge>
          )}
          <SubscribePopover
            profileId={post.profileId}
            projectName={post.projectName}
            isSubscribed={isSubscribed}
            onSubscribe={onSubscribe}
          />
        </div>
      </div>

      {/* Tweet Embed */}
      {tweetId ? (
        <div className="mx-3 my-3 overflow-hidden rounded-sm border border-border/30 bg-background/50">
          <div className="[&_.react-tweet-theme]:!bg-transparent [&_article]:!border-0 [&_article]:!shadow-none" data-theme="dark">
            <Tweet id={tweetId} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
          <a href={post.tweetUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
            View post →
          </a>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-4 py-2">
        <p className="line-clamp-1 text-[11px] text-muted-foreground">
          {post.title || (relativeTime ? `Posted ${relativeTime}` : 'Builder update')}
        </p>
        {post.tweetUrl && (
          <a
            href={post.tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            <span>View on X</span>
          </a>
        )}
      </div>
    </div>
  );
}
