import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tweet } from 'react-tweet';
import { Badge } from '@/components/ui/badge';
import { SubscribePopover } from './SubscribePopover';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
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

/** Extract creation date from Twitter snowflake ID */
const getTweetDate = (tweetId: string): Date | null => {
  try {
    const id = BigInt(tweetId);
    const timestamp = Number(id >> 22n) + 1288834974657;
    return new Date(timestamp);
  } catch {
    return null;
  }
};

const formatRelativeTime = (date: Date): string => {
  return formatDistanceToNow(date, { addSuffix: true });
};

export function BuilderPostCard({ post, index, isSubscribed, onSubscribe }: BuilderPostCardProps) {
  const tweetId = getTweetId(post.tweetUrl);
  const tweetDate = tweetId ? getTweetDate(tweetId) : null;
  const relativeTime = tweetDate ? formatRelativeTime(tweetDate) : null;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="group overflow-hidden rounded-sm border border-primary/40 bg-[#0a0a0a] transition-all duration-300 hover:border-primary/70 hover:shadow-[0_0_25px_-5px_hsl(var(--primary)/0.25)] animate-fade-in"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
    >
      {/* Header — two rows */}
      <div className="border-b border-primary/20 bg-[#0a0a0a] px-4 py-2.5 flex items-center gap-3">
        {/* Logo */}
        <Link to={`/program/${post.profileId}`} className="shrink-0 hover:opacity-80">
          {post.logoUrl ? (
            <img src={post.logoUrl} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-primary/30" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary/10 ring-1 ring-primary/30" />
          )}
        </Link>

        {/* Name + Badge stacked */}
        <div className="flex flex-col min-w-0 flex-1">
          <Link to={`/program/${post.profileId}`} className="truncate text-base font-bold text-foreground hover:opacity-80 leading-tight">
            {post.projectName}
          </Link>
          {post.category && (
            <Badge variant="secondary" className="mt-0.5 w-fit text-[10px] border-primary/30 bg-primary/10 text-primary font-mono uppercase tracking-wider">
              {post.category}
            </Badge>
          )}
        </div>

        {/* Subscribe */}
        <div className="shrink-0 self-center">
          <SubscribePopover
            profileId={post.profileId}
            projectName={post.projectName}
            isSubscribed={isSubscribed}
            onSubscribe={onSubscribe}
          />
        </div>
      </div>

      {/* Tweet Embed — expandable */}
      {tweetId ? (
        <div className="relative">
          <motion.div
            animate={{ height: expanded ? 'auto' : 200 }}
            initial={false}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden bg-[#0a0a0a]"
          >
            <div
              className={`origin-top-left [&_.react-tweet-theme]:!bg-transparent [&_article]:!border-0 [&_article]:!shadow-none [&>div]:!mb-0 [&_article]:!mb-0 [&_.react-tweet-theme]:!p-0 [&_video]:!max-h-[280px] [&_video]:!object-cover [&_div:has(>video)]:!max-h-[280px] [&_div:has(>video)]:!overflow-hidden [&_[data-testid="videoPlayer"]]:!max-h-[280px] [&_[data-video-wrapper]]:!max-h-[280px] transition-transform duration-300 ${
                expanded ? '' : ''
              }`}
              style={
                expanded
                  ? { transform: 'scale(1)', width: '100%' }
                  : { transform: 'scale(0.82)', width: '121.95%' }
              }
              data-theme="dark"
            >
              <Tweet id={tweetId} />
            </div>
          </motion.div>

          {/* Fade gradient — only when collapsed */}
          <AnimatePresence>
            {!expanded && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0a0a0a] to-transparent"
              />
            )}
          </AnimatePresence>

          {/* Toggle button */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-center gap-1 border-t border-primary/20 bg-[#0a0a0a] py-1.5 text-[11px] font-medium text-primary/70 transition-colors hover:text-primary hover:bg-primary/5"
          >
            {expanded ? (
              <>Show less <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>Read more <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        </div>
      ) : (
        <div className="flex h-[200px] items-center justify-center bg-[#0a0a0a]">
          <a href={post.tweetUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline hover:text-primary/80 transition-colors">
            View post →
          </a>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-primary/20 bg-[#0a0a0a] px-4 py-2.5 flex items-center justify-between">
        {relativeTime ? (
          <span className="font-mono text-[10px] text-muted-foreground">{relativeTime}</span>
        ) : (
          <span />
        )}
        {post.tweetUrl && (
          <a
            href={post.tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            View on X
          </a>
        )}
      </div>
    </div>
  );
}
