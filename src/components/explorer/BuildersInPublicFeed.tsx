import { useBuildersFeed } from '@/hooks/useBuildersFeed';
import { useProjectSubscribe } from '@/hooks/useProjectSubscribe';
import { BuilderPostCard } from './BuilderPostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function BuildersInPublicFeed() {
  const { data: posts, isLoading, error } = useBuildersFeed();
  const { subscribe, subscribedProjects } = useProjectSubscribe();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-sm" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-6 text-center">
        <p className="text-sm text-destructive">Failed to load builder posts.</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-sm border border-border bg-card p-12 text-center">
        <Megaphone className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h3 className="mb-2 font-display text-lg font-semibold uppercase text-foreground">
          No Builders Posting Yet
        </h3>
        <p className="mx-auto mb-4 max-w-md text-muted-foreground">
          Be among the first to share your project journey. Claim your project and start building in public.
        </p>
        <Button asChild variant="outline">
          <Link to="/claim-profile">Claim Your Project</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BuilderPostCard
          key={post.postId}
          post={post}
          isSubscribed={subscribedProjects.has(post.profileId)}
          onSubscribe={subscribe}
        />
      ))}
    </div>
  );
}
