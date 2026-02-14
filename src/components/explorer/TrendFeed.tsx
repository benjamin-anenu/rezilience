import { useNavigate } from 'react-router-dom';
import { Megaphone, UserPlus, TrendingUp, AlertTriangle, BookOpen, Activity, X } from 'lucide-react';
import { useEcosystemTrends, type EcosystemTrend } from '@/hooks/useEcosystemTrends';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const eventIcons: Record<string, React.ElementType> = {
  admin_announcement: Megaphone,
  claim: UserPlus,
  score_milestone: TrendingUp,
  decay_alert: AlertTriangle,
  library_update: BookOpen,
  ecosystem_stat: Activity,
};

const eventLabels: Record<string, string> = {
  admin_announcement: 'Announcement',
  claim: 'New Claim',
  score_milestone: 'Milestone',
  decay_alert: 'Alert',
  library_update: 'Library',
  ecosystem_stat: 'Ecosystem',
};

function formatTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface TrendFeedProps {
  onClose: () => void;
}

export function TrendFeed({ onClose }: TrendFeedProps) {
  const { data: trends, isLoading } = useEcosystemTrends(20);
  const navigate = useNavigate();

  return (
    <div className="rounded-sm border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
          Ecosystem Trends
        </h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
        {isLoading && (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!isLoading && (!trends || trends.length === 0) && (
          <div className="p-8 text-center">
            <Activity className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No trends yet. Check back soon!</p>
          </div>
        )}

        {trends?.map((trend) => {
          const Icon = eventIcons[trend.event_type] || Activity;
          const isHighlight = trend.priority === 'highlight';

          return (
            <div
              key={trend.id}
              className={cn(
                'flex items-start gap-3 px-4 py-3 transition-colors',
                trend.profile_id && 'cursor-pointer hover:bg-muted/50',
                isHighlight && 'bg-primary/5'
              )}
              onClick={() => trend.profile_id && navigate(`/program/${trend.profile_id}`)}
            >
              <div className={cn(
                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm',
                isHighlight ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                <Icon className="h-3.5 w-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{trend.title}</p>
                {trend.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{trend.description}</p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">
                    {eventLabels[trend.event_type] || trend.event_type}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formatTimeAgo(trend.created_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
