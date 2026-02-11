import { Link } from 'react-router-dom';
import { Tweet } from 'react-tweet';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SubscribePopover } from './SubscribePopover';
import type { BuilderPost } from '@/hooks/useBuildersFeed';

interface BuilderPostCardProps {
  post: BuilderPost;
  isSubscribed: boolean;
  onSubscribe: (profileId: string, email: string, projectName: string) => Promise<boolean>;
}

const getTweetId = (url: string): string | null => {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
};

export function BuilderPostCard({ post, isSubscribed, onSubscribe }: BuilderPostCardProps) {
  const tweetId = getTweetId(post.tweetUrl);

  return (
    <Card className="overflow-hidden border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <Link to={`/program/${post.profileId}`} className="flex min-w-0 items-center gap-2 hover:opacity-80">
          {post.logoUrl ? (
            <img src={post.logoUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-muted" />
          )}
          <span className="truncate text-sm font-semibold text-foreground">{post.projectName}</span>
          {post.category && (
            <Badge variant="secondary" className="text-[10px]">{post.category}</Badge>
          )}
        </Link>
        <SubscribePopover
          profileId={post.profileId}
          projectName={post.projectName}
          isSubscribed={isSubscribed}
          onSubscribe={onSubscribe}
        />
      </div>

      {/* Tweet Embed */}
      {tweetId ? (
        <div className="[&_.react-tweet-theme]:!bg-transparent [&_article]:!border-0 [&_article]:!shadow-none" data-theme="dark">
          <Tweet id={tweetId} />
        </div>
      ) : (
        <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
          <a href={post.tweetUrl} target="_blank" rel="noopener noreferrer" className="underline">
            View post →
          </a>
        </div>
      )}

      {/* Footer */}
      {post.title && (
        <div className="border-t border-border bg-muted/30 px-3 py-2">
          <p className="line-clamp-1 text-xs text-muted-foreground">{post.title}</p>
        </div>
      )}
    </Card>
  );
}
