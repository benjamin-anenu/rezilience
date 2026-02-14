import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, UserPlus, TrendingUp, AlertTriangle, BookOpen, ChevronRight, Activity } from 'lucide-react';
import { useEcosystemTrends, type EcosystemTrend } from '@/hooks/useEcosystemTrends';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const eventIcons: Record<string, React.ElementType> = {
  admin_announcement: Megaphone,
  claim: UserPlus,
  score_milestone: TrendingUp,
  decay_alert: AlertTriangle,
  library_update: BookOpen,
  ecosystem_stat: Activity,
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

interface TrendTickerProps {
  onViewAll?: () => void;
}

export function TrendTicker({ onViewAll }: TrendTickerProps) {
  const { data: trends } = useEcosystemTrends(5);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  // Auto-rotate every 5s
  useEffect(() => {
    if (!trends || trends.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % trends.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [trends]);

  if (!trends || trends.length === 0) return null;

  const current = trends[activeIndex];
  const Icon = eventIcons[current.event_type] || Activity;
  const isHighlight = current.priority === 'highlight';

  const handleClick = () => {
    if (current.profile_id) {
      navigate(`/program/${current.profile_id}`);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-sm border px-4 py-2.5 transition-all',
        isHighlight
          ? 'border-primary/40 bg-primary/5'
          : 'border-border bg-card/50'
      )}
    >
      <div className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-sm',
        isHighlight ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
      )}>
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div
        className={cn('flex-1 min-w-0', current.profile_id && 'cursor-pointer')}
        onClick={handleClick}
      >
        <p className="truncate text-sm font-medium text-foreground">
          {current.title}
        </p>
      </div>

      <span className="shrink-0 text-[10px] font-mono text-muted-foreground">
        {formatTimeAgo(current.created_at)}
      </span>

      {trends.length > 1 && (
        <div className="flex items-center gap-1 shrink-0">
          {trends.map((_, i) => (
            <button
              key={i}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-colors',
                i === activeIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      )}

      {onViewAll && (
        <button
          onClick={onViewAll}
          className="shrink-0 flex items-center gap-0.5 text-[10px] font-mono uppercase text-primary hover:underline"
        >
          All
          <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
