import { useBuildersFeed } from '@/hooks/useBuildersFeed';
import { useProjectSubscribe } from '@/hooks/useProjectSubscribe';
import { BuilderPostCard } from './BuilderPostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function BuildersInPublicFeed() {
  const { data: posts, isLoading, error } = useBuildersFeed();
  const { subscribe, subscribedProjects } = useProjectSubscribe();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="glass-chart rounded-sm border border-border p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-sm" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
        </div>
        {/* Card skeletons */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-sm border border-border/50 bg-card/60 backdrop-blur-xl p-0 overflow-hidden">
              <div className="flex items-center gap-2.5 border-b border-border/50 px-4 py-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
              <div className="p-4">
                <Skeleton className="h-48 w-full rounded-sm" />
              </div>
              <div className="border-t border-border/50 px-4 py-2.5">
                <Skeleton className="h-2.5 w-32" />
              </div>
            </div>
          ))}
        </div>
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
      <div className="glass-chart rounded-sm border border-border p-12 text-center">
        <Megaphone className="mx-auto mb-4 h-10 w-10 text-primary animate-pulse-glow" />
        <h3 className="mb-2 font-display text-lg font-bold uppercase tracking-wider text-foreground">
          Be the First to Build in Public
        </h3>
        <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
          Share your project journey with the Rezilience community. Claim your project and start posting updates.
        </p>
        <Button asChild className="gap-2">
          <Link to="/claim-profile">Claim Your Project</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Premium Section Header */}
      <div className="glass-chart rounded-sm border border-border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10">
              <Megaphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                Build in Public
              </h2>
              <p className="text-xs text-muted-foreground">
                Real-time project updates from verified builders in the Rezilience Registry
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
            {posts.length} Update{posts.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Post Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <BuilderPostCard
            key={post.postId}
            post={post}
            index={index}
            isSubscribed={subscribedProjects.has(post.profileId)}
            onSubscribe={subscribe}
          />
        ))}
      </div>
    </div>
  );
}
